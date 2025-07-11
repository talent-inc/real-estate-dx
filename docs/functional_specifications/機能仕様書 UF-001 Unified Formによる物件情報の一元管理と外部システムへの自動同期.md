### **機能仕様書 v2.0**

**機能ID:** `UF-001` **機能名:** `Unified Formによる物件情報の一元管理と外部システムへの自動同期`

**更新履歴:**
- v1.1 (2025-06-01): 初版作成
- v2.0 (2025-07-11): ベータ版スコープを複数入力負荷解消に特化、価値提案明確化

#### **1\. 概要（Overview）**

**不動産売買業務の複数入力負荷解消の核心機能**

物件に関する全ての情報（基本情報、価格、写真、広告コメント等）を、単一のフォームで一元的に入力・管理する機能。**Beta版では、1回の入力で複数の外部システム（REINS、AtHome、SUUMO、LIFULL等）へ自動配信し、従来の「5サイトに5回入力」を「1回入力で5サイト同時配信」に変革する。**

**価値提案:** 1物件あたり2時間 → 30分（**75%削減**）の時短効果を実現。

#### **2\. ユーザーゴール（User Story）**

**`broker_agent`（仲介担当者）または `legal_staff`（法務・契約担当）として、** 私は **一度だけ物件情報を入力すれば、売買業務に必要な全ての帳票作成やシステム登録が完了してほしい。** それによって、**繰り返し作業から解放され、より創造的な販売活動や顧客対応に時間を使いたい。**

#### **3\. 受入基準（Acceptance Criteria）**

* `[ ]` 機能「OCR-001」で抽出されたデータが、フォームの該当項目に自動で入力されている。  
* `[ ]` ユーザーは、物件概要書、契約書、ポータルサイト掲載に必要な全ての項目を手動で入力・編集できる。  
* `[ ]` フォームには、売主が複数名いる場合にも対応できる入力欄が存在する。  
* `[ ]` 「保存・同期」ボタンをクリックすると、バックグラウンドで外部システムへの同期ジョブが開始される。  
* `[ ]` 同期ジョブのステータス（待機中、同期中、完了、失敗）が、案件ダッシュボード上で確認できる。  
* `[ ]` フォームの情報を用いて、カスタマイズ性の高い物件概要書（PDF）をワンクリックで生成できる。  
* `[ ]` 【テスト】E2Eテストとして、PDFアップロード→OCR→Unified Formでの編集→外部システム同期までの一連のフローが、Playwright等で自動実行され、毎晩テストされる。

#### **4\. UIデザインとUXフロー**

* **4.1. 画面デザイン（shadcn/ui + React Hook Form準拠）:**  
  * **技術スタック**: Next.js 14 + TypeScript + shadcn/ui + React Hook Form + Zod
  * **フォーム構成**: `Tabs` + `TabsContent` + `Form` コンポーネントでタブ形式
  
  * **shadcn/uiコンポーネント活用:**
    ```tsx
    // Unified Form メインコンポーネント
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">物件基本情報</TabsTrigger>
            <TabsTrigger value="details">土地・建物情報</TabsTrigger>
            <TabsTrigger value="pricing">価格・条件</TabsTrigger>
            <TabsTrigger value="media">写真・図面</TabsTrigger>
            <TabsTrigger value="marketing">広告・コメント</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>物件基本情報</CardTitle>
                <CardDescription>OCR抽出データの確認・編集</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>所在地</FormLabel>
                      <FormControl>
                        <Input placeholder="東京都渋谷区..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* 他のフィールド */}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
    ```

  * **同期ステータス表示エリア:**
    ```tsx
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sync className="h-5 w-5" />
          外部システム同期状況
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {syncStatuses.map((status) => (
            <div key={status.system} className="flex items-center justify-between">
              <span className="text-sm font-medium">{status.system}</span>
              <Badge variant={getBadgeVariant(status.status)}>
                {status.status}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(status.lastSync)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    ```

  * **アクションボタン（フローティング）:**
    ```tsx
    <div className="fixed bottom-6 right-6 flex gap-2">
      <Button 
        variant="outline" 
        onClick={() => form.handleSubmit(onDraftSave)()}
        disabled={isSaving}
      >
        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save />}
        下書き保存
      </Button>
      <Button 
        onClick={() => form.handleSubmit(onSaveAndSync)()}
        disabled={isSyncing}
      >
        {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload />}
        保存して同期
      </Button>
    </div>
    ```

