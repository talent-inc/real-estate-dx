# Google Cloud サービス連携状況

## 概要

Real Estate DXシステムのGoogle Cloud Platform連携の現在の状況と次のステップをまとめています。

## 完了済みタスク ✅

### 1. Google Cloud環境準備
- プロジェクト作成: `real-estate-dx`
- 必要なAPI有効化:
  - Cloud SQL Admin API
  - Cloud Storage API
  - Cloud Build API
  - Cloud Run API
  - Secret Manager API
  - IAM API

### 2. Cloud SQL設定
- インスタンス作成: `real-estate-db` (PostgreSQL 15)
- データベース作成: `real_estate_dx`
- ユーザー作成: `app_user`
- リージョン: asia-northeast1

### 3. Cloud Storage設定
- 汎用バケット: `real-estate-dx-storage-2024`
- ドキュメント用バケット: `real-estate-dx-documents-2024`
- CORS設定準備済み

### 4. IAM設定
- サービスアカウント作成: `real-estate-api@real-estate-dx.iam.gserviceaccount.com`
- 必要な権限付与:
  - Cloud SQL Client
  - Storage Admin
  - Secret Manager Secret Accessor

### 5. アプリケーション側実装
- Prismaスキーマ設計完了
- 環境切り替えロジック実装:
  - `USE_DEV_DATA=true`: SQLite/インメモリ
  - `USE_DEV_DATA=false`: PostgreSQL/Cloud Storage
- ストレージサービスの条件分岐実装
- 認証サービスの条件分岐実装

### 6. ドキュメント作成
- データベースセットアップガイド
- Google Cloud環境セットアップガイド
- 環境モード切り替えドキュメント
- テストデータシステム設計書

## 未実装タスク ❌

### 1. 実環境接続設定
```bash
# 必要な環境変数（未設定）
DATABASE_URL="postgresql://app_user:PASSWORD@/real_estate_dx?host=/cloudsql/..."
GOOGLE_APPLICATION_CREDENTIALS="./google-cloud-key.json"
GOOGLE_CLOUD_STORAGE_BUCKET="real-estate-dx-storage-2024"
GOOGLE_CLOUD_DOCUMENTS_BUCKET="real-estate-dx-documents-2024"
```

### 2. Cloud SQL接続
- Cloud SQL Proxyのセットアップ
- 本番環境でのSSL接続設定
- コネクションプーリング設定

### 3. Cloud Storage実装
- 実際のファイルアップロードテスト
- 署名付きURL生成の動作確認
- ライフサイクルポリシー設定

### 4. Secret Manager統合
```bash
# シークレット作成（未実行）
gcloud secrets create db-password --data-file=-
gcloud secrets create jwt-secret --data-file=-
gcloud secrets create master-encryption-key --data-file=-
```

### 5. Cloud Runデプロイ
- Dockerfileの作成
- Cloud Buildトリガー設定
- 環境変数とシークレットの設定
- カスタムドメイン設定

### 6. 監視・運用設定
- Cloud Logging設定
- Cloud Monitoring設定
- アラート設定
- バックアップ設定

## 現在の動作モード

```javascript
// 現在の設定（開発モード）
USE_DEV_DATA=true

// この状態では：
- データベース: SQLite (ローカルファイル)
- ファイルストレージ: インメモリ
- 認証: インメモリユーザーデータ
```

## 本番環境への切り替え手順

### 1. サービスアカウントキーの生成と配置
```bash
gcloud iam service-accounts keys create \
  ./google-cloud-key.json \
  --iam-account=real-estate-api@real-estate-dx.iam.gserviceaccount.com
```

### 2. 環境変数の設定
```bash
cp .env.production.example .env.production
# 実際のパスワードとシークレットを設定
```

### 3. Cloud SQL Proxyの起動
```bash
./cloud-sql-proxy real-estate-dx:asia-northeast1:real-estate-db --port=5432
```

### 4. データベースマイグレーション
```bash
# 本番用環境変数を読み込み
export $(cat .env.production | xargs)
# Prismaマイグレーション実行
npx prisma migrate deploy
```

### 5. アプリケーション起動
```bash
# 本番モードで起動
USE_DEV_DATA=false npm run start
```

## 推奨される次のステップ

1. **ローカルでのCloud SQL接続テスト**
   - Cloud SQL Proxyをインストール
   - ローカルから本番DBへの接続確認

2. **Cloud Storageテスト**
   - サービスアカウントキーでの認証確認
   - ファイルアップロード/ダウンロードテスト

3. **段階的な移行**
   - まずCloud SQLのみ本番接続
   - 次にCloud Storage接続
   - 最後にCloud Runデプロイ

4. **CI/CDパイプライン構築**
   - Cloud Buildトリガー設定
   - 自動テスト実行
   - ステージング環境構築

## トラブルシューティング

### Cloud SQL接続エラー
```bash
# エラー: Can't reach database server
# 解決策:
1. Cloud SQL Proxyが起動しているか確認
2. IAM権限を確認
3. ファイアウォールルールを確認
```

### Cloud Storage権限エラー
```bash
# エラー: Permission denied
# 解決策:
1. サービスアカウントキーのパスを確認
2. バケット名が正しいか確認
3. IAMロールを確認
```

### 環境変数エラー
```bash
# エラー: Missing required environment variable
# 解決策:
1. .envファイルの内容を確認
2. dotenvの読み込み順序を確認
3. Cloud Run環境変数設定を確認
```