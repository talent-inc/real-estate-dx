### **機能仕様書 v1.2**

**機能ID:** `API-001`
**機能名:** `外部連携用 公開API`

| Ver | 日付 | 作成 / 変更者 | 変更概要 |
|-----|------|---------------|----------|
| 1.0 | 2025-06-30 | システム管理者 | 初版作成 |
| 1.1 | 2025-06-30 | システム管理者 | OAuth 2.0認証、スコープ詳細化 |
| 1.2 | 2025-06-30 | システム管理者 | バージョン管理追加、Retry-Afterヘッダー仕様明確化 |

#### **1. 概要（Overview）**

本システムのデータを、外部のサードパーティ製アプリケーションや顧客の自社システムからプログラムを通じて安全に利用するための、標準的なアプリケーション・プログラミング・インターフェース（API）群。これにより、会計ソフトとの連携、高度な分析ツールへのデータ出力、公式連携パートナーとのシステム間連携など、本システムの活用範囲を大きく広げることを目的とする。本仕様書は、個別のエンドポイントではなく、公開API全体の設計方針と共通仕様を定める。

#### **2. 開発者ゴール（Developer Story）**

**サードパーティ開発者として、** 私は **標準的で分かりやすいAPI仕様と、充実したドキュメント、試しやすいテスト環境が欲しい。** それによって、**自分が開発するアプリケーションとこの不動産システムとの連携機能を、迅速かつ効率的に構築したい。**

#### **3. API共通仕様**

- `[ ]` **【設計思想】** APIは、REST (REpresentational State Transfer) の原則に準拠して設計される。
  - `[ ]` リソースはURIで表現される（例: `/api/v1/properties/{property_id}`）。
  - `[ ]` 操作はHTTPメソッド（`GET`, `POST`, `PUT`, `DELETE`）で表現される。
  - `[ ]` データ交換形式はJSONを標準とする。
- `[ ]` **【認証】** APIへのアクセスは、OAuth 2.0プロトコルによる認証を必須とする。
- `[ ]` **【バージョニング】** APIは後方互換性を損なう変更に備え、URLにバージョン番号を含める（例: `/api/v1/...`）。仕様変更時には、最低90日間の移行期間を設け、旧バージョンも並行して提供する。
- `[ ]` **【エラーハンドリング】** エラー発生時は、標準的なHTTPステータスコード（例: `400`, `401`, `404`, `500`）と共に、エラーの詳細情報（エラーコード、メッセージ）を含むJSONをレスポンスボディとして返す。
- `[ ]` **【レートリミット】** システムの安定性を保つため、クライアントごとに単位時間あたりのAPIコール数を制限する。**デフォルト値は「通常100リクエスト/分、バースト（短期集中）300リクエスト/分」を上限とする。** 制限を超えた場合は、ステータスコード `429 Too Many Requests` と、以下の詳細仕様で `Retry-After` ヘッダーを返す：
  - `[ ]` **Retry-After値計算:** レートリミット復旧までの秒数（整数）。通常制限の場合は60秒、バースト制限の場合は20秒を返す。
  - `[ ]` **レスポンス例:** `Retry-After: 60` （60秒後に再試行可能）
  - `[ ]` **エラーレスポンスボディ例:**
    ```json
    {
      "error": "rate_limit_exceeded",
      "message": "API call rate limit exceeded. Try again later.",
      "retry_after": 60,
      "limit": 100,
      "reset_time": "2025-06-30T10:15:00Z"
    }
    ```
- `[ ]` **【ページネーション】** 大量データを返す可能性があるリソース（物件一覧など）は、カーソルベースまたはオフセットベースのページネーションを実装する。

#### **4. 認証と認可**

- `[ ]` **【認証方式】** APIへのアクセスは、**OAuth 2.0**のClient Credentials Grantフローで発行されたアクセストークンを必須とする。
- `[ ]` トークンは、HTTPリクエストの`Authorization`ヘッダーに`Bearer`トークンとして付与する。
- `[ ]` **【スコープベースの認可】** 発行されるトークンには、実行可能な操作を制限する**スコープ**が付与される。クライアントは、許可されたスコープの範囲内でのみAPIを呼び出すことができる。
  - **スコープの例:**
    - `properties:read`: 物件情報の読み取り
    - `properties:write`: 物件情報の作成・更新
    - `contacts:read`: 顧客情報の読み取り
    - `contacts:write`: 顧客情報の作成・更新

