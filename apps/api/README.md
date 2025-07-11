# 🔗 Backend API (Node.js) - 担当: Backend Engineer

## 🎯 あなたのミッション
**Node.js + TypeScript + Express + Prisma** で堅牢なバックエンドAPIを実装する

---

## ⚡ 今すぐ開始

### 1. 開発環境確認
```bash
# プロジェクトルートで実行済みか確認
cd ../../  # real-estate-dx/ ディレクトリに戻る
pnpm dev

# API単体起動
cd apps/api
pnpm dev
# → http://localhost:4000
```

### 2. 今日のタスク（Day 1）
- [ ] **データベース接続確認**
- [ ] **Prismaスキーマ確認・編集**
- [ ] **JWT認証システム実装開始**

---

## 📂 ディレクトリ構造

```
apps/api/
├── 📦 package.json              # 依存関係・スクリプト
├── 📄 tsconfig.json            # TypeScript設定
├── 📄 .eslintrc.js             # ESLint設定
├── 🔧 .env                     # 環境変数（ローカル）
├── 📁 src/
│   ├── 🚀 server.ts            # Express サーバーエントリーポイント
│   ├── 🔧 app.ts               # Express アプリケーション設定
│   │
│   ├── 📁 routes/              # API ルート
│   │   ├── 🔐 auth.ts          # 認証API (/api/auth/*)
│   │   ├── 🏠 properties.ts    # 物件API (/api/properties/*)
│   │   ├── 👥 users.ts         # ユーザーAPI (/api/users/*)
│   │   ├── 🏢 tenants.ts       # テナントAPI (/api/tenants/*)
│   │   ├── 📄 documents.ts     # 文書API (/api/documents/*)
│   │   └── 🤖 ocr.ts           # AI-OCR API (/api/ocr/*)
│   │
│   ├── 🔐 auth/                # 認証・認可システム
│   │   ├── jwt.ts              # JWT ユーティリティ
│   │   ├── oauth.ts            # OAuth 2.0 実装
│   │   ├── rbac.ts             # Role-Based Access Control
│   │   ├── middleware.ts       # 認証ミドルウェア
│   │   └── strategies/         # 認証ストラテジー
│   │       ├── google.ts       # Google OAuth
│   │       └── microsoft.ts    # Microsoft OAuth
│   │
│   ├── 📁 middleware/          # Express ミドルウェア
│   │   ├── auth.ts             # 認証チェック
│   │   ├── cors.ts             # CORS設定
│   │   ├── validation.ts       # リクエストバリデーション
│   │   ├── errorHandler.ts     # エラーハンドリング
│   │   ├── rateLimit.ts        # レート制限
│   │   └── logger.ts           # ログ出力
│   │
│   ├── 📁 services/            # ビジネスロジック
│   │   ├── 🔐 authService.ts   # 認証サービス
│   │   ├── 🏠 propertyService.ts # 物件サービス
│   │   ├── 👥 userService.ts   # ユーザーサービス
│   │   ├── 🏢 tenantService.ts # テナントサービス
│   │   ├── 📄 documentService.ts # 文書サービス
│   │   └── 🤖 ocrService.ts    # AI-OCRサービス
│   │
│   ├── 📁 models/              # データモデル・Prisma
│   │   ├── index.ts            # Prisma クライアント
│   │   ├── 🏠 property.ts      # 物件モデル
│   │   ├── 👥 user.ts          # ユーザーモデル
│   │   ├── 🏢 tenant.ts        # テナントモデル
│   │   └── 📄 document.ts      # 文書モデル
│   │
│   ├── 🔧 lib/                 # ユーティリティ
│   │   ├── database.ts         # データベース接続
│   │   ├── redis.ts            # Redis接続
│   │   ├── email.ts            # メール送信
│   │   ├── storage.ts          # ファイルストレージ（GCS）
│   │   ├── validation.ts       # バリデーションスキーマ
│   │   └── utils.ts            # 共通ユーティリティ
│   │
│   └── 📁 types/               # TypeScript型定義
│       ├── auth.ts             # 認証関連型
│       ├── property.ts         # 物件関連型
│       ├── user.ts             # ユーザー関連型
│       ├── api.ts              # API レスポンス型
│       └── common.ts           # 共通型
│
├── 📁 tests/                   # テストファイル
│   ├── 🧪 unit/               # ユニットテスト
│   ├── 🧪 integration/        # 統合テスト
│   ├── 🧪 e2e/                # E2Eテスト
│   └── 🧪 fixtures/           # テストデータ
│
└── 📁 docs/                    # API ドキュメント
    ├── 📄 openapi.yaml        # OpenAPI 仕様書
    └── 📄 AUTHENTICATION.md   # 認証仕様書
```

---

## 🛠️ 開発コマンド

