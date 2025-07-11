import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            不動産売買DXシステム
          </h1>
          <p className="text-xl text-gray-600">
            次世代の不動産売買業務支援システムへようこそ
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>AI-OCR機能</CardTitle>
              <CardDescription>
                登記簿PDFを自動解析し、物件情報を即座にデータ化
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Gemini APIを活用した高精度なOCR処理により、手入力の手間を大幅に削減します。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>物件管理</CardTitle>
              <CardDescription>
                物件情報の一元管理と効率的な検索
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                売買物件の情報を一元管理し、条件に応じた検索・フィルタリングが可能です。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>外部連携</CardTitle>
              <CardDescription>
                レインズや不動産ポータルサイトとの自動連携
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                主要な不動産情報サービスとの連携により、物件情報の掲載・更新を自動化します。
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <Button size="lg" asChild>
            <a href="/login">ログインして始める</a>
          </Button>
        </div>
      </div>
    </div>
  )
}