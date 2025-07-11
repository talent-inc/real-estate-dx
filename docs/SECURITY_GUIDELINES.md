# 🔐 セキュリティガイドライン

## API Key管理のベストプラクティス

### 1. **絶対にやってはいけないこと**
- ❌ API Keyをソースコードにハードコード
- ❌ API Keyをコミット履歴に残す
- ❌ API Keyを公開リポジトリで共有

### 2. **推奨される管理方法**

#### 開発環境
```bash
# .envファイルで管理
GOOGLE_API_KEY=your-api-key-here

# 環境変数として設定
export GOOGLE_API_KEY='your-api-key-here'
```

#### 本番環境
- GitHub Secrets
- Google Secret Manager
- 環境変数（CI/CD経由）

### 3. **API Key制限の設定**

必ず以下の制限を設定：
- **IPアドレス制限**（開発環境）
- **HTTPリファラー制限**（本番環境）
- **API制限**（使用するAPIのみ許可）
- **使用量クォータ**

### 4. **定期的なローテーション**

- 3ヶ月ごとにAPI Keyを更新
- 漏洩の疑いがある場合は即座に無効化

### 5. **コードレビューチェックリスト**

- [ ] API Keyがハードコードされていないか
- [ ] 環境変数から読み取っているか
- [ ] .env.exampleにはプレースホルダーのみか
- [ ] .gitignoreで.envが除外されているか

## 漏洩時の対応手順

1. **即座に無効化**
   - Google Cloud Consoleで該当API Keyを削除

2. **コードから削除**
   - すべての出現箇所を環境変数に置換

3. **履歴から削除**
   ```bash
   # BFG Repo-Cleaner使用
   java -jar bfg.jar --replace-text passwords.txt repo.git
   ```

4. **新しいKeyを発行**
   - 必ず制限を設定

5. **監査ログ確認**
   - 不正アクセスの有無を確認

## 環境変数の使用例

### JavaScript/TypeScript
```typescript
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  throw new Error('GOOGLE_API_KEY is not set');
}
```

### Python
```python
import os

api_key = os.getenv('GOOGLE_API_KEY')
if not api_key:
    raise ValueError('GOOGLE_API_KEY environment variable is not set')
```

## Git pre-commitフック

秘密情報の誤コミットを防ぐ：

```bash
#!/bin/sh
# .git/hooks/pre-commit

# API Keyパターンを検出
if git diff --cached | grep -E "AIza[0-9A-Za-z_-]{35}"; then
  echo "Error: Possible API Key detected in commit"
  exit 1
fi
```

---

**セキュリティに関する質問は、セキュリティチームまでお問い合わせください。**