### 基本コマンド
```bash
# 開発サーバー起動
pnpm dev
# → http://localhost:4000

# 本番ビルド
pnpm build

# 本番サーバー起動
pnpm start

# テスト実行
pnpm test
pnpm test:watch      # 監視モード
pnpm test:coverage   # カバレッジ付き

# リント・フォーマット
pnpm lint
pnpm lint:fix
pnpm format
```

### データベース操作
```bash
# Prisma Studio起動（データベースGUI）
npx prisma studio
# → http://localhost:5555

# マイグレーション実行
npx prisma migrate dev --name init

# Prisma Client生成
npx prisma generate

# データベースリセット
npx prisma migrate reset

# シードデータ実行
npx tsx prisma/seed.ts
```

### デバッグ・監視
```bash
# デバッグモード起動
pnpm dev:debug

# API health check
curl http://localhost:4000/api/health

# ログ確認
pnpm logs
```

---

## 📅 実装スケジュール

### Week 1: データベース・認証基盤
- [ ] **Day 1**: Prismaスキーマ設計・データベース構築
- [ ] **Day 2-3**: JWT認証システム実装
- [ ] **Day 4-5**: OAuth 2.0統合・RBAC実装

### Week 2: 基本CRUD API
- [ ] **Day 1-2**: ユーザー管理API実装
- [ ] **Day 3-5**: 認証ミドルウェア・バリデーション

### Week 3-4: 物件管理API
- [ ] **Week 3**: 物件CRUD・検索API実装
- [ ] **Week 4**: ファイル管理・画像アップロード

### Week 5: 高度機能・統合
- [ ] **Day 1-2**: テナント管理API
- [ ] **Day 3-5**: AI-OCR API統合・文書管理

---

## 🧩 実装優先度

### 🔥 最優先（Week 1）
1. **Prismaスキーマ確定**
2. **JWT認証システム**
3. **基本ミドルウェア**

### ⚡ 高優先（Week 2-3）
1. **ユーザー管理API**
2. **物件管理API**
3. **権限管理**

### 📊 中優先（Week 4-5）
1. **ファイル管理**
2. **AI-OCR統合**
3. **テナント管理**

---

## 🗄️ データベース設計

### Prisma スキーマ例
```prisma
// database/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String?  // OAuth users may not have password
  name      String
  avatar    String?
  role      Role     @default(USER)
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  properties Property[]
  documents  Document[]

  @@map("users")
}

model Tenant {
  id        String   @id @default(cuid())
  name      String
  domain    String   @unique
  plan      String   @default("free")
  settings  Json?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  users      User[]
  properties Property[]

  @@map("tenants")
}

model Property {
  id          String   @id @default(cuid())
  title       String
  description String?
  price       Decimal
  area        Float
  address     String
  lat         Float?
  lng         Float?
  status      PropertyStatus @default(DRAFT)
  tenantId    String
  userId      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  tenant    Tenant     @relation(fields: [tenantId], references: [id])
  user      User       @relation(fields: [userId], references: [id])
  documents Document[]
  images    PropertyImage[]

  @@map("properties")
}

model Document {
  id         String   @id @default(cuid())
  filename   String
  originalName String
  mimeType   String
  size       Int
  url        String
  type       DocumentType
  propertyId String?
  userId     String
  tenantId   String
  ocrResult  Json?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  // Relations
  property Property? @relation(fields: [propertyId], references: [id])
  user     User      @relation(fields: [userId], references: [id])

  @@map("documents")
}

enum Role {
  SUPER_ADMIN
  TENANT_ADMIN
  MANAGER
  AGENT
  USER
  VIEWER
}

enum PropertyStatus {
  DRAFT
  ACTIVE
  SOLD
  WITHDRAWN
}

enum DocumentType {
  PROPERTY_DEED
  FLOOR_PLAN
  PHOTO
  CONTRACT
  OTHER
}
```

---

## 🔐 認証・認可システム

### JWT認証実装
```typescript
// src/auth/jwt.ts
import jwt from 'jsonwebtoken'
import { User } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_EXPIRES_IN = '7d'

export interface JWTPayload {
  userId: string
  email: string
  role: string
  tenantId: string
}

export const generateToken = (user: User): string => {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload
}

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' })
}
```

### 認証ミドルウェア
```typescript
// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../auth/jwt'
import { prisma } from '../models'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
    tenantId: string
  }
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    // ユーザー情報取得
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
      },
    })

    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export const authorize = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }

    next()
  }
}
```

