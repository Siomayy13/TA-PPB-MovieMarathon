import { apiClient, BASE_URL } from '../config/api'
import { getUserIdentifier } from './userService'

const WATCHLIST_KEY = 'movie_marathon_watchlist_v2'
const DEFAULT_SEED_IDS = [
  '22222222-2222-4222-8222-222222222201',
  '22222222-2222-4222-8222-222222222202',
]

const notifyWatchlistUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('watchlist-updated'))
  }
}

class WatchlistService {
  getWatchlistIds() {
    try {
      const raw = localStorage.getItem(WATCHLIST_KEY)
      return raw ? JSON.parse(raw) : DEFAULT_SEED_IDS
    } catch {
      return DEFAULT_SEED_IDS
    }
  }

  saveWatchlistIds(ids) {
    try {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(ids))
      notifyWatchlistUpdated()
    } catch {
      // ignore
    }
  }

  async syncFromApi() {
    if (!BASE_URL) return this.getWatchlistIds()
    try {
      const userId = getUserIdentifier()
      const res = await apiClient.get('/watchlist', {
        params: { user_identifier: userId },
      })
      if (Array.isArray(res) && res.length > 0) {
        const apiIds = res.map((row) => row.movie_id).filter(Boolean)
        this.saveWatchlistIds(apiIds)
        return apiIds
      }
    } catch {
      // offline fallback
    }
    return this.getWatchlistIds()
  }

  isWatchlisted(movieId) {
    const ids = this.getWatchlistIds()
    return ids.some((id) => String(id) === String(movieId))
  }

  toggleWatchlist(movieId) {
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

      // Sinkronisasi asynchronous ke Custom Express API di background
      if (BASE_URL) {
        const userId = getUserIdentifier()
        apiClient
          .post('/watchlist/toggle', {
            user_identifier: userId,
            movie_id: movieId,
          })
          .catch(() => {
            // tetap aman di localStorage saat offline
          })
      }

      return { success: true, isWatchlisted: added, ids }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  removeFromWatchlist(movieId) {
    try {
      const ids = this.getWatchlistIds().filter((id) => String(id) !== String(movieId))
      this.saveWatchlistIds(ids)

      if (BASE_URL) {
        const userId = getUserIdentifier()
        apiClient
          .delete(`/watchlist/${movieId}`, {
            params: { user_identifier: userId },
          })
          .catch(() => {})
      }

      return { success: true, ids }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }
}

export default new WatchlistService()
