"""
OCR サービス実装
Google Cloud Vision API + Gemini Flash の組み合わせテスト
"""

import time
import json
import base64
from typing import Dict, List, Optional, Tuple
from io import BytesIO
import logging

import PyPDF2
from PIL import Image
import cv2
import numpy as np
from google.cloud import vision
import vertexai
from vertexai.generative_models import GenerativeModel, Part

from config import (
    GOOGLE_CLOUD_PROJECT, 
    VERTEX_AI_LOCATION, 
    GEMINI_MODEL, 
    TARGET_FIELDS,
    PERFORMANCE_TARGETS
)

# ログ設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OCRService:
    def __init__(self):
        """OCRサービスの初期化"""
        self.vision_client = vision.ImageAnnotatorClient()
        
        # Vertex AI初期化
        vertexai.init(project=GOOGLE_CLOUD_PROJECT, location=VERTEX_AI_LOCATION)
        self.gemini_model = GenerativeModel(GEMINI_MODEL)
        
        logger.info("OCRService initialized")

    def preprocess_image(self, image_data: bytes) -> bytes:
        """
        画像前処理: 傾き補正、ノイズ除去、二値化
        """
        try:
            # PIL Image として読み込み
            pil_image = Image.open(BytesIO(image_data))
            
            # OpenCV形式に変換
            opencv_image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
            
            # グレースケール変換
            gray = cv2.cvtColor(opencv_image, cv2.COLOR_BGR2GRAY)
            
            # ノイズ除去
            denoised = cv2.fastNlMeansDenoising(gray)
            
            # 適応的閾値処理（二値化）
            binary = cv2.adaptiveThreshold(
                denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
            )
            
            # PIL Imageに戻す
            processed_image = Image.fromarray(binary)
            
            # バイト形式で返す
            output_buffer = BytesIO()
            processed_image.save(output_buffer, format='PNG')
            return output_buffer.getvalue()
            
        except Exception as e:
            logger.warning(f"前処理でエラー発生: {e}. 元画像を使用します。")
            return image_data

    def extract_text_with_vision(self, image_data: bytes) -> Tuple[str, float]:
        """
        Google Cloud Vision APIでテキスト抽出
        
        Returns:
            Tuple[str, float]: (抽出テキスト, 信頼度)
        """
        try:
            start_time = time.time()
            
            # 前処理
            processed_image = self.preprocess_image(image_data)
            
            # Vision API呼び出し
            image = vision.Image(content=processed_image)
            response = self.vision_client.text_detection(image=image)
            
            if response.error.message:
                raise Exception(f'Vision API Error: {response.error.message}')
            
            # テキスト抽出
            texts = response.text_annotations
            if not texts:
                return "", 0.0
            
            full_text = texts[0].description
            
            # 信頼度計算（各単語の信頼度の平均）
            total_confidence = 0
            word_count = 0
            for text in texts[1:]:  # 最初は全体テキストなのでスキップ
                if hasattr(text, 'confidence'):
                    total_confidence += text.confidence
                    word_count += 1
            
            confidence = total_confidence / word_count if word_count > 0 else 0.0
            
            processing_time = time.time() - start_time
            logger.info(f"Vision API処理時間: {processing_time:.2f}秒, 信頼度: {confidence:.2%}")
            
            return full_text, confidence
            
        except Exception as e:
            logger.error(f"Vision API エラー: {e}")
            return "", 0.0

    def structure_data_with_gemini(self, text: str) -> Dict:
        """
        Gemini Flashで構造化データに変換
        """
        try:
            start_time = time.time()
            
            # プロンプト作成
            prompt = self._create_extraction_prompt(text)
            
            # Gemini API呼び出し
            response = self.gemini_model.generate_content(prompt)
            
            processing_time = time.time() - start_time
            logger.info(f"Gemini処理時間: {processing_time:.2f}秒")
            
            # JSONパース
            try:
                result = json.loads(response.text)
                return result
            except json.JSONDecodeError:
                logger.error("Geminiの応答がJSONパースできませんでした")
                return {"error": "JSON parse error", "raw_response": response.text}
                
        except Exception as e:
            logger.error(f"Gemini API エラー: {e}")
            return {"error": str(e)}

    def _create_extraction_prompt(self, text: str) -> str:
        """
        登記簿謄本用の抽出プロンプト作成
        """
        fields_list = "\n".join([f"- {field}" for field in TARGET_FIELDS])
        
        prompt = f"""
以下は登記簿謄本から抽出したテキストです。
このテキストから以下の項目を抽出し、JSON形式で回答してください。

抽出項目:
{fields_list}

抽出したテキスト:
{text}

回答フォーマット:
{{
    "extracted_data": {{
        "不動産の表示": "抽出された値または空文字",
        "所在": "抽出された値または空文字",
        "地番": "抽出された値または空文字",
        ...（他の項目も同様）
    }},
    "confidence_scores": {{
        "不動産の表示": 0.95,
        "所在": 0.90,
        ...（各項目の信頼度0.0-1.0）
    }},
    "metadata": {{
        "total_fields": 抽出された項目数,
        "average_confidence": 平均信頼度
    }}
}}

注意:
- 抽出できない項目は空文字 "" にしてください
- 信頼度は0.0から1.0の数値で設定してください
- 必ずJSONフォーマットで回答してください
"""
        return prompt

    def process_pdf(self, pdf_path: str) -> Dict:
        """
        PDFファイル全体を処理
        """
        try:
            start_time = time.time()
            logger.info(f"PDF処理開始: {pdf_path}")
            
            # PDF読み込み
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                
                if len(pdf_reader.pages) == 0:
                    return {"error": "PDFにページが含まれていません"}
                
                # 最初のページを処理（登記簿謄本は通常1ページ）
                page = pdf_reader.pages[0]
                
                # ページを画像に変換（実際の実装では pdf2image を使用）
                # ここではサンプル画像を使用
                image_data = self._convert_page_to_image(page)
                
                if not image_data:
                    return {"error": "PDF to Image変換に失敗しました"}
                
                # Vision APIでテキスト抽出
                extracted_text, vision_confidence = self.extract_text_with_vision(image_data)
                
                if not extracted_text:
                    return {"error": "テキスト抽出に失敗しました"}
                
                # Geminiで構造化
                structured_data = self.structure_data_with_gemini(extracted_text)
                
                total_time = time.time() - start_time
                
                # 結果まとめ
                result = {
                    "success": True,
                    "processing_time": total_time,
                    "vision_confidence": vision_confidence,
                    "extracted_text": extracted_text[:500] + "..." if len(extracted_text) > 500 else extracted_text,
                    "structured_data": structured_data,
                    "performance_evaluation": self._evaluate_performance(total_time, structured_data)
                }
                
                logger.info(f"PDF処理完了: {total_time:.2f}秒")
                return result
                
        except Exception as e:
            logger.error(f"PDF処理エラー: {e}")
            return {"error": str(e), "success": False}

    def _convert_page_to_image(self, page) -> Optional[bytes]:
        """
        PDFページを画像に変換（実装例）
        実際の実装ではpdf2imageライブラリを使用推奨
        """
        # TODO: 実際の実装では pdf2image.convert_from_path を使用
        # ここではダミー画像データを返す
        
        # サンプル画像（1x1ピクセルの白画像）
        sample_image = Image.new('RGB', (1, 1), color='white')
        buffer = BytesIO()
        sample_image.save(buffer, format='PNG')
        return buffer.getvalue()

    def _evaluate_performance(self, processing_time: float, structured_data: Dict) -> Dict:
        """
        パフォーマンス評価
        """
        mvp_target = PERFORMANCE_TARGETS["mvp"]
        rc_target = PERFORMANCE_TARGETS["rc"]
        
        # 抽出成功率計算
        if "extracted_data" in structured_data:
            extracted_fields = sum(1 for v in structured_data["extracted_data"].values() if v)
            extraction_rate = extracted_fields / len(TARGET_FIELDS)
        else:
            extraction_rate = 0.0
        
        # 平均信頼度
        if "metadata" in structured_data and "average_confidence" in structured_data["metadata"]:
            avg_confidence = structured_data["metadata"]["average_confidence"]
        else:
            avg_confidence = 0.0
        
        return {
            "processing_time": {
                "actual": processing_time,
                "mvp_target": mvp_target["processing_time"],
                "rc_target": rc_target["processing_time"],
                "mvp_meets_target": processing_time <= mvp_target["processing_time"],
                "rc_meets_target": processing_time <= rc_target["processing_time"]
            },
            "accuracy": {
                "extraction_rate": extraction_rate,
                "average_confidence": avg_confidence,
                "mvp_target": mvp_target["accuracy"],
                "rc_target": rc_target["accuracy"],
                "mvp_meets_target": avg_confidence >= mvp_target["accuracy"],
                "rc_meets_target": avg_confidence >= rc_target["accuracy"]
            }
        }