'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  FileText, 
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface FileUploadAreaProps {
  onFileUpload: (file: File) => Promise<void>
  isUploading?: boolean
  uploadProgress?: number
}

interface UploadFile {
  file: File
  preview?: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  errorMessage?: string
}

export default function FileUploadArea({ 
  onFileUpload, 
  isUploading = false, 
  uploadProgress = 0 
}: FileUploadAreaProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      status: 'pending' as const
    }))
    
    setUploadedFiles(prev => [...prev, ...newFiles])

    for (const fileData of newFiles) {
      try {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.file === fileData.file 
              ? { ...f, status: 'uploading' }
              : f
          )
        )

        await onFileUpload(fileData.file)

        setUploadedFiles(prev => 
          prev.map(f => 
            f.file === fileData.file 
              ? { ...f, status: 'success' }
              : f
          )
        )
      } catch (error) {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.file === fileData.file 
              ? { 
                  ...f, 
                  status: 'error', 
                  errorMessage: error instanceof Error ? error.message : 'アップロードに失敗しました' 
                }
              : f
          )
        )
      }
    }
  }, [onFileUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true,
    disabled: isUploading
  })

  const removeFile = (fileToRemove: File) => {
    setUploadedFiles(prev => prev.filter(f => f.file !== fileToRemove))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* アップロードエリア */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            登記簿PDFアップロード
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-300 hover:border-gray-400'
              }
              ${isUploading ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              
              {isDragActive ? (
                <div>
                  <p className="text-lg font-medium text-primary">
                    ファイルをドロップしてください
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    PDFファイルをドラッグ＆ドロップ
                  </p>
                  <p className="text-gray-600">
                    または
                  </p>
                  <Button variant="outline" className="mt-2">
                    ファイルを選択
                  </Button>
                </div>
              )}
              
              <div className="text-sm text-gray-500">
                <p>対応形式: PDF</p>
                <p>最大ファイルサイズ: 10MB</p>
                <p>複数ファイルの同時アップロード可能</p>
              </div>
            </div>

            {isUploading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                <div className="text-center space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-gray-600">アップロード中...</p>
                  {uploadProgress > 0 && (
                    <div className="w-48 mx-auto">
                      <Progress value={uploadProgress} />
                      <p className="text-xs text-gray-500 mt-1">
                        {uploadProgress}% 完了
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* アップロードしたファイル一覧 */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>アップロードファイル</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map((fileData, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-red-500" />
                    <div>
                      <p className="font-medium text-sm">
                        {fileData.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(fileData.file.size)}
                      </p>
                      {fileData.errorMessage && (
                        <p className="text-xs text-red-600">
                          {fileData.errorMessage}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {fileData.status === 'uploading' && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    )}
                    {fileData.status === 'success' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {fileData.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(fileData.file)}
                      disabled={fileData.status === 'uploading'}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}