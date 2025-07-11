# 🗄️ Database Layer - 担当: Backend Engineer

## 🎯 あなたのミッション
**PostgreSQL + Prisma ORM** でスケーラブルなデータベース基盤を構築する

---

## ⚡ 今すぐ開始

### 1. データベース起動確認
```bash
# Docker サービス起動
cd ../../  # real-estate-dx/ ディレクトリに戻る
docker-compose up -d postgres redis

# データベース接続確認
docker-compose ps

# Prisma Studio起動（データベースGUI）
cd database
pnpm db:studio
# → http://localhost:5555
```

### 2. 今日のタスク（Day 1）
- [ ] **Prismaスキーマ確認・理解**
- [ ] **マイグレーション実行**
- [ ] **初期データ投入**

---

## 📂 ディレクトリ構造

```
database/
├── 📄 README.md                # このファイル
├── 📄 schema.prisma            # Prismaスキーマ定義
├── 📄 package.json             # データベース関連スクリプト
├── 📁 migrations/              # マイグレーションファイル
│   ├── 20250710000001_init/
│   └── migration_lock.toml
├── 📁 seeds/                   # 初期データ
│   ├── 001_tenants.ts          # テナント初期データ
│   ├── 002_users.ts            # ユーザー初期データ
│   ├── 003_properties.ts       # 物件サンプルデータ
│   └── index.ts                # シード実行ファイル
├── 📁 sql/                     # 生SQL・ビュー定義
│   ├── views/                  # データベースビュー
│   ├── functions/              # ストアドファンクション
│   └── indexes/                # パフォーマンス用インデックス
└── 📁 backups/                 # バックアップファイル
```

---

## 🛠️ データベース操作コマンド

### 基本コマンド
```bash
# Prisma クライアント生成
pnpm db:generate

# スキーマをデータベースに反映（開発用）
pnpm db:push

# マイグレーション作成・実行
pnpm db:migrate

# 初期データ投入
pnpm db:seed

# データベースリセット（注意！全データ削除）
pnpm db:reset

# Prisma Studio起動（GUI）
pnpm db:studio

# マイグレーション状態確認
pnpm db:status
```

### データベース管理
```bash
# バックアップ作成
pnpm db:backup

# バックアップから復元
pnpm db:restore backup_20250710.sql

# スキーマ検証
pnpm db:validate

# データベース接続テスト
pnpm db:test-connection
```

---

## 🗄️ データベース設計概要

### 📊 エンティティ関係図（概要）
```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Tenant    │◄─────►│    User     │◄─────►│  Property   │
│             │   1:N  │             │   1:N  │             │
└─────────────┘       └─────────────┘       └─────────────┘
       │                       │                       │
       │                       │                       │
       ▼                       ▼                       ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  Activity   │       │ Notification│       │  Document   │
│ (監査ログ)    │       │   (通知)     │       │ (AI-OCR)    │
└─────────────┘       └─────────────┘       └─────────────┘
```

### 🏗️ マルチテナント設計
```sql
-- テナント分離戦略: Schema-per-tenant approach
-- 各テナントはtenantIdで完全分離

-- 例: 物件取得（テナント分離）
SELECT * FROM properties 
WHERE tenant_id = 'tenant_123' 
  AND status = 'ACTIVE';

-- Row Level Security (RLS) 設定例
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON properties
  FOR ALL TO app_user
  USING (tenant_id = current_setting('app.current_tenant_id'));
```

### 🎯 主要テーブル設計

