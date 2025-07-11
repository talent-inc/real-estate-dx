'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Home, 
  Building, 
  Upload,
  Zap
} from 'lucide-react'

const navigationItems = [
  {
    title: 'ダッシュボード',
    href: '/dashboard',
    icon: Home,
    description: '概要とサマリー'
  },
  {
    title: '物件管理',
    href: '/properties',
    icon: Building,
    description: '物件の登録・管理'
  },
  {
    title: 'AI-OCR',
    href: '/ocr',
    icon: Upload,
    description: '登記簿の自動読み取り'
  },
  {
    title: 'API連携テスト',
    href: '/api-test',
    icon: Zap,
    description: 'API接続確認'
  },
]

interface SidebarProps {
  className?: string
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("flex flex-col w-64 bg-gray-50 border-r border-gray-200", className)}>
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex-1 px-3 space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    isActive
                      ? "text-primary-foreground"
                      : "text-gray-400 group-hover:text-gray-500"
                  )}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">{item.title}</div>
                  <div className={cn(
                    "text-xs",
                    isActive
                      ? "text-primary-foreground/80"
                      : "text-gray-500"
                  )}>
                    {item.description}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
      
      {/* フッター情報 */}
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <div className="flex-shrink-0 w-full group block">
          <div className="flex items-center">
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
                不動産売買DXシステム
              </p>
              <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                Version 1.0.0 Alpha
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}