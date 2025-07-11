import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { AuthState, AuthActions, User, LoginRequest } from '@/types/auth'
import { apiClient } from '@/lib/api-client'

interface AuthStore extends AuthState, AuthActions {}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      loading: false,

      // Actions
      login: async (credentials: LoginRequest) => {
        set({ loading: true })
        
        try {
          const response = await apiClient.post('/auth/login', credentials)
          
          if (response.success && response.data) {
            const { accessToken, refreshToken, user } = response.data as { accessToken: string; refreshToken: string; user: User }
            
            set({
              isAuthenticated: true,
              user,
              accessToken,
              refreshToken,
              loading: false,
            })

            // APIクライアントに認証情報を設定
            apiClient.setTenantId(user.tenantId)
            apiClient.setTokenProvider(() => get().accessToken)
          } else {
            throw new Error('ログインに失敗しました')
          }
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          refreshToken: null,
          loading: false,
        })

        // APIクライアントの認証情報をクリア
        apiClient.setTokenProvider(() => null)

        // ローカルストレージからも削除
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage')
        }
      },

      refresh: async () => {
        const { refreshToken } = get()
        
        if (!refreshToken) {
          throw new Error('リフレッシュトークンがありません')
        }

        try {
          const response = await apiClient.post('/auth/refresh', { refreshToken })
          
          if (response.success && response.data) {
            const { accessToken, refreshToken: newRefreshToken, user } = response.data as { accessToken: string; refreshToken: string; user: User }
            
            set({
              accessToken,
              refreshToken: newRefreshToken,
              user,
            })

            // APIクライアントに新しいトークンを設定
            apiClient.setTokenProvider(() => get().accessToken)
          } else {
            throw new Error('トークンの更新に失敗しました')
          }
        } catch (error) {
          // リフレッシュに失敗した場合はログアウト
          get().logout()
          throw error
        }
      },

      setUser: (user: User) => {
        set({ user })
      },

      setTokens: (accessToken: string, refreshToken: string) => {
        set({ accessToken, refreshToken })
        
        // APIクライアントにトークンを設定
        apiClient.setTokenProvider(() => get().accessToken)
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        // サーバーサイドレンダリング時はlocalStorageが使えないため
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          }
        }
        return localStorage
      }),
      // パスワードなどの機密情報は永続化しない
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
)

// 初期化時にAPIクライアントに認証情報を設定
if (typeof window !== 'undefined') {
  const store = useAuthStore.getState()
  if (store.accessToken && store.user) {
    apiClient.setTenantId(store.user.tenantId)
    apiClient.setTokenProvider(() => useAuthStore.getState().accessToken)
  }
}

// トークンの有効期限チェック
export const checkTokenExpiry = () => {
  const { accessToken, refresh, logout } = useAuthStore.getState()
  
  if (!accessToken) return
  
  try {
    // JWTの有効期限をチェック（簡易実装）
    const payload = JSON.parse(atob(accessToken.split('.')[1]))
    const now = Date.now() / 1000
    
    // 有効期限の5分前にリフレッシュ
    if (payload.exp - now < 300) {
      refresh().catch(() => {
        console.warn('Token refresh failed, logging out')
        logout()
      })
    }
  } catch (error) {
    console.error('Token validation error:', error)
    logout()
  }
}

// 定期的なトークンチェック（5分間隔）
if (typeof window !== 'undefined') {
  setInterval(checkTokenExpiry, 5 * 60 * 1000)
}