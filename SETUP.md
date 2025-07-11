# 🔧 開発環境セットアップガイド

## 🎯 目標
このガイドに従って、**10分以内**に開発環境を構築し、実装開始できる状態にします。

---

## 📋 前提条件チェック

### ✅ 必要ソフトウェア
```bash
# 1. Node.js 20+ 確認
node --version
# ✅ v20.x.x が表示されればOK
# ❌ エラーの場合: https://nodejs.org/ からインストール

# 2. pnpm インストール
npm install -g pnpm
pnpm --version
# ✅ v8.x.x が表示されればOK

# 3. Docker 確認
docker --version
docker-compose --version
# ✅ バージョンが表示されればOK
# ❌ エラーの場合: https://docker.com/ からインストール

# 4. Git 確認
git --version
# ✅ バージョンが表示されればOK
```

### 🔑 必要なAPI キー・認証情報
```bash
# Google Cloud設定
# プロジェクトID: real-estate-dx
# APIキー: AIzaSyARAEr8OZJ20CjAx7u_q0y7VN25un9JpEc（すでに取得済み）

# 確認コマンド
echo "✅ Google Cloud APIキー準備済み"
```

---

## ⚡ クイックセットアップ（5分）

### 1. プロジェクトクローン・依存関係インストール
```bash
# プロジェクトディレクトリに移動
cd "/mnt/c/Users/mtsid/OneDrive/ドキュメント/TALENT/AIDX/不動産売買システム/real-estate-dx"

# 依存関係インストール
pnpm install

# 必要なパッケージが自動インストールされます
# - Next.js 14 + TypeScript
# - Node.js + Express + tRPC
# - Prisma ORM
# - shadcn/ui + Tailwind CSS
```

### 2. 環境変数設定
```bash
# 環境変数ファイル作成
cp .env.example .env.local

# 以下をエディタで編集
nano .env.local
```

**`.env.local` 設定内容**:
```env
# データベース（Docker自動設定）
DATABASE_URL="postgresql://postgres:password@localhost:5432/real_estate_dx"

# Google Cloud設定
GOOGLE_CLOUD_PROJECT="real-estate-dx"
GOOGLE_CLOUD_API_KEY="AIzaSyARAEr8OZJ20CjAx7u_q0y7VN25un9JpEc"

# JWT認証
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Redis（キャッシュ・セッション）
REDIS_URL="redis://localhost:6379"

# API URLs
API_URL="http://localhost:4000"
AI_WORKER_URL="http://localhost:8000"
```

### 3. データベース・サービス起動
```bash
# Docker サービス起動（PostgreSQL + Redis）
docker-compose up -d

# 起動確認
docker-compose ps
# ✅ postgres, redis が "Up" 状態であることを確認

# データベースマイグレーション
pnpm db:push

# 初期データ投入
pnpm db:seed
```

### 4. 開発サーバー起動
```bash
# 全サービス同時起動
pnpm dev

# 以下のサービスが起動します：
# - Frontend (Next.js): http://localhost:3000
# - Backend API: http://localhost:4000  
# - AI Worker: http://localhost:8000
# - Database: localhost:5432
# - Redis: localhost:6379
```

### 5. 動作確認
```bash
# フロントエンド確認
curl http://localhost:3000
# ✅ HTMLが返ってくればOK

# API確認
curl http://localhost:4000/api/health
# ✅ {"status": "ok"} が返ってくればOK

# AI Worker確認
curl http://localhost:8000/health
# ✅ {"status": "healthy"} が返ってくればOK
```

---

## 📂 プロジェクト構造詳細

