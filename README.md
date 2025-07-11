# 🏠 Real Estate DX - 不動産売買システム

## 🎯 開発者向けガイド

### 👋 はじめに
このリポジトリは**不動産売買DXシステム**のメインアプリケーションです。
あなたの役割に応じて、該当するディレクトリの手順に従ってください。

---

## 📁 プロジェクト構造

```
real-estate-dx/
├── 📋 README.md                    # このファイル（プロジェクト概要）
├── 📦 package.json                 # 依存関係・スクリプト
├── 🔧 .env.example                 # 環境変数テンプレート
├── 🏗️ infrastructure/              # インフラ・GCP設定（Terraform）
├── 🗄️ database/                    # データベース・Prisma
├── ⚙️ apps/
│   ├── 🌐 web/                     # Next.js フロントエンド
│   ├── 🔗 api/                     # Node.js バックエンドAPI
│   └── 🤖 ai-worker/               # Python AI処理ワーカー
├── 📚 packages/
│   ├── 🎨 ui/                      # 共通UIコンポーネント
│   ├── 🔧 config/                  # 共通設定
│   └── 📊 types/                   # TypeScript型定義
├── 🧪 tests/                       # テスト（E2E・統合）
├── 📄 docs/                        # 開発者ドキュメント
└── 🔄 .github/                     # GitHub Actions・テンプレート
```

---

## 👥 役割別クイックスタート

### 🧑‍💼 Tech Lead
**今すぐやること**:
```bash
1. 📋 README.md (このファイル) ← いまここ
2. 📄 docs/TECH_LEAD.md
3. 🏗️ infrastructure/README.md

# 今日のタスク
- プロジェクト全体レビュー
- 技術判断・設計確認
- チーム進捗確認
```

### 🧑‍💻 Backend Engineer
**今すぐやること**:
```bash
1. 🔧 SETUP.md → 開発環境構築
2. 🗄️ database/README.md → Prisma設定
3. ⚙️ apps/api/README.md → API実装開始

# 今日のタスク
- Node.js + TypeScript環境構築
- データベースセットアップ
- 認証API実装開始
```

### 🎨 Frontend Engineer  
**今すぐやること**:
```bash
1. 🔧 SETUP.md → 開発環境構築
2. ⚙️ apps/web/README.md → Next.js設定
3. 📚 packages/ui/README.md → shadcn/ui設定

# 今日のタスク
- Next.js + TypeScript環境構築
- shadcn/ui セットアップ
- 認証画面実装開始
```

### 🔄 Full Stack Engineer
**今すぐやること**:
```bash
1. 🔧 SETUP.md → 開発環境構築
2. ⚙️ apps/ai-worker/README.md → AI-OCR設定
3. 📄 docs/AI_OCR_GUIDE.md → Gemini API統合

# 今日のタスク
- Python + FastAPI環境構築
- Gemini API接続確認
- AI-OCR機能実装開始
```

### ☁️ DevOps Engineer
**今すぐやること**:
```bash
1. 🏗️ infrastructure/README.md → GCP設定
2. 🔄 .github/README.md → CI/CD設定
3. 📄 docs/DEPLOYMENT.md → デプロイ手順

# 今日のタスク
- Google Cloud環境構築
- Terraform設定
- CI/CDパイプライン構築
```

---

## ⚡ 5分でスタート

### 1. 必要ツール確認
```bash
# Node.js 20+ 
node --version

# pnpm（推奨パッケージマネージャー）
npm install -g pnpm

# Docker（ローカルDB用）
docker --version

# Git
git --version
```

### 2. プロジェクトセットアップ
```bash
# 依存関係インストール
pnpm install

# 環境変数設定
cp .env.example .env.local

# データベース起動（Docker）
docker-compose up -d

# 開発サーバー起動（全サービス）
pnpm dev
```

### 3. 動作確認
- **フロントエンド**: http://localhost:3000
- **API**: http://localhost:4000/api/health  
- **AI Worker**: http://localhost:8000/health
- **Database**: http://localhost:5432

---

## 📅 今週のタスク（担当者別）

### Week 1: 基盤構築

#### ☁️ DevOps Engineer（最優先）
- [ ] **GCP環境構築** → `infrastructure/gcp-setup.md`
- [ ] **CI/CDパイプライン** → `.github/workflows/`
- [ ] **監視・ログ設定** → `infrastructure/monitoring.md`

#### 🗄️ Backend Engineer（最優先）
- [ ] **Prismaスキーマ設計** → `database/schema.prisma`
- [ ] **JWT認証システム** → `apps/api/auth/`
- [ ] **基本CRUD API** → `apps/api/routes/`

