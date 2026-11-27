import { useState, useEffect, useCallback } from 'react'
import watchlistService from '../services/watchlistService'
import { useAuth } from '../context/AuthContext'

export function useWatchlist() {
  const { isAuthenticated, user, openAuthModal } = useAuth()
  const [watchlistIds, setWatchlistIds] = useState(() =>
    isAuthenticated ? watchlistService.getWatchlistIds() : [],
  )

  const refresh = useCallback(() => {
    if (!isAuthenticated) {
      setWatchlistIds([])
      return
    }
    setWatchlistIds(watchlistService.getWatchlistIds())
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) {
      setWatchlistIds([])
      return
    }
    setWatchlistIds(watchlistService.getWatchlistIds())
    watchlistService.syncFromApi().then((ids) => {
      if (Array.isArray(ids)) setWatchlistIds(ids)
    })

    const handleSync = () => refresh()
    window.addEventListener('storage', handleSync)
    window.addEventListener('watchlist-updated', handleSync)
    return () => {
      window.removeEventListener('storage', handleSync)
      window.removeEventListener('watchlist-updated', handleSync)
    }
  }, [isAuthenticated, user?.id, refresh])

  const toggleWatchlist = (movieId) => {
    if (!isAuthenticated) {
      openAuthModal('login')
      return { success: false, requiresAuth: true }
    }
    const res = watchlistService.toggleWatchlist(movieId)
    if (res.success) {
      setWatchlistIds([...res.ids])
    }
    return res
  }

  const isWatchlisted = (movieId) => {
    if (!isAuthenticated) return false
    return watchlistIds.some((id) => String(id) === String(movieId))
  }

  return {
    watchlistIds,
    watchlistCount: watchlistIds.length,
    toggleWatchlist,
    isWatchlisted,
    refresh,
  }
}