### 🏗️ モノレポ構成（Turborepo）
```
real-estate-dx/
├── 📦 package.json              # ルートパッケージ（Turborepo設定）
├── 📝 turbo.json               # Turborepo設定
├── 🐳 docker-compose.yml       # ローカル開発用Docker
├── 🔧 .env.example             # 環境変数テンプレート
│
├── ⚙️ apps/                    # アプリケーション群
│   ├── 🌐 web/                 # Next.js フロントエンド
│   │   ├── 📦 package.json
│   │   ├── 🔧 next.config.js
│   │   ├── 📄 tsconfig.json
│   │   ├── 🎨 tailwind.config.js
│   │   ├── 📁 src/
│   │   │   ├── 📄 pages/       # Next.js ページ
│   │   │   ├── 🧩 components/  # Reactコンポーネント
│   │   │   ├── 🎨 styles/      # CSS・Tailwind
│   │   │   └── 🔧 lib/         # ユーティリティ
│   │   └── 📁 public/          # 静的ファイル
│   │
│   ├── 🔗 api/                 # Node.js バックエンドAPI
│   │   ├── 📦 package.json
│   │   ├── 📄 tsconfig.json
│   │   ├── 📁 src/
│   │   │   ├── 🚀 server.ts    # Express サーバー
│   │   │   ├── 📁 routes/      # API ルート
│   │   │   ├── 🔐 auth/        # 認証・認可
│   │   │   ├── 📁 middleware/  # Express ミドルウェア
│   │   │   └── 🔧 lib/         # ユーティリティ
│   │   └── 📁 tests/           # APIテスト
│   │
│   └── 🤖 ai-worker/           # Python AI処理ワーカー
│       ├── 📦 requirements.txt
│       ├── 🚀 main.py          # FastAPI サーバー
│       ├── 📁 services/        # AI サービス
│       ├── 🔍 ocr/             # AI-OCR機能
│       └── 📁 tests/           # Pythonテスト
│
├── 📚 packages/                # 共通パッケージ
│   ├── 🎨 ui/                  # 共通UIコンポーネント
│   │   ├── 📦 package.json
│   │   ├── 🧩 components/      # shadcn/ui コンポーネント
│   │   └── 🎨 styles/          # 共通スタイル
│   │
│   ├── 📊 types/               # TypeScript型定義
│   │   ├── 📄 auth.ts          # 認証関連型
│   │   ├── 📄 property.ts      # 物件関連型
│   │   └── 📄 common.ts        # 共通型
│   │
│   └── 🔧 config/              # 共通設定
│       ├── 📄 eslint.config.js # ESLint設定
│       ├── 📄 prettier.config.js # Prettier設定
│       └── 📄 tsconfig.base.json # TypeScript基本設定
│
├── 🗄️ database/               # データベース関連
│   ├── 📄 schema.prisma        # Prismaスキーマ
│   ├── 📁 migrations/          # マイグレーションファイル
│   └── 📁 seeds/               # 初期データ
│
├── 🏗️ infrastructure/          # インフラ・デプロイ
│   ├── 📁 terraform/           # Terraform（GCP）
│   ├── 📁 kubernetes/          # Kubernetes設定
│   └── 📁 docker/              # Dockerファイル
│
├── 🧪 tests/                   # 統合・E2Eテスト
│   ├── 📁 e2e/                 # Playwright E2Eテスト
│   └── 📁 integration/         # API統合テスト
│
└── 📄 docs/                    # ドキュメント
    ├── 📄 API.md               # API仕様書
    ├── 📄 DEPLOYMENT.md        # デプロイ手順
    └── 📄 CONTRIBUTING.md      # 開発貢献ガイド
```

---

## 👥 役割別詳細セットアップ

### 🧑‍💻 Backend Engineer

#### 追加セットアップ
```bash
# Prisma Studio起動（データベースGUI）
pnpm db:studio
# → http://localhost:5555 でデータベース確認可能

# API開発用ツール
pnpm add -g @nestjs/cli  # 必要に応じて

# テスト実行
cd apps/api
pnpm test
```

#### 開発開始手順
```bash
# 1. 認証システム実装
cd apps/api/src/auth
# ファイルが自動生成されているので、実装開始

# 2. Prismaスキーマ確認・編集
cd database
nano schema.prisma

# 3. API エンドポイント作成
cd apps/api/src/routes
# 物件管理APIから開始
```

### 🎨 Frontend Engineer

#### 追加セットアップ
```bash
# shadcn/ui コンポーネント追加
cd apps/web
npx shadcn-ui@latest add button
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add table

# Storybookセットアップ（オプション）
pnpm add -D @storybook/react-vite
pnpm storybook init
```

#### 開発開始手順
```bash
# 1. 認証画面実装
cd apps/web/src/pages/auth
# login.tsx, register.tsx が生成済み

# 2. 共通レイアウト実装
cd apps/web/src/components/layout
# layout.tsx, header.tsx, sidebar.tsx が生成済み

# 3. shadcn/ui コンポーネント確認
cd packages/ui/components
# Button, Form, Input などが利用可能
```

### 🤖 Full Stack Engineer

#### 追加セットアップ
```bash
# Python環境確認
python3 --version  # 3.11+ 推奨

# AI Worker依存関係インストール
cd apps/ai-worker
pip install -r requirements.txt

# Google Cloud SDK（オプション）
# curl https://sdk.cloud.google.com | bash
```

#### 開発開始手順
```bash
# 1. AI-OCR機能実装
cd apps/ai-worker/ocr
# gemini_service.py, pdf_processor.py が生成済み

# 2. Gemini API接続確認
cd apps/ai-worker
python -c "from services.gemini import test_connection; test_connection()"

# 3. OCR テスト実行
python tests/test_ocr.py
```

### ☁️ DevOps Engineer

#### 追加セットアップ
```bash
# Google Cloud CLI
curl https://sdk.cloud.google.com | bash
gcloud auth login

# Terraform
cd infrastructure/terraform
terraform init

# Kubernetes（オプション）
kubectl version
```

