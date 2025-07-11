'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth'
import { useToast } from '@/hooks/useToast'
import { useErrorHandler } from '@/hooks/useErrorHandler'

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore(state => state.login)
  const loading = useAuthStore(state => state.loading)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tenantId, setTenantId] = useState('default-tenant')
  const { showSuccess, showError } = useToast()
  const { handleError } = useErrorHandler()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await login({
        email,
        password,
        tenantId
      })
      
      showSuccess('ログインに成功しました')
      router.push('/dashboard')
    } catch (error) {
      handleError(error, {
        fallbackMessage: 'ログインに失敗しました。メールアドレスとパスワードを確認してください。'
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            ログイン
          </CardTitle>
          <CardDescription className="text-center">
            不動産売買DXシステムへようこそ
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenantId">テナントID</Label>
              <Input
                id="tenantId"
                type="text"
                placeholder="default-tenant"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <Link 
                href="/forgot-password" 
                className="text-primary hover:underline"
              >
                パスワードを忘れた方はこちら
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </Button>
            <div className="text-center text-sm">
              アカウントをお持ちでない方は
              <Link 
                href="/signup" 
                className="text-primary hover:underline ml-1"
              >
                新規登録
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}