### OAuth 2.0実装
```typescript
// src/auth/oauth.ts
import { OAuth2Client } from 'google-auth-library'
import { prisma } from '../models'
import { generateToken } from './jwt'

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

export const handleGoogleCallback = async (code: string, tenantId: string) => {
  try {
    // 認可コードをトークンに交換
    const { tokens } = await googleClient.getToken(code)
    googleClient.setCredentials(tokens)

    // ユーザー情報取得
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    
    const payload = ticket.getPayload()
    if (!payload) throw new Error('Invalid token')

    // ユーザー作成または取得
    let user = await prisma.user.findUnique({
      where: { email: payload.email },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: payload.email!,
          name: payload.name!,
          avatar: payload.picture,
          tenantId,
          role: 'USER',
        },
      })
    }

    // JWT トークン生成
    const jwtToken = generateToken(user)
    
    return { user, token: jwtToken }
  } catch (error) {
    throw new Error('OAuth authentication failed')
  }
}
```

---

## 🏠 物件管理API

### 物件CRUD実装
```typescript
// src/routes/properties.ts
import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth'
import { validateRequest } from '../middleware/validation'
import { propertyService } from '../services/propertyService'
import { createPropertySchema, updatePropertySchema } from '../lib/validation'

const router = Router()

// 物件一覧取得
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, filter } = req.query
    
    const properties = await propertyService.getProperties({
      tenantId: req.user!.tenantId,
      page: Number(page),
      limit: Number(limit),
      search: search as string,
      filter: filter as any,
    })

    res.json(properties)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch properties' })
  }
})

// 物件詳細取得
router.get('/:id', authenticate, async (req, res) => {
  try {
    const property = await propertyService.getPropertyById(
      req.params.id,
      req.user!.tenantId
    )

    if (!property) {
      return res.status(404).json({ error: 'Property not found' })
    }

    res.json(property)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch property' })
  }
})

// 物件作成
router.post('/',
  authenticate,
  authorize(['TENANT_ADMIN', 'MANAGER', 'AGENT']),
  validateRequest(createPropertySchema),
  async (req, res) => {
    try {
      const property = await propertyService.createProperty({
        ...req.body,
        userId: req.user!.id,
        tenantId: req.user!.tenantId,
      })

      res.status(201).json(property)
    } catch (error) {
      res.status(500).json({ error: 'Failed to create property' })
    }
  }
)

// 物件更新
router.put('/:id',
  authenticate,
  authorize(['TENANT_ADMIN', 'MANAGER', 'AGENT']),
  validateRequest(updatePropertySchema),
  async (req, res) => {
    try {
      const property = await propertyService.updateProperty(
        req.params.id,
        req.body,
        req.user!.tenantId
      )

      res.json(property)
    } catch (error) {
      res.status(500).json({ error: 'Failed to update property' })
    }
  }
)

// 物件削除
router.delete('/:id',
  authenticate,
  authorize(['TENANT_ADMIN', 'MANAGER']),
  async (req, res) => {
    try {
      await propertyService.deleteProperty(req.params.id, req.user!.tenantId)
      res.status(204).send()
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete property' })
    }
  }
)

export default router
```

### 物件サービス実装
```typescript
// src/services/propertyService.ts
import { prisma } from '../models'
import { Property, PropertyStatus } from '@prisma/client'

interface GetPropertiesParams {
  tenantId: string
  page: number
  limit: number
  search?: string
  filter?: {
    status?: PropertyStatus
    minPrice?: number
    maxPrice?: number
    minArea?: number
    maxArea?: number
  }
}

export const propertyService = {
  async getProperties(params: GetPropertiesParams) {
    const { tenantId, page, limit, search, filter } = params
    const skip = (page - 1) * limit

    const where: any = { tenantId }

    // 検索条件
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ]
    }

    // フィルター条件
    if (filter) {
      if (filter.status) where.status = filter.status
      if (filter.minPrice) where.price = { gte: filter.minPrice }
      if (filter.maxPrice) where.price = { ...where.price, lte: filter.maxPrice }
      if (filter.minArea) where.area = { gte: filter.minArea }
      if (filter.maxArea) where.area = { ...where.area, lte: filter.maxArea }
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
          images: true,
          _count: { select: { documents: true } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.property.count({ where }),
    ])

    return {
      properties,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  },

  async getPropertyById(id: string, tenantId: string) {
    return prisma.property.findFirst({
      where: { id, tenantId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        images: true,
        documents: true,
      },
    })
  },

  async createProperty(data: any) {
    return prisma.property.create({
      data,
      include: {
        user: { select: { id: true, name: true, email: true } },
        images: true,
      },
    })
  },

  async updateProperty(id: string, data: any, tenantId: string) {
    return prisma.property.updateMany({
      where: { id, tenantId },
      data: { ...data, updatedAt: new Date() },
    })
  },

  async deleteProperty(id: string, tenantId: string) {
    return prisma.property.deleteMany({
      where: { id, tenantId },
    })
  },
}
```

---

## 🧪 テスト戦略

