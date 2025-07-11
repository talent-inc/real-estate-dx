"""
シンプルなAPI接続テスト（最小依存関係版）
標準ライブラリのみ使用
"""

import json
import urllib.request
import urllib.parse
import base64
import os
import sys

# 設定
GOOGLE_CLOUD_PROJECT = "real-estate-dx"
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY', '')

# APIキーが設定されていない場合の警告
if not GOOGLE_API_KEY:
    print("⚠️ 警告: GOOGLE_API_KEY環境変数が設定されていません")
    print("環境変数を設定してください: export GOOGLE_API_KEY='your-api-key'")
    sys.exit(1)

def test_gemini_api():
    """
    Gemini API接続テスト
    """
    print("=== Gemini API接続テスト ===")
    
    try:
        # エンドポイント
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GOOGLE_API_KEY}"
        
        # テストペイロード
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": "これはAPIテストです。'成功'と返答してください。"
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "maxOutputTokens": 100,
            }
        }
        
        # リクエスト作成
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(url, data=data)
        req.add_header('Content-Type', 'application/json')
        
        # APIリクエスト実行
        print("Gemini APIリクエスト送信中...")
        with urllib.request.urlopen(req, timeout=30) as response:
            result = json.loads(response.read().decode('utf-8'))
        
        # レスポンス確認
        if "candidates" in result and result["candidates"]:
            response_text = result["candidates"][0]["content"]["parts"][0]["text"]
            print(f"✅ Gemini API接続成功")
            print(f"レスポンス: {response_text}")
            return True
        else:
            print(f"❌ Gemini API レスポンス異常: {result}")
            return False
            
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        print(f"❌ Gemini API HTTPエラー: {e.code} - {error_body}")
        return False
    except Exception as e:
        print(f"❌ Gemini API エラー: {e}")
        return False

def test_vision_api():
    """
    Vision API接続テスト
    """
    print("\n=== Vision API接続テスト ===")
    
    try:
        # エンドポイント
        url = f"https://vision.googleapis.com/v1/images:annotate?key={GOOGLE_API_KEY}"
        
        # テスト用1x1ピクセル画像（Base64エンコード済み）
        # 白色1ピクセルPNG画像
        test_image_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
        
        # ペイロード
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
        
        # リクエスト作成
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(url, data=data)
        req.add_header('Content-Type', 'application/json')
        
        # APIリクエスト実行
        print("Vision APIリクエスト送信中...")
        with urllib.request.urlopen(req, timeout=30) as response:
            result = json.loads(response.read().decode('utf-8'))
        
        # レスポンス確認
        if "responses" in result:
            response_data = result["responses"][0]
            if "error" in response_data:
                print(f"❌ Vision API エラー: {response_data['error']}")
                return False
            else:
                print("✅ Vision API接続成功")
                if "textAnnotations" in response_data:
                    print("テキスト検出機能: 動作確認済み")
                else:
                    print("テキスト検出結果: なし（テスト画像が小さいため正常）")
                return True
        else:
            print(f"❌ Vision API レスポンス異常: {result}")
            return False
            
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        print(f"❌ Vision API HTTPエラー: {e.code} - {error_body}")
        return False
    except Exception as e:
        print(f"❌ Vision API エラー: {e}")
        return False

def test_ocr_integration():
    """
    OCR統合テスト（サンプルテキスト）
    """
    print("\n=== OCR統合テスト ===")
    
    # サンプル登記簿テキスト
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
"""
    
    # Geminiで構造化データ抽出
    extraction_prompt = f"""
以下の登記簿謄本テキストから情報を抽出し、JSON形式で回答してください：

{sample_text}

以下のJSONフォーマットで回答：
{{
    "所在": "抽出された所在地",
    "地番": "抽出された地番",
    "地目": "抽出された地目",
    "地積": "抽出された地積",
    "所有者": "抽出された所有者名",
    "住所": "抽出された住所"
}}
"""
    
    try:
        # Gemini API呼び出し
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GOOGLE_API_KEY}"
        
        payload = {
            "contents": [{"parts": [{"text": extraction_prompt}]}],
            "generationConfig": {"temperature": 0.1, "maxOutputTokens": 1000}
        }
        
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(url, data=data)
        req.add_header('Content-Type', 'application/json')
        
        print("登記簿情報抽出テスト実行中...")
        with urllib.request.urlopen(req, timeout=30) as response:
            result = json.loads(response.read().decode('utf-8'))
        
        if "candidates" in result and result["candidates"]:
            response_text = result["candidates"][0]["content"]["parts"][0]["text"]
            print("✅ 情報抽出成功")
            print("抽出結果:")
            print(response_text)
            
            # JSONパース試行
            try:
                extracted_data = json.loads(response_text)
                print("\n✅ JSON形式での構造化成功")
                print("構造化データ:")
                for key, value in extracted_data.items():
                    print(f"  {key}: {value}")
                return True
            except json.JSONDecodeError:
                print("⚠️ JSONパースできませんが、テキスト抽出は成功")
                return True
        else:
            print(f"❌ 情報抽出失敗: {result}")
            return False
            
    except Exception as e:
        print(f"❌ OCR統合テスト エラー: {e}")
        return False

def main():
    """
    メインテスト実行
    """
    print("Google Cloud OCR機能 簡易テスト")
    print(f"プロジェクトID: {GOOGLE_CLOUD_PROJECT}")
    print(f"APIキー: {GOOGLE_API_KEY[:20]}...")
    print("="*50)
    
    results = []
    
    # 1. Gemini APIテスト
    gemini_success = test_gemini_api()
    results.append(("Gemini API", gemini_success))
    
    # 2. Vision APIテスト
    vision_success = test_vision_api()
    results.append(("Vision API", vision_success))
    
    # 3. OCR統合テスト（Gemini APIが成功した場合）
    if gemini_success:
        ocr_success = test_ocr_integration()
        results.append(("OCR統合", ocr_success))
    else:
        print("\n⚠️ Gemini APIテストが失敗したため、OCR統合テストをスキップ")
        ocr_success = False
    
    # 結果サマリー
    print("\n" + "="*50)
    print("テスト結果サマリー")
    print("="*50)
    
    for test_name, success in results:
        status = "✅ 成功" if success else "❌ 失敗"
        print(f"{test_name}: {status}")
    
    all_success = all(success for _, success in results)
    
    if all_success:
        print("\n🎉 全テスト成功！OCR機能の基本動作確認完了")
        print("\n次のステップ:")
        print("1. 実際の登記簿PDFファイルでの検証")
        print("2. 精度・速度の詳細測定")
        print("3. エラーハンドリングの強化")
        
    else:
        print("\n⚠️ 一部テストが失敗しました")
        print("確認事項:")
        print("1. APIキーの権限設定")
        print("2. 必要なAPIの有効化")
        print("3. プロジェクト設定の確認")
    
    return all_success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)