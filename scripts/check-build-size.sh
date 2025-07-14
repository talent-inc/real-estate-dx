#!/bin/bash
set -e

echo "🔍 Dockerイメージサイズチェック"
echo "================================="

# BuildKit有効化
export DOCKER_BUILDKIT=1

# APIイメージビルド
echo "📦 Building API image..."
docker build -f apps/api/Dockerfile -t real-estate-dx-api:size-check . --target production --quiet

# Webイメージビルド
echo "📦 Building Web image..."
docker build -f apps/web/Dockerfile -t real-estate-dx-web:size-check . --target production --quiet

# サイズ確認
echo ""
echo "📊 Image Sizes:"
echo "==============="
API_SIZE=$(docker images real-estate-dx-api:size-check --format "{{.Size}}")
WEB_SIZE=$(docker images real-estate-dx-web:size-check --format "{{.Size}}")

echo "API: $API_SIZE"
echo "Web: $WEB_SIZE"

# サイズチェック（200MB以下を目標）
API_SIZE_MB=$(docker images real-estate-dx-api:size-check --format "{{.Size}}" | sed 's/MB//')
WEB_SIZE_MB=$(docker images real-estate-dx-web:size-check --format "{{.Size}}" | sed 's/MB//')

echo ""
if [[ ${API_SIZE_MB%.*} -lt 200 ]] && [[ ${WEB_SIZE_MB%.*} -lt 200 ]]; then
  echo "✅ Both images are under 200MB target!"
else
  echo "⚠️  One or more images exceed 200MB target"
fi

# レイヤー詳細
echo ""
echo "📋 Layer Details (API):"
docker history real-estate-dx-api:size-check --no-trunc --format "table {{.CreatedBy}}\t{{.Size}}" | head -10

echo ""
echo "📋 Layer Details (Web):"
docker history real-estate-dx-web:size-check --no-trunc --format "table {{.CreatedBy}}\t{{.Size}}" | head -10

# クリーンアップ
docker rmi real-estate-dx-api:size-check real-estate-dx-web:size-check