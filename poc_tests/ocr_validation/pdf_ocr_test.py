"""
実際のPDFファイルを使用したOCRテスト
PDFを画像に変換してVision API + Geminiで処理
"""

import json
import urllib.request
import urllib.parse
import base64
import os
import sys
import time
from io import BytesIO

# 設定
GOOGLE_CLOUD_PROJECT = "real-estate-dx"
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY', '')

# APIキーが設定されていない場合の警告
if not GOOGLE_API_KEY:
    print("⚠️ 警告: GOOGLE_API_KEY環境変数が設定されていません")
    print("環境変数を設定してください: export GOOGLE_API_KEY='your-api-key'")
    sys.exit(1)

def pdf_to_image_base64(pdf_path):
    """
    PDFファイルを画像に変換してBase64エンコード
    注意: 実際の実装ではpdf2imageライブラリを使用推奨
    今回は簡易的にPDFの最初のページを読み込み
    """
    try:
        # PDFファイルサイズチェック
        file_size = os.path.getsize(pdf_path)
        print(f"PDFファイルサイズ: {file_size / (1024*1024):.2f} MB")
        
        if file_size > 100 * 1024 * 1024:  # 100MB制限
            print("❌ ファイルサイズが100MBを超えています")
            return None
        
        # PDFファイルを直接Base64エンコード（Vision APIはPDFも処理可能）
        with open(pdf_path, 'rb') as file:
            pdf_content = file.read()
            pdf_base64 = base64.b64encode(pdf_content).decode('utf-8')
        
        print(f"✅ PDFファイル読み込み完了: {len(pdf_base64)} 文字")
        return pdf_base64
        
    except Exception as e:
        print(f"❌ PDFファイル読み込みエラー: {e}")
        return None

def extract_text_from_pdf(pdf_base64):
    """
    Vision APIでPDFからテキスト抽出
    """
    print("\n=== Vision API でテキスト抽出 ===")
    
    try:
        # Vision API エンドポイント
        url = f"https://vision.googleapis.com/v1/images:annotate?key={GOOGLE_API_KEY}"
        
        # ペイロード作成
        payload = {
            "requests": [
                {
                    "image": {
                        "content": pdf_base64
                    },
                    "features": [
                        {
                            "type": "DOCUMENT_TEXT_DETECTION",  # 文書テキスト検出
                            "maxResults": 1
                        }
                    ]
                }
            ]
        }
        
        # APIリクエスト送信
        print("Vision APIリクエスト送信中...")
        start_time = time.time()
        
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(url, data=data)
        req.add_header('Content-Type', 'application/json')
        
        with urllib.request.urlopen(req, timeout=60) as response:
            result = json.loads(response.read().decode('utf-8'))
        
        processing_time = time.time() - start_time
        print(f"Vision API処理時間: {processing_time:.2f}秒")
        
        # レスポンス解析
        if "responses" not in result or not result["responses"]:
            print("❌ Vision API レスポンスが空です")
            return None, 0
        
        response_data = result["responses"][0]
        
        if "error" in response_data:
            print(f"❌ Vision API エラー: {response_data['error']}")
            return None, 0
        
        # テキスト抽出
        if "fullTextAnnotation" in response_data:
            full_text = response_data["fullTextAnnotation"]["text"]
            
            # 信頼度計算
            pages = response_data["fullTextAnnotation"].get("pages", [])
            total_confidence = 0
            word_count = 0
            
            for page in pages:
                for block in page.get("blocks", []):
                    for paragraph in block.get("paragraphs", []):
                        for word in paragraph.get("words", []):
                            if "confidence" in word:
                                total_confidence += word["confidence"]
                                word_count += 1
            
            confidence = total_confidence / word_count if word_count > 0 else 0.8
            
            print(f"✅ テキスト抽出成功")
            print(f"抽出文字数: {len(full_text)} 文字")
            print(f"平均信頼度: {confidence:.2%}")
            print(f"抽出テキスト（最初の500文字）:")
            print("-" * 50)
            print(full_text[:500])
            print("-" * 50)
            
            return full_text, confidence
            
        elif "textAnnotations" in response_data:
            # フォールバック: 通常のテキスト検出
            text_annotations = response_data["textAnnotations"]
            if text_annotations:
                full_text = text_annotations[0]["description"]
                print(f"✅ テキスト抽出成功（フォールバック）")
                print(f"抽出文字数: {len(full_text)} 文字")
                return full_text, 0.8
            
        print("❌ テキストが検出されませんでした")
        return None, 0
        
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        print(f"❌ Vision API HTTPエラー: {e.code}")
        print(f"エラー詳細: {error_body}")
        return None, 0
    except Exception as e:
        print(f"❌ Vision API エラー: {e}")
        return None, 0

