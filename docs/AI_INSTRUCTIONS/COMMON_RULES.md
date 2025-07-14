# 🚨 全AI共通ルール - 必ず読んでください

## 基本情報
- **プロジェクト**: Real Estate DX（不動産売買業務効率化SaaS）
- **リポジトリ**: https://github.com/talent-inc/real-estate-dx
- **作業ブランチ**: `develop`（全員ここで作業）
- **使用言語**: TypeScript（strictモード必須）

## 絶対に守るルール

### 1. 作業開始時の儀式
```bash
# 毎回必ず実行
git checkout develop
git pull origin develop
```

### 2. コミットルール
```bash
# こまめにコミット（機能の区切りごと）
git add [担当ディレクトリ]
git commit -m "[prefix]: 簡潔な説明"
git push origin develop
```

**プレフィックス**:
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `style`: フォーマット（コードの動作に影響なし）
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: ビルド・補助ツール

### 3. TypeScriptエラー
- **エラーは絶対に残さない**
- コミット前に `pnpm typecheck` で確認
- 一時的な回避策（any等）は使わない

### 4. コンフリクト対応
1. 小さいコンフリクト → 自分で解決してpush
2. 大きいコンフリクト → 人間に相談
3. prisma/schema.prismaのコンフリクト → **必ず人間に相談**

## 担当範囲の厳守

| AI | 担当ディレクトリ | 触ってOK | 触っちゃダメ |
|----|-----------------|----------|-------------|
| AI-1 | apps/web/ | src/以下すべて | apps/api/, prisma/ |
| AI-2 | apps/api/ | src/以下すべて | apps/web/, prisma/schema.prisma |
| AI-3 | ルート | Docker, CI/CD, scripts/ | apps/*/src/ |

## API契約の遵守
- `/docs/api-contracts/`の型定義は**絶対**
- 勝手に変更しない
- 追加が必要なら人間に相談

## 環境変数
- 新規追加時は`.env.example`を更新
- 実際の値は絶対にコミットしない
- 説明コメントを必ず記載

## 困ったときの相談フロー
1. **技術的な問題** → 関連AIに聞く
2. **仕様の不明点** → ドキュメントを確認
3. **設計の変更** → 人間に相談
4. **コンフリクト** → 規模により判断

## 現在の最優先事項
1. **TypeScriptエラーをゼロに**
2. 既存機能の安定化
3. テスト基盤の構築

## やってはいけないこと
- masterブランチへの直接push
- 他AIの担当ディレクトリの編集
- console.logの残存
- 秘密情報のハードコード
- package.jsonの無断変更

## 推奨される振る舞い
- 1-2時間ごとにpush
- 明確なコミットメッセージ
- 不明点は早めに確認
- 他AIの作業を尊重

---
これらのルールを守ることで、効率的な並行開発が可能になります。
ルールを理解したら、担当の指示書を読んで作業を開始してください。