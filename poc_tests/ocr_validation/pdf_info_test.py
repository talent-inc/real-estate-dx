"""
PDFファイルの情報確認とテキスト抽出テスト
"""

import os
import sys
import json
import urllib.request
import base64
import time

# 設定
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY', '')

# APIキーが設定されていない場合の警告
if not GOOGLE_API_KEY:
    print("⚠️ 警告: GOOGLE_API_KEY環境変数が設定されていません")
    print("環境変数を設定してください: export GOOGLE_API_KEY='your-api-key'")
    sys.exit(1)

def analyze_pdf_file(pdf_path):
    """
    PDFファイルの基本情報を確認
    """
    print(f"=== PDFファイル分析: {os.path.basename(pdf_path)} ===")
    
    if not os.path.exists(pdf_path):
        print(f"❌ ファイルが見つかりません: {pdf_path}")
        return False
    
    # ファイル情報
    file_size = os.path.getsize(pdf_path)
    print(f"ファイルサイズ: {file_size:,} bytes ({file_size / (1024*1024):.2f} MB)")
    
    # ファイル形式確認
    with open(pdf_path, 'rb') as f:
        header = f.read(10)
        print(f"ファイルヘッダー: {header}")
        
        if header.startswith(b'%PDF'):
            print("✅ 有効なPDFファイルです")
            return True
        else:
            print("❌ PDFファイル形式ではありません")
            return False

def test_document_ai_api(pdf_path):
    """
    Document AI APIでPDF処理をテスト
    """
    print(f"\n=== Document AI API テスト ===")
    
    try:
        # PDFファイル読み込み
        with open(pdf_path, 'rb') as file:
            pdf_content = file.read()
            pdf_base64 = base64.b64encode(pdf_content).decode('utf-8')
        
        # Document AI API エンドポイント (簡易的にVision APIの文書解析機能を使用)
        url = f"https://vision.googleapis.com/v1/images:annotate?key={GOOGLE_API_KEY}"
        
        # まず小さなサンプル画像でテスト
        test_image_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
        
        payload = {
            "requests": [
                {
                    "image": {
                        "content": test_image_base64
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
        
        print("Vision API接続テスト中...")
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(url, data=data)
        req.add_header('Content-Type', 'application/json')
        
        with urllib.request.urlopen(req, timeout=30) as response:
            result = json.loads(response.read().decode('utf-8'))
        
        print("✅ Vision API接続成功")
        return True
        
    except Exception as e:
        print(f"❌ Document AI API テストエラー: {e}")
        return False

def extract_text_alternative_method(pdf_path):
    """
    代替方法でPDFからテキスト抽出（Geminiに直接PDFを送信）
    """
    print(f"\n=== Gemini API 直接PDF処理テスト ===")
    
    try:
        # PDFファイルを読み込み
        with open(pdf_path, 'rb') as file:
            pdf_content = file.read()
            pdf_base64 = base64.b64encode(pdf_content).decode('utf-8')
        
        # Gemini APIに直接PDFを送信
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GOOGLE_API_KEY}"
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": "添付されたPDFファイルは登記簿謄本です。このファイルからテキストを抽出し、重要な情報（所在、地番、所有者等）を教えてください。"
                        },
                        {
                            "inline_data": {
                                "mime_type": "application/pdf",
                                "data": pdf_base64
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "maxOutputTokens": 2048,
            }
        }
        
        print("Gemini APIでPDF処理中...")
        start_time = time.time()
        
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(url, data=data)
        req.add_header('Content-Type', 'application/json')
        
        with urllib.request.urlopen(req, timeout=120) as response:
            result = json.loads(response.read().decode('utf-8'))
        
        processing_time = time.time() - start_time
        print(f"処理時間: {processing_time:.2f}秒")
        
        # レスポンス解析
        if "candidates" in result and result["candidates"]:
            response_text = result["candidates"][0]["content"]["parts"][0]["text"]
            print("✅ Gemini PDF処理成功")
            print(f"抽出結果 ({len(response_text)} 文字):")
            print("-" * 60)
            print(response_text)
            print("-" * 60)
            return True
        else:
            print(f"❌ Gemini API レスポンス異常: {result}")
            return False
        
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        print(f"❌ Gemini API HTTPエラー: {e.code}")
        print(f"エラー詳細: {error_body}")
        return False
    except Exception as e:
        print(f"❌ Gemini PDF処理エラー: {e}")
        return False

def test_simple_text_extraction():
    """
    簡単なテキスト処理テスト
    """
    print(f"\n=== 簡単なテキスト処理テスト ===")
    
    sample_text = """
登記記録
不動産の表示
所在: 東京都渋谷区神宮前
地番: 1番1
地目: 宅地
地積: 300.45平方メートル
所有者: 山田太郎
住所: 東京都渋谷区神宮前1-1-1
"""
    
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GOOGLE_API_KEY}"
        
        prompt = f"""
以下のテキストから重要な情報を抽出してJSON形式で回答してください：

{sample_text}

JSON形式:
{{
    "所在": "抽出された所在地",
    "地番": "抽出された地番",
    "地目": "抽出された地目",
    "地積": "抽出された地積",
    "所有者": "抽出された所有者名",
    "住所": "抽出された住所"
}}
"""
        
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.1, "maxOutputTokens": 1000}
        }
        
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(url, data=data)
        req.add_header('Content-Type', 'application/json')
        
        with urllib.request.urlopen(req, timeout=30) as response:
            result = json.loads(response.read().decode('utf-8'))
        
        if "candidates" in result and result["candidates"]:
            response_text = result["candidates"][0]["content"]["parts"][0]["text"]
            print("✅ テキスト処理成功")
            print("抽出結果:")
            print(response_text)
            return True
        
    except Exception as e:
        print(f"❌ テキスト処理エラー: {e}")
        return False

def main():
    """
    メインテスト実行
    """
    print("PDFファイル詳細分析テスト")
    print("=" * 60)
    
    pdf_path = "/mnt/c/Users/mtsid/OneDrive/ドキュメント/TALENT/AIDX/不動産売買システム/poc_tests/ocr_validation/sample_documents/登記簿サンプル.pdf"
    
    # 1. PDFファイル分析
    if not analyze_pdf_file(pdf_path):
        return False
    
    # 2. API接続テスト
    if not test_document_ai_api(pdf_path):
        return False
    
    # 3. 簡単なテキスト処理テスト
    if not test_simple_text_extraction():
        return False
    
    # 4. Gemini直接PDF処理テスト
    print("\n" + "="*60)
    print("🚀 実際のPDFファイルでテスト実行中...")
    pdf_success = extract_text_alternative_method(pdf_path)
    
    if pdf_success:
        print("\n🎉 PDF処理テスト成功！")
        print("Gemini APIで直接PDFファイルの処理ができました")
    else:
        print("\n⚠️ PDF直接処理は失敗しましたが、テキストベースの処理は正常です")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)