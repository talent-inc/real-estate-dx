# サンプル文書フォルダ

## 概要
OCR機能のテスト用サンプル登記簿PDFファイルを配置するフォルダです。

## 必要なサンプルファイル
以下のような多様なパターンの登記簿謄本PDFを準備してください：

### 1. 基本パターン
- `sample_01_basic.pdf` - 標準的な登記簿謄本
- `sample_02_standard.pdf` - 一般的なフォーマット

### 2. 品質バリエーション
- `sample_03_high_quality.pdf` - 高解像度（300dpi以上）
- `sample_04_low_quality.pdf` - 低解像度（200dpi未満）
- `sample_05_scanned.pdf` - スキャンされた画像PDF

### 3. レイアウトバリエーション
- `sample_06_old_format.pdf` - 古い様式の登記簿
- `sample_07_new_format.pdf` - 新しい様式の登記簿
- `sample_08_handwritten.pdf` - 手書き部分を含む登記簿

### 4. 複雑ケース
- `sample_09_multiple_owners.pdf` - 複数所有者の登記簿
- `sample_10_complex_layout.pdf` - 複雑なレイアウトの登記簿

## 注意事項
- 実際の個人情報が含まれる登記簿謄本は使用しないでください
- テスト用の匿名化されたサンプルまたはダミーデータを使用してください
- ファイルサイズは100MB以下にしてください

## テスト実行
```bash
# 単一ファイルテスト
python test_vision_gemini.py --pdf_path sample_documents/sample_01_basic.pdf

# 一括テスト
python test_vision_gemini.py --pdf_path sample_documents/
```