#### **4.1. システム構成図**

##### **4.1.1. 公開API全体アーキテクチャ図**

```mermaid
graph TB
    subgraph "サードパーティ・外部システム"
        CLIENT1[会計ソフトウェア<br/>連携クライアント]
        CLIENT2[分析ツール<br/>BI連携]
        CLIENT3[モバイルアプリ<br/>カスタムApp]
        PARTNER[連携パートナー<br/>システム]
    end
    
    subgraph "API Gateway・認証"
        GATEWAY[API Gateway<br/>ロードバランサー]
        AUTH[OAuth 2.0<br/>認証サーバー]
        RATE[レートリミッター<br/>100req/min制御]
        SCOPE[スコープ検証<br/>権限チェック]
    end
    
    subgraph "API Services・ビジネスロジック"
        PROP_API[Properties API<br/>物件情報サービス]
        CUST_API[Customers API<br/>顧客情報サービス]
        DEAL_API[Deals API<br/>案件情報サービス]
        HOOK_API[Webhook API<br/>イベント通知]
    end
    
    subgraph "内部システム連携"
        UF[Unified Form<br/>物件管理]
        DSH[Dashboard<br/>案件管理]
        CTR[Contract Generator<br/>契約書生成]
        AUDIT[監査ログ<br/>アクセス記録]
    end
    
    subgraph "データ・ストレージ"
        DB[PostgreSQL<br/>物件・顧客データ]
        CACHE[Redis Cache<br/>高速レスポンス]
        QUEUE[Message Queue<br/>Webhook配信]
        METRICS[メトリクス DB<br/>使用量・課金]
    end
    
    subgraph "開発者支援・運用"
        PORTAL[開発者ポータル<br/>ドキュメント・管理]
        SANDBOX[サンドボックス<br/>テスト環境]
        MONITOR[監視システム<br/>パフォーマンス・SLA]
        ALERT[アラート<br/>障害・制限通知]
    end
    
    CLIENT1 --> GATEWAY
    CLIENT2 --> GATEWAY
    CLIENT3 --> GATEWAY
    PARTNER --> GATEWAY
    
    GATEWAY --> AUTH
    GATEWAY --> RATE
    AUTH --> SCOPE
    RATE --> SCOPE
    
    SCOPE --> PROP_API
    SCOPE --> CUST_API
    SCOPE --> DEAL_API
    SCOPE --> HOOK_API
    
    PROP_API --> UF
    CUST_API --> DSH
    DEAL_API --> CTR
    HOOK_API --> QUEUE
    
    UF --> DB
    DSH --> DB
    CTR --> DB
    PROP_API --> CACHE
    CUST_API --> CACHE
    
    SCOPE --> AUDIT
    RATE --> METRICS
    HOOK_API --> QUEUE
    
    GATEWAY --> MONITOR
    RATE --> ALERT
    
    PORTAL --> SANDBOX
    MONITOR --> ALERT
    
    style CLIENT1 fill:#fff3e0
    style CLIENT2 fill:#fff3e0
    style CLIENT3 fill:#fff3e0
    style PARTNER fill:#fff3e0
    style GATEWAY fill:#e1f5fe
    style AUTH fill:#f3e5f5
    style PORTAL fill:#e8f5e8
    style ALERT fill:#ffebee
```

##### **4.1.2. 認証・認可フローチャート**

