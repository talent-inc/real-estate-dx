'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiClient } from '@/lib/api-client'
import { authService } from '@/services/auth.service'
import { propertyService } from '@/services/property.service'
import { useToast } from '@/hooks/useToast'
import { useErrorHandler } from '@/hooks/useErrorHandler'

export default function ApiTestPage() {
  const [results, setResults] = useState<{ [key: string]: any }>({})
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({})
  const { showSuccess, showError } = useToast()
  const { handleError } = useErrorHandler()

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setLoading(prev => ({ ...prev, [testName]: true }))
    try {
      const result = await testFn()
      setResults(prev => ({ ...prev, [testName]: { success: true, data: result } }))
      showSuccess(`${testName} テスト成功`)
    } catch (error) {
      const errorInfo = handleError(error, { showToast: false })
      setResults(prev => ({ 
        ...prev, 
        [testName]: { 
          success: false, 
          error: errorInfo.message,
          code: errorInfo.code 
        } 
      }))
      showError(`${testName} テスト失敗: ${errorInfo.message}`)
    } finally {
      setLoading(prev => ({ ...prev, [testName]: false }))
    }
  }

  const tests = [
    {
      name: 'ヘルスチェック',
      description: 'APIサーバーの状態確認',
      testFn: () => apiClient.healthCheck()
    },
    {
      name: '認証なし物件一覧',
      description: '認証なしでの物件一覧取得テスト（401エラー想定）',
      testFn: () => propertyService.getProperties()
    },
    {
      name: 'ユーザー登録',
      description: 'テストユーザーの新規登録',
      testFn: () => authService.register({
        email: 'test@example.com',
        password: 'testpassword123',
        name: 'テストユーザー',
        tenantId: 'test-tenant'
      })
    },
    {
      name: 'ログイン',
      description: 'テストユーザーでのログイン',
      testFn: () => authService.login({
        email: 'test@example.com',
        password: 'testpassword123',
        tenantId: 'test-tenant'
      })
    },
    {
      name: '認証後物件一覧',
      description: '認証後の物件一覧取得',
      testFn: () => propertyService.getProperties()
    },
    {
      name: '物件作成',
      description: '新規物件の作成テスト',
      testFn: () => propertyService.createProperty({
        title: 'テスト物件',
        description: 'API連携テスト用の物件です',
        price: 50000000,
        area: 60.5,
        address: '東京都テスト区テスト町1-1-1',
        prefecture: '東京都',
        city: 'テスト区',
        propertyType: 'APARTMENT',
        buildingType: 'REINFORCED_CONCRETE',
        rooms: 3,
        bathrooms: 1
      })
    }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ページヘッダー */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API連携テスト</h1>
          <p className="text-gray-600">
            バックエンドAPIとの接続確認とテストを行います
          </p>
        </div>

        {/* テスト実行ボタン */}
        <Card>
          <CardHeader>
            <CardTitle>API接続テスト</CardTitle>
            <CardDescription>
              各APIエンドポイントとの連携をテストします
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tests.map((test) => (
                <Button
                  key={test.name}
                  onClick={() => runTest(test.name, test.testFn)}
                  disabled={loading[test.name]}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start"
                >
                  <div className="font-semibold">{test.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {test.description}
                  </div>
                  {loading[test.name] && (
                    <div className="mt-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    </div>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 全テスト実行 */}
        <Card>
          <CardContent className="pt-6">
            <Button
              onClick={async () => {
                for (const test of tests) {
                  await runTest(test.name, test.testFn)
                  // テスト間の間隔
                  await new Promise(resolve => setTimeout(resolve, 500))
                }
              }}
              disabled={Object.values(loading).some(Boolean)}
              className="w-full"
            >
              全テスト実行
            </Button>
          </CardContent>
        </Card>

        {/* テスト結果 */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">テスト結果</h2>
          {Object.entries(results).map(([testName, result]) => (
            <Card key={testName}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result.success ? (
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  ) : (
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  )}
                  {testName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.success ? (
                  <div>
                    <p className="text-green-600 mb-2">✅ 成功</p>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div>
                    <p className="text-red-600 mb-2">❌ 失敗</p>
                    <p className="text-sm text-gray-600 mb-2">
                      エラー: {result.error}
                    </p>
                    {result.code && (
                      <p className="text-xs text-gray-500">
                        コード: {result.code}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}