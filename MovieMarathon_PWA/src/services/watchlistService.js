import { apiClient, BASE_URL } from '../config/api'
import authService from './authService'

const keyForUser = (userId) => `movie_marathon_watchlist_user_${userId}`

const notifyWatchlistUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('watchlist-updated'))
  }
}

class WatchlistService {
  getCurrentUserId() {
    return authService.getStoredUser()?.id || null
  }

  getWatchlistIds() {
    const userId = this.getCurrentUserId()
    if (!userId) return []
    try {
      const raw = localStorage.getItem(keyForUser(userId))
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  saveWatchlistIds(ids) {
    const userId = this.getCurrentUserId()
    if (!userId) return
    try {
      localStorage.setItem(keyForUser(userId), JSON.stringify(ids))
      notifyWatchlistUpdated()
    } catch {
      // ignore
    }
  }

  async syncFromApi() {
    const userId = this.getCurrentUserId()
    if (!userId) return []
    if (!BASE_URL) return this.getWatchlistIds()
    try {
      const res = await apiClient.get('/watchlist')
      if (Array.isArray(res)) {
        const apiIds = res.map((row) => row.movie_id).filter(Boolean)
        this.saveWatchlistIds(apiIds)
        return apiIds
      }
    } catch {
      // fallback ke cache user saat offline
    }
    return this.getWatchlistIds()
  }

  isWatchlisted(movieId) {
    const ids = this.getWatchlistIds()
    return ids.some((id) => String(id) === String(movieId))
  }

  toggleWatchlist(movieId) {
    const userId = this.getCurrentUserId()
    if (!userId) {
      return { success: false, requiresAuth: true, error: 'Silakan login terlebih dahulu.' }
    }
    try {
      const ids = [...this.getWatchlistIds()]
      const index = ids.findIndex((id) => String(id) === String(movieId))
      let added = false

      if (index === -1) {
        ids.push(movieId)
        added = true
      } else {
        ids.splice(index, 1)
        added = false
      }

      this.saveWatchlistIds(ids)

      if (BASE_URL) {
        apiClient.post('/watchlist/toggle', { movie_id: movieId }).catch(() => {})
      }

      return { success: true, isWatchlisted: added, ids }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }
}

export default new WatchlistService()
