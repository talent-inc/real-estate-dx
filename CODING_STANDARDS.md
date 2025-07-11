# 📋 コーディング規約・開発ルール

## 🎯 目的
長期的な変更に耐えうる**クリーンで保守性の高いコード**を、チーム全員が一貫して実装・メンテナンスできるようにする。

---

## 📐 基本原則（SOLID + Clean Code）

### 🎪 SOLID原則の適用
1. **Single Responsibility Principle (SRP)**: 1つのクラス・関数は1つの責任のみ
2. **Open/Closed Principle (OCP)**: 拡張に開いて、修正に閉じる
3. **Liskov Substitution Principle (LSP)**: サブタイプは基底型と置換可能
4. **Interface Segregation Principle (ISP)**: インターフェースは最小限に
5. **Dependency Inversion Principle (DIP)**: 抽象に依存し、具象に依存しない

### 🧹 Clean Code原則
1. **意味のある名前**: 変数・関数・クラス名は目的を明確に表現
2. **小さな関数**: 1つの関数は20行以下、1つのことだけ実行
3. **コメントより良いコード**: コードが自己説明的であること
4. **一貫性**: プロジェクト全体で統一されたスタイル
5. **DRY (Don't Repeat Yourself)**: 重複排除・再利用性重視

---

## 🏗️ アーキテクチャ規約

### 📁 ディレクトリ構造規約
```
apps/[app-name]/
├── src/
│   ├── components/     # UI コンポーネント（フロントエンド）
│   ├── pages/         # ページコンポーネント（フロントエンド）
│   ├── hooks/         # カスタムフック（フロントエンド）
│   ├── routes/        # API ルート（バックエンド）
│   ├── services/      # ビジネスロジック
│   ├── models/        # データモデル・スキーマ
│   ├── middleware/    # ミドルウェア
│   ├── lib/          # ユーティリティ・ヘルパー
│   ├── types/        # TypeScript 型定義
│   └── tests/        # テストファイル
packages/[package-name]/
├── src/              # 共通パッケージのソース
└── tests/            # 共通パッケージのテスト
```

### 🎯 レイヤード アーキテクチャ
```
┌─────────────────────┐
│   Presentation      │ ← UI Components / API Routes
├─────────────────────┤
│   Business Logic    │ ← Services / Use Cases
├─────────────────────┤
│   Data Access       │ ← Models / Repositories
├─────────────────────┤
│   Infrastructure    │ ← Database / External APIs
└─────────────────────┘
```

**依存関係ルール**: 上位レイヤーは下位レイヤーに依存OK、逆は禁止

---

## 💻 TypeScript規約

### 🎪 型定義・命名規約
```typescript
// ✅ Good: 明確で一貫した命名
interface UserProfile {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

type PropertyStatus = 'draft' | 'active' | 'sold' | 'withdrawn'

enum UserRole {
  SUPER_ADMIN = 'super_admin',
  TENANT_ADMIN = 'tenant_admin',
  MANAGER = 'manager',
  AGENT = 'agent',
  USER = 'user',
  VIEWER = 'viewer',
}

// ❌ Bad: 曖昧・不一致な命名
interface Data {
  stuff: any
  thing: string
}
```

### 🔧 型安全性ルール
```typescript
// ✅ Good: 厳格な型定義
interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  errors?: string[]
}

const fetchUser = async (id: string): Promise<ApiResponse<UserProfile>> => {
  // implementation
}

// ✅ Good: Union Types for状態管理
type LoadingState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: UserProfile }
  | { status: 'error'; error: string }

// ❌ Bad: any の多用
const fetchData = async (id: any): Promise<any> => {
  // any は禁止（型安全性を損なう）
}
```

### 📋 型ガード・バリデーション
```typescript
// ✅ Good: 型ガード関数
const isUser = (obj: unknown): obj is UserProfile => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'email' in obj &&
    'name' in obj
  )
}

// ✅ Good: Zodを使ったバリデーション
import { z } from 'zod'

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string().min(8),
})

type CreateUserInput = z.infer<typeof CreateUserSchema>
```

---

## ⚛️ React / Next.js規約

### 🧩 コンポーネント設計規約
```typescript
// ✅ Good: 関数コンポーネント + TypeScript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger'
  size: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  onClick?: () => void
}

export const Button: React.FC<ButtonProps> = ({
  variant,
  size,
  disabled = false,
  loading = false,
  children,
  onClick,
}) => {
  const baseClasses = 'font-semibold rounded-md transition-colors'
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? 'Loading...' : children}
    </button>
  )
}

// ❌ Bad: Props型未定義・any使用
const BadButton = (props: any) => {
  return <button {...props} />
}
```

### 🪝 カスタムフック規約
```typescript
// ✅ Good: 型安全なカスタムフック
interface UseApiOptions<T> {
  initialData?: T
  enabled?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

export const useApi = <T>(
  url: string,
  options: UseApiOptions<T> = {}
) => {
  const [data, setData] = useState<T | null>(options.initialData ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      
      const result = await response.json()
      setData(result)
      options.onSuccess?.(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      options.onError?.(error)
    } finally {
      setLoading(false)
    }
  }, [url, options])

  useEffect(() => {
    if (options.enabled !== false) {
      refetch()
    }
  }, [refetch, options.enabled])

  return { data, loading, error, refetch }
}
```

### 📄 ページコンポーネント規約
```typescript
// ✅ Good: Next.js ページ構造
import { GetServerSideProps } from 'next'
import { Layout } from '@/components/layout/Layout'
import { PropertyList } from '@/components/property/PropertyList'

interface PropertyPageProps {
  initialProperties: Property[]
  totalCount: number
}

const PropertyPage: React.FC<PropertyPageProps> = ({
  initialProperties,
  totalCount,
}) => {
  return (
    <Layout title="物件管理">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">物件管理</h1>
        <PropertyList
          initialData={initialProperties}
          totalCount={totalCount}
        />
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps<PropertyPageProps> = async (context) => {
  try {
    const properties = await fetchProperties()
    
    return {
      props: {
        initialProperties: properties.data,
        totalCount: properties.total,
      },
    }
  } catch (error) {
    return {
      notFound: true,
    }
  }
}

export default PropertyPage
```

---

## 🔗 Node.js / Express規約

### 🛤️ API ルート設計規約
```typescript
// ✅ Good: RESTful API設計
import { Router } from 'express'
import { z } from 'zod'
import { authenticate, authorize } from '../middleware/auth'
import { validateRequest } from '../middleware/validation'
import { propertyService } from '../services/propertyService'

const router = Router()

// GET /api/properties - 物件一覧取得
router.get('/', 
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const query = z.object({
        page: z.string().transform(Number).default('1'),
        limit: z.string().transform(Number).default('20'),
        search: z.string().optional(),
        status: z.enum(['draft', 'active', 'sold', 'withdrawn']).optional(),
      }).parse(req.query)

      const result = await propertyService.getProperties({
        ...query,
        tenantId: req.user!.tenantId,
      })

      res.json({
        success: true,
        data: result.properties,
        pagination: result.pagination,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid query parameters',
          errors: error.errors,
        })
      }

      console.error('Get properties error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }
)

// POST /api/properties - 物件作成
const createPropertySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  price: z.number().positive(),
  area: z.number().positive(),
  address: z.string().min(1),
  lat: z.number().optional(),
  lng: z.number().optional(),
})

router.post('/',
  authenticate,
  authorize(['TENANT_ADMIN', 'MANAGER', 'AGENT']),
  validateRequest(createPropertySchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const propertyData = createPropertySchema.parse(req.body)
      
      const property = await propertyService.createProperty({
        ...propertyData,
        userId: req.user!.id,
        tenantId: req.user!.tenantId,
      })

      res.status(201).json({
        success: true,
        data: property,
        message: 'Property created successfully',
      })
    } catch (error) {
      console.error('Create property error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to create property',
      })
    }
  }
)
```

### 🔧 サービス層設計規約
```typescript
// ✅ Good: サービス層の責任分離
import { prisma } from '../models'
import { CreatePropertyInput, UpdatePropertyInput } from '../types/property'

export class PropertyService {
  // 物件一覧取得
  async getProperties(params: GetPropertiesParams) {
    const { tenantId, page, limit, search, filter } = params
    
    // ビジネスロジック: 検索・フィルタリング条件構築
    const where = this.buildWhereClause(tenantId, search, filter)
    
    // データアクセス
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: this.getPropertyIncludes(),
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.property.count({ where }),
    ])

    // ビジネスロジック: ページネーション計算
    return {
      properties,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  // 物件作成
  async createProperty(input: CreatePropertyInput) {
    // ビジネスロジック: バリデーション
    await this.validatePropertyCreation(input)
    
    // データアクセス
    const property = await prisma.property.create({
      data: {
        ...input,
        status: 'draft', // デフォルト状態
      },
      include: this.getPropertyIncludes(),
    })

    // ビジネスロジック: 作成後処理（通知等）
    await this.afterPropertyCreated(property)
    
    return property
  }

  // プライベートヘルパーメソッド
  private buildWhereClause(tenantId: string, search?: string, filter?: any) {
    const where: any = { tenantId }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (filter) {
      Object.assign(where, filter)
    }

    return where
  }

  private getPropertyIncludes() {
    return {
      user: { select: { id: true, name: true, email: true } },
      images: true,
      _count: { select: { documents: true } },
    }
  }

  private async validatePropertyCreation(input: CreatePropertyInput) {
    // ビジネスルール: 同一テナント内でのタイトル重複チェック
    const existing = await prisma.property.findFirst({
      where: {
        title: input.title,
        tenantId: input.tenantId,
      },
    })

    if (existing) {
      throw new Error('Property with this title already exists')
    }
  }

  private async afterPropertyCreated(property: any) {
    // 後処理: 通知送信、ログ記録等
    console.log(`Property created: ${property.id}`)
  }
}

export const propertyService = new PropertyService()
```

---

## 🧪 テスト規約

### 🏗️ テスト構造規約
```typescript
// ✅ Good: AAA (Arrange, Act, Assert) パターン
describe('PropertyService', () => {
  describe('createProperty', () => {
    it('should create property with valid data', async () => {
      // Arrange (準備)
      const propertyData = {
        title: 'Test Property',
        price: 100000,
        area: 50.5,
        address: 'Test Address',
        userId: 'user1',
        tenantId: 'tenant1',
      }

      // Mock setup
      const mockProperty = { id: 'prop1', ...propertyData }
      jest.spyOn(prisma.property, 'create').mockResolvedValue(mockProperty)
      jest.spyOn(prisma.property, 'findFirst').mockResolvedValue(null)

      // Act (実行)
      const result = await propertyService.createProperty(propertyData)

      // Assert (検証)
      expect(result).toEqual(mockProperty)
      expect(prisma.property.create).toHaveBeenCalledWith({
        data: { ...propertyData, status: 'draft' },
        include: expect.any(Object),
      })
    })

    it('should throw error when title already exists', async () => {
      // Arrange
      const propertyData = {
        title: 'Duplicate Title',
        price: 100000,
        area: 50.5,
        address: 'Test Address',
        userId: 'user1',
        tenantId: 'tenant1',
      }

      // Mock: 既存物件が存在
      jest.spyOn(prisma.property, 'findFirst').mockResolvedValue({
        id: 'existing',
        title: 'Duplicate Title',
      } as any)

      // Act & Assert
      await expect(propertyService.createProperty(propertyData))
        .rejects.toThrow('Property with this title already exists')
    })
  })
})
```

### 📊 テストカバレッジ規約
```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // 重要ファイルはより高い基準
    './src/services/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**',
    '!src/**/*.test.{ts,tsx}',
  ],
}
```

---

## 📝 命名規約

### 🔤 命名パターン
```typescript
// ✅ Good: 一貫した命名規約

// Variables: camelCase
const userProfile = { ... }
const isAuthenticated = true
const propertyCount = 10

// Constants: SCREAMING_SNAKE_CASE
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const API_ENDPOINTS = {
  PROPERTIES: '/api/properties',
  USERS: '/api/users',
} as const

// Functions: camelCase (動詞で開始)
const getUserById = (id: string) => { ... }
const validateEmail = (email: string) => { ... }
const transformPropertyData = (data: any) => { ... }

// Classes: PascalCase
class PropertyService { ... }
class UserRepository { ... }

// Interfaces: PascalCase (I prefix不要)
interface UserProfile { ... }
interface ApiResponse<T> { ... }

// Types: PascalCase
type PropertyStatus = 'draft' | 'active' | 'sold'
type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// Enums: PascalCase (values: SCREAMING_SNAKE_CASE)
enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TENANT_ADMIN = 'TENANT_ADMIN',
  MANAGER = 'MANAGER',
}

// Files/Directories: kebab-case or camelCase
// user-profile.ts or userProfile.ts
// property-service/ or propertyService/

// React Components: PascalCase
const PropertyList = () => { ... }
const UserProfileCard = () => { ... }

// React Hooks: camelCase (use prefix)
const useAuth = () => { ... }
const usePropertyList = () => { ... }
```

### 🎯 意味のある命名
```typescript
// ✅ Good: 意図が明確
const calculateMonthlyPayment = (principal: number, rate: number, months: number) => {
  return (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1)
}

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const getUsersWithActiveSubscription = async () => {
  return prisma.user.findMany({
    where: {
      subscription: {
        status: 'active',
        expiresAt: { gt: new Date() },
      },
    },
  })
}

// ❌ Bad: 曖昧・省略しすぎ
const calc = (p: number, r: number, m: number) => { ... }
const chk = (em: string) => { ... }
const getUsrs = () => { ... }
```

---

## 🚨 エラーハンドリング規約

### 🎯 エラー型定義
```typescript
// ✅ Good: 構造化されたエラー型
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message)
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field: string) {
    super(message, 'VALIDATION_ERROR', 400)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401)
  }
}
```

### 🛡️ エラーハンドリング パターン
```typescript
// ✅ Good: 適切なエラーハンドリング
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// API Route でのエラーハンドリング
router.get('/properties/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  
  if (!id || typeof id !== 'string') {
    throw new ValidationError('Invalid property ID', 'id')
  }

  const property = await propertyService.getPropertyById(id, req.user!.tenantId)
  
  if (!property) {
    throw new NotFoundError('Property')
  }

  res.json({
    success: true,
    data: property,
  })
}))

// グローバルエラーハンドラー
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500
  let message = 'Internal Server Error'
  let code = 'INTERNAL_ERROR'

  if (error instanceof AppError) {
    statusCode = error.statusCode
    message = error.message
    code = error.code
  } else if (error instanceof z.ZodError) {
    statusCode = 400
    message = 'Validation failed'
    code = 'VALIDATION_ERROR'
  }

  // ログ出力
  if (statusCode >= 500) {
    console.error('Server Error:', error)
  } else {
    console.warn('Client Error:', { message, code, url: req.url })
  }

  res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  })
}
```

---

## 🔄 Git / コミット規約

### 📝 コミットメッセージ規約（Conventional Commits）
```bash
# フォーマット
<type>(<scope>): <description>

[optional body]

[optional footer(s)]

# 例
feat(auth): add OAuth 2.0 Google integration

- Add Google OAuth client configuration
- Implement callback handler
- Add user creation from OAuth profile

Closes #123

# Types
feat     # 新機能
fix      # バグ修正
docs     # ドキュメントのみの変更
style    # フォーマット修正（機能に影響なし）
refactor # リファクタリング
test     # テスト追加・修正
chore    # ビルド・補助ツール等の変更

# Scopes
auth     # 認証関連
api      # API関連
ui       # UI関連
db       # データベース関連
config   # 設定関連
```

### 🌿 ブランチ戦略
```bash
# ブランチ命名規約
main                    # 本番デプロイ用
develop                 # 開発統合用
feature/auth-system     # 新機能開発
fix/login-bug          # バグ修正
hotfix/security-patch  # 緊急修正
release/v1.0.0         # リリース準備

# ワークフロー
1. develop から feature branch 作成
2. 機能開発・テスト
3. develop への Pull Request
4. コードレビュー・承認
5. develop へマージ
6. リリース時に main へマージ
```

---

## 📊 パフォーマンス規約

### ⚡ フロントエンド パフォーマンス
```typescript
// ✅ Good: パフォーマンス最適化
import { memo, useMemo, useCallback } from 'react'
import { debounce } from 'lodash'

// React.memo でレンダリング最適化
export const PropertyCard = memo<PropertyCardProps>(({ property, onEdit }) => {
  // useCallback で関数メモ化
  const handleEdit = useCallback(() => {
    onEdit(property.id)
  }, [property.id, onEdit])

  // useMemo で計算結果メモ化
  const formattedPrice = useMemo(() => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(property.price)
  }, [property.price])

  return (
    <div className="property-card">
      <h3>{property.title}</h3>
      <p>{formattedPrice}</p>
      <button onClick={handleEdit}>編集</button>
    </div>
  )
})

// 検索のデバウンス
export const PropertySearch = () => {
  const [query, setQuery] = useState('')
  
  const debouncedSearch = useMemo(
    () => debounce((searchQuery: string) => {
      // API call
      searchProperties(searchQuery)
    }, 300),
    []
  )

  useEffect(() => {
    debouncedSearch(query)
  }, [query, debouncedSearch])

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="物件を検索..."
    />
  )
}
```

### 🗄️ バックエンド パフォーマンス
```typescript
// ✅ Good: データベースクエリ最適化
export class PropertyService {
  // N+1問題を避けるために include 使用
  async getPropertiesWithDetails(tenantId: string) {
    return prisma.property.findMany({
      where: { tenantId },
      include: {
        user: { select: { id: true, name: true } }, // 必要な項目のみ
        images: true,
        _count: { select: { documents: true } }, // カウントのみ
      },
      orderBy: { updatedAt: 'desc' },
    })
  }

  // バッチ処理でパフォーマンス向上
  async updateMultipleProperties(ids: string[], data: any) {
    return prisma.property.updateMany({
      where: { id: { in: ids } },
      data,
    })
  }

  // ページネーション必須
  async searchProperties(params: SearchParams) {
    const { page, limit, search } = params
    const skip = (page - 1) * limit

    // 検索クエリ最適化
    const where = {
      AND: [
        { tenantId: params.tenantId },
        search ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { address: { contains: search, mode: 'insensitive' } },
          ],
        } : {},
      ],
    }

    // 並行実行でパフォーマンス向上
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limit,
        include: this.getPropertyIncludes(),
      }),
      prisma.property.count({ where }),
    ])

    return { properties, total }
  }
}
```

---

## 🛡️ セキュリティ規約

### 🔐 セキュリティ実装パターン
```typescript
// ✅ Good: セキュリティベストプラクティス

// 1. 入力バリデーション（Zod使用）
const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
})

// 2. パスワードハッシュ化
import bcrypt from 'bcryptjs'

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash)
}

// 3. SQL Injection 対策（Prisma使用）
// ✅ Good: Prisma の型安全クエリ
const user = await prisma.user.findUnique({
  where: { email: validatedEmail }, // バリデーション済み
})

// ❌ Bad: 生SQLは避ける
// const user = await prisma.$queryRaw`SELECT * FROM users WHERE email = ${email}`

// 4. XSS対策（入力サニタイゼーション）
import DOMPurify from 'dompurify'

export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u'],
    ALLOWED_ATTR: [],
  })
}

// 5. CSRF対策（ミドルウェア）
import csrf from 'csurf'

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
})

// 6. レート制限
import rateLimit from 'express-rate-limit'

export const createRateLimit = (windowMs: number, max: number) => {
  return rateLimit({
    windowMs,
    max,
    message: 'Too many requests from this IP',
    standardHeaders: true,
    legacyHeaders: false,
  })
}

// ログイン試行の制限
export const loginRateLimit = createRateLimit(15 * 60 * 1000, 5) // 15分で5回
```

---

## 📋 コードレビュー規約

### 👀 レビューチェックリスト

#### 🔍 必須チェック項目
- [ ] **機能要件**: 仕様通りに動作するか
- [ ] **型安全性**: TypeScript エラーがないか
- [ ] **テスト**: 適切なテストが書かれているか
- [ ] **セキュリティ**: 脆弱性がないか
- [ ] **パフォーマンス**: N+1問題等のパフォーマンス問題がないか
- [ ] **エラーハンドリング**: 適切なエラー処理が実装されているか
- [ ] **命名**: 意味のある名前が使われているか
- [ ] **コメント**: 必要な箇所にコメントがあるか（コードで表現できない場合のみ）

#### 📊 品質基準
```typescript
// ✅ Good: レビュー通過基準
// 1. 関数は単一責任
const calculateTax = (amount: number, rate: number): number => {
  return amount * rate
}

// 2. エラーハンドリング適切
const getUserById = async (id: string): Promise<User | null> => {
  try {
    return await prisma.user.findUnique({ where: { id } })
  } catch (error) {
    console.error('Failed to get user:', error)
    throw new Error('Database error')
  }
}

// 3. テストカバレッジ適切
describe('calculateTax', () => {
  it('should calculate tax correctly', () => {
    expect(calculateTax(100, 0.1)).toBe(10)
  })

  it('should handle zero amount', () => {
    expect(calculateTax(0, 0.1)).toBe(0)
  })
})

// ❌ Bad: レビュー差し戻し
const doStuff = (data: any) => { // 命名が曖昧、any使用
  // エラーハンドリングなし
  return data.map(item => item.value * 1.1) // マジックナンバー
}
```

---

## 🔄 リファクタリング規約

### 🧹 段階的リファクタリング
```typescript
// Phase 1: 型安全性向上
// Before
const processData = (data: any) => {
  return data.items.map((item: any) => ({
    id: item.id,
    name: item.name,
    price: item.price * 1.1,
  }))
}

// After
interface DataItem {
  id: string
  name: string
  price: number
}

interface ProcessedItem {
  id: string
  name: string
  price: number
}

const processData = (data: { items: DataItem[] }): ProcessedItem[] => {
  const TAX_RATE = 0.1
  
  return data.items.map(item => ({
    id: item.id,
    name: item.name,
    price: item.price * (1 + TAX_RATE),
  }))
}

// Phase 2: 責任分離
const TAX_RATE = 0.1

const calculatePriceWithTax = (price: number): number => {
  return price * (1 + TAX_RATE)
}

const transformDataItem = (item: DataItem): ProcessedItem => ({
  id: item.id,
  name: item.name,
  price: calculatePriceWithTax(item.price),
})

const processData = (data: { items: DataItem[] }): ProcessedItem[] => {
  return data.items.map(transformDataItem)
}

// Phase 3: エラーハンドリング追加
const processDataSafely = (data: unknown): ProcessedItem[] => {
  if (!data || typeof data !== 'object' || !('items' in data)) {
    throw new ValidationError('Invalid data format', 'data')
  }

  const { items } = data as { items: unknown[] }
  
  if (!Array.isArray(items)) {
    throw new ValidationError('Items must be an array', 'items')
  }

  return items.map((item, index) => {
    try {
      return transformDataItem(item as DataItem)
    } catch (error) {
      throw new ValidationError(`Invalid item at index ${index}`, `items[${index}]`)
    }
  })
}
```

---

## 📚 ドキュメント規約

### 📝 コメント規約
```typescript
/**
 * 物件の月額支払い金額を計算する
 * 
 * @param principal - 元本金額（円）
 * @param annualRate - 年利率（小数点表記。例: 0.03 = 3%）
 * @param years - 返済年数
 * @returns 月額支払い金額（円）
 * 
 * @example
 * ```typescript
 * const monthly = calculateMonthlyPayment(1000000, 0.03, 30)
 * console.log(monthly) // 4216.04
 * ```
 */
export const calculateMonthlyPayment = (
  principal: number,
  annualRate: number,
  years: number
): number => {
  const monthlyRate = annualRate / 12
  const totalMonths = years * 12
  
  // 複利計算式を使用
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
         (Math.pow(1 + monthlyRate, totalMonths) - 1)
}

// 複雑なビジネスロジックには説明コメント
export const determinePropertyStatus = (property: Property): PropertyStatus => {
  // 物件ステータス判定ロジック
  // 1. 契約済みの場合は 'sold'
  if (property.contractedAt) {
    return 'sold'
  }
  
  // 2. 公開日が未来の場合は 'draft'
  if (property.publishedAt && property.publishedAt > new Date()) {
    return 'draft'
  }
  
  // 3. 期限切れの場合は 'withdrawn'
  if (property.expiresAt && property.expiresAt < new Date()) {
    return 'withdrawn'
  }
  
  // 4. それ以外は 'active'
  return 'active'
}
```

---

## 🚀 CI/CD・デプロイ規約

### ⚙️ GitHub Actions設定
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm format:check

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: password
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:coverage
      - run: pnpm test:e2e

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pnpm audit --audit-level moderate
      - uses: securecodewarrior/github-action-add-sarif@v1
        with:
          sarif-file: security-report.sarif

  build:
    runs-on: ubuntu-latest
    needs: [lint-and-type-check, test, security]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm test:build

  deploy:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: echo "Deploy to production"
```

---

## 📋 まとめ・チェックリスト

### ✅ 開発前チェック
- [ ] 型定義が適切に設計されているか
- [ ] ディレクトリ構造が規約に従っているか
- [ ] 命名規約を理解しているか
- [ ] テスト戦略が明確か

### ✅ 実装中チェック
- [ ] 単一責任原則に従っているか
- [ ] エラーハンドリングが適切か
- [ ] パフォーマンスを考慮しているか
- [ ] セキュリティ要件を満たしているか

### ✅ 実装後チェック
- [ ] テストカバレッジが基準を満たしているか
- [ ] ドキュメント・コメントが適切か
- [ ] コードレビューでの指摘事項を反映したか
- [ ] CI/CDパイプラインが通るか

---

**🎯 この規約に従って、保守性が高く長期的に成長できるコードベースを構築していきましょう！**

> 💡 **重要**: 規約は絶対的なものではありません。チームの議論を通じて継続的に改善していくことが大切です。