```mermaid
flowchart TD
    START[サードパーティ: API利用開始] --> REGISTER[開発者ポータル<br/>クライアント登録]
    REGISTER --> CRED[Client ID/Secret<br/>取得]
    
    CRED --> TOKEN_REQ[OAuth 2.0<br/>Client Credentials Grant]
    TOKEN_REQ --> OAUTH_AUTH{認証サーバー<br/>認証}
    OAUTH_AUTH -->|失敗| AUTH_ERROR[認証エラー<br/>401 Unauthorized]
    OAUTH_AUTH -->|成功| SCOPE_GRANT[スコープ付与<br/>アクセストークン発行]
    
    SCOPE_GRANT --> API_CALL[API呼び出し<br/>Bearer Token付与]
    API_CALL --> GATEWAY[API Gateway<br/>トークン検証]
    
    GATEWAY --> TOKEN_VALID{トークン<br/>有効性}
    TOKEN_VALID -->|無効| TOKEN_ERROR[トークンエラー<br/>401 Unauthorized]
    TOKEN_VALID -->|有効| RATE_CHECK[レートリミット<br/>チェック]
    
    RATE_CHECK --> RATE_STATUS{制限状況<br/>確認}
    RATE_STATUS -->|制限超過| RATE_ERROR[レート制限エラー<br/>429 Too Many Requests<br/>Retry-After: 60]
    RATE_STATUS -->|制限内| SCOPE_CHECK[スコープ権限<br/>チェック]
    
    SCOPE_CHECK --> SCOPE_STATUS{権限<br/>確認}
    SCOPE_STATUS -->|権限なし| SCOPE_ERROR[権限エラー<br/>403 Forbidden]
    SCOPE_STATUS -->|権限あり| RESOURCE_ACCESS[リソースアクセス<br/>許可]
    
    RESOURCE_ACCESS --> BIZ_LOGIC[ビジネスロジック<br/>実行]
    BIZ_LOGIC --> DATA_FETCH[データ取得<br/>キャッシュ活用]
    
    DATA_FETCH --> RESPONSE_SUCCESS[成功レスポンス<br/>200 OK + JSON]
    
    BIZ_LOGIC --> BIZ_ERROR{ビジネス<br/>エラー}
    BIZ_ERROR -->|リソース不存在| NOT_FOUND[404 Not Found]
    BIZ_ERROR -->|データエラー| SERVER_ERROR[500 Internal Server Error]
    BIZ_ERROR -->|正常| RESPONSE_SUCCESS
    
    RESPONSE_SUCCESS --> AUDIT_LOG[監査ログ記録<br/>アクセス履歴]
    NOT_FOUND --> AUDIT_LOG
    SERVER_ERROR --> AUDIT_LOG
    
    AUDIT_LOG --> METRICS[メトリクス更新<br/>使用量・課金]
    METRICS --> END[API呼び出し完了]
    
    AUTH_ERROR --> RETRY_AUTH[認証情報確認<br/>再取得推奨]
    TOKEN_ERROR --> REFRESH_TOKEN[トークン更新<br/>再取得]
    RATE_ERROR --> WAIT_RETRY[待機後再試行<br/>指数バックオフ]
    SCOPE_ERROR --> PERMISSION_REQ[権限拡張要求<br/>管理者承認]
    
    style START fill:#e1f5fe
    style END fill:#e8f5e8
    style AUTH_ERROR fill:#ffebee
    style TOKEN_ERROR fill:#ffebee
    style RATE_ERROR fill:#ffebee
    style SCOPE_ERROR fill:#ffebee
    style NOT_FOUND fill:#ffebee
    style SERVER_ERROR fill:#ffebee
    style SCOPE_GRANT fill:#fff3e0
    style RESOURCE_ACCESS fill:#e8f5e8
```

##### **4.1.3. API利用・レスポンス・エラー処理シーケンス図**

