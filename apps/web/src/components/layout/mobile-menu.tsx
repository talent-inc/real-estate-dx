'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

const menuItems = [
  { href: '/dashboard', label: 'ダッシュボード', icon: '🏠' },
  { href: '/properties', label: '物件管理', icon: '🏢' },
  { href: '/ocr', label: 'OCR処理', icon: '📄' },
  { href: '/analytics', label: '分析', icon: '📊' },
]

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname()

  // ESCキーでメニューを閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // メニューが開いている時はスクロールを無効化
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      {/* オーバーレイ */}
      <div
        className={cn(
          "fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-all duration-[var(--duration-normal)] lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* メニューパネル */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-[280px] bg-[var(--surface)] shadow-[var(--shadow-lg)] z-50 transition-transform duration-[var(--duration-normal)] ease-[var(--ease-out)] lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* ヘッダー */}
        <div className="p-[var(--space-lg)] border-b border-[var(--border)]">
          <h2 className="text-[var(--text-lg)] font-[var(--semibold)] text-[var(--ink)]">
            メニュー
          </h2>
        </div>

        {/* ナビゲーション */}
        <nav className="p-[var(--space-md)]">
          <ul className="space-y-[var(--space-xs)]">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-[var(--space-md)] px-[var(--space-md)] py-[var(--space-sm)] rounded-[10px] text-[var(--text-base)] transition-all duration-[var(--duration-fast)]",
                      isActive
                        ? "bg-[var(--tint)] text-white"
                        : "text-[var(--ink)] hover:bg-[var(--surface-elevated)]"
                    )}
                    onClick={onClose}
                  >
                    <span className="text-[20px]">{item.icon}</span>
                    <span className="font-[var(--medium)]">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* フッター */}
        <div className="absolute bottom-0 left-0 right-0 p-[var(--space-lg)] border-t border-[var(--border)]">
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              // ログアウト処理
              onClose()
            }}
          >
            ログアウト
          </Button>
        </div>
      </div>
    </>
  )
}