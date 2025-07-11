# OCR機能 PoC動作確認

## 概要
登記簿PDFのAI-OCR機能の技術的実現可能性を検証するためのPoCテストコード群

## 検証項目
1. Google Cloud Vision API + Gemini Flash の組み合わせ
2. 処理速度・精度の測定
3. コスト計算
4. エラーハンドリング

## 前提条件
- Python 3.9+
- Google Cloud プロジェクトとサービスアカウント
- 必要なAPIの有効化：
  - Cloud Vision API
  - Vertex AI API

## セットアップ
```bash
cd poc_tests/ocr_validation
pip install -r requirements.txt
```

## API キー設定
以下の環境変数またはサービスアカウントキーファイルが必要：
- `GOOGLE_APPLICATION_CREDENTIALS`: サービスアカウントキーファイルのパス
- `GOOGLE_CLOUD_PROJECT`: Google Cloud プロジェクトID

## テスト実行
```bash
python test_vision_gemini.py --pdf_path=sample_documents/
```