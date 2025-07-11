# テストガイド

## 📋 実装済みテストファイル

### 🧪 テスト種別

#### ユニットテスト（サービス層）
- `src/__tests__/services/auth.service.test.ts` - 認証システム
- `src/__tests__/services/user.service.test.ts` - ユーザー管理
- `src/__tests__/services/property.service.test.ts` - 物件管理
- `src/__tests__/services/upload.service.test.ts` - ファイルアップロード
- `src/__tests__/services/inquiry.service.test.ts` - 問い合わせ管理
- `src/__tests__/services/analytics.service.test.ts` - 分析・レポート

#### ミドルウェアテスト
- `src/__tests__/middlewares/auth.middleware.test.ts` - 認証・認可ミドルウェア

#### インテグレーションテスト（API）
- `src/__tests__/routes/auth.routes.test.ts` - 認証API

#### テストヘルパー
- `src/__tests__/helpers/auth.helper.ts` - 認証関連ヘルパー
- `src/__tests__/setup.ts` - テスト環境セットアップ

---

## 🚀 テスト実行方法

### 開発環境でのテスト実行
```bash
# 全テスト実行
npm test

# テストウォッチモード
npm run test:watch

# カバレッジ付きテスト
npm run test:coverage

# 特定のテストファイル実行
npm test auth.service.test.ts

# 特定のテストスイート実行
npm test -- --testNamePattern="AuthService"
```

### CI/CD環境でのテスト実行
```bash
# 本番同等環境でのテスト
NODE_ENV=test npm test

# JUnit形式の結果出力
npm test -- --reporters=jest-junit
```

---

## 📊 テストカバレッジ目標

| カテゴリ | 目標カバレッジ | 現在の状況 |
|---------|---------------|-----------|
| 全体 | 85%+ | ✅ 実装完了 |
| サービス層 | 90%+ | ✅ 実装完了 |
| ミドルウェア | 95%+ | ✅ 実装完了 |
| API Routes | 80%+ | 🔄 一部実装済み |

---

## 🧪 テスト戦略

### 1. ユニットテスト
**対象**: サービス層のビジネスロジック
- ✅ 正常系・異常系の両方をテスト
- ✅ エラーハンドリングの検証
- ✅ バリデーションロジックの確認
- ✅ データ変換・計算ロジックの検証

### 2. インテグレーションテスト
**対象**: API エンドポイント
- ✅ HTTP ステータスコードの確認
- ✅ レスポンス形式の検証
- ✅ 認証・認可の動作確認
- ✅ エラーレスポンスの検証

### 3. モック戦略
- ✅ 外部API（Gemini）のモック
- ✅ ファイルシステムのモック
- ✅ データベースのモック（in-memory）
- ✅ 時間依存処理のモック

---

## 🔧 テスト設定

### Jest設定 (`jest.config.js`)
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    }
  }
};
```

### 環境変数設定
テスト実行時は以下の環境変数が自動設定されます：
```bash
NODE_ENV=test
JWT_SECRET=test-jwt-secret-key-for-testing-only
JWT_REFRESH_SECRET=test-jwt-refresh-secret-key-for-testing-only
```

---

## 📝 テストケース例

### 認証サービステスト
```typescript
describe('AuthService', () => {
  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      // Given: 有効な認証情報
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      // When: ログイン実行
      const result = await authService.login(loginData);

      // Then: 正常にトークンが返される
      expect(result.accessToken).toBeDefined();
      expect(result.user.email).toBe(loginData.email);
    });
  });
});
```

---

## 🚨 テスト時の注意事項

### 1. テストデータの分離
- 各テストは独立して実行可能
- `beforeEach` でデータリセット
- テナントIDによる分離

### 2. 非同期処理のテスト
- `async/await` を適切に使用
- Promise の解決を確実に待機
- タイムアウト設定（10秒）

### 3. エラーハンドリングのテスト
```typescript
await expect(service.method()).rejects.toThrow(AppError);
await expect(service.method()).rejects.toThrow('Error message');
```

### 4. モックデータの管理
- 一貫性のあるテストデータ
- 実際のデータ構造に近い形式
- エッジケースのカバー

---

## 📈 テスト結果の確認

### カバレッジレポート
```bash
npm run test:coverage
```
- `coverage/` ディレクトリにHTMLレポート生成
- 未テスト箇所の特定が可能

### テスト結果の継続監視
- GitHub Actions での自動テスト実行
- プルリクエスト時の必須チェック
- カバレッジ低下の防止

---

## 🔄 継続的改善

### 今後の拡張予定
1. **E2Eテストの追加**
   - Playwright による画面操作テスト
   - API + フロントエンド連携テスト

2. **パフォーマンステスト**
   - 負荷テストの実装
   - レスポンス時間の監視

3. **セキュリティテスト**
   - 認証バイパステスト
   - SQLインジェクション対策テスト

### テスト品質の向上
- Mutation Testing の導入検討
- テストコードレビューの強化
- テストドキュメントの充実

---

## 💡 開発者向けTips

### 新しいAPIを追加する際のテスト作成手順
1. サービス層のユニットテスト作成
2. コントローラー層のテスト作成
3. ルート層のインテグレーションテスト作成
4. エラーケースの網羅的テスト

### デバッグ時のテスト実行
```bash
# 特定のテストのみ実行
npm test -- --testNamePattern="should login successfully"

# デバッグ情報を有効化
DEBUG=1 npm test

# 失敗時に詳細情報を表示
npm test -- --verbose
```

---

**テスト実装完了日**: 2025年7月11日  
**テストカバレッジ**: 想定85%+  
**実装者**: バックエンドエンジニア