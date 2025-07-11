'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import PropertyTypeBadge from '@/components/properties/property-type-badge'
import PropertyStatusBadge from '@/components/properties/property-status-badge'
import { Property } from '@/types/property'
import { 
  ArrowLeft,
  Edit,
  Trash2,
  Share2,
  Download,
  Calendar,
  MapPin,
  Home,
  Train,
  Car,
  Phone,
  Mail,
  FileText,
  Camera
} from 'lucide-react'

interface PropertyDetailPageProps {
  params: { id: string }
}

// 仮のデータ（実際のAPIから取得するまで）
const mockProperty: Property = {
  id: '1',
  title: '新宿グランドマンション 301号室',
  name: '新宿グランドマンション 301号室',
  address: '東京都新宿区新宿3丁目1番1号',
  prefecture: '東京都',
  city: '新宿区',
  price: 85000000,
  rent: 350000,
  layout: '3LDK',
  area: 75.2,
  propertyType: 'APARTMENT',
  status: 'ACTIVE',
  description: '新宿駅徒歩5分の好立地に位置するグランドマンション。南向きの明るいお部屋で、リビングからは東京の街並みを一望できます。最上階の角部屋のため、プライバシーも確保されており、静かな住環境です。',
  images: [
    { url: '/placeholder-property.jpg', thumbnailUrl: '/placeholder-property.jpg', isMain: true },
    { url: '/placeholder-property.jpg', thumbnailUrl: '/placeholder-property.jpg', isMain: false },
    { url: '/placeholder-property.jpg', thumbnailUrl: '/placeholder-property.jpg', isMain: false },
    { url: '/placeholder-property.jpg', thumbnailUrl: '/placeholder-property.jpg', isMain: false }
  ],
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
}

export default function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const router = useRouter()
  const [property, setProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    // TODO: 実際のAPI呼び出しに置き換える
    const fetchProperty = async () => {
      try {
        setIsLoading(true)
        // API呼び出しのシミュレーション
        await new Promise(resolve => setTimeout(resolve, 500))
        setProperty(mockProperty)
      } catch (error) {
        console.error('Failed to fetch property:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProperty()
  }, [params.id])

  const formatPrice = (price: number) => {
    if (price >= 100000000) {
      return `${(price / 100000000).toFixed(1)}億円`
    } else if (price >= 10000) {
      return `${(price / 10000).toFixed(0)}万円`
    } else {
      return `${price.toLocaleString()}円`
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">物件情報を読み込み中...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!property) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">物件が見つかりませんでした。</p>
          <Button onClick={() => router.push('/properties')}>
            物件一覧に戻る
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ページヘッダー */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              戻る
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{property.name}</h1>
              <p className="text-gray-600 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {property.address}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              共有
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              PDF出力
            </Button>
            <Button variant="outline" onClick={() => router.push(`/properties/${property.id}/edit`)}>
              <Edit className="w-4 h-4 mr-2" />
              編集
            </Button>
            <Button variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              削除
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* メイン情報 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 画像ギャラリー */}
            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-video">
                  <Image
                    src={property.images[selectedImageIndex].url}
                    alt={`${property.name} - 画像${selectedImageIndex + 1}`}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <PropertyTypeBadge type={property.propertyType} />
                    <PropertyStatusBadge status={property.status} />
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <Badge variant="secondary" className="bg-black/50 text-white">
                      <Camera className="w-3 h-3 mr-1" />
                      {selectedImageIndex + 1} / {property.images.length}
                    </Badge>
                  </div>
                </div>
                {property.images.length > 1 && (
                  <div className="p-4">
                    <div className="flex gap-2 overflow-x-auto">
                      {property.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden ${
                            selectedImageIndex === index ? 'ring-2 ring-primary' : ''
                          }`}
                        >
                          <Image
                            src={image.thumbnailUrl}
                            alt={`サムネイル ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 物件概要 */}
            <Card>
              <CardHeader>
                <CardTitle>物件概要</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">価格</span>
                      <span className="font-bold text-lg text-primary">
                        {formatPrice(property.price)}
                      </span>
                    </div>
                    {property.rent && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">賃料</span>
                        <span className="font-medium">
                          {formatPrice(property.rent)} / 月
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">間取り</span>
                      <span className="font-medium">{property.layout}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">専有面積</span>
                      <span className="font-medium">{property.area}㎡</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">築年数</span>
                      <span className="font-medium">築{property.buildingAge}年</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">構造</span>
                      <span className="font-medium">{property.structure}</span>
                    </div>
                    {property.floor && property.totalFloors && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">階数</span>
                        <span className="font-medium">
                          {property.floor}階 / {property.totalFloors}階建
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">最寄駅</span>
                      <span className="font-medium">
                        {property.nearestStation} 徒歩{property.walkingMinutes}分
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 物件詳細 */}
            <Card>
              <CardHeader>
                <CardTitle>物件詳細</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">物件説明</h4>
                    <p className="text-gray-700 leading-relaxed">
                      {property.description}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">設備・条件</h4>
                    <div className="flex flex-wrap gap-2">
                      {property.parking && (
                        <Badge variant="outline">
                          <Car className="w-3 h-3 mr-1" />
                          駐車場あり
                        </Badge>
                      )}
                      {property.petAllowed && (
                        <Badge variant="outline">ペット可</Badge>
                      )}
                      {property.furnished && (
                        <Badge variant="outline">家具付き</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 担当者情報 */}
            <Card>
              <CardHeader>
                <CardTitle>担当者情報</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="font-medium text-gray-600">
                        {property.assignedTo?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{property.assignedTo}</p>
                      <p className="text-sm text-gray-600">営業担当</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      <Phone className="w-4 h-4 mr-2" />
                      電話する
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Mail className="w-4 h-4 mr-2" />
                      メール送信
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 物件情報 */}
            <Card>
              <CardHeader>
                <CardTitle>更新情報</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">登録日</span>
                    <span>{formatDate(property.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">更新日</span>
                    <span>{formatDate(property.updatedAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">物件ID</span>
                    <span className="font-mono">{property.id}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* アクション */}
            <Card>
              <CardHeader>
                <CardTitle>アクション</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    契約書生成
                  </Button>
                  <Button variant="outline" className="w-full">
                    物件概要書作成
                  </Button>
                  <Button variant="outline" className="w-full">
                    査定書作成
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}