```mermaid
sequenceDiagram
    participant Client as サードパーティクライアント
    participant Portal as 開発者ポータル
    participant Gateway as API Gateway
    participant Auth as OAuth認証サーバー
    participant Rate as レートリミッター
    participant API as Properties API
    participant Cache as Redis Cache
    participant DB as データベース
    participant Audit as 監査ログ
    participant Webhook as Webhook配信

    Note over Client,Portal: 初回セットアップフェーズ
    Client->>Portal: 開発者登録・クライアント作成
    Portal-->>Client: Client ID/Secret発行
    
    Note over Client,Auth: 認証フェーズ
    Client->>Auth: OAuth Client Credentials Grant
    Auth->>Auth: Client ID/Secret検証
    alt 認証成功
        Auth-->>Client: アクセストークン（スコープ付き）
    else 認証失敗
        Auth-->>Client: 401 Unauthorized
    end

    Note over Client,Webhook: API利用フェーズ
    Client->>Gateway: GET /api/v1/properties/123
    Note over Gateway: Authorization: Bearer {token}
    
    Gateway->>Auth: トークン検証
    Auth-->>Gateway: トークン有効性・スコープ情報
    
    alt トークン有効
        Gateway->>Rate: レートリミットチェック
        alt 制限内
            Rate-->>Gateway: リクエスト許可
            Gateway->>API: プロパティ取得要求
            
            API->>Cache: キャッシュ確認
            alt キャッシュヒット
                Cache-->>API: キャッシュデータ
            else キャッシュミス
                API->>DB: データベースクエリ
                DB-->>API: 物件データ
                API->>Cache: キャッシュ更新
            end
            
            API-->>Gateway: 200 OK + 物件データ（JSON）
            Gateway->>Audit: アクセスログ記録
            Gateway-->>Client: 200 OK + データ
            
        else レート制限超過
            Rate-->>Gateway: 429 Too Many Requests
            Gateway-->>Client: 429 + Retry-After: 60
        end
        
    else トークン無効
        Auth-->>Gateway: トークン無効
        Gateway-->>Client: 401 Unauthorized
    end

    Note over API,Webhook: Webhook通知フェーズ
    API->>Webhook: 物件データ更新イベント
    Webhook->>Client: POST {webhook_url}
    Note over Webhook,Client: イベント通知（非同期）
    
    alt Webhook成功
        Client-->>Webhook: 200 OK
        Webhook->>Audit: 配信成功ログ
    else Webhook失敗
        Client-->>Webhook: 4xx/5xx エラー
        Webhook->>Webhook: 指数バックオフ再送（最大3回）
        Webhook->>Audit: 配信失敗ログ
    end

    Note over Client,Portal: 監視・管理フェーズ
    Client->>Portal: 使用量・エラー率確認
    Portal->>Audit: 利用統計取得
    Audit-->>Portal: メトリクス・ログデータ
    Portal-->>Client: ダッシュボード表示

    Note over Gateway,Audit: エラーケース例
    Client->>Gateway: GET /api/v1/properties/999（存在しない）
    Gateway->>API: 存在確認
    API->>DB: データ検索
    DB-->>API: レコードなし
    API-->>Gateway: 404 Not Found
    Gateway->>Audit: エラーログ記録
    Gateway-->>Client: 404 + エラー詳細JSON
```

#### **5. 提供されるリソースとロードマップ**

- **v1.1で提供する主なリソース（読み取り専用）:**
  - **物件情報 (`/properties`):** 物件の基本情報、価格、ステータスなどの取得。
  - **顧客情報 (`/customers`):** 案件に紐づく顧客情報の取得。
  - **案件情報 (`/deals`):** 売買契約の進捗状況や契約情報の取得。

- **v1.2以降のロードマップ案:**
  - **書き込みAPIの解禁:** `PATCH`, `PUT` メソッドをサポートし、外部システムからのデータ更新を可能にする。
  - **Webhook機能:** Unified Formの物件情報が更新された際など、特定のイベント発生時に指定されたURLへ通知を送信する機能を追加する。

##### **v1.1 (MVP)**

- **リソース:**
  - `[ ]` `GET /api/v1/properties/{id}`: 特定の物件情報を取得
- **Webhook（将来の拡張）:**
  - `[ ]` 物件情報が更新された際に、指定されたURLに通知を送信するWebhook機能を提供する。
  - `[ ]` **再送ポリシー:** Webhookの送信に失敗した場合（HTTPステータスコードが2xx以外）、**指数バックオフ**アルゴリズムを用いて最大**3回**まで再送する。3回失敗した後は、開発者コンソールで失敗履歴を確認できる。

##### **v1.2 (Post-MVP)**

- **リソース:**
  - `[ ]` `GET /api/v1/properties/{id}`: 特定の物件情報を取得

#### **6. 開発者向けサポート**

- `[ ]` **【開発者ポータル】** APIの利用方法、認証手順、利用規約などを掲載した開発者向けポータルサイトを提供する。
- `[ ]` **【APIドキュメンテーション】** 全てのエンドポイント、リクエストパラメータ、レスポンス形式などを網羅した、OpenAPI (Swagger) 仕様に基づくインタラクティブなAPIリファレンスを提供する。
- `[ ]` **【サンドボックス環境】** 開発者が本番データに影響を与えることなく、APIの動作を自由に試せるサンドボックス（テスト）環境を提供する。サンドボックス環境用のAPIキーを発行できる。
- `[ ]` **【SDK】** 主要なプログラミング言語（Python, Node.jsなど）向けに、APIを容易に利用するためのソフトウェア開発キット（SDK）を将来的には提供する。