* **4.2. ユーザーフロー図（Next.js App Router準拠）:**  
  1. ダッシュボード `/dashboard` から案件選択 → `/properties/[id]` 詳細画面  
  2. 「物件情報編集」ボタンクリック → `/properties/[id]/edit` へナビゲート  
  3. React Hook Form による Unified Form 表示（OCRデータ自動入力済み）  
  4. タブ切り替えでフォーム項目を編集（リアルタイムバリデーション）  
  5. 「保存して同期」→ tRPC mutation 実行、楽観的更新  
  6. トースト通知で同期開始メッセージ → `/dashboard` へリダイレクト  

* **4.3. バリデーション・型安全性（Zod Schema）:**  
  ```typescript
  // 物件情報のZodスキーマ定義
  const propertySchema = z.object({
    // 基本情報
    address: z.string().min(10, "所在地は10文字以上で入力してください"),
    propertyType: z.enum(["戸建て", "マンション", "土地", "一棟"]),
    buildingAge: z.number().min(0).max(100).optional(),
    
    // 価格・条件
    price: z.number().min(1000000, "価格は100万円以上で入力してください"),
    currency: z.enum(["JPY", "USD"]).default("JPY"), // 国際化対応
    
    // 面積（単位変換対応）
    landArea: z.object({
      value: z.number().positive(),
      unit: z.enum(["㎡", "坪", "sqft"]).default("㎡")
    }),
    
    // 写真・図面
    images: z.array(z.object({
      url: z.string().url(),
      caption: z.string().optional(),
      type: z.enum(["exterior", "interior", "floorplan", "other"])
    })).max(20, "画像は20枚まで登録可能です")
  });
  
  type PropertyFormData = z.infer<typeof propertySchema>;
  ```

* **4.4. 国際化対応（Phase 1: 基盤準備のみ）:**  
  
  **注意：海外展開は検討段階のため、以下は技術的基盤の準備のみ実装**
  * **通貨・単位変換**: データスキーマは拡張可能だが、表示は当面JPY・㎡のみ
    ```tsx
    // 将来の拡張に備えたフック設計（現在は変換なし）
    const { formatCurrency, formatArea } = useUnitFormatter();
    // JPY表示のみ（USD等は将来対応）
    // ㎡・坪表示のみ（sqft等は将来対応）
    ```
  * **多言語UI**: `next-intl` 対応可能なコンポーネント設計（日本語のみ実装）

#### **5\. システム要件（バックエンド）**

* **5.1. tRPC Procedures（型安全API）:**  
  ```typescript
  // apps/api/src/router/property.ts
  export const propertyRouter = createTRPCRouter({
    // 物件情報取得（編集ロック取得）
    getForEdit: protectedProcedure
      .input(z.object({ propertyId: z.string().cuid() }))
      .query(async ({ ctx, input }) => {
        // ペシミスティックロック取得
        const lockKey = `property:${input.propertyId}:edit`;
        const lockResult = await ctx.redis.set(
          lockKey, 
          ctx.session.user.id, 
          'EX', 1800, // 30分TTL
          'NX' // 存在しない場合のみ設定
        );
        
        if (!lockResult) {
          const currentLockUserId = await ctx.redis.get(lockKey);
          const lockUser = await ctx.db.user.findUnique({
            where: { id: currentLockUserId },
            select: { name: true }
          });
          throw new TRPCError({
            code: 'CONFLICT',
            message: `この物件は${lockUser?.name}が編集中です`
          });
        }

        return await ctx.db.property.findUniqueOrThrow({
          where: { id: input.propertyId },
          include: {
            images: true,
            syncStatuses: true,
            client: { select: { name: true, phone: true } }
          }
        });
      }),

    // 下書き保存（同期なし）
    saveDraft: protectedProcedure
      .input(propertySchema.partial().extend({
        propertyId: z.string().cuid()
      }))
      .mutation(async ({ ctx, input }) => {
        const { propertyId, ...updateData } = input;
        
        return await ctx.db.property.update({
          where: { id: propertyId },
          data: {
            ...updateData,
            isDraft: true,
            updatedAt: new Date(),
            updatedBy: ctx.session.user.id
          }
        });
      }),

    // 保存して同期（バックグラウンドジョブ開始）
    saveAndSync: protectedProcedure
      .input(propertySchema.extend({
        propertyId: z.string().cuid()
      }))
      .mutation(async ({ ctx, input }) => {
        const { propertyId, ...updateData } = input;
        
        // トランザクション内で処理
        return await ctx.db.$transaction(async (tx) => {
          // 物件情報更新
          const updatedProperty = await tx.property.update({
            where: { id: propertyId },
            data: {
              ...updateData,
              isDraft: false,
              lastSyncAttempt: new Date(),
              updatedBy: ctx.session.user.id
            }
          });

          // 監査ログ記録
          await tx.propertyHistory.create({
            data: {
              propertyId,
              userId: ctx.session.user.id,
              action: 'UPDATE',
              changes: JSON.stringify(updateData),
              timestamp: new Date()
            }
          });

          // 非同期同期ジョブをキューに追加
          await ctx.queue.add('property-sync', {
            propertyId,
            systems: ['hatsapo', 'reins', 'suumo', 'athome'],
            priority: 'normal'
          });

          // 編集ロック解放
          await ctx.redis.del(`property:${propertyId}:edit`);

          return updatedProperty;
        });
      }),

    // 編集ロック解放（明示的）
    releaseLock: protectedProcedure
      .input(z.object({ propertyId: z.string().cuid() }))
      .mutation(async ({ ctx, input }) => {
        const lockKey = `property:${input.propertyId}:edit`;
        const currentUserId = await ctx.redis.get(lockKey);
        
        if (currentUserId === ctx.session.user.id) {
          await ctx.redis.del(lockKey);
          return { success: true };
        }
        
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'このロックを解放する権限がありません'
        });
      }),

    // 同期ステータス取得
    getSyncStatus: protectedProcedure
      .input(z.object({ propertyId: z.string().cuid() }))
      .query(async ({ ctx, input }) => {
        return await ctx.db.syncStatus.findMany({
          where: { propertyId: input.propertyId },
          orderBy: { lastAttempt: 'desc' }
        });
      })
  });
  ```

