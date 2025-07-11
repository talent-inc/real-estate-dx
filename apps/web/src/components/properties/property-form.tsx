'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Property, PropertyType, PropertyStatus, PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS } from '@/types/property'
import { 
  Save, 
  X,
  Upload,
  Trash2
} from 'lucide-react'

interface PropertyFormProps {
  property?: Property
  onSave: (propertyData: Partial<Property>) => Promise<void>
  onCancel: () => void
  isEditing?: boolean
}

const LAYOUT_OPTIONS = ['1R', '1K', '1DK', '1LDK', '2K', '2DK', '2LDK', '3K', '3DK', '3LDK', '4LDK', '4LDK以上']
const STRUCTURE_OPTIONS = ['木造', 'RC造', 'SRC造', '軽量鉄骨造', '鉄骨造', 'その他']

export default function PropertyForm({ property, onSave, onCancel, isEditing = false }: PropertyFormProps) {
  const [formData, setFormData] = useState<Partial<Property>>({
    name: property?.name || '',
    address: property?.address || '',
    price: property?.price || 0,
    rent: property?.rent || 0,
    layout: property?.layout || '',
    area: property?.area || 0,
    propertyType: property?.propertyType || 'APARTMENT',
    status: property?.status || 'ACTIVE',
    description: property?.description || '',
    nearestStation: property?.nearestStation || '',
    walkingMinutes: property?.walkingMinutes || 0,
    buildingAge: property?.buildingAge || 0,
    structure: property?.structure || '',
    floor: property?.floor || 0,
    totalFloors: property?.totalFloors || 0,
    parking: property?.parking || false,
    petAllowed: property?.petAllowed || false,
    furnished: property?.furnished || false,
    assignedTo: property?.assignedTo || '',
    images: property?.images || []
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof Property, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      newErrors.name = '物件名は必須です'
    }
    if (!formData.address?.trim()) {
      newErrors.address = '所在地は必須です'
    }
    if (!formData.price || formData.price <= 0) {
      newErrors.price = '価格は正の数値で入力してください'
    }
    if (!formData.layout?.trim()) {
      newErrors.layout = '間取りは必須です'
    }
    if (!formData.area || formData.area <= 0) {
      newErrors.area = '面積は正の数値で入力してください'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      await onSave(formData)
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    // TODO: 実際の画像アップロード処理
    console.log('Image upload:', files)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 基本情報 */}
      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
          <CardDescription>
            物件の基本的な情報を入力してください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">物件名 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="例：新宿グランドマンション 301号室"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="propertyType">物件種別 *</Label>
              <Select 
                value={formData.propertyType} 
                onValueChange={(value) => handleInputChange('propertyType', value as PropertyType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="物件種別を選択" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">所在地 *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="例：東京都新宿区新宿3丁目1番1号"
              className={errors.address ? 'border-red-500' : ''}
            />
            {errors.address && (
              <p className="text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">物件説明</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="物件の特徴や周辺環境について記載してください"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* 価格・面積情報 */}
      <Card>
        <CardHeader>
          <CardTitle>価格・面積情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">価格 (円) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', Number(e.target.value))}
                placeholder="85000000"
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && (
                <p className="text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rent">賃料 (円/月)</Label>
              <Input
                id="rent"
                type="number"
                value={formData.rent}
                onChange={(e) => handleInputChange('rent', Number(e.target.value))}
                placeholder="350000"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="layout">間取り *</Label>
              <Select 
                value={formData.layout} 
                onValueChange={(value) => handleInputChange('layout', value)}
              >
                <SelectTrigger className={errors.layout ? 'border-red-500' : ''}>
                  <SelectValue placeholder="間取りを選択" />
                </SelectTrigger>
                <SelectContent>
                  {LAYOUT_OPTIONS.map((layout) => (
                    <SelectItem key={layout} value={layout}>
                      {layout}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.layout && (
                <p className="text-sm text-red-600">{errors.layout}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">専有面積 (㎡) *</Label>
              <Input
                id="area"
                type="number"
                step="0.1"
                value={formData.area}
                onChange={(e) => handleInputChange('area', Number(e.target.value))}
                placeholder="75.2"
                className={errors.area ? 'border-red-500' : ''}
              />
              {errors.area && (
                <p className="text-sm text-red-600">{errors.area}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 建物情報 */}
      <Card>
        <CardHeader>
          <CardTitle>建物情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="buildingAge">築年数</Label>
              <Input
                id="buildingAge"
                type="number"
                value={formData.buildingAge}
                onChange={(e) => handleInputChange('buildingAge', Number(e.target.value))}
                placeholder="8"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="structure">構造</Label>
              <Select 
                value={formData.structure} 
                onValueChange={(value) => handleInputChange('structure', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="構造を選択" />
                </SelectTrigger>
                <SelectContent>
                  {STRUCTURE_OPTIONS.map((structure) => (
                    <SelectItem key={structure} value={structure}>
                      {structure}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">ステータス</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleInputChange('status', value as PropertyStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="ステータスを選択" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROPERTY_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="floor">階数</Label>
              <Input
                id="floor"
                type="number"
                value={formData.floor}
                onChange={(e) => handleInputChange('floor', Number(e.target.value))}
                placeholder="3"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalFloors">総階数</Label>
              <Input
                id="totalFloors"
                type="number"
                value={formData.totalFloors}
                onChange={(e) => handleInputChange('totalFloors', Number(e.target.value))}
                placeholder="15"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* アクセス情報 */}
      <Card>
        <CardHeader>
          <CardTitle>アクセス情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nearestStation">最寄駅</Label>
              <Input
                id="nearestStation"
                value={formData.nearestStation}
                onChange={(e) => handleInputChange('nearestStation', e.target.value)}
                placeholder="JR新宿駅"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="walkingMinutes">徒歩時間 (分)</Label>
              <Input
                id="walkingMinutes"
                type="number"
                value={formData.walkingMinutes}
                onChange={(e) => handleInputChange('walkingMinutes', Number(e.target.value))}
                placeholder="5"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 設備・条件 */}
      <Card>
        <CardHeader>
          <CardTitle>設備・条件</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.parking}
                onChange={(e) => handleInputChange('parking', e.target.checked)}
                className="rounded border-gray-300"
              />
              <span>駐車場あり</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.petAllowed}
                onChange={(e) => handleInputChange('petAllowed', e.target.checked)}
                className="rounded border-gray-300"
              />
              <span>ペット可</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.furnished}
                onChange={(e) => handleInputChange('furnished', e.target.checked)}
                className="rounded border-gray-300"
              />
              <span>家具付き</span>
            </label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedTo">担当者</Label>
            <Input
              id="assignedTo"
              value={formData.assignedTo}
              onChange={(e) => handleInputChange('assignedTo', e.target.value)}
              placeholder="田中営業"
            />
          </div>
        </CardContent>
      </Card>

      {/* 画像アップロード */}
      <Card>
        <CardHeader>
          <CardTitle>物件画像</CardTitle>
          <CardDescription>
            物件の画像をアップロードしてください（最大10枚まで）
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  画像をドラッグ＆ドロップまたはクリックして選択
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Button type="button" variant="outline" asChild>
                  <label htmlFor="image-upload" className="cursor-pointer">
                    画像を選択
                  </label>
                </Button>
              </div>
            </div>

            {/* 既存画像の表示（編集時） */}
            {formData.images && formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={typeof image === 'string' ? image : image.url}
                      alt={`物件画像 ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        const newImages = formData.images?.filter((_, i) => i !== index)
                        handleInputChange('images', newImages)
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* フォームアクション */}
      <div className="flex items-center justify-end space-x-4 pt-6">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          <X className="w-4 h-4 mr-2" />
          キャンセル
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? '保存中...' : isEditing ? '更新' : '登録'}
        </Button>
      </div>
    </form>
  )
}