#### **7. セキュリティ要件**

- 全てのリクエストとレスポンスは、TLS 1.2以上で暗号化される。
- 顧客データへのアクセスは、認可されたスコープ（例: `properties.read`, `customers.read`）に厳密に制限される。
- 全てのAPIコールは、誰が、いつ、どのリソースにアクセスしたかを記録する監査ログの対象となる。 

#### **8. RC版（Release Candidate）要件**

**目標**: 企業級・高性能 公開APIプラットフォーム

##### **8.1. API機能・網羅性拡張**
- `[ ]` **完全CRUD対応**: 全リソースでの作成・読取・更新・削除操作提供
- `[ ]` **リアルタイムAPI**: WebSocket・Server-Sent Events での即座データ配信
- `[ ]` **バッチAPI**: 大量データの一括処理・効率的データ転送
- `[ ]` **GraphQL対応**: REST APIと並行してGraphQLエンドポイント提供

##### **8.2. パフォーマンス・スケーラビリティ**
- `[ ]` **応答時間最適化**: 95パーセンタイルで200ms以内（データベースアクセス含む）
- `[ ]` **高可用性**: 99.99%の稼働率（年間ダウンタイム52分以内）
- `[ ]` **オートスケーリング**: 負荷に応じた自動スケール・容量最適化
- `[ ]` **CDN統合**: 静的データの全世界配信・レイテンシ最小化

##### **8.3. セキュリティ・認証強化**
- `[ ]` **OAuth 2.0 PKCE**: モバイルアプリ向け高セキュリティ認証
- `[ ]` **JWT トークン**: 署名付きトークンによる改ざん防止・オフライン検証
- `[ ]` **細粒度アクセス制御**: フィールドレベルでの詳細権限管理
- `[ ]` **API キー管理**: 動的ローテーション・使用量制御・異常検知

##### **8.4. 開発者体験・エコシステム**
- `[ ]` **完全自動化SDK**: 10言語以上での公式SDK・自動生成・更新
- `[ ]` **インタラクティブドキュメント**: ライブテスト・コード生成・即座実行
- `[ ]` **開発者ダッシュボード**: 使用量監視・エラー追跡・パフォーマンス分析
- `[ ]` **サンドボックス強化**: 本番同等環境・完全テストデータセット

##### **8.5. 監視・運用基盤**
- `[ ]` **リアルタイム監視**: API健全性・エラー率・レスポンス時間の即座監視
- `[ ]` **予測的スケーリング**: 機械学習による負荷予測・事前スケール
- `[ ]` **自動障害回復**: ヘルスチェック・自動フェイルオーバー・ロードバランシング
- `[ ]` **SLA監視**: 顧客別SLA追跡・違反時の自動アラート・補償

##### **8.6. ビジネス・収益化機能**
- `[ ]` **使用量計測**: リクエスト数・データ転送量・機能別課金計測
- `[ ]` **レート制限管理**: 顧客プランに応じた動的制限・アップグレード誘導
- `[ ]` **API マーケットプレース**: パートナー API の統合・収益分配
- `[ ]` **分析・インサイト**: API利用パターン分析・ビジネス意思決定支援

##### **8.7. Webhook・イベント駆動**
- `[ ]` **イベントストリーミング**: Apache Kafka での高可用性イベント配信
- `[ ]` **Webhook 信頼性**: 保証配信・重複排除・順序保証・リトライ戦略
- `[ ]` **カスタムイベント**: 顧客定義イベント・フィルタリング・ルーティング
- `[ ]` **リアルタイム通知**: プッシュ通知・メール・SMS 統合配信

##### **8.8. 成功基準**
- **応答時間**: 95パーセンタイルで200ms以内
- **稼働率**: 99.99%以上（月間ダウンタイム4分以内）
- **開発者満足度**: 4.8/5.0以上（開発者エクスペリエンス評価）
- **API採用率**: 25%以上の既存顧客によるAPI利用 