#### 開発開始手順
```bash
# 1. GCP環境構築
cd infrastructure/terraform
terraform plan
terraform apply

# 2. CI/CDパイプライン確認
cd .github/workflows
# deploy.yml, test.yml が生成済み

# 3. 監視設定
cd infrastructure/monitoring
# prometheus.yml, grafana設定 が生成済み
```

---

## 🧪 テスト実行

### 全体テスト
```bash
# 全テスト実行
pnpm test

# テストカバレッジ確認
pnpm test:coverage

# 特定アプリのテスト
pnpm test --filter=web      # フロントエンド
pnpm test --filter=api      # バックエンド
pnpm test --filter=ai-worker # AI Worker
```

### 個別テスト
```bash
# ユニットテスト
pnpm test:unit

# 統合テスト
pnpm test:integration

# E2Eテスト
pnpm test:e2e

# 監視モード（開発中）
pnpm test:watch
```

---

## 🛠️ 開発用コマンド

### よく使うコマンド
```bash
# 開発サーバー起動
pnpm dev                    # 全サービス
pnpm dev:web               # フロントエンドのみ
pnpm dev:api               # バックエンドのみ  
pnpm dev:ai                # AI Workerのみ

# ビルド
pnpm build                 # 全体ビルド
pnpm build:web             # フロントエンドビルド

# データベース操作
pnpm db:push               # スキーマ反映
pnpm db:migrate            # マイグレーション実行
pnpm db:seed               # 初期データ投入
pnpm db:reset              # データベースリセット
pnpm db:studio             # Prisma Studio起動

# コード品質
pnpm lint                  # ESLint実行
pnpm lint:fix              # ESLint自動修正
pnpm format                # Prettier実行
pnpm type-check            # TypeScript型チェック

# クリーンアップ
pnpm clean                 # node_modules等削除
pnpm clean:build           # ビルドファイル削除
```

---

## 🔧 トラブルシューティング

### よくある問題と解決法

#### 🚨 pnpm install でエラー
```bash
# Node.js バージョン確認
node --version  # v20.x.x 必須

# pnpm キャッシュクリア
pnpm store prune

# 完全リセット
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### 🚨 Docker サービス起動エラー
```bash
# Dockerプロセス確認
docker ps

# Docker再起動
docker-compose down
docker-compose up -d

# ポート確認（5432, 6379 が使用中でないか）
lsof -i :5432
lsof -i :6379
```

#### 🚨 データベース接続エラー
```bash
# 接続確認
psql postgresql://postgres:password@localhost:5432/real_estate_dx

# Prisma再生成
pnpm db:generate
pnpm db:push

# 初期化
pnpm db:reset
```

#### 🚨 Google Cloud API エラー
```bash
# API キー確認
echo $GOOGLE_CLOUD_API_KEY

# プロジェクト確認
echo $GOOGLE_CLOUD_PROJECT

# 接続テスト
cd apps/ai-worker
python -c "
from google.cloud import storage
print('✅ Google Cloud接続OK')
"
```

#### 🚨 ポート競合エラー
```bash
# 使用中ポート確認
lsof -i :3000  # Next.js
lsof -i :4000  # API
lsof -i :8000  # AI Worker

# プロセス終了
kill -9 <PID>

# 別ポート使用
PORT=3001 pnpm dev:web
```

---

## 📊 開発環境確認

### ✅ セットアップ完了チェックリスト
```bash
# 自動チェックスクリプト実行
pnpm check:env

# 実行結果例:
# ✅ Node.js v20.15.0
# ✅ pnpm v8.10.0  
# ✅ Docker running
# ✅ PostgreSQL connected
# ✅ Redis connected
# ✅ Google Cloud API accessible
# ✅ All services healthy
# 
# 🎉 開発環境セットアップ完了！
```

### 📈 パフォーマンス確認
```bash
# ビルド時間測定
time pnpm build

# テスト実行時間測定
time pnpm test

# 開発サーバー起動時間測定
time pnpm dev
```

---

## 🚀 次のステップ

### ✅ セットアップ完了後
1. **あなたの役割確認** → `README.md` の役割別ガイド
2. **最初のタスク開始** → 担当ディレクトリのREADME
3. **チーム連携開始** → Slack `#real-estate-dx-dev`

### 📚 参考リンク
- [プロジェクト概要](README.md)
- [API仕様書](docs/API.md)
- [デプロイガイド](docs/DEPLOYMENT.md)
- [コーディング規約](docs/CODING_STANDARDS.md)

---

**🎉 セットアップ完了！実装を始めましょう！**

> 💡 **困ったら**: Slack `#real-estate-dx-dev` で質問するか、各ディレクトリのREADME.mdを確認してください。