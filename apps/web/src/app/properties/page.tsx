'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/dashboard-layout'
import PropertyCard from '@/components/properties/property-card'
import PropertySearchFilters from '@/components/properties/property-search-filters'
import { Button } from '@/components/ui/button'
import { Property, PropertySearchParams } from '@/types/property'
import { 
  Plus, 
  LayoutGrid, 
  List,
  Download,
  Upload
} from 'lucide-react'

// 仮のデータ（API仕様準拠）
const mockProperties: Property[] = [
  {
    id: '1',
    title: '新宿グランドマンション 301号室',
    name: '新宿グランドマンション 301号室',
    address: '東京都新宿区新宿3丁目1-1-1',
    prefecture: '東京都',
    city: '新宿区',
    price: 85000000,
    rent: 350000,
    layout: '3LDK',
    area: 75.2,
    propertyType: 'APARTMENT',
    status: 'ACTIVE',
    description: '新宿駅徒歩5分の好立地マンション',
    images: [{ url: '/placeholder-property.jpg', thumbnailUrl: '/placeholder-property.jpg', isMain: true }],
    nearestStation: 'JR新宿駅',
    walkingMinutes: 5,
    buildingAge: 8,
    structure: 'RC造',
    floor: 3,
    totalFloors: 15,
    parking: true,
    petAllowed: false,
    furnished: false,
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: '2025-01-10T15:30:00Z',
    assignedTo: '田中営業'
  },
  {
    id: '2',
    title: '渋谷戸建て住宅',
    name: '渋谷戸建て住宅',
    address: '東京都渋谷区恵比寿南2丁目1-1',
    prefecture: '東京都',
    city: '渋谷区',
    price: 120000000,
    layout: '4LDK',
    area: 95.5,
    propertyType: 'HOUSE',
    status: 'PENDING',
    description: '閑静な住宅街の一戸建て',
    images: [{ url: '/placeholder-property.jpg', thumbnailUrl: '/placeholder-property.jpg', isMain: true }],
    nearestStation: 'JR恵比寿駅',
    walkingMinutes: 8,
    buildingAge: 5,
    structure: '木造',
    parking: true,
    petAllowed: true,
    furnished: false,
    createdAt: '2025-01-08T14:00:00Z',
    updatedAt: '2025-01-11T10:15:00Z',
    assignedTo: '佐藤営業'
  },
  {
    id: '3',
    title: '青山土地',
    name: '青山土地',
    address: '東京都港区青山1丁目1-1',
    prefecture: '東京都',
    city: '港区',
    price: 200000000,
    layout: '-',
    area: 150.0,
    propertyType: 'LAND',
    status: 'ACTIVE',
    description: '青山一丁目の貴重な土地',
    images: [{ url: '/placeholder-property.jpg', thumbnailUrl: '/placeholder-property.jpg', isMain: true }],
    nearestStation: '東京メトロ青山一丁目駅',
    walkingMinutes: 3,
    createdAt: '2025-01-05T11:00:00Z',
    updatedAt: '2025-01-09T16:45:00Z',
    assignedTo: '山田営業'
  }
]

export default function PropertiesPage() {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>(mockProperties)
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(mockProperties)
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (searchParams: PropertySearchParams) => {
    setIsLoading(true)
    
    // TODO: 実際のAPI呼び出しに置き換える
    try {
      console.log('Search params:', searchParams)
      
      // 仮の検索フィルタリングロジック
      let filtered = properties
      
      if (searchParams.keyword) {
        filtered = filtered.filter(property => 
          (property.name || property.title).includes(searchParams.keyword!) ||
          property.address.includes(searchParams.keyword!)
        )
      }
      
      if (searchParams.propertyTypes && searchParams.propertyTypes.length > 0) {
        filtered = filtered.filter(property => 
          searchParams.propertyTypes!.includes(property.propertyType)
        )
      }
      
      if (searchParams.minPrice) {
        filtered = filtered.filter(property => property.price >= searchParams.minPrice!)
      }
      
      if (searchParams.maxPrice) {
        filtered = filtered.filter(property => property.price <= searchParams.maxPrice!)
      }
      
      if (searchParams.status && searchParams.status.length > 0) {
        filtered = filtered.filter(property => 
          searchParams.status!.includes(property.status)
        )
      }
      
      setFilteredProperties(filtered)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ページヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">物件管理</h1>
            <p className="text-gray-600">
              {filteredProperties.length}件の物件が見つかりました
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              CSVインポート
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              CSVエクスポート
            </Button>
            <Button onClick={() => router.push('/properties/new')}>
              <Plus className="w-4 h-4 mr-2" />
              新規物件登録
            </Button>
          </div>
        </div>

        {/* 検索フィルター */}
        <PropertySearchFilters onSearch={handleSearch} />

        {/* 表示切り替えとソート */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">表示形式:</span>
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'card' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('card')}
                className="rounded-r-none"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">並び順:</span>
            <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
              <option value="updatedAt-desc">更新日時（新しい順）</option>
              <option value="price-asc">価格（安い順）</option>
              <option value="price-desc">価格（高い順）</option>
              <option value="area-desc">面積（広い順）</option>
              <option value="createdAt-desc">登録日時（新しい順）</option>
            </select>
          </div>
        </div>

        {/* 物件一覧 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">検索中...</p>
            </div>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">条件に合致する物件が見つかりませんでした。</p>
            <Button variant="outline" onClick={() => handleSearch({})}>
              すべての物件を表示
            </Button>
          </div>
        ) : (
          <div className={
            viewMode === 'card' 
              ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" 
              : "space-y-4"
          }>
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}

        {/* ページネーション（将来実装予定） */}
        {filteredProperties.length > 0 && (
          <div className="flex items-center justify-center pt-6">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                前のページ
              </Button>
              <span className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm">
                1
              </span>
              <Button variant="outline" size="sm" disabled>
                次のページ
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}