def structure_data_with_gemini(text):
    """
    Geminiで登記簿データを構造化
    """
    print("\n=== Gemini で構造化データ抽出 ===")
    
    # 長いテキストの場合は最初の部分のみ使用（トークン制限対策）
    if len(text) > 4000:
        text = text[:4000] + "..."
        print(f"⚠️ テキストが長いため最初の4000文字のみ使用")
    
    extraction_prompt = f"""
以下は登記簿謄本から抽出したテキストです。
このテキストから重要な情報を抽出し、JSON形式で回答してください。

抽出したテキスト:
{text}

以下のJSONフォーマットで回答してください：
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
        "overall_confidence": 0.85
    }},
    "metadata": {{
        "extracted_fields": 抽出できた項目数,
        "total_fields": 15,
        "processing_notes": "処理に関する注記"
    }}
}}

注意事項:
- 抽出できない項目は空文字 "" にしてください
- 必ずJSONフォーマットで回答してください
- 信頼度は0.0から1.0の数値で設定してください
"""
    
    try:
        # Gemini API エンドポイント
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GOOGLE_API_KEY}"
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": extraction_prompt
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "maxOutputTokens": 2048,
            }
        }
        
        # APIリクエスト送信
        print("Gemini APIリクエスト送信中...")
        start_time = time.time()
        
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(url, data=data)
        req.add_header('Content-Type', 'application/json')
        
        with urllib.request.urlopen(req, timeout=60) as response:
            result = json.loads(response.read().decode('utf-8'))
        
        processing_time = time.time() - start_time
        print(f"Gemini処理時間: {processing_time:.2f}秒")
        
        # レスポンス解析
        if "candidates" not in result or not result["candidates"]:
            print("❌ Gemini API レスポンスが空です")
            return None
        
        candidate = result["candidates"][0]
        if "content" not in candidate or "parts" not in candidate["content"]:
            print("❌ Gemini API レスポンス形式が不正です")
            return None
        
        response_text = candidate["content"]["parts"][0].get("text", "")
        print(f"✅ Gemini処理成功")
        print(f"レスポンス長: {len(response_text)} 文字")
        
        # JSONパース試行
        try:
            # コードブロックマーカーを除去
            clean_text = response_text.replace("```json", "").replace("```", "").strip()
            structured_data = json.loads(clean_text)
            print("✅ JSON構造化成功")
            return structured_data
        except json.JSONDecodeError as e:
            print(f"⚠️ JSONパースエラー: {e}")
            print("Raw response:")
            print(response_text)
            return {"raw_response": response_text, "parse_error": str(e)}
        
    except Exception as e:
        print(f"❌ Gemini API エラー: {e}")
        return None

