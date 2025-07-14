'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton'
import { 
  Building, 
  FileText, 
  Upload, 
  TrendingUp,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)

  // データの取得をシミュレート
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // 仮のデータ
  const stats = [
    {
      title: '総物件数',
      value: '127',
      change: '+8',
      changeType: 'positive' as const,
      icon: Building,
      description: '今月新規登録'
    },
    {
      title: 'AI-OCR処理数',
      value: '43',
      change: '+12',
      changeType: 'positive' as const,
      icon: Upload,
      description: '今月処理完了'
    },
    {
      title: '進行中案件',
      value: '18',
      change: '-3',
      changeType: 'negative' as const,
      icon: FileText,
      description: '要対応'
    },
    {
      title: '成約率',
      value: '68%',
      change: '+5%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      description: '前月比'
    }
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'property',
      title: '新宿区マンション物件が登録されました',
      time: '2時間前',
      status: 'success'
    },
    {
      id: 2,
      type: 'ocr',
      title: '登記簿OCR処理が完了しました',
      time: '4時間前',
      status: 'success'
    },
    {
      id: 3,
      type: 'alert',
      title: '価格更新が必要な物件があります',
      time: '6時間前',
      status: 'warning'
    },
    {
      id: 4,
      type: 'property',
      title: '渋谷区戸建て物件の契約が成立しました',
      time: '1日前',
      status: 'success'
    }
  ]

  return (
    <DashboardLayout>
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-6">
        {/* ページヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
            <p className="text-gray-600">不動産売買業務の概要をご確認いただけます</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              今月のレポート
            </Button>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              登記簿アップロード
            </Button>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="flex items-center space-x-1 text-xs">
                  <span className={`${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-gray-500">{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 最近のアクティビティ */}
          <Card>
            <CardHeader>
              <CardTitle>最近のアクティビティ</CardTitle>
              <CardDescription>
                システム内での最新の活動状況
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`mt-1 ${
                      activity.status === 'success' ? 'text-green-500' : 'text-orange-500'
                    }`}>
                      {activity.status === 'success' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" className="w-full">
                  すべてのアクティビティを表示
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* クイックアクション */}
          <Card>
            <CardHeader>
              <CardTitle>クイックアクション</CardTitle>
              <CardDescription>
                よく使用する機能への素早いアクセス
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <Button variant="outline" className="justify-start h-auto p-4">
                  <Building className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">新規物件登録</div>
                    <div className="text-xs text-gray-500">物件情報を手動で登録</div>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4">
                  <Upload className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">AI-OCR処理</div>
                    <div className="text-xs text-gray-500">登記簿PDFを自動解析</div>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4">
                  <FileText className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">契約書生成</div>
                    <div className="text-xs text-gray-500">物件情報から自動生成</div>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4">
                  <Users className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">顧客管理</div>
                    <div className="text-xs text-gray-500">顧客情報の登録・管理</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      )}
    </DashboardLayout>
  )
}