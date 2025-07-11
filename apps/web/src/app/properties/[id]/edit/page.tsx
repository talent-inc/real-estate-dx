'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/dashboard-layout'
import PropertyForm from '@/components/properties/property-form'
import { Property } from '@/types/property'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PropertyEditPageProps {
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
  description: '新宿駅徒歩5分の好立地に位置するグランドマンション。南向きの明るいお部屋で、リビングからは東京の街並みを一望できます。',
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
}

export default function PropertyEditPage({ params }: PropertyEditPageProps) {
  const router = useRouter()
  const [property, setProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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

  const handleSave = async (propertyData: Partial<Property>) => {
    try {
      // TODO: API呼び出しで物件を更新
      console.log('Updating property:', propertyData)
      
      // 仮の保存処理
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 成功時は物件詳細ページに戻る
      router.push(`/properties/${params.id}`)
    } catch (error) {
      console.error('Failed to update property:', error)
      // エラーハンドリング
    }
  }

  const handleCancel = () => {
    router.push(`/properties/${params.id}`)
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
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">物件編集</h1>
            <p className="text-gray-600">{property.name}</p>
          </div>
        </div>

        {/* 物件フォーム */}
        <PropertyForm
          property={property}
          onSave={handleSave}
          onCancel={handleCancel}
          isEditing={true}
        />
      </div>
    </DashboardLayout>
  )
}