* **5.2. データ処理とキューシステム（BullMQ + Redis）:**  
  ```typescript
  // 非同期同期ワーカー
  export class PropertySyncWorker {
    async processJob(job: Job<PropertySyncData>) {
      const { propertyId, systems } = job.data;
      
      for (const system of systems) {
        try {
          switch (system) {
            case 'hatsapo':
              await this.syncToHatsapo(propertyId);
              break;
            case 'reins':
              await this.syncToReins(propertyId);
              break;
            // ... 他のシステム
          }
          
          // 成功ログ記録
          await this.updateSyncStatus(propertyId, system, 'SUCCESS');
        } catch (error) {
          // エラーハンドリング（指数バックオフリトライ）
          await this.updateSyncStatus(propertyId, system, 'FAILED', error.message);
          throw error; // BullMQの自動リトライに委ねる
        }
      }
    }
  }
  ```

* **5.3. データマッピング設定（外部JSON管理）:**  
  ```json
  // config/mapping/hatsapo-mapping.json
  {
    "version": "1.2.0",
    "lastUpdated": "2025-06-30",
    "mappings": {
      "address": "物件所在地",
      "price": "価格",
      "landArea.value": "土地面積",
      "buildingArea.value": "建物面積",
      "propertyType": {
        "field": "物件種別",
        "valueMap": {
          "戸建て": "戸建",
          "マンション": "区分マンション",
          "土地": "土地",
          "一棟": "一棟マンション"
        }
      }
    }
  }
  ```

* **5.4. 排他制御とリアルタイム通信:**  
  * **ペシミスティックロック**: Redis SET命令のNXオプションでアトミックな排他制御
  * **ロック監視**: WebSocketでリアルタイム編集状況を他ユーザーに通知
    ```typescript
    // リアルタイム編集状況通知
    useEffect(() => {
      const socket = io('/property-editing');
      socket.emit('join-property', propertyId);
      
      socket.on('user-editing', (data) => {
        if (data.userId !== currentUserId) {
          showEditingBanner(`${data.userName}が編集中です`);
        }
      });
      
      return () => socket.disconnect();
    }, [propertyId]);
    ```
  * **自動ロック延長**: ユーザーが編集中は15分ごとにTTLを自動延長

#### **6\. エラーハンドリングとリトライ戦略**

