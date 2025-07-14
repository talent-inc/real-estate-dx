'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { MobileMenu } from './mobile-menu'
import { 
  Home, 
  Building, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  User
} from 'lucide-react'

export default function Header() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    // TODO: ログアウト処理の実装
    console.log('Logging out...')
    router.push('/login')
  }

  const navigationItems = [
    { href: '/dashboard', label: 'ダッシュボード', icon: Home },
    { href: '/properties', label: '物件管理', icon: Building },
    { href: '/documents', label: '書類管理', icon: FileText },
    { href: '/settings', label: '設定', icon: Settings },
  ]

  return (
    <>
      <header className="bg-[var(--surface)] border-b border-[var(--border)] sticky top-0 z-30 backdrop-blur-xl bg-opacity-80">
        <div className="max-w-[980px] mx-auto px-[var(--space-lg)]">
          <div className="flex justify-between items-center h-16">
            {/* ロゴ・タイトル */}
            <div className="flex items-center">
              {/* モバイルメニューボタン */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden mr-[var(--space-sm)]"
                onClick={() => setIsMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <Link href="/dashboard" className="flex items-center gap-[var(--space-sm)]">
                <Building className="h-8 w-8 text-[var(--tint)]" />
                <span className="text-[var(--text-xl)] font-[var(--semibold)] text-[var(--ink)]">
                  不動産DX
                </span>
              </Link>
            </div>

            {/* デスクトップナビゲーション */}
            <nav className="hidden lg:flex gap-[var(--space-sm)]">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-[var(--space-xs)] px-[var(--space-md)] py-[var(--space-sm)] rounded-[10px] text-[var(--text-base)] font-[var(--medium)] text-[var(--ink)] hover:bg-[var(--surface-elevated)] transition-all duration-[var(--duration-fast)]"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* ユーザーメニュー */}
            <div className="hidden lg:flex items-center gap-[var(--space-md)]">
              <div className="flex items-center gap-[var(--space-sm)] text-[var(--text-sm)] text-[var(--ink-secondary)]">
                <User className="h-4 w-4" />
                <span>山田 太郎</span>
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center gap-[var(--space-xs)]"
              >
                <LogOut className="h-4 w-4" />
                <span>ログアウト</span>
              </Button>
            </div>

            {/* モバイル用ユーザーアイコン */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
              >
                <User className="h-5 w-5 text-[var(--ink)]" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* モバイルメニュー */}
      <MobileMenu 
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </>
  )
}