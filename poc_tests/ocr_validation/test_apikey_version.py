"""
APIキー版OCRテスト
提供されたGoogle Cloud APIキーを使用したテスト
"""

import os
import json
import time
from pathlib import Path
from dotenv import load_dotenv

from ocr_service_apikey import OCRServiceAPIKey

# 環境変数読み込み
load_dotenv()

def test_api_connectivity():
    """
    API接続テスト
    """
    print("=== API接続テスト（APIキー版） ===")
    
    try:
        # 環境変数確認
        api_key = os.getenv("GOOGLE_API_KEY")
        project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
        
        print(f"プロジェクトID: {project_id}")
        print(f"APIキー設定: {'設定済み' if api_key else '未設定'}")
        
        if not api_key:
            print("❌ GOOGLE_API_KEY環境変数が設定されていません")
            return False
        
        # OCRサービス初期化
        ocr_service = OCRServiceAPIKey()
        print("✅ OCRServiceAPIKey初期化成功")
        
        # API接続テスト実行
        connectivity_results = ocr_service.test_api_connectivity()
        
        print("\n--- API接続結果 ---")
        for api_name, result in connectivity_results.items():
            status_icon = "✅" if result["status"] == "success" else "❌"
            print(f"{status_icon} {api_name.upper()} API: {result['message']}")
        
        # 全てのAPIが成功しているかチェック
        all_success = all(result["status"] == "success" for result in connectivity_results.values())
        
        if all_success:
            print("\n✅ 全てのAPI接続に成功しました")
        else:
            print("\n⚠️ 一部のAPI接続に問題があります")
        
        return all_success
        
    except Exception as e:
        print(f"❌ API接続テストエラー: {e}")
        return False

def test_ocr_functionality():
    """
    OCR機能テスト（サンプルテキスト使用）
    """
    print("\n=== OCR機能テスト ===")
    
    try:
        ocr_service = OCRServiceAPIKey()
        
        # サンプルテスト実行
        print("サンプルテキストによるOCR処理テストを実行中...")
        result = ocr_service.process_pdf_simple("sample_test.pdf")
        
        if result.get("success"):
            print("✅ OCR処理成功")
            
            # 処理時間
            processing_time = result.get("processing_time", 0)
            print(f"処理時間: {processing_time:.2f}秒")
            
            # パフォーマンス評価
            perf = result.get("performance_evaluation", {})
            
            # 処理時間評価
            time_eval = perf.get("processing_time", {})
            mvp_time_ok = time_eval.get("mvp_meets_target", False)
            rc_time_ok = time_eval.get("rc_meets_target", False)
            
            print(f"MVP時間目標: {'✅' if mvp_time_ok else '❌'} ({time_eval.get('mvp_target')}秒以内)")
            print(f"RC時間目標: {'✅' if rc_time_ok else '❌'} ({time_eval.get('rc_target')}秒以内)")
            
            # 精度評価
            acc_eval = perf.get("accuracy", {})
            extraction_rate = acc_eval.get("extraction_rate", 0)
            avg_confidence = acc_eval.get("average_confidence", 0)
            mvp_acc_ok = acc_eval.get("mvp_meets_target", False)
            rc_acc_ok = acc_eval.get("rc_meets_target", False)
            
            print(f"抽出率: {extraction_rate:.1%}")
            print(f"平均信頼度: {avg_confidence:.1%}")
            print(f"MVP精度目標: {'✅' if mvp_acc_ok else '❌'} ({acc_eval.get('mvp_target', 0):.1%}以上)")
            print(f"RC精度目標: {'✅' if rc_acc_ok else '❌'} ({acc_eval.get('rc_target', 0):.1%}以上)")
            
            # 抽出データサンプル表示
            structured_data = result.get("structured_data", {})
            if "extracted_data" in structured_data:
                print("\n--- 抽出データサンプル ---")
                extracted_data = structured_data["extracted_data"]
                for field, value in list(extracted_data.items())[:5]:
                    print(f"{field}: {value}")
                
                if len(extracted_data) > 5:
                    print(f"... 他 {len(extracted_data) - 5} 項目")
            
            return True
            
        else:
            print(f"❌ OCR処理失敗: {result.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"❌ OCR機能テストエラー: {e}")
        return False

def generate_test_report(connectivity_success: bool, ocr_success: bool):
    """
    テストレポート生成
    """
    print("\n" + "="*50)
    print("テストレポート")
    print("="*50)
    
    print(f"API接続テスト: {'✅ 成功' if connectivity_success else '❌ 失敗'}")
    print(f"OCR機能テスト: {'✅ 成功' if ocr_success else '❌ 失敗'}")
    
    overall_success = connectivity_success and ocr_success
    print(f"\n総合結果: {'✅ 全テスト成功' if overall_success else '❌ 一部テスト失敗'}")
    
    if overall_success:
        print("\n🎉 OCR機能の基本動作確認が完了しました！")
        print("次のステップ:")
        print("1. 実際の登記簿PDFファイルでのテスト")
        print("2. 複数ファイルでの精度・速度測定")
        print("3. 本格的なPoCの実装")
    else:
        print("\n⚠️ 問題を解決してから次のステップに進んでください")
        if not connectivity_success:
            print("- API設定の確認")
            print("- APIキーの権限確認")
        if not ocr_success:
            print("- OCR処理ロジックの確認")
            print("- エラーログの詳細確認")

def main():
    """
    メインテスト実行
    """
    print("Google Cloud OCR機能テスト開始")
    print(f"プロジェクト: {os.getenv('GOOGLE_CLOUD_PROJECT', 'unknown')}")
    print(f"APIキー: {'設定済み' if os.getenv('GOOGLE_API_KEY') else '未設定'}")
    
    # 1. API接続テスト
    connectivity_success = test_api_connectivity()
    
    # 2. OCR機能テスト（API接続が成功した場合のみ）
    ocr_success = False
    if connectivity_success:
        ocr_success = test_ocr_functionality()
    else:
        print("\n⚠️ API接続テストが失敗したため、OCR機能テストをスキップします")
    
    # 3. レポート生成
    generate_test_report(connectivity_success, ocr_success)

if __name__ == "__main__":
    main()