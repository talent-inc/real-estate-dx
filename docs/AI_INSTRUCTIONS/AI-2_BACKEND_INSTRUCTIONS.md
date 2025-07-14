# AI-2: バックエンド開発担当への指示

## 🎯 あなたの役割
Real Estate DXプロジェクトのバックエンド開発を担当します。`apps/api/`ディレクトリ内のExpress.js APIサーバーの実装に専念してください。

## 📁 担当範囲
- **メインディレクトリ**: `/apps/api/`
- **作業可能ファイル**:
  - `src/controllers/*` - リクエストハンドラー
  - `src/services/*` - ビジネスロジック
  - `src/routes/*` - APIルーティング
  - `src/middlewares/*` - ミドルウェア
  - `src/validators/*` - 入力検証
  - `src/utils/*` - ユーティリティ関数
  - `src/types/*` - TypeScript型定義

## 🚨 触ってはいけないファイル
- `/apps/web/*` - フロントエンドはAI-1の担当
- `prisma/schema.prisma` - スキーマ変更は人間の承認が必要
- `/.github/*` - CI/CD設定
- ルートレベルの設定ファイル

## 🛠 使用する技術
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript（strictモード）
- **ORM**: Prisma
- **Database**: SQLite（開発）/ PostgreSQL（本番）
- **認証**: JWT（jsonwebtoken）
- **バリデーション**: express-validator

## 📋 開発ルール

### 1. 作業開始前
```bash
git checkout develop
git pull origin develop
# Prismaクライアントの更新確認
pnpm -F api prisma generate
```

### 2. API仕様の遵守
`/docs/api-contracts/`の型定義を必ず実装：
```typescript
// 例: controllers/auth.controller.ts
import { LoginRequest, LoginResponse } from '@/docs/api-contracts/auth';

export const login = async (req: Request<{}, {}, LoginRequest>, res: Response<LoginResponse>) => {
  // 実装
};
```

### 3. エラーハンドリング
JSend形式で統一：
```typescript
// 成功
res.json({
  status: 'success',
  data: { user, token }
});

// エラー
res.status(400).json({
  status: 'error',
  message: 'メールアドレスが無効です',
  code: 'INVALID_EMAIL'
});
```

### 4. サービス層の活用
コントローラーは薄く、ロジックはサービスに：
```typescript
// ❌ 悪い例: コントローラーに直接ロジック
export const createProperty = async (req, res) => {
  const property = await prisma.property.create({ ... });
  // 複雑なロジック
};

// ✅ 良い例: サービス層を使用
export const createProperty = async (req, res) => {
  try {
    const property = await propertyService.create(req.body);
    res.json({ status: 'success', data: property });
  } catch (error) {
    // エラーハンドリング
  }
};
```

### 5. コミット規約
```bash
git add apps/api/
git commit -m "feat(api): 認証エンドポイントを実装"
git push origin develop
```

## 🔄 他AIとの連携

### フロントエンド（AI-1）との連携
- エンドポイント: `/api/v1/`で統一
- CORS設定済み（localhost:3000を許可）
- レスポンス形式: 必ずJSend形式

### データベース（Prisma）使用時
```typescript
// 開発環境の確認
const isDevelopment = process.env.USE_DEV_DATA === 'true';

// Prismaクライアントの使用
import { prisma } from '@/lib/prisma';
```

## 📝 具体的なタスク例

### タスク1: 認証APIの実装
```typescript
// routes/auth.routes.ts
router.post('/login', validate(loginSchema), authController.login);
router.post('/signup', validate(signupSchema), authController.signup);
router.post('/refresh', authMiddleware, authController.refresh);

// services/auth.service.ts
export const authenticate = async (email: string, password: string) => {
  // 1. ユーザー検索
  // 2. パスワード検証
  // 3. JWT生成
  // 4. リフレッシュトークン保存
};
```

### タスク2: 物件CRUD API
```typescript
// 必須エンドポイント
GET    /api/v1/properties       // 一覧（ページネーション対応）
GET    /api/v1/properties/:id   // 詳細
POST   /api/v1/properties       // 作成
PUT    /api/v1/properties/:id   // 更新
DELETE /api/v1/properties/:id   // 削除
```

## ⚠️ 注意事項
1. TypeScriptエラーは絶対に残さない
2. `pnpm -F api typecheck`でエラーがないことを確認
3. 環境変数は`.env.example`に必ず記載
4. センシティブ情報のログ出力禁止
5. SQLインジェクション対策（Prismaが自動対応）

## 🧪 テスト実行
```bash
# 型チェック
pnpm -F api typecheck

# テスト（実装時）
pnpm -F api test

# 開発サーバー起動
pnpm -F api dev
```

## 🆘 困ったときは
- スキーマ変更が必要 → 人間に相談
- 外部API連携 → 設計ドキュメント確認
- パフォーマンス問題 → インデックス設計を相談

---
準備ができたら、`git checkout develop && git pull origin develop`を実行して作業を開始してください。