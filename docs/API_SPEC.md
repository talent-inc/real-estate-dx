# 不動産売買DXシステム API仕様書

**バージョン**: 1.2  
**作成日**: 2025年7月10日  
**更新日**: 2025年7月10日  

---

## 📋 API概要

### ベースURL
- **開発環境**: `http://localhost:4000/api`
- **ステージング環境**: `https://staging-api.real-estate-dx.com/api`
- **本番環境**: `https://api.real-estate-dx.com/api`

### 認証方式
- **認証**: JWT Bearer Token
- **認可**: Role-Based Access Control (RBAC)
- **マルチテナント**: テナントID による分離

### 共通ヘッダー
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
X-Tenant-ID: <TENANT_ID>
X-Request-ID: <UUID>
```

---

## 🔐 認証API

### POST /auth/login
ユーザーログイン

#### リクエスト
```json
{
  "email": "user@example.com",
  "password": "password123",
  "tenantId": "tenant_123"
}
```

#### レスポンス
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600,
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "田中太郎",
      "role": "AGENT",
      "tenantId": "tenant_123"
    }
  }
}
```

### POST /auth/refresh
トークンリフレッシュ

#### リクエスト
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### POST /auth/logout
ログアウト

---

## 🏠 物件管理API

### GET /properties
物件一覧取得

#### クエリパラメータ
```
?page=1&limit=20&status=ACTIVE&priceMin=5000000&priceMax=10000000
&area=東京都&propertyType=APARTMENT&search=新宿
```

#### レスポンス
```json
{
  "success": true,
  "data": {
    "properties": [
      {
        "id": "prop_123",
        "title": "新宿駅徒歩5分の高級マンション",
        "price": 85000000,
        "area": 75.5,
        "address": "東京都新宿区新宿3-1-1",
        "propertyType": "APARTMENT",
        "status": "ACTIVE",
        "images": [
          {
            "url": "https://storage.googleapis.com/...",
            "thumbnailUrl": "https://storage.googleapis.com/...",
            "isMain": true
          }
        ],
        "createdAt": "2025-07-10T00:00:00Z",
        "updatedAt": "2025-07-10T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "totalPages": 8
    }
  }
}
```

### POST /properties
物件作成

#### リクエスト
```json
{
  "title": "新宿駅徒歩5分の高級マンション",
  "description": "交通便利な立地の高級マンションです。",
  "price": 85000000,
  "area": 75.5,
  "address": "東京都新宿区新宿3-1-1",
  "prefecture": "東京都",
  "city": "新宿区",
  "propertyType": "APARTMENT",
  "buildingType": "REINFORCED_CONCRETE",
  "rooms": 3,
  "bathrooms": 2,
  "lat": 35.6896,
  "lng": 139.7006
}
```

### GET /properties/{propertyId}
物件詳細取得

### PUT /properties/{propertyId}
物件更新

### DELETE /properties/{propertyId}
物件削除

---

## 🤖 AI-OCR API

### POST /ocr/process
文書OCR処理

#### リクエスト (multipart/form-data)
```
file: <PDF_FILE>
documentType: property_deed
tenantId: tenant_123
userId: user_123
```

#### レスポンス
```json
{
  "success": true,
  "data": {
    "documentInfo": {
      "filename": "property_deed.pdf",
      "fileSize": 1024000,
      "pageCount": 3,
      "documentType": "property_deed"
    },
    "ocrResult": {
      "propertyInfo": {
        "address": "東京都新宿区新宿3-1-1",
        "landArea": 75.5,
        "buildingArea": 65.2,
        "buildingStructure": "鉄筋コンクリート造",
        "buildingUse": "共同住宅",
        "buildDate": "2020-03-15"
      },
      "ownershipInfo": {
        "currentOwner": "田中太郎",
        "ownershipRatio": "1/1",
        "acquisitionDate": "2020-04-01",
        "acquisitionCause": "売買"
      },
      "legalInfo": {
        "lotNumber": "新宿三丁目1番1号",
        "buildingNumber": "1番1号",
        "landRights": "所有権",
        "restrictions": []
      },
      "metadata": {
        "documentNumber": "令和2年第12345号",
        "issueDate": "2025-07-01",
        "issuingAuthority": "東京法務局新宿出張所"
      }
    },
    "confidence": 0.92,
    "processingTime": 2500
  }
}
```

### GET /ocr/status/{jobId}
OCR処理状況確認

#### レスポンス
```json
{
  "success": true,
  "data": {
    "jobId": "job_123",
    "status": "COMPLETED",
    "progress": 100,
    "result": { /* OCR結果 */ },
    "error": null
  }
}
```

---

## 🔗 外部システム連携API 🆕

