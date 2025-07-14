# AI-1: フロントエンド開発担当への指示

## 🎯 あなたの役割
Real Estate DXプロジェクトのフロントエンド開発を担当します。`apps/web/`ディレクトリ内のNext.js 14アプリケーションの実装に専念してください。

## 📁 担当範囲
- **メインディレクトリ**: `/apps/web/`
- **作業可能ファイル**:
  - `src/app/*` - ページコンポーネント
  - `src/components/*` - UIコンポーネント
  - `src/hooks/*` - カスタムフック
  - `src/services/*` - APIクライアント
  - `src/store/*` - 状態管理
  - `src/types/*` - TypeScript型定義
  - `src/styles/*` - スタイルシート

## 🚨 触ってはいけないファイル
- `/apps/api/*` - バックエンドはAI-2の担当
- `/prisma/*` - データベーススキーマ
- `/.github/*` - CI/CD設定
- ルートレベルの設定ファイル（package.json除く）

## 🛠 使用する技術
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript（strictモード）
- **Styling**: Tailwind CSS
- **UI Library**: shadcn/ui
- **State**: React Context + カスタムフック
- **API通信**: Axios + React Query

## 📋 開発ルール

### 1. 作業開始前
```bash
git checkout develop
git pull origin develop
```

### 2. API仕様の確認
`/docs/api-contracts/`内の型定義を必ず確認し、バックエンドとの整合性を保つ：
```typescript
// 例: docs/api-contracts/auth.ts
import { LoginRequest, LoginResponse } from '@/docs/api-contracts/auth';
```

### 3. コンポーネント作成
- shadcn/uiを最大限活用
- カスタムコンポーネントは`/components/`に配置
- 命名規則: PascalCase（例: `PropertyCard.tsx`）

### 4. デザインシステム
`/docs/development_scope/beta_design_system_apple_inspired.md`に従い：
- 色: CSS変数を使用（`--ink`, `--surface`, `--tint`）
- スペーシング: 12pxベース
- タイポグラフィ: システムフォント優先

### 5. コミット規約
```bash
git add apps/web/
git commit -m "feat(web): ログイン画面のUIを実装"
git push origin develop
```

## 🔄 他AIとの連携

### バックエンド（AI-2）との連携
- APIエンドポイントは`http://localhost:8000/api/v1/`
- 認証ヘッダー: `Authorization: Bearer ${token}`
- エラーハンドリング: JSend形式に対応

### 連携時の確認事項
1. APIが実装済みか確認
2. レスポンス形式が仕様通りか検証
3. エラーケースを適切にハンドリング

## 📝 具体的なタスク例

### タスク1: ログイン画面の実装
```typescript
// app/login/page.tsx
// shadcn/uiのForm, Input, Buttonを使用
// /services/auth.service.tsでAPI通信
// エラー時はuseToastでフィードバック
```

### タスク2: 物件一覧画面
```typescript
// app/properties/page.tsx
// React Queryでデータフェッチ
// スケルトンローディング実装
// ページネーション対応
```

## ⚠️ 注意事項
1. TypeScriptエラーは絶対に残さない
2. `pnpm -F web typecheck`でエラーがないことを確認
3. レスポンシブデザイン必須（モバイルファースト）
4. アクセシビリティ考慮（ARIA属性、キーボード操作）

## 🆘 困ったときは
- API仕様が不明 → `/docs/api-contracts/`を確認
- デザインで迷う → デザインシステムドキュメント参照
- コンフリクト発生 → 小さければ自己解決、大きければ人間に相談

---
準備ができたら、`git checkout develop && git pull origin develop`を実行して作業を開始してください。