### ユニットテスト
```typescript
// tests/unit/services/propertyService.test.ts
import { propertyService } from '../../../src/services/propertyService'
import { prisma } from '../../../src/models'

// Mock Prisma
jest.mock('../../../src/models', () => ({
  prisma: {
    property: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}))

describe('PropertyService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getProperties', () => {
    it('should return properties with pagination', async () => {
      const mockProperties = [
        { id: '1', title: 'Test Property', tenantId: 'tenant1' },
      ]
      
      ;(prisma.property.findMany as jest.Mock).mockResolvedValue(mockProperties)
      ;(prisma.property.count as jest.Mock).mockResolvedValue(1)

      const result = await propertyService.getProperties({
        tenantId: 'tenant1',
        page: 1,
        limit: 20,
      })

      expect(result.properties).toEqual(mockProperties)
      expect(result.pagination.total).toBe(1)
      expect(prisma.property.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant1' },
        skip: 0,
        take: 20,
        include: expect.any(Object),
        orderBy: { updatedAt: 'desc' },
      })
    })
  })
})
```

### 統合テスト
```typescript
// tests/integration/auth.test.ts
import request from 'supertest'
import { app } from '../../src/app'
import { prisma } from '../../src/models'

describe('Authentication', () => {
  beforeEach(async () => {
    // テストデータ準備
    await prisma.user.deleteMany()
    await prisma.tenant.deleteMany()
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        tenantId: 'tenant1',
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      expect(response.body).toHaveProperty('user')
      expect(response.body).toHaveProperty('token')
      expect(response.body.user.email).toBe(userData.email)
    })

    it('should return error for duplicate email', async () => {
      // 既存ユーザー作成
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Existing User',
          tenantId: 'tenant1',
        },
      })

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          tenantId: 'tenant1',
        })
        .expect(400)

      expect(response.body.error).toContain('already exists')
    })
  })
})
```

---

## 🔄 環境切り替え

### データソースの切り替え

本プロジェクトでは環境変数により開発用のインメモリストレージと本番用のデータベースを切り替えることができます。

#### 開発環境（インメモリ）
```bash
# .env
USE_DEV_DATA="true"    # インメモリストレージを使用
ENABLE_MOCK_AUTH="false"
```

- データはメモリ上に保存（サーバー再起動でリセット）
- 高速な開発とテストが可能
- 外部DBへの依存なし

#### 本番環境（Prisma/DB）
```bash
# .env
USE_DEV_DATA="false"   # Prismaを使用
DATABASE_URL="postgresql://user:password@host:5432/db"
```

- データは永続化
- マイグレーション管理
- トランザクション処理

詳細は [データベースセットアップガイド](../../docs/development/database-setup.md) を参照。

## 🚨 トラブルシューティング

### よくある問題

#### 🗄️ Prisma接続エラー
```bash
# データベース接続確認
pnpm db:studio

# Prisma再生成
pnpm db:generate

# マイグレーション確認
pnpm db:status
```

#### 🔐 JWT認証エラー
```bash
# JWT秘密鍵確認
echo $JWT_SECRET

# トークン生成テスト
node -e "
const jwt = require('jsonwebtoken');
const token = jwt.sign({userId: 'test'}, process.env.JWT_SECRET);
console.log('Token:', token);
"
```

#### 🚨 API エラーデバッグ
```bash
# ログレベル設定
DEBUG=* pnpm dev

# 特定のログのみ
DEBUG=app:* pnpm dev

# エラーログ確認
tail -f logs/error.log
```

#### 📦 依存関係エラー
```bash
# 依存関係確認
pnpm list

# 依存関係更新
pnpm update

# キャッシュクリア
pnpm store prune
```

---

## 📚 参考リンク

### 公式ドキュメント
- [Node.js](https://nodejs.org/docs/)
- [Express.js](https://expressjs.com/)
- [Prisma](https://www.prisma.io/docs)
- [TypeScript](https://www.typescriptlang.org/)

### 開発ツール
- [Prisma Studio](https://www.prisma.io/studio)
- [Postman](https://www.postman.com/)
- [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

---

## 🚀 今日から始めよう！

### ✅ 今すぐやること
1. **データベース確認**: `pnpm db:studio` でデータベース接続確認
2. **API Health Check**: `curl http://localhost:4000/api/health`
3. **最初の実装**: JWT認証システムから開始

### 📞 質問・サポート
- **Slack**: `#backend-dev`
- **Tech Lead**: アーキテクチャ相談・レビュー依頼
- **Frontend Engineer**: API仕様調整

---

**🔗 堅牢で拡張性の高いAPIを構築しましょう！**

> 💡 **ヒント**: まずは認証システムから実装を開始し、その後物件管理APIに進むのがおすすめです！