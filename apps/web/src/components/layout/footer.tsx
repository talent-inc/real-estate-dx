import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center space-x-6 md:order-2">
            <Link 
              href="/privacy" 
              className="text-gray-400 hover:text-gray-500 text-sm"
            >
              プライバシーポリシー
            </Link>
            <Link 
              href="/terms" 
              className="text-gray-400 hover:text-gray-500 text-sm"
            >
              利用規約
            </Link>
            <Link 
              href="/help" 
              className="text-gray-400 hover:text-gray-500 text-sm"
            >
              ヘルプ
            </Link>
            <Link 
              href="/contact" 
              className="text-gray-400 hover:text-gray-500 text-sm"
            >
              お問い合わせ
            </Link>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-sm text-gray-400">
              &copy; 2025 不動産売買DXシステム. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}