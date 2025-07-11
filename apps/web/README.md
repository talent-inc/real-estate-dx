# 🌐 Frontend (Next.js) - 担当: Frontend Engineer

## 🎯 あなたのミッション
**Next.js 14 + TypeScript + shadcn/ui** でモダンなフロントエンドを実装する

---

## ⚡ 今すぐ開始

### 1. 開発環境確認
```bash
# プロジェクトルートで実行済みか確認
cd ../../  # real-estate-dx/ ディレクトリに戻る
pnpm dev

# フロントエンド単体起動
cd apps/web
pnpm dev
# → http://localhost:3000
```

### 2. 今日のタスク（Day 1）
- [ ] **shadcn/ui セットアップ確認**
- [ ] **認証画面レイアウト作成**
- [ ] **共通コンポーネント確認**

---

## 📂 ディレクトリ構造

```
apps/web/
├── 📦 package.json              # 依存関係・スクリプト
├── 🔧 next.config.js           # Next.js設定
├── 📄 tsconfig.json            # TypeScript設定
├── 🎨 tailwind.config.js       # Tailwind CSS設定
├── 📄 .eslintrc.js             # ESLint設定
├── 📁 src/
│   ├── 📄 pages/               # Next.js ページ
│   │   ├── 🔐 auth/            # 認証画面
│   │   │   ├── login.tsx       # ログイン画面
│   │   │   ├── register.tsx    # 新規登録画面
│   │   │   └── forgot.tsx      # パスワードリセット
│   │   ├── 🏠 properties/      # 物件管理画面
│   │   │   ├── index.tsx       # 物件一覧
│   │   │   ├── [id].tsx        # 物件詳細
│   │   │   └── new.tsx         # 物件新規作成
│   │   ├── 📊 dashboard/       # ダッシュボード
│   │   │   └── index.tsx       # メインダッシュボード
│   │   ├── 🤖 ocr/             # AI-OCR機能
│   │   │   ├── upload.tsx      # PDF アップロード
│   │   │   └── result.tsx      # OCR結果確認
│   │   └── 📄 _app.tsx         # Next.js App
│   │
│   ├── 🧩 components/          # Reactコンポーネント
│   │   ├── 🎨 ui/              # shadcn/ui コンポーネント
│   │   ├── 📐 layout/          # レイアウトコンポーネント
│   │   │   ├── Header.tsx      # ヘッダー
│   │   │   ├── Sidebar.tsx     # サイドバー
│   │   │   ├── Footer.tsx      # フッター
│   │   │   └── Layout.tsx      # メインレイアウト
│   │   ├── 🔐 auth/            # 認証関連コンポーネント
│   │   ├── 🏠 property/        # 物件関連コンポーネント
│   │   └── 📊 dashboard/       # ダッシュボード関連
│   │
│   ├── 🎯 hooks/               # カスタムフック
│   │   ├── useAuth.ts          # 認証フック
│   │   ├── useApi.ts           # API呼び出しフック
│   │   └── useLocalStorage.ts  # ローカルストレージフック
│   │
│   ├── 🔧 lib/                 # ユーティリティ
│   │   ├── api.ts              # API クライアント
│   │   ├── auth.ts             # 認証ユーティリティ
│   │   ├── utils.ts            # 共通ユーティリティ
│   │   └── constants.ts        # 定数定義
│   │
│   └── 🎨 styles/              # スタイル
│       ├── globals.css         # グローバルCSS
│       └── components.css      # コンポーネント用CSS
│
├── 📁 public/                  # 静的ファイル
│   ├── 🖼️ images/              # 画像ファイル
│   ├── 📄 icons/               # アイコンファイル
│   └── 📄 favicon.ico          # ファビコン
│
└── 📁 tests/                   # テストファイル
    ├── 🧪 components/          # コンポーネントテスト
    ├── 🧪 pages/               # ページテスト
    └── 🧪 hooks/               # フックテスト
```

---

## 🛠️ 開発コマンド

### 基本コマンド
```bash
# 開発サーバー起動
pnpm dev
# → http://localhost:3000

# ビルド
pnpm build

# 本番サーバー起動（ビルド後）
pnpm start

# テスト実行
pnpm test

# リント実行
pnpm lint

# リント自動修正
pnpm lint:fix
```

### shadcn/ui コンポーネント追加
```bash
# 基本コンポーネント
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add form
npx shadcn-ui@latest add table
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog

# データ表示コンポーネント
npx shadcn-ui@latest add data-table
npx shadcn-ui@latest add chart
npx shadcn-ui@latest add badge

# ナビゲーションコンポーネント
npx shadcn-ui@latest add navigation-menu
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add breadcrumb
```

---

## 📅 実装スケジュール

### Week 1: UI基盤構築
- [ ] **Day 1-2**: shadcn/ui セットアップ・基本設定
- [ ] **Day 3-4**: 共通レイアウトコンポーネント実装
- [ ] **Day 5**: 認証画面実装開始

### Week 2: 認証・ナビゲーション
- [ ] **Day 1-2**: ログイン・登録画面完成
- [ ] **Day 3-4**: ヘッダー・サイドバー・ナビゲーション
- [ ] **Day 5**: レスポンシブ対応

### Week 3-4: 物件管理画面
- [ ] **Week 3**: 物件一覧・検索画面
- [ ] **Week 4**: 物件詳細・編集画面

### Week 5: ダッシュボード・AI-OCR
- [ ] **Day 1-3**: メインダッシュボード
- [ ] **Day 4-5**: AI-OCR アップロード画面

---