#### 🎨 Frontend Engineer（高優先）
- [ ] **shadcn/ui セットアップ** → `packages/ui/`
- [ ] **認証画面実装** → `apps/web/pages/auth/`
- [ ] **共通レイアウト** → `apps/web/components/layout/`

#### 🤖 Full Stack Engineer（高優先）
- [ ] **AI-OCR基盤準備** → `apps/ai-worker/`
- [ ] **Gemini API統合** → `apps/ai-worker/services/`
- [ ] **PDF処理機能** → `apps/ai-worker/ocr/`

---

## 🛠️ 開発ワークフロー

### 🔄 Git ワークフロー
```bash
# 機能ブランチ作成
git checkout -b feature/auth-system

# 実装・テスト
pnpm lint && pnpm test

# コミット
git commit -m "feat: add JWT authentication"

# プルリクエスト作成
git push origin feature/auth-system
```

### ✅ コミット前チェック（必須）
```bash
# 品質チェック（自動実行）
pnpm pre-commit

# 実行内容:
# - ESLint (コード品質)
# - TypeScript (型チェック)  
# - Prettier (フォーマット)
# - Tests (ユニットテスト)
```

### 👀 コードレビュー
- **全PR**: 最低1名レビュー必須
- **重要機能**: Tech Leadレビュー必須
- **レビュー時間**: 24時間以内

---

## 📊 進捗管理

### 📈 デイリー進捗
```bash
# 進捗状況確認
pnpm status

# 出力例:
# ✅ Backend API: 70% (7/10 endpoints)
# 🚧 Frontend UI: 45% (9/20 components)  
# ⏳ AI-OCR: 30% (3/10 features)
# 🏗️ Infrastructure: 85% (17/20 tasks)
```

### 📋 タスク管理
- **GitHub Issues**: 個別タスク管理
- **GitHub Projects**: スプリント管理
- **Slack**: デイリー報告

---

## 🧪 テスト・品質保証

### 🔍 テスト実行
```bash
# ユニットテスト
pnpm test

# 統合テスト  
pnpm test:integration

# E2Eテスト
pnpm test:e2e

# 全テスト + カバレッジ
pnpm test:coverage
```

### 📊 品質指標
- **テストカバレッジ**: 80%以上
- **TypeScript**: 95%以上
- **ESLint エラー**: 0件
- **Build時間**: 5分以内

---

## 🚨 トラブルシューティング

### ❓ よくある問題

#### 🔧 環境構築エラー
```bash
# Node.js バージョン確認
node --version  # v20.x.x 必須

# キャッシュクリア
pnpm store prune

# 環境リセット
pnpm clean && pnpm install
```

#### 🗄️ データベース接続エラー
```bash
# Docker コンテナ確認
docker-compose ps

# データベース再起動
docker-compose restart postgres

# Prisma再生成
pnpm db:reset
```

#### 🤖 AI-OCR エラー
```bash
# Google Cloud認証確認
gcloud auth list

# API キー確認
echo $GOOGLE_CLOUD_API_KEY

# サービス再起動
pnpm dev:ai
```

### 🆘 サポート
- **Slack**: `#real-estate-dx-dev`
- **緊急時**: Tech Lead DM
- **バグ報告**: GitHub Issues

---

## 📚 重要リンク・ドキュメント

### 📄 技術仕様
- [システム仕様書](../docs/システム仕様書.md)
- [技術的実現可能性検証結果](../docs/technical_feasibility/技術的実現可能性総合検証結果.md)
- [API設計書](docs/API_SPECIFICATION.md)

### 🛠️ 開発ガイド
- [セットアップガイド](SETUP.md)
- [コーディング規約](docs/CODING_STANDARDS.md)
- [デプロイガイド](docs/DEPLOYMENT.md)

### 🔗 外部リンク
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Google Cloud Docs](https://cloud.google.com/docs)

---

## 🎯 今日のアクション

### ✅ すぐにやること
1. **自分の役割確認** → 上記「役割別クイックスタート」
2. **環境構築開始** → `SETUP.md`  
3. **最初のタスク着手** → 担当ディレクトリのREADME

### 📞 質問・相談
- **技術相談**: 各ディレクトリのREADME
- **進捗相談**: デイリースタンドアップ
- **緊急相談**: Slack DM

---

**🚀 Let's Build Amazing Real Estate DX System!**

> 💡 **ヒント**: 迷ったら、まず `SETUP.md` から始めましょう。step-by-stepで進められます！