#### 1. Users（ユーザー管理）
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String?  // OAuth users may not have password
  name      String
  role      UserRole @default(USER)
  tenantId  String   // マルチテナント対応
  
  // Relations
  properties Property[]
  documents  Document[]
  activities Activity[]
}
```

#### 2. Properties（物件管理）
```prisma
model Property {
  id          String         @id @default(cuid())
  title       String
  price       Decimal        @db.Decimal(15, 2)
  area        Float          // 面積 (m²)
  address     String
  lat         Float?         // 緯度
  lng         Float?         // 経度
  status      PropertyStatus @default(DRAFT)
  tenantId    String         // マルチテナント対応
  
  // Relations
  images      PropertyImage[]
  documents   Document[]
  inquiries   Inquiry[]
}
```

#### 3. Documents（AI-OCR対応）
```prisma
model Document {
  id            String    @id @default(cuid())
  filename      String
  url           String
  type          DocumentType
  ocrStatus     OcrStatus @default(PENDING)
  ocrResult     Json?     // AI-OCR抽出データ
  ocrConfidence Float?    // OCR信頼度
  tenantId      String    // マルチテナント対応
  
  // Relations
  property      Property? @relation(fields: [propertyId], references: [id])
}
```

---

## 📅 実装スケジュール

### Week 1: データベース基盤構築
- [ ] **Day 1**: Prismaスキーマ確認・マイグレーション実行
- [ ] **Day 2**: 初期データ作成・投入
- [ ] **Day 3**: マルチテナント設定・RLS設定
- [ ] **Day 4**: インデックス最適化・パフォーマンステスト
- [ ] **Day 5**: バックアップ・復旧手順確立

### Week 2: 高度機能実装
- [ ] **Day 1-2**: 全文検索設定（PostgreSQL FTS）
- [ ] **Day 3-4**: データベースビュー・ストアドファンクション
- [ ] **Day 5**: パーティショニング設定（大量データ対応）

---

## 🧩 実装優先度

### 🔥 最優先（Day 1-2）
1. **基本スキーマ確定**
2. **マルチテナント設定**
3. **初期データ投入**

### ⚡ 高優先（Day 3-5）
1. **インデックス最適化**
2. **バックアップ戦略**
3. **パフォーマンステスト**

### 📊 中優先（Week 2）
1. **全文検索設定**
2. **データベースビュー**
3. **ストアドファンクション**

---

## 🔧 Prisma設定・使用方法

### Prismaクライアント初期化
```typescript
// apps/api/src/models/index.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 基本CRUD操作例
```typescript
// ユーザー作成
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'Test User',
    tenantId: 'tenant_123',
    role: 'USER',
  },
})

// 物件一覧取得（テナント分離）
const properties = await prisma.property.findMany({
  where: {
    tenantId: 'tenant_123',
    status: 'ACTIVE',
  },
  include: {
    images: true,
    user: { select: { id: true, name: true } },
    _count: { select: { documents: true } },
  },
  orderBy: { updatedAt: 'desc' },
  take: 20,
  skip: 0,
})

// 検索機能（全文検索）
const searchResults = await prisma.property.findMany({
  where: {
    tenantId: 'tenant_123',
    AND: [
      {
        OR: [
          { title: { contains: searchQuery, mode: 'insensitive' } },
          { description: { contains: searchQuery, mode: 'insensitive' } },
          { address: { contains: searchQuery, mode: 'insensitive' } },
        ],
      },
    ],
  },
})

// トランザクション処理
const result = await prisma.$transaction(async (tx) => {
  // 物件作成
  const property = await tx.property.create({
    data: propertyData,
  })

  // アクティビティログ記録
  await tx.activity.create({
    data: {
      type: 'PROPERTY',
      action: 'create',
      entity: 'property',
      entityId: property.id,
      userId: userId,
      tenantId: tenantId,
    },
  })

  return property
})
```

### 高度なクエリ例
```typescript
// 集計クエリ
const stats = await prisma.property.groupBy({
  by: ['status', 'propertyType'],
  where: { tenantId: 'tenant_123' },
  _count: { id: true },
  _avg: { price: true },
  _sum: { area: true },
})

// 生SQLクエリ（複雑な検索）
const complexSearch = await prisma.$queryRaw`
  SELECT p.*, u.name as user_name,
         COUNT(d.id) as document_count
  FROM properties p
  LEFT JOIN users u ON p.user_id = u.id
  LEFT JOIN documents d ON p.id = d.property_id
  WHERE p.tenant_id = ${tenantId}
    AND p.price BETWEEN ${minPrice} AND ${maxPrice}
    AND ST_DWithin(
        ST_Point(p.lng, p.lat)::geography,
        ST_Point(${centerLng}, ${centerLat})::geography,
        ${radiusMeters}
      )
  GROUP BY p.id, u.name
  ORDER BY p.updated_at DESC
  LIMIT ${limit} OFFSET ${offset}
