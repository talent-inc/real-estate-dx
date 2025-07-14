#!/bin/bash
set -e

echo "🚀 Real Estate DX 開発環境を起動します..."

# BuildKit有効化
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# 環境変数チェック
if [ ! -f .env ]; then
  echo "⚠️  .envファイルが見つかりません。.env.exampleからコピーします..."
  cp .env.example .env
fi

# 古いコンテナの停止
echo "🧹 既存のコンテナを停止中..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down

# ネットワークが存在しない場合は作成
if ! docker network ls | grep -q "real-estate-dx-network"; then
  echo "📡 ネットワークを作成中..."
  docker network create real-estate-dx-network
fi

# ビルドと起動
echo "🏗️  Dockerイメージをビルド中..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml build --parallel

echo "🎯 サービスを起動中..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# ヘルスチェック待機
echo "⏳ サービスの起動を待機中..."
sleep 10

# サービス状態確認
echo "📊 サービス状態:"
docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps

echo "✅ 開発環境が起動しました！"
echo "📍 Web: http://localhost:3000"
echo "📍 API: http://localhost:8000"
echo "📍 PgAdmin: http://localhost:5050"
echo "📍 Redis Commander: http://localhost:8081"
echo ""
echo "📝 ログを見る場合: docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f"
echo "🛑 停止する場合: docker-compose -f docker-compose.yml -f docker-compose.dev.yml down"