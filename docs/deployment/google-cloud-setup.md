# Google Cloud 環境セットアップガイド

## 概要

Real Estate DXシステムをGoogle Cloud Platform上で稼働させるための環境構築手順書です。

## 前提条件

- Google Cloudアカウント
- プロジェクト作成権限
- 請求先アカウントの設定

## 1. プロジェクトの作成と初期設定

### 1.1 プロジェクト作成

```bash
# プロジェクトの作成
gcloud projects create real-estate-dx --name="Real Estate DX"

# プロジェクトの選択
gcloud config set project real-estate-dx

# 請求先アカウントの紐付け
gcloud beta billing projects link real-estate-dx \
  --billing-account=BILLING_ACCOUNT_ID
```

### 1.2 必要なAPIの有効化

```bash
# 一括で有効化
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  sqladmin.googleapis.com \
  storage-component.googleapis.com \
  secretmanager.googleapis.com \
  cloudresourcemanager.googleapis.com \
  iam.googleapis.com \
  compute.googleapis.com
```

## 2. Cloud SQL (PostgreSQL) セットアップ

### 2.1 インスタンスの作成

```bash
# Cloud SQLインスタンスを作成
gcloud sql instances create real-estate-db \
  --database-version=POSTGRES_15 \
  --tier=db-g1-small \
  --region=asia-northeast1 \
  --network=default \
  --no-assign-ip
```

### 2.2 データベースとユーザーの作成

```bash
# データベース作成
gcloud sql databases create real_estate_dx \
  --instance=real-estate-db

# ユーザー作成
gcloud sql users create app_user \
  --instance=real-estate-db \
  --password=YOUR_SECURE_PASSWORD
```

### 2.3 Cloud SQL Proxyのセットアップ

```bash
# Cloud SQL Proxyのダウンロード
curl -o cloud-sql-proxy \
  https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.13.0/cloud-sql-proxy.linux.amd64

chmod +x cloud-sql-proxy

# プロキシの起動（開発時）
./cloud-sql-proxy real-estate-dx:asia-northeast1:real-estate-db --port=5432
```

## 3. Cloud Storage バケットの作成

### 3.1 ストレージバケット作成

```bash
# 一般ファイル用バケット
gsutil mb -p real-estate-dx \
  -c standard \
  -l asia-northeast1 \
  gs://real-estate-dx-storage-2024/

# ドキュメント用バケット（プライベート）
gsutil mb -p real-estate-dx \
  -c standard \
  -l asia-northeast1 \
  gs://real-estate-dx-documents-2024/
```

### 3.2 バケットポリシー設定

```bash
# 一般ファイル用バケット（公開読み取り可能）
gsutil iam ch allUsers:objectViewer \
  gs://real-estate-dx-storage-2024

# CORSポリシー設定
cat > cors.json << EOF
[
  {
    "origin": ["https://your-domain.com", "http://localhost:3000"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "responseHeader": ["*"],
    "maxAgeSeconds": 3600
  }
]
EOF

gsutil cors set cors.json gs://real-estate-dx-storage-2024/
gsutil cors set cors.json gs://real-estate-dx-documents-2024/
```

## 4. サービスアカウントとIAM設定

### 4.1 サービスアカウント作成

```bash
# APIサーバー用サービスアカウント
gcloud iam service-accounts create real-estate-api \
  --display-name="Real Estate API Service Account"

# 必要な権限を付与
gcloud projects add-iam-policy-binding real-estate-dx \
  --member="serviceAccount:real-estate-api@real-estate-dx.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding real-estate-dx \
  --member="serviceAccount:real-estate-api@real-estate-dx.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding real-estate-dx \
  --member="serviceAccount:real-estate-api@real-estate-dx.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 4.2 サービスアカウントキーの作成（開発用）

```bash
# キーファイルの生成
gcloud iam service-accounts keys create \
  ./google-cloud-key.json \
  --iam-account=real-estate-api@real-estate-dx.iam.gserviceaccount.com
```

## 5. Secret Manager設定

### 5.1 シークレットの作成

```bash
# データベースパスワード
echo -n "YOUR_DB_PASSWORD" | \
  gcloud secrets create db-password --data-file=-

# JWT秘密鍵
echo -n "YOUR_JWT_SECRET" | \
  gcloud secrets create jwt-secret --data-file=-

# その他の環境変数
echo -n "YOUR_MASTER_ENCRYPTION_KEY" | \
  gcloud secrets create master-encryption-key --data-file=-
```

## 6. Cloud Runデプロイ設定

### 6.1 Dockerイメージのビルド

```bash
# Cloud Buildでイメージをビルド
gcloud builds submit --tag gcr.io/real-estate-dx/api