`

// バッチ操作
const batchUpdate = await prisma.property.updateMany({
  where: {
    tenantId: 'tenant_123',
    status: 'DRAFT',
    createdAt: { lt: thirtyDaysAgo },
  },
  data: {
    status: 'EXPIRED',
  },
})
```

---

## 🗂️ 初期データ・シード

### シード実行
```bash
# 初期データ投入
pnpm db:seed

# 特定のシードファイルのみ実行
pnpm db:seed --file 003_properties.ts

# 本番用初期データ
pnpm db:seed --env production
```

### シード実装例
```typescript
// seeds/001_tenants.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const seedTenants = async () => {
  console.log('🏢 Seeding tenants...')

  const tenants = [
    {
      id: 'tenant_demo',
      name: 'デモ不動産株式会社',
      domain: 'demo-realestate.com',
      plan: 'PROFESSIONAL',
      status: 'ACTIVE',
      maxUsers: 50,
      maxProperties: 1000,
    },
    {
      id: 'tenant_test',
      name: 'テスト不動産',
      domain: 'test-realestate.com',
      plan: 'BASIC',
      status: 'TRIAL',
      maxUsers: 10,
      maxProperties: 100,
    },
  ]

  for (const tenant of tenants) {
    await prisma.tenant.upsert({
      where: { domain: tenant.domain },
      update: {},
      create: tenant,
    })
  }

  console.log('✅ Tenants seeded')
}

// seeds/002_users.ts
export const seedUsers = async () => {
  console.log('👥 Seeding users...')

  const users = [
    {
      email: 'admin@demo-realestate.com',
      name: 'システム管理者',
      role: 'TENANT_ADMIN',
      tenantId: 'tenant_demo',
      password: await bcrypt.hash('password123', 12),
    },
    {
      email: 'agent@demo-realestate.com',
      name: '営業担当者',
      role: 'AGENT',
      tenantId: 'tenant_demo',
      password: await bcrypt.hash('password123', 12),
    },
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    })
  }

  console.log('✅ Users seeded')
}

// seeds/003_properties.ts
export const seedProperties = async () => {
  console.log('🏠 Seeding properties...')

  const properties = [
    {
      title: '新宿駅徒歩5分の高級マンション',
      description: '交通便利な立地の高級マンションです。',
      price: 85000000,
      area: 75.5,
      address: '東京都新宿区新宿3-1-1',
      prefecture: '東京都',
      city: '新宿区',
      lat: 35.6896,
      lng: 139.7006,
      propertyType: 'APARTMENT',
      rooms: 3,
      bathrooms: 2,
      status: 'ACTIVE',
      tenantId: 'tenant_demo',
      userId: 'user_admin_demo',
    },
    // ... more sample properties
  ]

  for (const property of properties) {
    await prisma.property.create({ data: property })
  }

  console.log('✅ Properties seeded')
}
```

---

## 📊 パフォーマンス最適化

### インデックス戦略
```sql
-- 1. 複合インデックス（よく使われる検索条件）
CREATE INDEX CONCURRENTLY idx_properties_tenant_status_type 
ON properties (tenant_id, status, property_type);

-- 2. 部分インデックス（条件付きインデックス）
CREATE INDEX CONCURRENTLY idx_properties_active 
ON properties (tenant_id, updated_at) 
WHERE status = 'ACTIVE';

-- 3. 全文検索インデックス
CREATE INDEX CONCURRENTLY idx_properties_fulltext 
ON properties USING gin(to_tsvector('japanese', title || ' ' || description));

-- 4. 地理空間インデックス
CREATE INDEX CONCURRENTLY idx_properties_location 
ON properties USING gist(ST_Point(lng, lat));

-- 5. JSONB インデックス（OCR結果検索用）
CREATE INDEX CONCURRENTLY idx_documents_ocr_result 
ON documents USING gin(ocr_result);
```

### クエリ最適化
```typescript
// ❌ Bad: N+1 problem
const properties = await prisma.property.findMany({
  where: { tenantId },
})
for (const property of properties) {
  const images = await prisma.propertyImage.findMany({
    where: { propertyId: property.id },
  })
}

// ✅ Good: Include で一度に取得
const properties = await prisma.property.findMany({
  where: { tenantId },
  include: {
    images: true,
    user: { select: { id: true, name: true } },
    _count: { select: { documents: true, inquiries: true } },
  },
})

// ✅ Good: バッチ処理で効率化
const propertyIds = properties.map(p => p.id)
const images = await prisma.propertyImage.findMany({
  where: { propertyId: { in: propertyIds } },
})
```