### GET /external-systems/auth
外部システム認証情報一覧取得

#### レスポンス
```json
{
  "success": true,
  "data": {
    "systems": [
      {
        "id": "ext_123",
        "systemType": "REINS",
        "systemName": "REINS（指定流通機構）",
        "isActive": true,
        "lastTestAt": "2025-07-10T12:00:00Z",
        "lastSyncAt": "2025-07-10T10:30:00Z",
        "lastError": null,
        "syncEnabled": true,
        "settings": {
          "syncSchedule": "0 */6 * * *",
          "autoSync": true
        }
      }
    ]
  }
}
```

### POST /external-systems/auth
外部システム認証情報設定

#### リクエスト
```json
{
  "systemType": "REINS",
  "systemName": "REINS（指定流通機構）",
  "credentials": {
    "username": "user123",
    "password": "password123",
    "apiKey": "api_key_123"
  },
  "settings": {
    "syncSchedule": "0 */6 * * *",
    "autoSync": true,
    "timeout": 30000
  }
}
```

#### レスポンス
```json
{
  "success": true,
  "data": {
    "id": "ext_123",
    "systemType": "REINS",
    "isActive": true,
    "testResult": {
      "connectionStatus": "SUCCESS",
      "responseTime": 1200,
      "testedAt": "2025-07-10T12:00:00Z"
    }
  }
}
```

### PUT /external-systems/auth/{systemId}
外部システム認証情報更新

### DELETE /external-systems/auth/{systemId}
外部システム認証情報削除

### POST /external-systems/test/{systemId}
外部システム接続テスト

#### レスポンス
```json
{
  "success": true,
  "data": {
    "connectionStatus": "SUCCESS",
    "responseTime": 1200,
    "systemInfo": {
      "version": "2.1.0",
      "status": "ONLINE"
    },
    "capabilities": [
      "PROPERTY_SEARCH",
      "PROPERTY_CREATE",
      "PROPERTY_UPDATE"
    ],
    "testedAt": "2025-07-10T12:00:00Z"
  }
}
```

### POST /external-systems/sync/{systemId}
外部システム同期実行

#### リクエスト
```json
{
  "syncType": "INCREMENTAL",
  "syncDirection": "IMPORT",
  "filters": {
    "updatedAfter": "2025-07-09T00:00:00Z",
    "propertyTypes": ["APARTMENT", "HOUSE"],
    "maxRecords": 1000
  }
}
```

#### レスポンス
```json
{
  "success": true,
  "data": {
    "syncId": "sync_123",
    "status": "STARTED",
    "estimatedDuration": 300,
    "startedAt": "2025-07-10T12:00:00Z",
    "jobUrl": "/external-systems/sync/status/sync_123"
  }
}
```

### GET /external-systems/sync/status/{syncId}
同期ステータス確認

#### レスポンス
```json
{
  "success": true,
  "data": {
    "syncId": "sync_123",
    "status": "COMPLETED",
    "progress": 100,
    "totalRecords": 150,
    "successRecords": 148,
    "failedRecords": 2,
    "startedAt": "2025-07-10T12:00:00Z",
    "completedAt": "2025-07-10T12:05:00Z",
    "errors": [
      {
        "recordId": "prop_456",
        "error": "Invalid property type",
        "details": { "field": "propertyType", "value": "UNKNOWN" }
      }
    ]
  }
}
```

### GET /external-systems/sync/history
同期履歴取得

#### クエリパラメータ
```
?systemType=REINS&status=COMPLETED&startDate=2025-07-01&endDate=2025-07-10
&page=1&limit=20
```

---

## 📄 文書管理API

### GET /documents
文書一覧取得

### POST /documents/upload
文書アップロード

#### リクエスト (multipart/form-data)
```
file: <FILE>
type: PROPERTY_DEED
propertyId: prop_123
category: legal
```

### GET /documents/{documentId}
文書詳細取得

### DELETE /documents/{documentId}
文書削除

---

## 📞 問い合わせ管理API

### GET /inquiries
問い合わせ一覧取得

### POST /inquiries
問い合わせ作成

#### リクエスト
```json
{
  "name": "山田花子",
  "email": "yamada@example.com",
  "phone": "090-1234-5678",
  "subject": "物件の内見希望",
  "message": "新宿のマンションの内見を希望します。",
  "type": "VIEWING",
  "propertyId": "prop_123"
}
```

### PUT /inquiries/{inquiryId}
問い合わせ更新（回答・ステータス変更）

---

## 👥 ユーザー管理API

### GET /users
ユーザー一覧取得

### POST /users
ユーザー作成

### GET /users/{userId}
ユーザー詳細取得

