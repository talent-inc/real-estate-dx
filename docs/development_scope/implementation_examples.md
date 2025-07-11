# 実装例 - Apple-Inspired Design System

## 物件一覧画面

```tsx
import { PropertyGrid, PropertyCard, SearchBar, FilterSheet } from '@/components';

export function PropertiesPage() {
  return (
    <div className="min-h-screen bg-[--surface-secondary]">
      {/* ヘッダー - 浮遊する検索 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[--border]">
        <div className="container mx-auto px-6 py-4">
          <SearchBar placeholder="エリア、駅名、物件名で検索" />
        </div>
      </header>

      {/* メイン */}
      <main className="container mx-auto px-6 py-8">
        {/* フィルター - 控えめな存在感 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-[--ink]">
            物件一覧
            <span className="text-base font-normal text-[--ink-secondary] ml-2">
              (324件)
            </span>
          </h1>
          <FilterSheet />
        </div>

        {/* グリッド - 整然とした美しさ */}
        <PropertyGrid>
          {properties.map(property => (
            <PropertyCard
              key={property.id}
              image={property.mainImage}
              title={property.name}
              price={formatPrice(property.price)}
              area={property.area}
              layout={property.layout}
              station={property.nearestStation}
            />
          ))}
        </PropertyGrid>
      </main>
    </div>
  );
}
```

## 物件詳細画面

```tsx
export function PropertyDetailPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ヒーロー画像 - 没入感 */}
      <div className="relative h-[60vh] overflow-hidden">
        <img 
          src={property.mainImage} 
          alt={property.name}
          className="w-full h-full object-cover"
        />
        {/* グラデーションオーバーレイ */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        
        {/* 基本情報オーバーレイ */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <h1 className="text-4xl font-semibold mb-2">{property.name}</h1>
          <p className="text-3xl">{formatPrice(property.price)}</p>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メイン情報 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 概要カード */}
            <Card>
              <h2 className="text-xl font-semibold mb-4">物件概要</h2>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-[--ink-secondary] text-sm">所在地</dt>
                  <dd className="text-[--ink] mt-1">{property.address}</dd>
                </div>
                <div>
                  <dt className="text-[--ink-secondary] text-sm">交通</dt>
                  <dd className="text-[--ink] mt-1">{property.access}</dd>
                </div>
                {/* ... */}
              </dl>
            </Card>

            {/* 詳細情報 - アコーディオン */}
            <Accordion>
              <Accordion.Item title="建物・設備">
                {/* ... */}
              </Accordion.Item>
              <Accordion.Item title="周辺環境">
                {/* ... */}
              </Accordion.Item>
            </Accordion>
          </div>

          {/* サイドバー - スティッキー */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* 問い合わせカード */}
              <Card className="border-2 border-[--tint]">
                <h3 className="text-lg font-semibold mb-4">この物件について</h3>
                <Button variant="primary" className="w-full mb-3">
                  問い合わせる
                </Button>
                <Button variant="secondary" className="w-full">
                  資料請求
                </Button>
              </Card>

              {/* 営業担当者 */}
              <Card>
                <div className="flex items-center gap-4">
                  <img 
                    src={agent.photo} 
                    alt={agent.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-sm text-[--ink-secondary]">
                      {agent.department}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## モバイル最適化の例

```tsx
// レスポンシブフック
function useResponsive() {
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  
  useEffect(() => {
    const checkDevice = () => {
      if (window.innerWidth <= 428) setDevice('mobile');
      else if (window.innerWidth <= 1024) setDevice('tablet');
      else setDevice('desktop');
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);
  
  return device;
}

// モバイル専用ナビゲーション
export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-[--border] lg:hidden">
      <div className="grid grid-cols-4 gap-1 p-2">
        <NavButton icon={<HomeIcon />} label="ホーム" href="/" />
        <NavButton icon={<SearchIcon />} label="検索" href="/search" />
        <NavButton icon={<FavoriteIcon />} label="お気に入り" href="/favorites" />
        <NavButton icon={<UserIcon />} label="マイページ" href="/mypage" />
      </div>
    </nav>
  );
}
```

## ローディング状態

```tsx
// スケルトンローダー
export function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden">
      <div className="aspect-[16/9] bg-[--surface-elevated] animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-[--surface-elevated] rounded animate-pulse" />
        <div className="h-6 bg-[--surface-elevated] rounded w-2/3 animate-pulse" />
        <div className="h-4 bg-[--surface-elevated] rounded animate-pulse" />
      </div>
    </div>
  );
}

// ローディングビュー
export function LoadingView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}
```

## エラー処理

```tsx
// エラー境界
export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundaryPrimitive
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 text-[--critical]">
              <ExclamationIcon />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              エラーが発生しました
            </h2>
            <p className="text-[--ink-secondary] mb-6">
              申し訳ございません。しばらく時間をおいて再度お試しください。
            </p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              再読み込み
            </Button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundaryPrimitive>
  );
}
```

## アクセシビリティ考慮

```tsx
// フォーカス管理
export function FocusTrap({ children, active }: { children: React.ReactNode; active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!active) return;
    
    const element = ref.current;
    if (!element) return;
    
    // フォーカス可能な要素を取得
    const focusables = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusables[0] as HTMLElement;
    const lastFocusable = focusables[focusables.length - 1] as HTMLElement;
    
    // 最初の要素にフォーカス
    firstFocusable?.focus();
    
    // Tab キーのトラップ
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable?.focus();
          e.preventDefault();
        }
      }
    };
    
    element.addEventListener('keydown', handleKeyDown);
    return () => element.removeEventListener('keydown', handleKeyDown);
  }, [active]);
  
  return <div ref={ref}>{children}</div>;
}

// スキップリンク
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-[--tint] text-white px-4 py-2 rounded-full"
    >
      メインコンテンツへスキップ
    </a>
  );
}
```

これらの実装例は、Apple-Inspired Design Systemの原則に従い、シンプルさ、美しさ、そして使いやすさを追求しています。