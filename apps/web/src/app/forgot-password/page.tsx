'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // TODO: API呼び出しの実装
      console.log('Password reset request for:', email)
      
      // 仮の送信成功処理
      setTimeout(() => {
        setIsSubmitted(true)
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Password reset error:', error)
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-green-600">
              送信完了
            </CardTitle>
            <CardDescription className="text-center">
              パスワードリセットのメールを送信しました
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              <strong>{email}</strong> にパスワードリセット用のメールを送信しました。
              メール内のリンクをクリックして、新しいパスワードを設定してください。
            </p>
            <p className="text-xs text-gray-500 text-center">
              メールが届かない場合は、迷惑メールフォルダもご確認ください。
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/login">ログイン画面に戻る</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            パスワードリセット
          </CardTitle>
          <CardDescription className="text-center">
            登録時のメールアドレスを入力してください
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
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-gray-500">
              入力されたメールアドレスにパスワードリセット用のリンクを送信します。
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? '送信中...' : 'リセットメールを送信'}
            </Button>
            <div className="text-center text-sm">
              <Link 
                href="/login" 
                className="text-primary hover:underline"
              >
                ログイン画面に戻る
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}