# フロントエンド
gcloud builds submit --tag gcr.io/real-estate-dx/web
```

### 6.2 Cloud Runへのデプロイ

```bash
# APIサーバーのデプロイ
gcloud run deploy real-estate-api \
  --image gcr.io/real-estate-dx/api \
  --platform managed \
  --region asia-northeast1 \
  --service-account real-estate-api@real-estate-dx.iam.gserviceaccount.com \
  --add-cloudsql-instances real-estate-dx:asia-northeast1:real-estate-db \
  --set-env-vars="USE_DEV_DATA=false" \
  --set-secrets="DATABASE_URL=db-connection-string:latest" \
  --set-secrets="JWT_SECRET=jwt-secret:latest" \
  --allow-unauthenticated

# フロントエンドのデプロイ
gcloud run deploy real-estate-web \
  --image gcr.io/real-estate-dx/web \
  --platform managed \
  --region asia-northeast1 \
  --set-env-vars="NEXT_PUBLIC_API_URL=https://real-estate-api-xxxxx.run.app" \
  --allow-unauthenticated
```

## 7. CI/CDパイプライン設定

### 7.1 Cloud Build設定ファイル

`cloudbuild.yaml`:

```yaml
steps:
  # APIのビルドとデプロイ
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/api', './apps/api']
  
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/api']
  
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'real-estate-api'
      - '--image'
      - 'gcr.io/$PROJECT_ID/api'
      - '--region'
      - 'asia-northeast1'
      - '--platform'
      - 'managed'

  # フロントエンドのビルドとデプロイ
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/web', './apps/web']
  
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/web']
  
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'real-estate-web'
      - '--image'
      - 'gcr.io/$PROJECT_ID/web'
      - '--region'
      - 'asia-northeast1'
      - '--platform'
      - 'managed'

timeout: 1200s
```

### 7.2 GitHub連携

```bash
# Cloud Build トリガーの作成
gcloud builds triggers create github \
  --repo-name=real-estate-dx \
  --repo-owner=YOUR_GITHUB_USERNAME \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml
```

## 8. 監視とロギング

### 8.1 Cloud Logging設定

```bash
# ログシンクの作成（BigQueryへの転送）
gcloud logging sinks create real-estate-logs \
  bigquery.googleapis.com/projects/real-estate-dx/datasets/logs \
  --log-filter='resource.type="cloud_run_revision"'
```

### 8.2 アラート設定

```bash
# エラー率アラート
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="High Error Rate" \
  --condition-display-name="Error rate > 5%" \
  --condition-threshold-value=0.05 \
  --condition-threshold-duration=300s
```

## 9. 本番環境チェックリスト

### デプロイ前確認事項

- [ ] Cloud SQLバックアップ設定
- [ ] Cloud Storageライフサイクル設定
- [ ] ファイアウォールルール確認
- [ ] SSL証明書設定
- [ ] カスタムドメイン設定
- [ ] CDN（Cloud CDN）設定
- [ ] 負荷分散設定
- [ ] 自動スケーリング設定

### セキュリティ確認

- [ ] IAMポリシー最小権限化
- [ ] VPC設定
- [ ] Cloud Armor設定
- [ ] シークレットローテーション計画
- [ ] 監査ログ有効化

## 10. コスト最適化

### 推奨設定

```bash
# Cloud SQL - 開発環境は停止スケジュール設定
gcloud sql instances patch real-estate-db-dev \
  --no-backup \
  --maintenance-window-day=SUN \
  --maintenance-window-hour=3

# Cloud Storage - 古いファイルの自動アーカイブ
gsutil lifecycle set lifecycle.json gs://real-estate-dx-storage-2024/
```

`lifecycle.json`:
```json
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "SetStorageClass", "storageClass": "NEARLINE"},
        "condition": {"age": 30}
      },
      {
        "action": {"type": "Delete"},
        "condition": {"age": 365}
      }
    ]
  }
}
```

## トラブルシューティング

### よくある問題

1. **Cloud SQL接続エラー**
   ```bash
   # プライベートIPの確認
   gcloud sql instances describe real-estate-db --format="value(ipAddresses[0].ipAddress)"
   ```

2. **権限エラー**
   ```bash
   # サービスアカウントの権限確認
   gcloud projects get-iam-policy real-estate-dx \
     --flatten="bindings[].members" \
     --filter="bindings.members:real-estate-api@"
   ```

3. **Storage CORS エラー**
   ```bash
   # CORS設定の確認
   gsutil cors get gs://real-estate-dx-storage-2024/
   ```

## 参考リンク

- [Cloud SQL ドキュメント](https://cloud.google.com/sql/docs)
- [Cloud Run ドキュメント](https://cloud.google.com/run/docs)
- [Cloud Storage ドキュメント](https://cloud.google.com/storage/docs)
- [Cloud Build ドキュメント](https://cloud.google.com/build/docs)