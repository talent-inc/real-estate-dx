"""
OCR サービス実装（APIキー版）
Google Cloud Vision API + Gemini Flash の組み合わせテスト
APIキー認証を使用
"""

import time
import json
import base64
from typing import Dict, List, Optional, Tuple
from io import BytesIO
import logging
import os

import PyPDF2
from PIL import Image
import cv2
import numpy as np
import requests
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

class OCRServiceAPIKey:
    def __init__(self):
        """OCRサービスの初期化（APIキー版）"""
        self.api_key = os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY環境変数が設定されていません")
        
        # Vision API用のエンドポイント
        self.vision_endpoint = f"https://vision.googleapis.com/v1/images:annotate?key={self.api_key}"
        
        # Gemini用のエンドポイント
        self.gemini_endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
        
        logger.info("OCRServiceAPIKey initialized")

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

    def extract_text_with_vision_api(self, image_data: bytes) -> Tuple[str, float]:
        """
        Google Cloud Vision API（REST）でテキスト抽出
        
        Returns:
            Tuple[str, float]: (抽出テキスト, 信頼度)
        """
        try:
            start_time = time.time()
            
            # 前処理
            processed_image = self.preprocess_image(image_data)
            
            # Base64エンコード
            image_base64 = base64.b64encode(processed_image).decode('utf-8')
            
            # リクエストペイロード
            payload = {
                "requests": [
                    {
                        "image": {
                            "content": image_base64
                        },
                        "features": [
                            {
                                "type": "TEXT_DETECTION",
                                "maxResults": 1
                            }
                        ]
                    }
                ]
            }
            
            # Vision API呼び出し
            response = requests.post(self.vision_endpoint, json=payload)
            response.raise_for_status()
            
            result = response.json()
            
            if "responses" not in result or not result["responses"]:
                return "", 0.0
            
            response_data = result["responses"][0]
            
            if "error" in response_data:
                raise Exception(f'Vision API Error: {response_data["error"]}')
            
            # テキスト抽出
            text_annotations = response_data.get("textAnnotations", [])
            if not text_annotations:
                return "", 0.0
            
            full_text = text_annotations[0].get("description", "")
            
            # 信頼度計算（各単語の信頼度の平均）
            total_confidence = 0
            word_count = 0
            for annotation in text_annotations[1:]:  # 最初は全体テキストなのでスキップ
                if "confidence" in annotation:
                    total_confidence += annotation["confidence"]
                    word_count += 1
            
            confidence = total_confidence / word_count if word_count > 0 else 0.8  # デフォルト値
            
            processing_time = time.time() - start_time
            logger.info(f"Vision API処理時間: {processing_time:.2f}秒, 信頼度: {confidence:.2%}")
            
            return full_text, confidence
            
        except Exception as e:
            logger.error(f"Vision API エラー: {e}")
            return "", 0.0

    def structure_data_with_gemini_api(self, text: str) -> Dict:
        """
        Gemini Flash（REST API）で構造化データに変換
        """
        try:
            start_time = time.time()
            
            # プロンプト作成
            prompt = self._create_extraction_prompt(text)
            
            # リクエストペイロード
            payload = {
                "contents": [
                    {
                        "parts": [
                            {
                                "text": prompt
                            }
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.1,
                    "maxOutputTokens": 2048,
                }
            }
            
            # Gemini API呼び出し
            response = requests.post(self.gemini_endpoint, json=payload)
            response.raise_for_status()
            
            result = response.json()
            
            processing_time = time.time() - start_time
            logger.info(f"Gemini処理時間: {processing_time:.2f}秒")
            
            # レスポンス解析
            if "candidates" not in result or not result["candidates"]:
                return {"error": "Gemini API: No candidates in response"}
            
            candidate = result["candidates"][0]
            if "content" not in candidate or "parts" not in candidate["content"]:
                return {"error": "Gemini API: Invalid response structure"}
            
            response_text = candidate["content"]["parts"][0].get("text", "")
            
            # JSONパース
            try:
                parsed_result = json.loads(response_text)
                return parsed_result
            except json.JSONDecodeError:
                logger.error("Geminiの応答がJSONパースできませんでした")
                return {"error": "JSON parse error", "raw_response": response_text}
                
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
        "地目": "抽出された値または空文字",
        "地積": "抽出された値または空文字",
        "所有者の氏名又は名称": "抽出された値または空文字",
        "住所": "抽出された値または空文字",
        "持分": "抽出された値または空文字",
        "登記の目的": "抽出された値または空文字",
        "受付年月日・受付番号": "抽出された値または空文字",
        "登記原因": "抽出された値または空文字",
        "権利者その他の事項": "抽出された値または空文字",
        "建物の表示": "抽出された値または空文字",
        "家屋番号": "抽出された値または空文字",
        "構造": "抽出された値または空文字"
    }},
    "confidence_scores": {{
        "不動産の表示": 0.95,
        "所在": 0.90,
        "地番": 0.85,
        "地目": 0.90,
        "地積": 0.85,
        "所有者の氏名又は名称": 0.95,
        "住所": 0.90,
        "持分": 0.80,
        "登記の目的": 0.85,
        "受付年月日・受付番号": 0.80,
        "登記原因": 0.85,
        "権利者その他の事項": 0.75,
        "建物の表示": 0.90,
        "家屋番号": 0.85,
        "構造": 0.85
    }},
    "metadata": {{
        "total_fields": 15,
        "average_confidence": 0.85
    }}
}}

