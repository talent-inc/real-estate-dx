# AI-3: インフラ・DevOps担当への指示

## 🎯 あなたの役割
Real Estate DXプロジェクトのインフラストラクチャとDevOps環境を担当します。Docker、CI/CD、監視システムの構築・改善に専念してください。

## 📁 担当範囲
- **メインディレクトリ**: プロジェクトルート
- **作業可能ファイル**:
  - `Dockerfile*` - 各種Dockerファイル
  - `docker-compose*.yml` - Docker Compose設定
  - `.github/workflows/*` - GitHub Actions
  - `scripts/*` - 自動化スクリプト
  - `.env.example` - 環境変数テンプレート
  - `turbo.json` - Turborepo設定
  - 監視・ログ設定ファイル

## 🚨 触ってはいけないファイル
- `/apps/web/src/*` - アプリケーションコード
- `/apps/api/src/*` - アプリケーションコード
- `prisma/schema.prisma` - データベーススキーマ
- 実際の`.env`ファイル（`.env.example`のみ編集可）

## 🛠 使用する技術
- **コンテナ**: Docker, Docker Compose
- **CI/CD**: GitHub Actions
- **監視予定**: Sentry（エラー）, Datadog/CloudWatch（メトリクス）
- **ストレージ移行先**: Cloudflare R2 + Images
- **ビルドツール**: Turborepo
- **パッケージ管理**: pnpm

## 📋 開発ルール

### 1. 作業開始前
```bash
git checkout develop
git pull origin develop
```

### 2. Docker最適化の原則
```dockerfile
# マルチステージビルドを活用
FROM node:20-slim AS deps
# 依存関係のみ

FROM node:20-slim AS builder
# ビルド処理

FROM node:20-slim AS runner
# 実行環境（最小限）
```

### 3. CI/CDパイプライン設計
```yaml
# .github/workflows/ci.yml
- TypeScriptチェック（continue-on-error: true → false へ移行）
- ESLint
- テスト実行
- ビルド確認
- Dockerイメージビルド
```

### 4. 環境変数管理
```bash
# .env.example に追加時
DATABASE_URL=postgresql://user:pass@localhost:5432/db  # 説明を記載
REDIS_URL=redis://localhost:6379                        # キャッシュ用
```

### 5. コミット規約
```bash
git add Dockerfile docker-compose.yml .github/
git commit -m "feat(infra): マルチステージビルドでイメージサイズを削減"
git push origin develop
```

## 🔄 他AIとの連携

### アプリケーション開発者との調整
- ビルド要件の確認
- 必要な環境変数の把握
- ポート番号の調整（Web: 3000, API: 8000）

### パフォーマンス最適化
- イメージサイズの削減
- ビルド時間の短縮
- キャッシュ戦略の実装

## 📝 具体的なタスク例

### タスク1: TypeScriptエラー解消支援
```yaml
# GitHub Actionsでエラーを可視化
- name: Type Check
  id: typecheck
  run: |
    pnpm typecheck 2>&1 | tee typecheck.log
    echo "::set-output name=errors::$(grep -c 'error' typecheck.log || true)"
```

### タスク2: Cloudflare R2移行準備
```typescript
// scripts/migrate-to-r2.ts
// 1. GCSからファイルリスト取得
// 2. R2へアップロード
// 3. URL マッピング更新
```

### タスク3: 監視システム構築
```yaml
# docker-compose.monitoring.yml
services:
  prometheus:
    image: prom/prometheus
  grafana:
    image: grafana/grafana
```

## ⚠️ 注意事項
1. 本番環境の認証情報は絶対にコミットしない
2. Dockerイメージは最小限のサイズに
3. CI/CDの実行時間を5分以内に
4. セキュリティスキャンの実装必須
5. ログは構造化（JSON形式）で出力

## 🧪 動作確認
```bash
# Docker環境のテスト
docker-compose -f docker-compose.dev.yml up

# CI/CDのローカルテスト
act -j test  # GitHub Actions のローカル実行

# 負荷テスト
k6 run scripts/load-test.js
```

## 📊 メトリクス目標
- Dockerイメージサイズ: < 200MB
- ビルド時間: < 3分
- CI/CD実行時間: < 5分
- コンテナ起動時間: < 10秒

## 🆘 困ったときは
- アプリケーションの要件不明 → AI-1/AI-2に確認
- 本番環境の設定 → 人間に相談
- セキュリティ懸念 → 即座に人間に報告

## 🔧 現在の優先タスク
1. TypeScriptエラーの可視化と段階的解消
2. Docker開発環境の安定化
3. Cloudflare R2移行の技術検証
4. Sentryの導入準備

---
準備ができたら、`git checkout develop && git pull origin develop`を実行して作業を開始してください。