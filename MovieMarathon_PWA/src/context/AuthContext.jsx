import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({
  children,
  onOpenAuthModal,
  onAuthSuccess,
  onRequestLogout,
}) {
  const [user, setUser] = useState(() => authService.getStoredUser())
  const [token, setToken] = useState(() => authService.getStoredToken())
  const [loadingAuth, setLoadingAuth] = useState(Boolean(authService.getStoredToken()))

  const syncSession = useCallback(() => {
    setUser(authService.getStoredUser())
    setToken(authService.getStoredToken())
  }, [])

  // Sinkronkan profil terbaru dari database saat aplikasi pertama dibuka jika ada token
  useEffect(() => {
    let active = true
    const init = async () => {
      if (!authService.getStoredToken()) {
        setLoadingAuth(false)
        return
      }
      try {
        const freshUser = await authService.fetchMe()
        if (active) {
          setUser(freshUser)
          setToken(authService.getStoredToken())
        }
      } finally {
        if (active) setLoadingAuth(false)
      }
    }
    init()

    window.addEventListener('auth-updated', syncSession)
    window.addEventListener('storage', syncSession)
    return () => {
      active = false
      window.removeEventListener('auth-updated', syncSession)
      window.removeEventListener('storage', syncSession)
    }
  }, [syncSession])

  const login = async (email, password) => {
    const res = await authService.login(email, password)
    setUser(res.user)
    setToken(res.token)
    if (onAuthSuccess) onAuthSuccess(res.user)
    return res.user
  }

  const register = async (payload) => {
    const res = await authService.register(payload)
    setUser(res.user)
    setToken(res.token)
    if (onAuthSuccess) onAuthSuccess(res.user)
    return res.user
  }

  const updateProfile = async (payload) => {
    const updatedUser = await authService.updateProfile(payload)
    setUser(updatedUser)
    setToken(authService.getStoredToken())
    return updatedUser
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    setToken(null)
  }

  const requestLogout = () => {
    if (onRequestLogout) {
      onRequestLogout()
    } else {
      logout()
    }
  }

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isAdmin: Boolean(user && user.role === 'admin'),
    loadingAuth,
    login,
    register,
    logout,
    requestLogout,
    updateProfile,
    refreshUser: () =>
      authService.fetchMe().then((u) => {
        setUser(u)
        return u
      }),
    openAuthModal: (defaultMode = 'login') => onOpenAuthModal && onOpenAuthModal(defaultMode),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider')
  }
  return ctx
}
