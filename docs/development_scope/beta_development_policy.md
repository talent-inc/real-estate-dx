# 🚀 ベータ版開発方針

**作成日**: 2025年7月11日  
**対象期間**: 2025年7月〜9月（ベータ版リリースまで）  
**最終更新**: 2025年7月11日

---

## 📋 エグゼクティブサマリー

本ドキュメントは、不動産DXシステムのベータ版開発における技術的方針と優先事項を定めたものです。Gemini AIとの協議を踏まえ、実務的かつ現実的なアプローチを採用しています。

### 最重要方針
1. **TypeScriptエラーの完全解消**を最優先事項とする
2. **画像ストレージをCloudflare R2へ移行**しコスト効率を改善
3. **新機能からTDDを適用**し、段階的に品質を向上
4. **迅速な価値提供**のためのCI/CD基盤を確立

---

## 🎯 優先順位と実行計画

### Phase 1: 基盤の安定化（1-2週間）

#### 1.1 TypeScriptエラーの撲滅 🔴 最優先
```bash
# 現状確認
pnpm typecheck

# エラーゼロを目指す
pnpm -r exec tsc --noEmit
```

**アクションアイテム**:
- [ ] 全プロジェクトでTypeScriptエラーを0に
- [ ] `tsconfig.json`の`strict: true`を維持
- [ ] CI/CDでtypecheckを必須化

#### 1.2 テストインフラの構築
```bash
# Frontend (Vitest)
pnpm -F web add -D vitest @testing-library/react @testing-library/jest-dom

# Backend (Jest)
pnpm -F api add -D jest @types/jest ts-jest
```

**アクションアイテム**:
- [ ] 基本的なテスト設定ファイルの作成
- [ ] サンプルテストの実装
- [ ] CIでのテスト自動実行

### Phase 2: アーキテクチャの最適化（2-3週間）

#### 2.1 画像ストレージ移行（GCS → Cloudflare R2）

**移行の根拠**（Gemini推奨）:
- **コスト**: 下り転送量無料で大幅なコスト削減
- **パフォーマンス**: CDN統合で高速配信
- **開発効率**: Cloudflare Imagesで自動最適化

**実装計画**:
```typescript
// 新しい画像サービス
interface ImageService {
  upload(file: Buffer, metadata: ImageMetadata): Promise<ImageUrl>;
  getOptimizedUrl(id: string, options: ImageOptions): string;
  migrate(sourceUrl: string): Promise<ImageUrl>;
}

// 実装
class CloudflareImageService implements ImageService {
  // R2 for storage
  // Images for optimization
}
```

**移行ステップ**:
1. [ ] Cloudflareアカウント設定
2. [ ] PoC実装（1物件分のテスト）
3. [ ] 移行スクリプトの作成
4. [ ] 段階的移行の実施

#### 2.2 エラー監視システムの導入

**推奨ツール**: Sentry
```typescript
// Frontend
import * as Sentry from "@sentry/nextjs";

// Backend
import * as Sentry from "@sentry/node";
```

**アクションアイテム**:
- [ ] Sentryアカウント作成
- [ ] フロントエンド統合
- [ ] バックエンド統合
- [ ] アラート設定

### Phase 3: 開発効率の最大化（継続的）

#### 3.1 TDD開発フローの確立

**方針**: 新機能からTDDを適用、既存コードは触る際にテスト追加

**TDD実践例**:
```typescript
// 1. Red: テストを先に書く
describe('PropertyService', () => {
  it('should validate property data before creation', async () => {
    const invalidData = { name: '', price: -1 };
    await expect(propertyService.create(invalidData))
      .rejects.toThrow('Validation error');
  });
});

// 2. Green: 最小限の実装
// 3. Refactor: リファクタリング
```

#### 3.2 CI/CDパイプラインの強化

**GitHub Actions設定**:
```yaml
name: CI/CD Pipeline
on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: pnpm install
      - name: Type check
        run: pnpm typecheck
      - name: Lint
        run: pnpm lint
      - name: Test
        run: pnpm test
      - name: Build
        run: pnpm build
```

---

## 🛠 技術選定の詳細

### 画像ストレージ比較

| 項目 | Google Cloud Storage | Cloudflare R2 + Images |
|------|---------------------|------------------------|
| 下り転送コスト | $0.12/GB | **$0/GB** |
| 画像最適化 | 要実装 | **URLパラメータで自動** |
| CDN | 別途設定要 | **統合済み** |
| S3互換API | ❌ | ✅ |
| 初期コスト | 低 | 低 |

### テストフレームワーク選定

| 用途 | フレームワーク | 選定理由 |
|------|--------------|---------|
| Frontend | Vitest | Vite統合で高速、Jest互換API |
| Backend | Jest | 実績豊富、TypeScript対応良好 |
| E2E | Playwright | モダン、高速、デバッグ容易 |

---

## 📊 成功指標

### 技術的指標
- **TypeScriptエラー**: 0件を維持
- **テストカバレッジ**: 新機能80%以上
- **ビルド時間**: 3分以内
- **デプロイ頻度**: 1日2回以上

### ビジネス指標
- **ページ読み込み時間**: 2秒以内（画像含む）
- **エラー率**: 0.1%以下
- **画像配信コスト**: 50%削減
- **開発速度**: 機能実装時間20%短縮

---

## 🚨 リスクと対策

### リスク1: 移行に伴う一時的な不安定性
**対策**: 
- Feature Flagで段階的リリース
- カナリアデプロイの活用
- ロールバック手順の明文化

### リスク2: 学習コストによる開発速度低下
**対策**:
- ペアプログラミングセッション
- 内部勉強会の開催
- AIツール（Claude/Copilot）の積極活用

### リスク3: 既存バグの顕在化
**対策**:
- TypeScriptの厳格化で早期発見
- Sentryによる本番環境監視
- ユーザーフィードバックの迅速な対応

---

## 🔄 レビューと更新

このドキュメントは生きた文書として、以下のタイミングで更新します：

- **週次**: 進捗確認と優先順位の調整
- **フェーズ完了時**: 次フェーズの詳細計画
- **重大な技術的決定時**: 即時更新

---

## 📚 参考資料

- [個人開発の教科書](https://izanami.dev/kojin-kaihatsu)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Vitest Guide](https://vitest.dev/guide/)
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)

---

**次のアクション**: Phase 1.1のTypeScriptエラー解消から着手