### PUT /users/{userId}
ユーザー更新

### DELETE /users/{userId}
ユーザー削除

---

## 🏢 テナント管理API

### GET /tenants/current
現在のテナント情報取得

### PUT /tenants/current
テナント情報更新

### GET /tenants/usage
使用量統計取得

#### レスポンス
```json
{
  "success": true,
  "data": {
    "users": {
      "current": 15,
      "limit": 50,
      "usage": 30
    },
    "properties": {
      "current": 250,
      "limit": 1000,
      "usage": 25
    },
    "storage": {
      "current": 536870912,
      "limit": 1073741824,
      "usage": 50
    },
    "ocrProcessing": {
      "thisMonth": 150,
      "limit": 1000,
      "usage": 15
    }
  }
}
```

---

## 📊 分析・レポートAPI

### GET /analytics/dashboard
ダッシュボード統計取得

#### レスポンス
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalProperties": 250,
      "activeProperties": 180,
      "totalInquiries": 45,
      "newInquiriesThisWeek": 12
    },
    "charts": {
      "propertiesByType": [
        { "type": "APARTMENT", "count": 150 },
        { "type": "HOUSE", "count": 80 },
        { "type": "LAND", "count": 20 }
      ],
      "inquiriesByMonth": [
        { "month": "2025-05", "count": 32 },
        { "month": "2025-06", "count": 41 },
        { "month": "2025-07", "count": 45 }
      ]
    }
  }
}
```

### GET /analytics/properties
物件分析データ取得

### GET /analytics/sales
売上分析データ取得

---

## 🔔 通知API

### GET /notifications
通知一覧取得

### PUT /notifications/{notificationId}/read
通知既読設定

### POST /notifications/settings
通知設定更新

---

## 🧪 システム管理API

### GET /health
ヘルスチェック

#### レスポンス
```json
{
  "status": "healthy",
  "version": "1.2.0",
  "timestamp": "2025-07-10T12:00:00Z",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "geminiApi": "healthy",
    "storage": "healthy"
  },
  "uptime": 86400
}
```

### GET /system/metrics
システムメトリクス取得

---

## 📋 エラーレスポンス仕様

### エラー形式
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力データに不正があります",
    "details": [
      {
        "field": "email",
        "message": "有効なメールアドレスを入力してください"
      }
    ],
    "requestId": "req_123",
    "timestamp": "2025-07-10T12:00:00Z"
  }
}
```

### エラーコード一覧
| コード | HTTPステータス | 説明 |
|--------|---------------|------|
| VALIDATION_ERROR | 400 | バリデーションエラー |
| AUTHENTICATION_ERROR | 401 | 認証エラー |
| AUTHORIZATION_ERROR | 403 | 認可エラー |
| NOT_FOUND | 404 | リソースが見つからない |
| CONFLICT | 409 | データの競合 |
| RATE_LIMIT_EXCEEDED | 429 | レート制限超過 |
| INTERNAL_SERVER_ERROR | 500 | サーバー内部エラー |
| EXTERNAL_API_ERROR | 502 | 外部API連携エラー |
| SERVICE_UNAVAILABLE | 503 | サービス利用不可 |

---

## 🔄 レート制限

### 制限設定
- **認証API**: 5回/分/IP
- **一般API**: 100回/分/ユーザー
- **OCR API**: 10回/分/テナント
- **外部連携API**: 20回/分/テナント

### レート制限ヘッダー
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1625097600
Retry-After: 60
```

---

## 📚 SDK・ライブラリ

### JavaScript/TypeScript SDK
```bash
npm install @real-estate-dx/api-client
```

#### 使用例
```typescript
import { RealEstateDXClient } from '@real-estate-dx/api-client'

const client = new RealEstateDXClient({
  baseUrl: 'https://api.real-estate-dx.com',
  accessToken: 'your-jwt-token',
  tenantId: 'your-tenant-id'
})

// 物件一覧取得
const properties = await client.properties.list({
  page: 1,
  limit: 20,
  status: 'ACTIVE'
})

// OCR処理
const ocrResult = await client.ocr.processDocument(file, {
  documentType: 'property_deed'
})
```

---

## 🔄 更新履歴

### v1.2 (2025-07-10)
- 外部システム連携API群を追加
- 同期管理エンドポイント追加
- 認証情報管理API追加
- エラーハンドリング仕様を強化

### v1.1 (2025-07-09)
- AI-OCR API詳細を追加
- 分析・レポートAPI追加
- レート制限仕様を追加

### v1.0 (2025-07-08)
- 初版作成
- 基本API仕様定義
- 認証・物件管理API定義

---

**承認者**: システム設計責任者  
**承認日**: 2025年7月10日