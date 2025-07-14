# Sentry統合ガイド

## 概要
Real Estate DXプロジェクトにおけるエラーモニタリングのためのSentry統合計画。

## 導入目的
- プロダクションエラーのリアルタイム検知
- エラーの詳細なスタックトレース取得
- パフォーマンスモニタリング
- ユーザー影響の可視化

## 統合対象
1. **API Server** (Express.js)
2. **Web Frontend** (Next.js)
3. **AI Worker** (FastAPI) - 将来対応

## API Server統合

### 1. パッケージインストール
```bash
pnpm add @sentry/node @sentry/profiling-node
```

### 2. 初期化コード
`apps/api/src/index.ts` の最初に追加：
```typescript
import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";

// Sentryの初期化（他のimportよりも前に）
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    // Express自動統合
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
    // パフォーマンスプロファイリング
    new ProfilingIntegration(),
  ],
  // パフォーマンスモニタリング
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  // プロファイリング
  profilesSampleRate: 1.0,
});

// Sentryミドルウェアの追加
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());
```

### 3. エラーハンドラー統合
`apps/api/src/middlewares/error.middleware.ts` に追加：
```typescript
// 既存のエラーハンドラーの前に追加
app.use(Sentry.Handlers.errorHandler());

// カスタムエラーハンドラー内でSentryに送信
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Sentryにエラーを記録
  Sentry.captureException(err, {
    extra: {
      requestId: req.id,
      userId: req.user?.id,
    },
  });
  
  // 既存のエラーハンドリングロジック
  // ...
};
```

## Web Frontend統合

### 1. パッケージインストール
```bash
pnpm add @sentry/nextjs
```

### 2. 設定ファイル作成
`apps/web/sentry.client.config.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

`apps/web/sentry.server.config.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
});
```

### 3. Next.js設定更新
`apps/web/next.config.js`:
```javascript
const { withSentryConfig } = require("@sentry/nextjs");

const nextConfig = {
  // 既存の設定...
};

module.exports = withSentryConfig(
  nextConfig,
  {
    silent: true,
    org: "real-estate-dx",
    project: "web-frontend",
  },
  {
    widenClientFileUpload: true,
    transpileClientSDK: true,
    hideSourceMaps: true,
    disableLogger: true,
  }
);
```

## 環境変数

### 開発環境 (.env.local)
```env
# API
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=real-estate-dx
SENTRY_PROJECT=api-server

# Web
NEXT_PUBLIC_SENTRY_DSN=https://yyy@yyy.ingest.sentry.io/yyy
```

### CI/CD環境
GitHub Secretsに追加：
- `SENTRY_AUTH_TOKEN` - リリース管理用
- `SENTRY_DSN` - API用DSN
- `NEXT_PUBLIC_SENTRY_DSN` - Web用DSN

## エラー通知設定

### アラートルール
1. **Critical Errors**
   - 5分間に10件以上のエラー
   - 通知先: Slack #dev-alerts
   
2. **Performance Issues**
   - APIレスポンス > 5秒
   - 通知先: メール

3. **Error Rate**
   - エラー率 > 5%
   - 通知先: Slack #dev-alerts

## 実装チェックリスト

### Phase 1: 基本統合（1週間）
- [ ] Sentryアカウント作成
- [ ] プロジェクト設定
- [ ] API Server統合
- [ ] Web Frontend統合
- [ ] 開発環境でのテスト

### Phase 2: 高度な機能（1週間）
- [ ] カスタムコンテキスト追加
- [ ] パフォーマンスモニタリング設定
- [ ] Session Replay有効化
- [ ] リリーストラッキング設定

### Phase 3: 運用開始（継続）
- [ ] アラートルール調整
- [ ] ダッシュボード作成
- [ ] 定期レポート設定
- [ ] チーム教育

## プライバシー考慮事項
- 個人情報のマスキング設定
- IPアドレスの匿名化
- センシティブデータの除外

## コスト見積もり
- Team Plan: $26/月（10万イベント/月）
- 推定使用量: 5万イベント/月
- 年間コスト: 約$312