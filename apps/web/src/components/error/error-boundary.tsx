'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-[var(--space-lg)]">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-[var(--space-md)] w-[64px] h-[64px] rounded-full bg-[var(--critical)]/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-[var(--critical)]" />
              </div>
              <CardTitle className="text-[var(--text-xl)]">エラーが発生しました</CardTitle>
              <CardDescription className="text-[var(--text-sm)] text-[var(--ink-secondary)]">
                申し訳ございません。予期しないエラーが発生しました。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-[var(--space-md)]">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-[var(--space-md)] bg-[var(--surface-elevated)] rounded-[10px] text-[var(--text-xs)] font-mono overflow-auto max-h-[200px]">
                  <p className="font-[var(--semibold)] text-[var(--critical)] mb-[var(--space-xs)]">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="text-[var(--ink-secondary)] whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-[var(--space-sm)]">
                <Button
                  onClick={this.handleReset}
                  className="flex-1"
                  variant="primary"
                >
                  <RefreshCw className="w-4 h-4 mr-[var(--space-xs)]" />
                  再試行
                </Button>
                <Button
                  onClick={() => window.location.href = '/dashboard'}
                  className="flex-1"
                  variant="secondary"
                >
                  <Home className="w-4 h-4 mr-[var(--space-xs)]" />
                  ホームへ戻る
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}