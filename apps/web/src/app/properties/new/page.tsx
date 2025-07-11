'use client'

import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/dashboard-layout'
import PropertyForm from '@/components/properties/property-form'
import { Property } from '@/types/property'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NewPropertyPage() {
  const router = useRouter()

  const handleSave = async (propertyData: Partial<Property>) => {
    try {
      // TODO: API呼び出しで物件を作成
      console.log('Creating property:', propertyData)
      
      // 仮の保存処理
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 成功時は物件一覧に戻る
      router.push('/properties')
    } catch (error) {
      console.error('Failed to create property:', error)
      // エラーハンドリング
    }
  }

  const handleCancel = () => {
    router.back()
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
            <h1 className="text-3xl font-bold text-gray-900">新規物件登録</h1>
            <p className="text-gray-600">新しい物件情報を登録します</p>
          </div>
        </div>

        {/* 物件フォーム */}
        <PropertyForm
          onSave={handleSave}
          onCancel={handleCancel}
          isEditing={false}
        />
      </div>
    </DashboardLayout>
  )
}