---

## 🔐 セキュリティ・マルチテナント

### Row Level Security（RLS）設定
```sql
-- 1. RLS有効化
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- 2. テナント分離ポリシー
CREATE POLICY tenant_isolation_properties ON properties
  FOR ALL TO app_user
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_documents ON documents
  FOR ALL TO app_user
  USING (tenant_id = current_setting('app.current_tenant_id', true));

-- 3. アプリケーション側でテナントID設定
-- Prisma middleware で自動設定
prisma.$use(async (params, next) => {
  if (params.action === 'findMany' || params.action === 'findFirst') {
    params.args.where = {
      ...params.args.where,
      tenantId: getCurrentTenantId(),
    }
  }
  return next(params)
})
```

### データ暗号化
```typescript
// 機密データの暗号化（アプリケーション層）
import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY! // 32 chars
const ALGORITHM = 'aes-256-gcm'

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY)
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

export const decrypt = (encryptedText: string): string => {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':')
  
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY)
  decipher.setAuthTag(authTag)
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}
```

---

## 🧪 テスト戦略

### データベーステスト
```typescript
// tests/database/property.test.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.TEST_DATABASE_URL } },
})

describe('Property Model', () => {
  beforeEach(async () => {
    // テストデータクリーンアップ
    await prisma.property.deleteMany()
    await prisma.user.deleteMany()
    await prisma.tenant.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('should create property with valid data', async () => {
    // テナント作成
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Test Tenant',
        domain: 'test.com',
      },
    })

    // ユーザー作成
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        tenantId: tenant.id,
      },
    })

    // 物件作成
    const property = await prisma.property.create({
      data: {
        title: 'Test Property',
        price: 100000,
        area: 50.5,
        address: 'Test Address',
        propertyType: 'APARTMENT',
        tenantId: tenant.id,
        userId: user.id,
      },
    })

    expect(property.title).toBe('Test Property')
    expect(property.tenantId).toBe(tenant.id)
  })

  it('should enforce tenant isolation', async () => {
    // 別テナントの物件は取得できないことを確認
    const properties = await prisma.property.findMany({
      where: { tenantId: 'different_tenant' },
    })

    expect(properties).toHaveLength(0)
  })
})
```

---

## 🚨 トラブルシューティング

### よくある問題

#### 🔧 Prisma接続エラー
```bash
# 1. DATABASE_URL確認
echo $DATABASE_URL

# 2. データベースサービス確認
docker-compose ps postgres

# 3. Prisma再生成
pnpm db:generate

# 4. 接続テスト
pnpm db:test-connection
```

#### 🗄️ マイグレーションエラー
```bash
# 1. マイグレーション状態確認
pnpm db:status

# 2. 手動でマイグレーション実行
pnpm db:migrate deploy

# 3. スキーマリセット（開発環境のみ）
pnpm db:reset

# 4. Prisma Studio で確認
pnpm db:studio
```

#### 📊 パフォーマンス問題
```sql
-- 1. 実行中クエリ確認
SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
FROM pg_stat_activity 
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';

-- 2. インデックス使用状況確認
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;

-- 3. テーブルサイズ確認
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 📚 参考リンク

### 公式ドキュメント
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)

### 開発ツール
- [Prisma Studio](https://www.prisma.io/studio)
- [PgAdmin](https://www.pgadmin.org/)
- [PostgREST](https://postgrest.org/)

---

## 🚀 今日から始めよう！

### ✅ 今すぐやること
1. **データベース起動確認**: `docker-compose up -d postgres`
2. **Prisma Studio起動**: `pnpm db:studio`
3. **初期マイグレーション**: `pnpm db:push && pnpm db:seed`

### 📞 質問・サポート
- **Slack**: `#database-dev`
- **Tech Lead**: スキーマ設計相談・パフォーマンス相談
- **Backend Engineer**: API統合相談

---

**🗄️ 堅牢で拡張性の高いデータベース基盤を構築しましょう！**

> 💡 **ヒント**: まずはPrisma Studioでスキーマ構造を理解し、サンプルデータでCRUD操作を試してみましょう！