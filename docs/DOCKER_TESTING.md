# 🧪 Docker環境テストガイド

**作成日**: 2025年7月11日  
**目的**: Docker環境の動作確認と問題の特定

---

## ⚠️ 現在の状況

Docker環境を構築しましたが、**実際の動作テストは未実施**です。
以下の手順で段階的にテストを行ってください。

---

## 🔍 段階別テスト手順

### Phase 1: 基本サービステスト

```bash
# 1. ネットワーク作成
docker network create real-estate-dx-network

# 2. データベースとRedisのみ起動
docker-compose -f docker-compose.yml up -d postgres redis

# 3. サービス状態確認
docker-compose ps
docker-compose logs postgres
docker-compose logs redis

# 4. 接続テスト
docker-compose exec postgres psql -U postgres -d real_estate_dx -c "SELECT 1;"
docker-compose exec redis redis-cli ping
```

### Phase 2: APIサーバーテスト

```bash
# 1. 簡易版でAPIテスト
docker-compose -f docker-compose.simple.yml up --build api

# 2. ログ確認
docker-compose -f docker-compose.simple.yml logs -f api

# 3. ヘルスチェック
curl http://localhost:8000/health
```

### Phase 3: フル環境テスト

```bash
# 1. 開発環境起動
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# 2. 全サービス確認
docker-compose ps
curl http://localhost:3000    # Web
curl http://localhost:8000    # API
curl http://localhost:8001    # AI Worker
```

---

## 🐛 予想される問題と対策

### 1. **pnpm設定エラー**

**症状**: `pnpm: command not found`

**対策**:
```dockerfile
# Dockerfileに追加
RUN corepack enable pnpm
RUN corepack prepare pnpm@latest --activate
```

### 2. **monorepo パス問題**

**症状**: パッケージが見つからない

**対策**:
```bash
# ビルドコンテキストをルートに変更
docker build -t real-estate-dx-api -f apps/api/Dockerfile .
```

### 3. **Next.js standalone未設定**

**症状**: Web コンテナが起動しない

**対策**: `next.config.js`に`output: 'standalone'`を追加済み

### 4. **環境変数の不整合**

**症状**: データベース接続エラー

**対策**:
```env
# Docker内では localhost ではなくサービス名を使用
DATABASE_URL=postgresql://postgres:password@postgres:5432/real_estate_dx
REDIS_URL=redis://redis:6379
```

### 5. **Prismaマイグレーション**

**症状**: テーブルが存在しない

**対策**:
```bash
# マイグレーション実行
docker-compose exec api pnpm exec prisma migrate dev
```

---

## 🔧 修正が必要な箇所

### 1. API Dockerfile

現在の問題:
- monorepo構造でのパス参照が不正確
- pnpm-lock.yamlの場所が間違っている

修正済みファイル: `apps/api/Dockerfile.fixed`

### 2. Web Dockerfile

現在の問題:
- standalone出力の設定が不足していた → 修正済み
- ビルドコンテキストの問題

### 3. AI Worker

現在の問題:
- requirements.txtが存在しない可能性
- Python環境のセットアップ

---

## ✅ テスト後の修正手順

1. **問題を特定**
   ```bash
   docker-compose logs [service-name]
   docker-compose exec [service-name] sh
   ```

2. **Dockerfileを修正**
   - 動作確認後、正式版に反映

3. **docker-compose設定を調整**
   - 環境変数の修正
   - ボリュームマウントの調整

4. **ドキュメント更新**
   - 実際の手順を反映
   - トラブルシューティング追加

---

## 🎯 テスト完了の判定基準

### 最低限の動作確認

- [ ] PostgreSQL接続成功
- [ ] Redis接続成功
- [ ] APIサーバー起動成功（`/health`エンドポイント応答）
- [ ] Webフロントエンド表示成功

### 理想的な動作確認

- [ ] データベースマイグレーション成功
- [ ] API-DB間の通信成功
- [ ] Web-API間の通信成功
- [ ] ファイルアップロード機能
- [ ] ホットリロード動作

---

## 🚀 テスト成功後のタスク

1. **Dockerfileの最終化**
   ```bash
   mv apps/api/Dockerfile.fixed apps/api/Dockerfile
   ```

2. **不要ファイルの削除**
   ```bash
   rm docker-compose.simple.yml
   rm Dockerfile.simple
   ```

3. **ドキュメント更新**
   - DOCKER_SETUP.mdの手順を実測値で更新
   - トラブルシューティングの追加

4. **GitHubコミット**
   - 動作確認済みの設定をプッシュ

---

## 📝 テスト結果記録テンプレート

```markdown
## Docker環境テスト結果

**テスト実施日**: 
**テスト実施者**: 
**環境**: Docker Desktop x.x.x on [OS]

### Phase 1: 基本サービス
- [ ] PostgreSQL起動: ✅/❌
- [ ] Redis起動: ✅/❌
- [ ] 接続テスト: ✅/❌

### Phase 2: APIサーバー
- [ ] ビルド成功: ✅/❌
- [ ] 起動成功: ✅/❌
- [ ] ヘルスチェック: ✅/❌

### Phase 3: フル環境
- [ ] 全サービス起動: ✅/❌
- [ ] Web表示: ✅/❌
- [ ] API通信: ✅/❌

### 発見された問題
1. 
2. 
3. 

### 修正内容
1. 
2. 
3. 
```

このテストガイドに従って実際の環境で確認してください。