| エラーケース | ユーザーへの表示（フロントエンド） | システムの挙動（バックエンド） |
| :---- | :---- | :---- |
| **必須項目が未入力** | 「必須項目が入力されていません」というエラーメッセージをフォーム上部に表示し、該当項目をハイライトする。 | APIはバリデーションエラー（ステータスコード422）を返す。 |
| **外部システムの同期失敗** （DB保存は成功） | 案件ダッシュボードの同期ステータスを「一部失敗」と表示。「詳細」で失敗した連携先（例：「ハトサポへの接続に失敗」）と「再試行」ボタンを表示する。 | DBへの更新トランザクションはコミットしたまま、失敗した同期ジョブのステータスを「失敗」とし、後述の戦略に従いリトライする。 |
| **外部システムの認証情報エラー** | 「ポータルサイトAの認証情報が無効です。設定画面で更新してください」という通知を表示する。 | 認証失敗を検知した場合、該当ジョブを中断し、`tenant_admin`ロールを持つユーザーに再設定を促す通知を発行する。 |

#### **7\. エラーハンドリングとリトライ戦略**

- **DBロールバック方針:** 外部システムへの同期に失敗しても、本システムのデータベースへの保存（`properties`テーブルの更新）は**ロールバックしない**。マスターデータは常に最新の状態を維持し、外部連携の成否は個別のジョブステータスとして管理する。
- **リトライ戦略（指数バックオフ）:**
  - `[ ]` 外部システムへの同期に失敗したジョブは、**指数バックオフ**アルゴリズムに基づいて自動的に再試行される。
  - `[ ]` 再試行は最大**5回**まで行われる。
  - `[ ]` 具体的な待機時間（例）: 1回目: 1分後, 2回目: 2分後, 3回目: 4分後, 4回目: 8分後, 5回目: 16分後。
  - `[ ]` 5回すべての再試行に失敗した場合、ジョブのステータスは恒久的に「失敗」となり、案件担当者（`broker_agent`, `legal_staff`）および`tenant_admin`に手動での対応を促す通知が発行される。

#### **8\. 将来の展望（Roadmap）**

- **Webhookによる外部通知:** 将来的に `API-001` を拡張し、本フォームでのデータ変更をトリガーに、外部のサードパーティシステムへリアルタイムで通知を送信するWebhook機能の実装を検討する。
  - **仕様案（Footnote）:**
    - 設定用エンドポイント: `POST /api/v1/webhook_configs`
    - イベント名: `property.updated`, `property.created`, `property.deleted`
    - ペイロード: 変更後の `property` オブジェクト全体

Google スプレッドシートにエクスポート  

---

#### **9. RC版（Release Candidate）要件**

**目標**: 商用環境での安定稼働に向けた品質向上・パフォーマンス最適化

##### **9.1. パフォーマンス要件**
- `[ ]` **大量データ対応**: 1テナントあたり10,000件以上の物件データでの安定動作
- `[ ]` **同時編集対応**: 50名以上の同時ユーザーでの編集ロック・競合制御
- `[ ]` **レスポンス性能**: 物件データ保存・読み込み3秒以内（99パーセンタイル）
- `[ ]` **スケーラビリティ**: Cloud Runの自動スケーリング設定最適化

##### **9.2. セキュリティ強化**
- `[ ]` **アクセス制御強化**: RBACの詳細権限設定・テスト完了
- `[ ]` **データ暗号化**: 保存時・転送時の暗号化方式確認・監査対応
- `[ ]` **監査ログ充実**: すべての変更操作の完全なトレーサビリティ確保
- `[ ]` **ペネトレーションテスト**: 第三者機関による脆弱性検査実施

##### **9.3. 運用品質向上**
- `[ ]` **エラーハンドリング網羅**: 全ての異常系ケースの適切な処理・ユーザー通知
- `[ ]` **監視・アラート**: Cloud Monitoring連携による障害早期検知
- `[ ]` **ドキュメント整備**: 運用マニュアル・トラブルシューティングガイド
- `[ ]` **自動復旧機能**: 一時的な外部システム障害からの自動復旧機構

##### **9.4. 外部連携の安定性**
- `[ ]` **フェイルセーフ機構**: 外部システム障害時のデータ整合性保証
- `[ ]` **リトライ戦略最適化**: 指数バックオフの調整・上限値設定
- `[ ]` **マッピング設定GUI**: 技術者以外でもデータマッピング変更可能なUI
- `[ ]` **連携品質監視**: 同期成功率・レスポンス時間の継続監視

##### **9.5. 成功基準**
- **稼働率**: 99.5%以上（月次）
- **データ整合性**: 外部システム同期の成功率95%以上
- **ユーザー満足度**: 4.0/5.0以上（RC版ユーザーアンケート）
- **セキュリティ**: ペネトレーションテストでの重大脆弱性0件
