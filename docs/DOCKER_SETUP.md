# 🐳 Docker環境構築ガイド

**最終更新**: 2025年7月11日  
**対象**: 開発チーム全員

---

## 📋 概要

このガイドでは、Real Estate DXシステムのDocker開発環境の構築方法を説明します。Docker環境により、チーム全体で統一された開発環境を簡単に構築できます。

---

## 🚀 クイックスタート

### 1. 前提条件

以下がインストールされていることを確認してください：

- **Docker Desktop** (最新版推奨)
- **Docker Compose** v2.0以上
- **Git**

### 2. リポジトリクローン

```bash
git clone <repository-url>
cd real-estate-dx
```

### 3. 開発環境の起動

```bash
# 自動セットアップスクリプトを実行
./scripts/docker-setup.sh dev

# または手動で実行
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### 4. アクセス確認

- **Web Frontend**: http://localhost:3000
- **API Server**: http://localhost:8000
- **AI Worker**: http://localhost:8001
- **PgAdmin**: http://localhost:5050 (admin@example.com / admin)

---

## 🏗️ アーキテクチャ

### サービス構成

```mermaid
graph TB
    subgraph "Frontend Layer"
        W[Web Frontend<br/>Next.js:3000]
    end
    
    subgraph "Backend Layer"
        A[API Server<br/>Express:8000]
        AI[AI Worker<br/>FastAPI:8001]
    end
    
    subgraph "Data Layer"
        P[PostgreSQL:5432]
        R[Redis:6379]
    end
    
    subgraph "Development Tools"
        PA[PgAdmin:5050]
        RC[Redis Commander:8081]
    end
    
    W --> A
    A --> AI
    A --> P
    A --> R
    AI --> R
```

### Docker Compose構成

| ファイル | 用途 | 説明 |
|----------|------|------|
| `docker-compose.yml` | ベース構成 | 共通インフラ（DB、Redis、監視等） |
| `docker-compose.dev.yml` | 開発環境 | ホットリロード、デバッグ設定 |
| `docker-compose.prod.yml` | 本番環境 | 最適化、セキュリティ強化 |

---

## 🛠️ 詳細セットアップ

### 環境別起動方法

#### 開発環境
```bash
# フル機能での起動
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# 特定サービスのみ起動
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d postgres redis web api
```

#### テスト環境
```bash
# テスト用データベースを含む起動
docker-compose -f docker-compose.yml --profile test up -d
```

#### 本番環境
```bash
# 本番設定での起動
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### オプションサービス

```bash
# 監視ツール (Prometheus, Grafana)
docker-compose --profile monitoring up -d

# 検索機能 (Elasticsearch)
docker-compose --profile search up -d

# ストレージ (MinIO)
docker-compose --profile storage up -d

# 管理ツール (PgAdmin, Redis Commander)
docker-compose --profile admin up -d
```

---

## ⚙️ 環境設定

### 環境変数ファイル

以下のファイルを作成し、適切な値を設定してください：

#### `apps/api/.env`
```env
# Database
DATABASE_URL=postgresql://postgres:password@postgres:5432/real_estate_dx

# Redis
REDIS_URL=redis://redis:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Google Cloud
GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-service-account.json
GEMINI_API_KEY=your-gemini-api-key

# Other APIs
OPENAI_API_KEY=your-openai-api-key
```

#### `apps/web/.env.local`
```env
# Next.js
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### `apps/ai-worker/.env`
```env
# Python Environment
PYTHON_ENV=development
REDIS_URL=redis://redis:6379
API_URL=http://api:8000

# AI Services
GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-service-account.json
GEMINI_API_KEY=your-gemini-api-key
```

### 認証情報の配置

```bash
# Google Cloud認証ファイルを配置
mkdir -p credentials
cp /path/to/your/google-service-account.json credentials/
```

---

## 🔧 開発ワークフロー

### 日常的な操作

```bash
# サービス状態確認
docker-compose ps

# ログ確認
docker-compose logs -f api          # API サーバーのログ
docker-compose logs -f web          # Web フロントエンドのログ
docker-compose logs -f ai-worker    # AI ワーカーのログ

# サービス再起動
docker-compose restart api

# コンテナ内でのコマンド実行
docker-compose exec api pnpm test               # API テスト実行
docker-compose exec web pnpm run lint           # Web リント実行
docker-compose exec postgres psql -U postgres   # PostgreSQL接続
```

### データベース操作

```bash
# マイグレーション実行
docker-compose exec api pnpm exec prisma migrate dev

# Prismaスキーマの反映
docker-compose exec api pnpm exec prisma generate

# データベースリセット
docker-compose exec api pnpm exec prisma migrate reset
```

### ボリューム管理

```bash
# データボリューム確認
docker volume ls

# 開発データのバックアップ
docker-compose exec postgres pg_dump -U postgres real_estate_dx > backup.sql

# データボリューム削除（注意: データが失われます）
docker-compose down -v
```

---

## 🐛 トラブルシューティング

### よくある問題と解決方法

#### 1. ポート衝突エラー
```bash
# 使用中のポートを確認
netstat -tulpn | grep :3000

# Dockerサービスを停止してポートを解放
docker-compose down
```

#### 2. データベース接続エラー
```bash
# PostgreSQLの状態確認
docker-compose exec postgres pg_isready -U postgres

# データベースログ確認
docker-compose logs postgres
```

#### 3. パッケージインストールエラー
```bash
# node_modulesをクリア
docker-compose down
docker-compose build --no-cache api web

# キャッシュクリア
docker system prune -f
```

#### 4. メモリ不足
```bash
# Dockerメモリ使用量確認
docker stats

# 未使用リソースの削除
docker system prune -a --volumes
```

### ログレベル設定

開発時は詳細なログを表示：

```env
# .envファイルに追加
LOG_LEVEL=debug
NODE_ENV=development
```

---

## 🔍 監視・デバッグ

### ヘルスチェック

```bash
# 全サービスの健全性確認
curl http://localhost:8000/health    # API
curl http://localhost:3000          # Web
curl http://localhost:8001/health   # AI Worker
```

### パフォーマンス監視

Prometheusダッシュボード: http://localhost:9090
Grafanaダッシュボード: http://localhost:3001 (admin/admin)

### デバッグモード

```bash
# デバッグポート付きでAPI起動
docker-compose exec api node --inspect=0.0.0.0:9229 dist/index.js

# VSCodeでリモートデバッグ接続
# launch.jsonに以下を追加:
{
  "type": "node",
  "request": "attach",
  "name": "Docker Debug",
  "remoteRoot": "/app",
  "localRoot": "${workspaceFolder}/apps/api",
  "port": 9229,
  "host": "localhost"
}
```

---

## 🔐 セキュリティ考慮事項

### 開発環境での注意点

1. **環境変数の管理**
   - `.env`ファイルをGitにコミットしない
   - 開発用の弱いパスワードを本番で使用しない

2. **ポート公開**
   - 必要最小限のポートのみ公開
   - 本番環境では内部通信を使用

3. **ボリュームマウント**
   - ソースコードの読み取り専用マウントを検討
   - 機密データのマウント場所に注意

---

## 📚 参考資料

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

---

## 🤝 チーム運用

### 新メンバー向けセットアップ

1. リポジトリクローン
2. `./scripts/docker-setup.sh dev` 実行
3. 環境変数ファイルの設定確認
4. 認証情報の配置
5. http://localhost:3000 でアクセス確認

### 継続的な保守

- 週次でDockerイメージ更新
- 月次でボリュームクリーンアップ
- 四半期でセキュリティ監査

---

**問題が発生した場合は、開発チームSlackチャンネルで相談してください。**