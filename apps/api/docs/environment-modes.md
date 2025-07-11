# 環境モード切り替えガイド

## 概要

Real Estate DX APIは、開発効率と本番環境への移行をスムーズにするため、2つの動作モードを提供しています。

## 動作モード

### 1. インメモリモード（開発用）

高速な開発とテストのために、データをメモリ上に保存します。

**特徴：**
- ✅ 即座の起動（データベース不要）
- ✅ 高速なデータ操作
- ✅ 簡単なテストデータリセット
- ❌ データは永続化されない
- ❌ サーバー再起動でデータ消失

**設定方法：**
```env
# .env
USE_DEV_DATA="true"
ENABLE_MOCK_AUTH="false"
```

**使用場面：**
- 初期開発
- 機能実装
- ユニットテスト
- UIの動作確認

### 2. データベースモード（本番用）

Prisma ORMを使用した本格的なデータベース操作。

**特徴：**
- ✅ データの永続化
- ✅ トランザクション処理
- ✅ マイグレーション管理
- ✅ 本番環境と同等の動作
- ❌ 初期セットアップが必要

**設定方法：**
```env
# .env
USE_DEV_DATA="false"

# SQLite（ローカル開発）
DATABASE_URL="file:./dev.db"

# PostgreSQL（本番環境）
DATABASE_URL="postgresql://user:password@host:5432/database"
```

**使用場面：**
- 統合テスト
- ステージング環境
- 本番環境
- データベース機能のテスト

## サービス実装例

### 環境対応のAuthService

```typescript
// src/services/auth.service.ts

const USE_PRISMA = process.env.USE_DEV_DATA !== 'true';

export class AuthService {
  async login(loginData: LoginRequest) {
    if (USE_PRISMA) {
      return this.loginWithPrisma(loginData);
    }
    return this.loginInMemory(loginData);
  }

  private async loginInMemory(loginData: LoginRequest) {
    // インメモリ実装
    const user = users.find(u => u.email === loginData.email);
    // ...
  }

  private async loginWithPrisma(loginData: LoginRequest) {
    // Prisma実装
    const user = await prisma.user.findFirst({
      where: { email: loginData.email }
    });
    // ...
  }
}
```

## 切り替え時の注意点

### インメモリ → データベース

1. **初回マイグレーション実行**
   ```bash
   npx prisma migrate dev --name init
   ```

2. **環境変数更新**
   ```bash
   USE_DEV_DATA="false"
   ```

3. **初期データ投入**
   ```bash
   npx tsx prisma/seed.ts
   ```

### データベース → インメモリ

1. **環境変数更新**
   ```bash
   USE_DEV_DATA="true"
   ```

2. **サーバー再起動**
   ```bash
   pnpm dev
   ```

## テスト戦略

### 開発フロー

```mermaid
graph LR
    A[機能開発] -->|USE_DEV_DATA=true| B[インメモリ]
    B --> C[ユニットテスト]
    C --> D[統合テスト]
    D -->|USE_DEV_DATA=false| E[データベース]
    E --> F[E2Eテスト]
    F --> G[本番デプロイ]
```

### CI/CD設定例

```yaml
# .github/workflows/test.yml
jobs:
  unit-tests:
    env:
      USE_DEV_DATA: "true"
    steps:
      - run: pnpm test:unit

  integration-tests:
    env:
      USE_DEV_DATA: "false"
      DATABASE_URL: "file:./test.db"
    steps:
      - run: npx prisma migrate deploy
      - run: pnpm test:integration
```

## パフォーマンス比較

| 操作 | インメモリ | SQLite | PostgreSQL |
|------|-----------|---------|------------|
| 起動時間 | < 1秒 | 2-3秒 | 3-5秒 |
| CRUD操作 | < 1ms | 5-10ms | 10-20ms |
| 複雑なクエリ | 1-5ms | 20-50ms | 30-100ms |
| 同時接続数 | 制限なし | 低 | 高 |

## トラブルシューティング

### Q: モード切り替え後、データが見えない

A: 各モードのデータは独立しています。必要に応じてデータを移行してください。

### Q: Prismaエラーが発生する

A: `USE_DEV_DATA="false"`の場合、以下を確認：
```bash
# Prisma Clientが生成されているか
npx prisma generate

# マイグレーションが適用されているか
npx prisma migrate status
```

### Q: インメモリモードでデータが消える

A: 正常な動作です。永続化が必要な場合はデータベースモードを使用してください。

## ベストプラクティス

1. **開発初期**: インメモリモードで高速イテレーション
2. **機能完成後**: データベースモードでテスト
3. **PR作成時**: 両モードでのテストを確認
4. **本番環境**: 必ずデータベースモード

## 関連ドキュメント

- [データベースセットアップガイド](../../../docs/development/database-setup.md)
- [Prismaスキーマ定義](../prisma/schema.prisma)
- [環境変数設定](./.env.example)