## 🧩 実装優先度

### 🔥 最優先（Week 1）
1. **shadcn/ui セットアップ完了**
2. **共通レイアウト実装**
3. **認証画面レイアウト**

### ⚡ 高優先（Week 2-3）
1. **認証フロー完成**
2. **物件一覧画面**
3. **ナビゲーション**

### 📊 中優先（Week 4-5）
1. **物件詳細画面**
2. **ダッシュボード**
3. **AI-OCR画面**

---

## 🎨 デザインシステム

### カラーパレット
```css
/* apps/web/src/styles/globals.css */
:root {
  /* Primary Colors */
  --primary: 220 70% 50%;        /* Blue */
  --primary-foreground: 0 0% 98%;

  /* Secondary Colors */
  --secondary: 220 14% 96%;      /* Light Gray */
  --secondary-foreground: 220 9% 46%;

  /* Success/Error */
  --success: 142 76% 36%;        /* Green */
  --destructive: 0 72% 51%;      /* Red */
  
  /* Background */
  --background: 0 0% 100%;       /* White */
  --foreground: 220 9% 9%;       /* Dark Gray */
}
```

### タイポグラフィ
```css
/* Headings */
.text-h1 { @apply text-4xl font-bold; }
.text-h2 { @apply text-3xl font-semibold; }
.text-h3 { @apply text-2xl font-semibold; }

/* Body */
.text-body { @apply text-base; }
.text-small { @apply text-sm; }
.text-xs { @apply text-xs; }
```

### スペーシング
```css
/* Margins & Padding */
.space-xs { @apply p-2; }
.space-sm { @apply p-4; }
.space-md { @apply p-6; }
.space-lg { @apply p-8; }
.space-xl { @apply p-12; }
```

---

## 🧪 テスト戦略

### コンポーネントテスト
```typescript
// tests/components/Button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    screen.getByRole('button').click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### ページテスト
```typescript
// tests/pages/login.test.tsx
import { render, screen } from '@testing-library/react'
import LoginPage from '@/pages/auth/login'

describe('Login Page', () => {
  it('renders login form', () => {
    render(<LoginPage />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })
})
```

### E2Eテスト
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test('user can login', async ({ page }) => {
  await page.goto('/auth/login')
  
  await page.fill('[data-testid="email"]', 'test@example.com')
  await page.fill('[data-testid="password"]', 'password123')
  await page.click('[data-testid="login-button"]')
  
  await expect(page).toHaveURL('/dashboard')
})
```

---

## 🔗 API統合

### API クライアント
```typescript
// src/lib/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// リクエストインターセプター（認証トークン追加）
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
```

### カスタムフック
```typescript
// src/hooks/useAuth.ts
import { useState, useEffect } from 'react'
import api from '@/lib/api'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password })
    const { token, user } = response.data
    
    localStorage.setItem('auth_token', token)
    setUser(user)
    return user
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setUser(null)
  }

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      // トークン検証
      api.get('/auth/me').then(({ data }) => {
        setUser(data.user)
      }).catch(() => {
        localStorage.removeItem('auth_token')
      }).finally(() => {
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [])

  return { user, login, logout, loading }
}
```

---

## 📱 レスポンシブデザイン

### ブレークポイント
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'sm': '640px',   // スマートフォン
      'md': '768px',   // タブレット
      'lg': '1024px',  // ラップトップ
      'xl': '1280px',  // デスクトップ
      '2xl': '1536px', // 大型ディスプレイ
    }
  }
}
```

### レスポンシブコンポーネント例
```typescript
// components/layout/Layout.tsx
import { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        className="lg:hidden"
      />
      
      {/* Desktop Sidebar */}
      <Sidebar className="hidden lg:block lg:fixed lg:w-64" />
      
      {/* Main Content */}
      <div className="lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
```

---

## 🚨 トラブルシューティング

### よくある問題

#### 🔧 shadcn/ui コンポーネントが見つからない
```bash
# コンポーネント再インストール
npx shadcn-ui@latest add button --overwrite

# パス確認
cat components.json  # shadcn設定確認
```

#### 🎨 Tailwind CSS が効かない
```bash
# Tailwind設定確認
cat tailwind.config.js

# CSS再ビルド
pnpm dev
# または
pnpm build
```

#### 🔗 API接続エラー
```bash
# API URL確認
echo $NEXT_PUBLIC_API_URL

# CORS設定確認（Backend側）
# apps/api/src/server.ts でCORS設定
```

#### 📱 レスポンシブが効かない
```html
<!-- viewport meta tag 確認 -->
<!-- pages/_app.tsx または pages/_document.tsx -->
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

---

## 📚 参考リンク

### 公式ドキュメント
- [Next.js 14](https://nextjs.org/docs)
- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

### 開発ツール
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Next.js DevTools](https://nextjs.org/docs/app/building-your-application/optimizing/bundle-analyzer)

---

## 🚀 今日から始めよう！

### ✅ 今すぐやること
1. **環境確認**: `pnpm dev` で localhost:3000 にアクセス
2. **shadcn/ui 確認**: 基本コンポーネントが利用可能か確認
3. **最初のコンポーネント作成**: 認証画面のレイアウトから開始

### 📞 質問・サポート
- **Slack**: `#frontend-dev`
- **Tech Lead**: 設計相談・レビュー依頼
- **Backend Engineer**: API仕様確認

---

**🎨 美しく使いやすいUIを作りましょう！**

> 💡 **ヒント**: まずは shadcn/ui のコンポーネントカタログを確認して、どんなコンポーネントが使えるかを把握しましょう！