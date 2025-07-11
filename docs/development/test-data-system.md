# テストデータシステム設計書

## 概要

Real Estate DXシステムのテストデータ管理システムです。開発・テスト環境での動作確認、リグレッションテスト、デモンストレーションに使用します。

## アーキテクチャ

### 環境切り替え

環境変数 `USE_DEV_DATA` で制御:
- `true`: テストデータモード（インメモリ）
- `false` または未設定: 本番モード（Prisma/Cloud Storage）

### コンポーネント構成

```
src/
├── data/
│   └── seed/
│       ├── index.ts          # TestDataGenerator メインクラス
│       ├── users.seed.ts     # ユーザーシードデータ
│       ├── properties.seed.ts # 物件シードデータ
│       ├── ocr-jobs.seed.ts  # OCRジョブシードデータ
│       └── inquiries.seed.ts # 問い合わせシードデータ
├── services/
│   └── test-data.service.ts # テストデータサービス
└── routes/
    └── test-data.routes.ts  # テストデータAPI
```

## データ構造

### 1. ユーザーデータ

```typescript
{
  id: string;
  email: string;
  password: string; // ハッシュ化済み
  name: string;
  role: 'ADMIN' | 'AGENT' | 'CLIENT';
  department?: string;
  phone?: string;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}
```

**デフォルトユーザー:**
- 管理者: admin@realestate-dx.com / Admin123!
- エージェント1: agent1@realestate-dx.com / Agent123!
- エージェント2: agent2@realestate-dx.com / Agent123!
- クライアント1: client1@example.com / Client123!
- クライアント2: client2@example.com / Client123!

### 2. 物件データ

```typescript
{
  id: string;
  title: string;
  description: string;
  propertyType: 'HOUSE' | 'APARTMENT' | 'LAND' | 'BUILDING' | 'OTHER';
  transactionType: 'SALE' | 'PURCHASE';
  status: 'DRAFT' | 'ACTIVE' | 'CONTRACT' | 'COMPLETED' | 'CANCELLED';
  price: number;
  landArea?: number;
  buildingArea?: number;
  address: {
    postalCode: string;
    prefecture: string;
    city: string;
    street: string;
    building?: string;
  };
  location: {
    lat: number;
    lng: number;
  };
  features: string[];
  images: Array<{
    id: string;
    url: string;
    caption: string;
    order: number;
  }>;
  agentId: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}
```

### 3. OCRジョブデータ

```typescript
{
  id: string;
  filename: string;
  documentType: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  fileUrl: string;
  progress: number;
  result?: {
    extractedText: string;
    confidence: number;
    metadata: object;
  };
  error?: string;
  userId: string;
  propertyId?: string;
  tenantId: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 4. 問い合わせデータ

```typescript
{
  id: string;
  propertyId: string;
  userId?: string;
  type: 'VIEWING' | 'PURCHASE' | 'GENERAL' | 'DOCUMENT' | 'PRICE';
  status: 'NEW' | 'IN_PROGRESS' | 'RESPONDED' | 'CLOSED';
  name: string;
  email: string;
  phone: string;
  message: string;
  response?: string;
  respondedBy?: string;
  respondedAt?: string;
  metadata?: object;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}
```

## API エンドポイント

### テストデータ管理API

すべてのエンドポイントは `/api/test-data` 配下で、`USE_DEV_DATA=true` の場合のみ有効。

#### 1. 全データ取得
```
GET /api/test-data/all
Authorization: Bearer {token}
Role: ADMIN

Response:
{
  "success": true,
  "data": {
    "users": [...],
    "properties": [...],
    "ocrJobs": [...],
    "inquiries": [...]
  }
}
```

#### 2. 統計情報取得
```
GET /api/test-data/stats
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "initialized": true,
    "counts": {
      "users": 15,
      "properties": 55,
      "ocrJobs": 35,
      "inquiries": 45
    },
    "breakdown": {
      "users": {
        "admins": 1,
        "agents": 4,
        "clients": 10
      },
      ...
    }
  }
}
```

#### 3. データリセット
```
POST /api/test-data/reset
Authorization: Bearer {token}
Role: ADMIN

