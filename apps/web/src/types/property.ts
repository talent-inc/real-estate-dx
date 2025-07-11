import { PaginatedResponse, PaginationParams } from './api'

export interface Property {
  id: string
  // API仕様に合わせた新フィールド
  title: string
  description?: string
  price: number
  area: number
  address: string
  prefecture: string
  city: string
  propertyType: PropertyType
  buildingType?: BuildingType
  status: PropertyStatus
  rooms?: number
  bathrooms?: number
  lat?: number
  lng?: number
  images: PropertyImage[]
  createdAt: string
  updatedAt: string
  // 既存フィールド（後方互換性のため）
  name?: string
  rent?: number
  layout?: string
  nearestStation?: string
  walkingMinutes?: number
  buildingAge?: number
  structure?: string
  floor?: number
  totalFloors?: number
  parking?: boolean
  petAllowed?: boolean
  furnished?: boolean
  assignedTo?: string
}

export interface PropertyImage {
  url: string
  thumbnailUrl: string
  isMain: boolean
}

// API仕様準拠の型
export type PropertyType = 
  | 'APARTMENT'
  | 'HOUSE'
  | 'LAND'
  | 'OFFICE'
  | 'STORE'

export type PropertyStatus = 
  | 'ACTIVE'
  | 'PENDING'
  | 'SOLD'
  | 'SUSPENDED'

export type BuildingType = 
  | 'REINFORCED_CONCRETE'
  | 'STEEL'
  | 'WOOD'
  | 'MIXED'

// 後方互換性のための旧型
export type LegacyPropertyType = 
  | 'apartment'
  | 'mansion'
  | 'house'
  | 'land'
  | 'office'
  | 'shop'

export type LegacyPropertyStatus = 
  | 'available'
  | 'negotiating'
  | 'contracted'
  | 'sold'
  | 'reserved'

export interface PropertySearchParams {
  keyword?: string
  propertyTypes?: PropertyType[]
  minPrice?: number
  maxPrice?: number
  layouts?: string[]
  minArea?: number
  maxArea?: number
  prefecture?: string
  city?: string
  nearestStation?: string
  maxWalkingMinutes?: number
  maxBuildingAge?: number
  status?: PropertyStatus[]
  features?: string[]
  sortBy?: 'price' | 'area' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

// API準拠のラベル
export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  APARTMENT: 'アパート・マンション',
  HOUSE: '戸建て',
  LAND: '土地',
  OFFICE: 'オフィス',
  STORE: '店舗'
}

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  ACTIVE: '公開中',
  PENDING: '審査中',
  SOLD: '成約済',
  SUSPENDED: '停止中'
}

export const BUILDING_TYPE_LABELS: Record<BuildingType, string> = {
  REINFORCED_CONCRETE: 'RC造',
  STEEL: 'S造',
  WOOD: '木造',
  MIXED: '混構造'
}

// 後方互換性のための旧ラベル
export const LEGACY_PROPERTY_TYPE_LABELS: Record<LegacyPropertyType, string> = {
  apartment: 'アパート',
  mansion: 'マンション',
  house: '戸建て',
  land: '土地',
  office: 'オフィス',
  shop: '店舗'
}

export const LEGACY_PROPERTY_STATUS_LABELS: Record<LegacyPropertyStatus, string> = {
  available: '公開中',
  negotiating: '商談中',
  contracted: '契約済',
  sold: '成約済',
  reserved: '予約済'
}

// API関連の型
export interface PropertyListParams extends PaginationParams {
  status?: PropertyStatus
  priceMin?: number
  priceMax?: number
  area?: string
  propertyType?: PropertyType
  search?: string
}

export interface PropertyListResponse extends PaginatedResponse<Property> {}

export interface PropertyCreateRequest {
  title: string
  description?: string
  price: number
  area: number
  address: string
  prefecture: string
  city: string
  propertyType: PropertyType
  buildingType?: BuildingType
  rooms?: number
  bathrooms?: number
  lat?: number
  lng?: number
}

export interface PropertyUpdateRequest extends Partial<PropertyCreateRequest> {}