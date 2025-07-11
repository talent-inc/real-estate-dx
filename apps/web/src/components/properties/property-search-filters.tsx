'use client'

import { useState } from 'react'
import { PropertySearchParams, PropertyType, PropertyStatus, PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS } from '@/types/property'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface PropertySearchFiltersProps {
  onSearch: (params: PropertySearchParams) => void
  initialParams?: PropertySearchParams
}

const LAYOUT_OPTIONS = ['1R', '1K', '1DK', '1LDK', '2K', '2DK', '2LDK', '3K', '3DK', '3LDK', '4LDK以上']

export default function PropertySearchFilters({ onSearch, initialParams = {} }: PropertySearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchParams, setSearchParams] = useState<PropertySearchParams>(initialParams)

  const handleInputChange = (field: keyof PropertySearchParams, value: any) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayToggle = (field: keyof PropertySearchParams, value: string) => {
    setSearchParams(prev => {
      const currentArray = (prev[field] as string[]) || []
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value]
      
      return {
        ...prev,
        [field]: newArray.length > 0 ? newArray : undefined
      }
    })
  }

  const handleSearch = () => {
    onSearch(searchParams)
  }

  const handleReset = () => {
    setSearchParams({})
    onSearch({})
  }

  const getActiveFiltersCount = () => {
    return Object.entries(searchParams).filter(([key, value]) => {
      if (key === 'keyword') return value && value.length > 0
      if (Array.isArray(value)) return value.length > 0
      return value !== undefined && value !== null && value !== ''
    }).length
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            検索・フィルター
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* フリーワード検索 */}
        <div className="space-y-2">
          <Label htmlFor="keyword">フリーワード</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="keyword"
              placeholder="物件名、住所、駅名で検索"
              value={searchParams.keyword || ''}
              onChange={(e) => handleInputChange('keyword', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* 価格帯 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minPrice">最低価格（万円）</Label>
            <Input
              id="minPrice"
              type="number"
              placeholder="0"
              value={searchParams.minPrice || ''}
              onChange={(e) => handleInputChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxPrice">最高価格（万円）</Label>
            <Input
              id="maxPrice"
              type="number"
              placeholder="無制限"
              value={searchParams.maxPrice || ''}
              onChange={(e) => handleInputChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
        </div>

        {/* 詳細検索（展開時のみ表示） */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            {/* 物件種別 */}
            <div className="space-y-2">
              <Label>物件種別</Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(PROPERTY_TYPE_LABELS).map(([type, label]) => {
                  const isSelected = searchParams.propertyTypes?.includes(type as PropertyType)
                  return (
                    <Badge
                      key={type}
                      variant={isSelected ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleArrayToggle('propertyTypes', type)}
                    >
                      {label}
                    </Badge>
                  )
                })}
              </div>
            </div>

            {/* 間取り */}
            <div className="space-y-2">
              <Label>間取り</Label>
              <div className="flex flex-wrap gap-2">
                {LAYOUT_OPTIONS.map((layout) => {
                  const isSelected = searchParams.layouts?.includes(layout)
                  return (
                    <Badge
                      key={layout}
                      variant={isSelected ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleArrayToggle('layouts', layout)}
                    >
                      {layout}
                    </Badge>
                  )
                })}
              </div>
            </div>

            {/* 面積 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minArea">最小面積（㎡）</Label>
                <Input
                  id="minArea"
                  type="number"
                  placeholder="0"
                  value={searchParams.minArea || ''}
                  onChange={(e) => handleInputChange('minArea', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxArea">最大面積（㎡）</Label>
                <Input
                  id="maxArea"
                  type="number"
                  placeholder="無制限"
                  value={searchParams.maxArea || ''}
                  onChange={(e) => handleInputChange('maxArea', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
            </div>

            {/* ステータス */}
            <div className="space-y-2">
              <Label>ステータス</Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(PROPERTY_STATUS_LABELS).map(([status, label]) => {
                  const isSelected = searchParams.status?.includes(status as PropertyStatus)
                  return (
                    <Badge
                      key={status}
                      variant={isSelected ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleArrayToggle('status', status)}
                    >
                      {label}
                    </Badge>
                  )
                })}
              </div>
            </div>

            {/* その他の条件 */}
            <div className="space-y-2">
              <Label>その他の条件</Label>
              <div className="flex flex-wrap gap-2">
                {['駐車場あり', 'ペット可', '家具付き'].map((feature) => {
                  const isSelected = searchParams.features?.includes(feature)
                  return (
                    <Badge
                      key={feature}
                      variant={isSelected ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleArrayToggle('features', feature)}
                    >
                      {feature}
                    </Badge>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex gap-2 pt-4">
          <Button onClick={handleSearch} className="flex-1">
            <Search className="w-4 h-4 mr-2" />
            検索
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <X className="w-4 h-4 mr-2" />
            リセット
          </Button>
        </div>

        {/* アクティブフィルターの表示 */}
        {getActiveFiltersCount() > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Filter className="w-4 h-4" />
              適用中の条件:
            </div>
            <div className="flex flex-wrap gap-2">
              {searchParams.keyword && (
                <Badge variant="secondary">
                  キーワード: {searchParams.keyword}
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer" 
                    onClick={() => handleInputChange('keyword', '')}
                  />
                </Badge>
              )}
              {searchParams.propertyTypes?.map(type => (
                <Badge key={type} variant="secondary">
                  {PROPERTY_TYPE_LABELS[type]}
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer" 
                    onClick={() => handleArrayToggle('propertyTypes', type)}
                  />
                </Badge>
              ))}
              {/* 他の条件も同様に表示 */}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}