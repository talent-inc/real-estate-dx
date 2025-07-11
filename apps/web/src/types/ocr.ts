// API仕様に準拠した型定義
export interface OCRProcessRequest {
  file: File
  documentType: DocumentType
  tenantId?: string
  userId?: string
}

export interface OCRProcessResponse {
  success: true
  data: {
    documentInfo: DocumentInfo
    ocrResult: OCRResult
    confidence: number
    processingTime: number
  }
}

export interface DocumentInfo {
  filename: string
  fileSize: number
  pageCount: number
  documentType: DocumentType
}

export interface OCRResult {
  propertyInfo: PropertyInfo
  ownershipInfo: OwnershipInfo
  legalInfo: LegalInfo
  metadata: DocumentMetadata
}

export interface PropertyInfo {
  address: string
  landArea: number
  buildingArea: number
  buildingStructure: string
  buildingUse: string
  buildDate: string
}

export interface OwnershipInfo {
  currentOwner: string
  ownershipRatio: string
  acquisitionDate: string
  acquisitionCause: string
}

export interface LegalInfo {
  lotNumber: string
  buildingNumber: string
  landRights: string
  restrictions: string[]
}

export interface DocumentMetadata {
  documentNumber: string
  issueDate: string
  issuingAuthority: string
}

export interface OCRJobStatus {
  jobId: string
  status: JobStatus
  progress: number
  result?: OCRResult
  error?: string
}

export type DocumentType = 'property_deed' | 'building_permit' | 'survey_report' | 'contract'
export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

// 既存の型（後方互換性のため）
export interface OcrTask {
  id: string
  fileName: string
  fileSize: number
  uploadedAt: string
  status: OcrStatus
  progress: number
  extractedData?: PropertyOcrData
  errors?: OcrError[]
  processingTime?: number
}

export type OcrStatus = 
  | 'uploading'
  | 'uploaded'
  | 'processing'
  | 'completed'
  | 'failed'

export interface OcrError {
  field: string
  message: string
  confidence?: number
}

export interface PropertyOcrData {
  // 物件基本情報
  propertyName?: OcrField<string>
  address?: OcrField<string>
  landArea?: OcrField<number>
  buildingArea?: OcrField<number>
  structure?: OcrField<string>
  buildYear?: OcrField<number>
  
  // 所有者情報
  ownerName?: OcrField<string>
  ownerAddress?: OcrField<string>
  
  // 権利関係
  ownership?: OcrField<string>
  mortgage?: OcrField<string>
  
  // その他
  registrationNumber?: OcrField<string>
  remarks?: OcrField<string>
}

export interface OcrField<T> {
  value: T
  confidence: number
  position?: {
    x: number
    y: number
    width: number
    height: number
  }
  isManuallyEdited?: boolean
}

// API準拠のラベル
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  property_deed: '不動産登記簿',
  building_permit: '建築確認済証',
  survey_report: '測量図',
  contract: '売買契約書'
}

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  PENDING: '待機中',
  PROCESSING: '処理中',
  COMPLETED: '完了',
  FAILED: '失敗'
}

// 既存のラベル（後方互換性のため）
export const OCR_STATUS_LABELS: Record<OcrStatus, string> = {
  uploading: 'アップロード中',
  uploaded: 'アップロード完了',
  processing: 'AI解析中',
  completed: '解析完了',
  failed: '解析失敗'
}

export const CONFIDENCE_LEVELS = {
  HIGH: 0.8,
  MEDIUM: 0.6,
  LOW: 0.4
} as const

export function getConfidenceLabel(confidence: number): string {
  if (confidence >= CONFIDENCE_LEVELS.HIGH) return '高'
  if (confidence >= CONFIDENCE_LEVELS.MEDIUM) return '中'
  return '低'
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= CONFIDENCE_LEVELS.HIGH) return 'text-green-600'
  if (confidence >= CONFIDENCE_LEVELS.MEDIUM) return 'text-yellow-600'
  return 'text-red-600'
}