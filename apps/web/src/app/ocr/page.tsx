'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  FileText, 
  Brain,
  CheckCircle,
  AlertCircle,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react'
import { OcrTask, OcrStatus, PropertyOcrData, OCR_STATUS_LABELS, getConfidenceLabel, getConfidenceColor } from '@/types/ocr'

// 仮のOCRタスクデータ
const mockOcrTasks: OcrTask[] = [
  {
    id: '1',
    fileName: '新宿マンション登記簿.pdf',
    fileSize: 2048000,
    uploadedAt: '2025-01-11T10:30:00Z',
    status: 'completed',
    progress: 100,
    processingTime: 45,
    extractedData: {
      propertyName: { value: '新宿グランドマンション', confidence: 0.95 },
      address: { value: '東京都新宿区新宿3丁目1番1号', confidence: 0.92 },
      landArea: { value: 500.5, confidence: 0.88 },
      buildingArea: { value: 75.2, confidence: 0.90 },
      structure: { value: 'RC造', confidence: 0.85 },
      buildYear: { value: 2015, confidence: 0.93 },
      ownerName: { value: '株式会社○○不動産', confidence: 0.87 },
      registrationNumber: { value: '12345-6789', confidence: 0.91 }
    }
  },
  {
    id: '2',
    fileName: '渋谷戸建て登記簿.pdf',
    fileSize: 1536000,
    uploadedAt: '2025-01-11T14:15:00Z',
    status: 'processing',
    progress: 65
  }
]

export default function OcrPage() {
  const [tasks, setTasks] = useState<OcrTask[]>(mockOcrTasks)
  const [selectedTask, setSelectedTask] = useState<OcrTask | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    // 新しいタスクを作成
    const newTask: OcrTask = {
      id: Date.now().toString(),
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      status: 'uploading',
      progress: 0
    }

    setTasks(prev => [newTask, ...prev])

    // アップロード・処理のシミュレーション
    try {
      // アップロード進行状況
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setTasks(prev => prev.map(task => 
          task.id === newTask.id 
            ? { ...task, progress, status: progress === 100 ? 'uploaded' : 'uploading' }
            : task
        ))
      }

      // 処理開始
      setTasks(prev => prev.map(task => 
        task.id === newTask.id 
          ? { ...task, status: 'processing', progress: 0 }
          : task
      ))

      // 処理進行状況
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        setTasks(prev => prev.map(task => 
          task.id === newTask.id 
            ? { ...task, progress }
            : task
        ))
      }

      // 完了
      setTasks(prev => prev.map(task => 
        task.id === newTask.id 
          ? { 
              ...task, 
              status: 'completed', 
              progress: 100,
              processingTime: 45,
              extractedData: {
                propertyName: { value: 'サンプル物件', confidence: 0.85 },
                address: { value: 'サンプル住所', confidence: 0.80 }
              }
            }
          : task
      ))
    } catch (error) {
      setTasks(prev => prev.map(task => 
        task.id === newTask.id 
          ? { ...task, status: 'failed' }
          : task
      ))
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP')
  }

  const getStatusBadge = (status: OcrStatus) => {
    const config = {
      uploading: { variant: 'secondary' as const, color: 'bg-blue-500' },
      uploaded: { variant: 'secondary' as const, color: 'bg-green-500' },
      processing: { variant: 'warning' as const, color: 'bg-yellow-500' },
      completed: { variant: 'success' as const, color: 'bg-green-500' },
      failed: { variant: 'destructive' as const, color: 'bg-red-500' }
    }

    return (
      <Badge variant={config[status].variant}>
        {OCR_STATUS_LABELS[status]}
      </Badge>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ページヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI-OCR</h1>
            <p className="text-gray-600">登記簿PDFを自動解析して物件情報を抽出</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              処理履歴
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* アップロードエリア */}
          <div className="lg:col-span-2 space-y-6">
            {/* ファイルアップロード */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  登記簿PDFアップロード
                </CardTitle>
                <CardDescription>
                  PDFファイルをアップロードしてAI解析を開始します
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium">ファイルを選択してください</p>
                    <p className="text-gray-600">PDF形式、最大10MBまで</p>
                  </div>
                  <div className="mt-4">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button asChild disabled={isUploading}>
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <FileText className="w-4 h-4 mr-2" />
                        ファイルを選択
                      </label>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 処理中・完了タスク一覧 */}
            <Card>
              <CardHeader>
                <CardTitle>処理タスク一覧</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div 
                      key={task.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedTask?.id === task.id ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedTask(task)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium">{task.fileName}</p>
                            <p className="text-sm text-gray-500">
                              {formatFileSize(task.fileSize)} • {formatDate(task.uploadedAt)}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(task.status)}
                      </div>

                      {(task.status === 'uploading' || task.status === 'processing') && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              {task.status === 'uploading' ? 'アップロード中' : 'AI解析中'}
                            </span>
                            <span>{task.progress}%</span>
                          </div>
                          <Progress value={task.progress} />
                        </div>
                      )}

                      {task.status === 'completed' && task.processingTime && (
                        <p className="text-sm text-green-600">
                          解析完了 (処理時間: {task.processingTime}秒)
                        </p>
                      )}

                      {task.status === 'failed' && (
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-red-600">解析に失敗しました</p>
                          <Button variant="outline" size="sm">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            再試行
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}

                  {tasks.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>アップロードされたファイルはありません</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 抽出データ表示 */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>抽出データ</CardTitle>
                <CardDescription>
                  AI解析により抽出された物件情報
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedTask?.extractedData ? (
                  <div className="space-y-4">
                    {Object.entries(selectedTask.extractedData).map(([key, field]) => (
                      <div key={key} className="space-y-1">
                        <Label className="text-sm font-medium">
                          {getFieldLabel(key)}
                        </Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            value={field.value?.toString() || ''}
                            className="flex-1"
                            readOnly
                          />
                          <Badge 
                            variant="outline" 
                            className={getConfidenceColor(field.confidence)}
                          >
                            {getConfidenceLabel(field.confidence)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          信頼度: {Math.round(field.confidence * 100)}%
                        </p>
                      </div>
                    ))}
                    
                    <div className="pt-4 border-t">
                      <Button className="w-full">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        物件として登録
                      </Button>
                    </div>
                  </div>
                ) : selectedTask ? (
                  <div className="text-center py-8">
                    {selectedTask.status === 'processing' ? (
                      <div>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                        <p className="text-sm text-gray-600">AI解析中...</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">データが抽出されていません</p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Eye className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>タスクを選択してください</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function getFieldLabel(key: string): string {
  const labels: Record<string, string> = {
    propertyName: '物件名',
    address: '所在地',
    landArea: '土地面積（㎡）',
    buildingArea: '建物面積（㎡）',
    structure: '構造',
    buildYear: '築年',
    ownerName: '所有者名',
    ownerAddress: '所有者住所',
    ownership: '所有権',
    mortgage: '抵当権',
    registrationNumber: '登記番号',
    remarks: '備考'
  }
  return labels[key] || key
}