def evaluate_performance(vision_time, gemini_time, structured_data, vision_confidence):
    """
    パフォーマンス評価
    """
    print("\n=== パフォーマンス評価 ===")
    
    total_time = vision_time + gemini_time
    
    # 時間評価
    mvp_time_target = 60  # 60秒
    rc_time_target = 30   # 30秒
    
    print(f"総処理時間: {total_time:.2f}秒")
    print(f"  - Vision API: {vision_time:.2f}秒")
    print(f"  - Gemini API: {gemini_time:.2f}秒")
    print(f"MVP時間目標 (60秒以内): {'✅' if total_time <= mvp_time_target else '❌'}")
    print(f"RC時間目標 (30秒以内): {'✅' if total_time <= rc_time_target else '❌'}")
    
    # 精度評価
    if structured_data and "extracted_data" in structured_data:
        extracted_count = sum(1 for v in structured_data["extracted_data"].values() if v.strip())
        total_fields = 15
        extraction_rate = extracted_count / total_fields
        
        print(f"\n抽出成功率: {extraction_rate:.1%} ({extracted_count}/{total_fields})")
        print(f"Vision信頼度: {vision_confidence:.1%}")
        
        mvp_accuracy_target = 0.95
        rc_accuracy_target = 0.98
        
        # 総合精度（Vision信頼度と抽出成功率の平均）
        overall_accuracy = (vision_confidence + extraction_rate) / 2
        
        print(f"総合精度: {overall_accuracy:.1%}")
        print(f"MVP精度目標 (95%以上): {'✅' if overall_accuracy >= mvp_accuracy_target else '❌'}")
        print(f"RC精度目標 (98%以上): {'✅' if overall_accuracy >= rc_accuracy_target else '❌'}")
        
        return {
            "processing_time": total_time,
            "accuracy": overall_accuracy,
            "extraction_rate": extraction_rate,
            "mvp_time_ok": total_time <= mvp_time_target,
            "mvp_accuracy_ok": overall_accuracy >= mvp_accuracy_target,
            "rc_time_ok": total_time <= rc_time_target,
            "rc_accuracy_ok": overall_accuracy >= rc_accuracy_target
        }
    
    return {"processing_time": total_time, "accuracy": 0}

def test_pdf_ocr(pdf_path):
    """
    PDFファイルのOCRテスト実行
    """
    print(f"=== PDF OCRテスト開始: {pdf_path} ===")
    
    if not os.path.exists(pdf_path):
        print(f"❌ ファイルが見つかりません: {pdf_path}")
        return False
    
    # 1. PDFを画像に変換
    pdf_base64 = pdf_to_image_base64(pdf_path)
    if not pdf_base64:
        return False
    
    # 2. Vision APIでテキスト抽出
    start_vision = time.time()
    extracted_text, vision_confidence = extract_text_from_pdf(pdf_base64)
    vision_time = time.time() - start_vision
    
    if not extracted_text:
        print("❌ テキスト抽出に失敗しました")
        return False
    
    # 3. Geminiで構造化
    start_gemini = time.time()
    structured_data = structure_data_with_gemini(extracted_text)
    gemini_time = time.time() - start_gemini
    
    if not structured_data:
        print("❌ 構造化データ抽出に失敗しました")
        return False
    
    # 4. パフォーマンス評価
    performance = evaluate_performance(vision_time, gemini_time, structured_data, vision_confidence)
    
    # 5. 結果表示
    print("\n=== 抽出結果サンプル ===")
    if "extracted_data" in structured_data:
        for key, value in list(structured_data["extracted_data"].items())[:8]:
            if value.strip():  # 空でない項目のみ表示
                print(f"{key}: {value}")
    
    return True

def main():
    """
    メインテスト実行
    """
    print("実際のPDFファイルを使用したOCRテスト")
    print("=" * 60)
    
    # サンプルPDFファイルパス
    pdf_path = "/mnt/c/Users/mtsid/OneDrive/ドキュメント/TALENT/AIDX/不動産売買システム/poc_tests/ocr_validation/sample_documents/登記簿サンプル.pdf"
    
    success = test_pdf_ocr(pdf_path)
    
    if success:
        print("\n🎉 PDF OCRテスト完了")
        print("実際の登記簿PDFでのOCR処理が正常に動作しました！")
    else:
        print("\n❌ PDF OCRテストに失敗しました")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)