Response:
{
  "success": true,
  "message": "Test data has been reset successfully"
}
```

#### 4. 特定タイプのデータ取得
```
GET /api/test-data/{type}
Authorization: Bearer {token}

Types: users, properties, ocr-jobs, inquiries

Response:
{
  "success": true,
  "data": [...],
  "count": 50
}
```

## データ生成ルール

### 自動生成数
- ユーザー: 5（シード） + 10（自動生成） = 15件
- 物件: 5（シード） + 50（自動生成） = 55件
- OCRジョブ: 5（シード） + 30（自動生成） = 35件
- 問い合わせ: 5（シード） + 40（自動生成） = 45件

### データの特徴
1. **リアリスティックなデータ**
   - 実在の地名（東京都内）
   - 適切な価格帯（1000万〜60億円）
   - 実際の不動産タイプ

2. **多様なステータス**
   - 各エンティティで複数のステータスを網羅
   - エラーケースも含む（OCRジョブの失敗など）

3. **関連性**
   - 物件とエージェントの紐付け
   - OCRジョブと物件の関連
   - 問い合わせと物件・ユーザーの関連

## 使用方法

### 1. 環境設定

```bash
# .env.local
USE_DEV_DATA=true
```

### 2. サーバー起動時の自動初期化

```typescript
// サーバー起動時に自動実行
if (process.env.USE_DEV_DATA === 'true') {
  await TestDataService.initialize();
}
```

### 3. 手動でのデータ操作

```typescript
// データ取得
const users = TestDataService.getUsers();
const property = TestDataService.getPropertyById('prop-1');

// データ追加
TestDataService.addProperty({
  // ... property data
});

// データ更新
TestDataService.updateProperty('prop-1', {
  status: 'COMPLETED'
});

// データリセット
await TestDataService.reset();
```

### 4. フロントエンドからの利用

```typescript
// 統計情報の取得
const response = await fetch('/api/test-data/stats', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// 特定タイプのデータ取得
const properties = await fetch('/api/test-data/properties', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## テストシナリオ

### 1. ログインテスト
```
Email: admin@realestate-dx.com
Password: Admin123!
Tenant ID: test-tenant-1
```

### 2. 物件検索テスト
- 価格帯: 1000万円〜6億円
- エリア: 東京都内各区
- タイプ: マンション、一戸建て、土地、ビル

### 3. OCR処理テスト
- 成功ケース: 登記簿謄本、公図
- 処理中: 測量図
- 失敗ケース: 建物図面

### 4. 問い合わせフロー
- 新規問い合わせ作成
- ステータス更新
- 返信機能

## セキュリティ考慮事項

1. **開発環境限定**
   - `USE_DEV_DATA=true` の場合のみ有効
   - 本番環境では完全に無効化

2. **認証・認可**
   - すべてのエンドポイントで認証必須
   - 管理者権限が必要な操作を制限

3. **パスワード**
   - すべてのパスワードはハッシュ化
   - デフォルトパスワードは開発用のみ

## トラブルシューティング

### データが表示されない
1. `USE_DEV_DATA=true` が設定されているか確認
2. サーバー起動時のログで初期化成功を確認
3. `/api/test-data/stats` で初期化状態を確認

### データの不整合
1. `/api/test-data/reset` でリセット
2. 関連データのIDが正しいか確認
3. テナントIDの一致を確認

### パフォーマンス問題
- インメモリのため、大量データ生成時は注意
- 必要に応じてデータ生成数を調整

## 今後の拡張

1. **データエクスポート/インポート**
   - JSONファイルへのエクスポート
   - カスタムデータのインポート

2. **シナリオベースデータ生成**
   - 特定のビジネスシナリオに基づくデータセット
   - E2Eテスト用データセット

3. **データ検証**
   - スキーマ検証
   - 関連性チェック

4. **UI管理画面**
   - テストデータの視覚的管理
   - リアルタイム編集機能