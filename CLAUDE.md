# CLAUDE.md - AI開発支援リファレンス

## プロジェクト概要
不動産売買業務を効率化するSaaSプラットフォーム。物件情報の一元管理とAI-OCRによる業務自動化を実現。

## 技術スタック
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, TypeScript, Prisma, JWT
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **AI**: Google Gemini API
- **Monorepo**: pnpm + Turborepo

## ディレクトリ構造
```
apps/
├── web/        # Next.jsフロントエンド
└── api/        # Express.jsバックエンド
packages/
└── shared/     # 共有型定義
```

## 重要コマンド
```bash
pnpm dev          # 開発サーバー起動
pnpm build        # ビルド
pnpm typecheck    # 型チェック
pnpm lint         # リント
pnpm test         # テスト（実装予定）

# Prisma
pnpm -F api prisma generate    # クライアント生成
pnpm -F api prisma migrate dev # マイグレーション
```

## コーディング規約
- **Components**: PascalCase (`PropertyCard.tsx`)
- **Hooks**: use prefix (`useProperties.ts`)
- **API**: RESTful, JSend format
- **Error**: カスタムエラークラス使用
- **Style**: Prettier + ESLint準拠

## 現在の課題
1. TypeScriptエラーが残存（最優先で解消中）
2. テスト未整備（Vitest/Jest導入予定）
3. 画像ストレージ最適化（Cloudflare R2移行予定）

## AI向け指示の例
```
「apps/web/src/components/properties/PropertyCard.tsxを作成してください。
shadcn/uiのCardコンポーネントを使用し、物件画像、名前、価格、住所を表示。
TypeScriptの型定義とレスポンシブ対応を含めてください。」
```

詳細な開発方針は `/docs/development_scope/beta_development_policy.md` を参照。