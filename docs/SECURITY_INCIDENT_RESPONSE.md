# 🔐 セキュリティインシデント対応記録

## 2025年7月11日 - Google API Key漏洩インシデント

### インシデント概要
- **発生日時**: 2025年7月11日
- **発見方法**: GitHub Secret Scanning Alert #1
- **漏洩したキー**: `AIzaSyARAEr8OZJ20CjAx7u_q0y7VN25un9JpEc`
- **影響範囲**: 6箇所のソースコードファイル

### 対応内容

#### 1. ✅ API Keyの無効化
- gcloudコマンドで漏洩したキーを削除
- 削除時刻: 2025-07-11T13:53:52.876960Z

#### 2. ✅ 新しいAPI Keyの発行
- 新キーID: `e66df83f-df6e-4f9b-b2dc-13be7a3bfc06`
- 表示名: `real-estate-dx-api-key-v2`
- API制限: Generative Language API (generativelanguage.googleapis.com) のみ

#### 3. ✅ コードの修正
- すべてのハードコードされたAPI Keyを環境変数に置換
- .env.exampleをプレースホルダーに更新
- セキュリティガイドラインを追加

#### 4. ✅ 環境変数の設定
- .envファイルに新しいAPI Keyを設定
- 環境変数設定用スクリプトを作成

### 影響評価
- セキュリティログを確認した結果、不正利用の形跡なし
- 漏洩期間: 約1時間（コミットからキー削除まで）

### 再発防止策
1. pre-commitフックでのシークレット検出
2. 定期的なシークレットスキャン
3. 開発者向けセキュリティガイドラインの周知
4. API Key使用時は必ず環境変数を使用

### GitHubアラートの対応
このインシデントに関するGitHub Secret Scanning Alert #1は、上記対応により解決済みとしてクローズ可能です。