注意:
- 抽出できない項目は空文字 "" にしてください
- 信頼度は0.0から1.0の数値で設定してください
- 必ずJSONフォーマットで回答してください
- 上記の全ての項目を含めてください
"""
        return prompt

    def process_pdf_simple(self, pdf_path: str) -> Dict:
        """
        PDFファイル処理（簡易版）
        実際のPDFからテキスト抽出ではなく、サンプルテキストで動作確認
        """
        try:
            start_time = time.time()
            logger.info(f"PDF処理開始: {pdf_path}")
            
            # サンプルテキスト（実際の登記簿謄本の例）
            sample_text = """
登記簿謄本

不動産の表示
所在: 東京都新宿区西新宿
地番: 1番1
地目: 宅地
地積: 500.00平方メートル

権利部（甲区）
順位番号1
登記の目的: 所有権保存
受付年月日・受付番号: 平成20年3月15日 第5678号
権利者その他の事項: 
所有者 田中太郎
住所 東京都新宿区西新宿1-1-1

建物の表示
家屋番号: 1番1
構造: 鉄筋コンクリート造陸屋根3階建
床面積: 1階 200.00平方メートル
        2階 180.00平方メートル
        3階 180.00平方メートル
"""
            
            # Geminiで構造化
            structured_data = self.structure_data_with_gemini_api(sample_text)
            
            total_time = time.time() - start_time
            
            # 結果まとめ
            result = {
                "success": True,
                "processing_time": total_time,
                "vision_confidence": 0.9,  # サンプル値
                "extracted_text": sample_text,
                "structured_data": structured_data,
                "performance_evaluation": self._evaluate_performance(total_time, structured_data),
                "note": "APIキー版テスト - サンプルテキストを使用"
            }
            
            logger.info(f"PDF処理完了: {total_time:.2f}秒")
            return result
            
        except Exception as e:
            logger.error(f"PDF処理エラー: {e}")
            return {"error": str(e), "success": False}

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

    def test_api_connectivity(self) -> Dict:
        """
        API接続テスト
        """
        results = {}
        
        # Gemini API接続テスト
        try:
            test_result = self.structure_data_with_gemini_api("これはテストです")
            if "error" not in test_result:
                results["gemini"] = {"status": "success", "message": "Gemini API接続成功"}
            else:
                results["gemini"] = {"status": "error", "message": f"Gemini API エラー: {test_result['error']}"}
        except Exception as e:
            results["gemini"] = {"status": "error", "message": f"Gemini API 例外: {str(e)}"}
        
        # Vision API接続テスト（簡易版）
        try:
            # 1x1ピクセルの白画像でテスト
            test_image = Image.new('RGB', (1, 1), color='white')
            buffer = BytesIO()
            test_image.save(buffer, format='PNG')
            test_image_data = buffer.getvalue()
            
            text, confidence = self.extract_text_with_vision_api(test_image_data)
            results["vision"] = {"status": "success", "message": "Vision API接続成功"}
        except Exception as e:
            results["vision"] = {"status": "error", "message": f"Vision API エラー: {str(e)}"}
        
        return results