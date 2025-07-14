# Cloudflare R2 移行ガイド

## 概要
Google Cloud Storage (GCS) から Cloudflare R2 への移行計画書。

## 移行のメリット

### コスト削減効果
| 項目 | GCS (Standard) | Cloudflare R2 | 削減率 |
|------|----------------|---------------|--------|
| ストレージ料金 | $0.026/GB | $0.015/GB | 42%削減 |
| 下り転送料金 | $0.12/GB | **無料** | 100%削減 |
| Aクラス操作 | $0.005/1,000回 | $0.0045/1,000回 | 10%削減 |

### パフォーマンス改善
- Cloudflare CDNによるグローバル配信
- エッジロケーションからの低レイテンシ配信
- 自動キャッシュ最適化

## 技術的変更内容

### 1. 依存関係の更新
```bash
# 新しいパッケージの追加
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# 不要なパッケージの削除
pnpm remove @google-cloud/storage
```

### 2. 環境変数の追加
`.env.example` に以下を追加：
```env
# Cloudflare R2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_STORAGE_BUCKET=real-estate-dx-storage
R2_DOCUMENTS_BUCKET=real-estate-dx-documents
R2_PUBLIC_DOMAIN=https://storage.your-domain.com
```

### 3. コード変更箇所
- `apps/api/src/lib/storage.ts` - S3 SDK使用に変更
- ファイル削除ロジックの調整（完全パス指定方式へ）

## データ移行手順

### 1. R2バケットの作成
1. Cloudflareダッシュボードでバケット作成
2. S3 API認証情報を取得
3. CORS設定（必要に応じて）

### 2. rcloneを使用したデータ移行
```bash
# rclone設定
cat > ~/.config/rclone/rclone.conf << EOF
[gcs]
type = google cloud storage
project_number = YOUR_PROJECT_NUMBER
service_account_file = /path/to/credentials.json

[r2]
type = s3
provider = Cloudflare
access_key_id = YOUR_R2_ACCESS_KEY_ID
secret_access_key = YOUR_R2_SECRET_ACCESS_KEY
endpoint = https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
EOF

# データコピー実行
rclone copy gcs:real-estate-dx-storage r2:real-estate-dx-storage --progress
rclone copy gcs:real-estate-dx-documents r2:real-estate-dx-documents --progress
```

## 移行フェーズ

### Phase 1: 開発環境での検証（1週間）
- [ ] R2アカウント設定
- [ ] 開発環境でのコード変更
- [ ] アップロード/ダウンロード機能テスト
- [ ] パフォーマンス測定

### Phase 2: ステージング環境での検証（1週間）
- [ ] データ移行テスト
- [ ] 負荷テスト実施
- [ ] 既存機能の動作確認

### Phase 3: 本番環境への移行（2日間）
- [ ] メンテナンスウィンドウの設定
- [ ] データの最終同期
- [ ] DNS/環境変数の切り替え
- [ ] 動作確認とロールバック準備

## リスクと対策

### リスク
1. データ移行中の不整合
2. APIレスポンスタイムの変化
3. 署名付きURLの有効期限管理

### 対策
1. 読み取り専用モードでの移行
2. 段階的なトラフィック切り替え
3. URL生成ロジックの十分なテスト

## 実装例

### storage.ts の主要変更
```typescript
// Before (GCS)
import { Storage } from '@google-cloud/storage';
const storage = new Storage();

// After (R2)
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});
```

## 移行後の監視
- Cloudflare Analyticsでのアクセス監視
- コスト推移の追跡
- パフォーマンスメトリクスの比較

## ロールバック計画
移行後に問題が発生した場合：
1. 環境変数をGCS設定に戻す
2. コードをGCSバージョンにロールバック
3. DNSを元の設定に戻す（Public URLを使用している場合）