# データベースセットアップガイド

## 概要

本プロジェクトでは、開発環境とプロダクション環境で異なるデータソースを使用できるように設計されています。環境変数により、以下の構成を切り替えることができます：

- **開発環境**: インメモリストレージ（モックデータ）
- **本番環境**: Prisma + SQLite/PostgreSQL

## 環境変数の設定

### 1. データソースの切り替え

`apps/api/.env` ファイルで以下の環境変数を設定します：

```env
# Development/Test Configuration
USE_DEV_DATA="true"    # true: インメモリ, false: Prisma/DB
ENABLE_MOCK_AUTH="false"
```

### 2. データベース設定

#### 開発環境（SQLite）
```env
# Database Configuration - SQLite for development
DATABASE_URL="file:./dev.db"
```

#### 本番環境（PostgreSQL / Cloud SQL）
```env
# Database Configuration - Cloud SQL
DATABASE_URL="postgresql://user:password@host:5432/database"
CLOUD_SQL_CONNECTION_NAME="project:region:instance"
```

## Prismaセットアップ

### 1. 初期セットアップ

```bash
# Prismaパッケージのインストール
cd apps/api
pnpm install

# データベースマイグレーション
npx prisma migrate dev --name init

# Prisma Clientの生成
npx prisma generate
```

### 2. スキーマの更新

`apps/api/prisma/schema.prisma` を編集後：

```bash
# マイグレーションの作成と適用
npx prisma migrate dev --name describe_your_changes

# Prisma Clientの再生成
npx prisma generate
```

### 3. データベースの確認

```bash
# Prisma Studioでデータベースを確認
npx prisma studio
```

## 環境別の動作

### インメモリモード（USE_DEV_DATA="true"）

- データはメモリ上に保存され、サーバー再起動時に消去されます
- 高速な開発とテストが可能
- 外部データベースへの依存なし
- モックデータの即座の反映

### データベースモード（USE_DEV_DATA="false"）

- データは永続化されます
- 実際の本番環境に近い動作
- トランザクション処理のテスト可能
- マイグレーション履歴の管理

## Google Cloud SQL接続

### 1. ローカル開発での接続

Cloud SQL Proxyを使用：

```bash
# Cloud SQL Proxyのダウンロード
curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.13.0/cloud-sql-proxy.linux.amd64
chmod +x cloud-sql-proxy

# プロキシの起動
./cloud-sql-proxy PROJECT:REGION:INSTANCE --port=5432
```

### 2. 本番環境での接続

Cloud Runなどから直接接続する場合は、環境変数で接続名を指定：

```env
CLOUD_SQL_CONNECTION_NAME="real-estate-dx:asia-northeast1:real-estate-db"
```

## テストデータの管理

### 1. シードデータの作成

`apps/api/prisma/seed.ts`:

```typescript
import { PrismaClient } from './generated/client';

const prisma = new PrismaClient();

async function main() {
  // テナントの作成
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Demo Tenant',
      subdomain: 'demo',
      plan: 'FREE',
    },
  });

  // ユーザーの作成
  const user = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      password: 'hashed_password',
      name: 'Demo User',
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  console.log('Seed data created:', { tenant, user });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### 2. シードデータの実行

```bash
npx tsx prisma/seed.ts
```

## トラブルシューティング

### Prismaエラー

1. **P1001: Can't reach database server**
   - データベースが起動していることを確認
   - 接続文字列が正しいことを確認
   - ファイアウォール設定を確認

2. **P1012: Schema validation error**
   - SQLiteでは`Json`型や`enum`がサポートされていません
   - 代わりに`String`型を使用してください

### 環境変数の確認

```bash
# 現在の設定を確認
cat apps/api/.env | grep USE_DEV_DATA
cat apps/api/.env | grep DATABASE_URL
```

## ベストプラクティス

1. **開発初期**: `USE_DEV_DATA="true"` でインメモリモードを使用
2. **統合テスト**: `USE_DEV_DATA="false"` でSQLiteを使用
3. **本番環境**: PostgreSQL（Cloud SQL）を使用
4. **CI/CD**: テスト用のSQLiteデータベースを使用

## 参考リンク

- [Prisma Documentation](https://www.prisma.io/docs)
- [Google Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)