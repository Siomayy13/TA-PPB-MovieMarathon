import { apiClient, BASE_URL } from '../config/api'
import authService from './authService'

const keyForUser = (userId) => `movie_marathon_history_user_${userId}`
const watchedEpsKey = (userId, movieId) => `movie_marathon_watched_eps_${userId}_${movieId}`

const emitHistoryUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('history-updated'))
  }
}

const getStoredHistory = (userId) => {
  if (!userId) return []
  try {
    const raw = localStorage.getItem(keyForUser(userId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const saveStoredHistory = (userId, list) => {
  if (!userId) return
  try {
    localStorage.setItem(keyForUser(userId), JSON.stringify(list))
    emitHistoryUpdated()
  } catch {
    // ignore
  }
}

class HistoryService {
  getCurrentUserId() {
    return authService.getStoredUser()?.id || null
  }

  getWatchedEpisodeNumbers(movieId) {
    const userId = this.getCurrentUserId()
    if (!userId || !movieId) return null
    try {
      const raw = localStorage.getItem(watchedEpsKey(userId, movieId))
      if (!raw) return null
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.map(Number).filter((n) => n > 0) : null
    } catch {
      return null
    }
  }

  saveWatchedEpisodeNumbers(movieId, numbers = []) {
    const userId = this.getCurrentUserId()
    if (!userId || !movieId) return
    try {
      const clean = Array.from(new Set(numbers.map(Number).filter((n) => n > 0))).sort(
        (a, b) => a - b,
      )
      localStorage.setItem(watchedEpsKey(userId, movieId), JSON.stringify(clean))
    } catch {
      // ignore
    }
  }

  async getHistory() {
    const userId = this.getCurrentUserId()
    if (!userId) return { success: false, requiresAuth: true, data: [] }

    if (BASE_URL) {
      try {
        const res = await apiClient.get('/history')
        if (Array.isArray(res)) {
          saveStoredHistory(userId, res)
          return { success: true, data: res, source: 'api' }
        }
      } catch (err) {
        console.info('[HistoryService] API offline, memuat histori cache lokal:', err.message)
      }
    }

    return { success: true, data: getStoredHistory(userId), source: 'local' }
  }

  async getMovieHistory(movieId) {
    const res = await this.getHistory()
    if (!res.success || !Array.isArray(res.data)) return null
    return res.data.find((h) => String(h.movie_id) === String(movieId)) || null
  }

  /**
   * Dipanggil otomatis saat pengguna menyelesaikan video/episode, mengubah toggle manual,
   * atau membatalkan status ditonton.
   */
  async recordWatch(payload, movieObj = null) {
    const userId = this.getCurrentUserId()
    if (!userId) return { success: false, requiresAuth: true }

    const rawLastEp =
      payload.last_episode_number !== undefined ? Number(payload.last_episode_number) : 1
    const lastEpNormalized = Math.max(0, Number.isNaN(rawLastEp) ? 0 : rawLastEp)

    if (BASE_URL) {
      try {
        const saved = await apiClient.post('/history/record', {
          ...payload,
          last_episode_number: lastEpNormalized,
        })
        if (saved && saved.removed) {
          const remaining = getStoredHistory(userId).filter(
            (h) => String(h.movie_id) !== String(payload.movie_id),
          )
          saveStoredHistory(userId, remaining)
          return { success: true, removed: true, source: 'api' }
        }
        if (saved && saved.id) {
          const list = getStoredHistory(userId).filter(
            (h) => String(h.movie_id) !== String(saved.movie_id),
          )
          list.unshift(saved)
          saveStoredHistory(userId, list)
          return { success: true, data: saved, source: 'api' }
        }
      } catch (err) {
        console.info('[HistoryService] Fallback simpan histori lokal:', err.message)
      }
    }

    // Fallback offline cache
    const list = getStoredHistory(userId)

    if (lastEpNormalized === 0 && payload.remove_if_empty) {
      const remaining = list.filter((h) => String(h.movie_id) !== String(payload.movie_id))
      saveStoredHistory(userId, remaining)
      return { success: true, removed: true, source: 'local' }
    }

    const idx = list.findIndex((h) => String(h.movie_id) === String(payload.movie_id))
    const existing = idx !== -1 ? list[idx] : null
    const totalEp = Math.max(1, Number(payload.total_episodes) || 1)
    const lastEp = Math.min(totalEp, lastEpNormalized)
    const percent =
      payload.progress_percent !== undefined
        ? Number(payload.progress_percent)
        : Math.round((lastEp / totalEp) * 100)
    const isDone = lastEp > 0 && (percent >= 100 || lastEp >= totalEp)

    const entry = {
      id: existing?.id || `hist-${Date.now()}`,
      user_id: userId,
      movie_id: payload.movie_id,
      episode_id: payload.episode_id !== undefined ? payload.episode_id : existing?.episode_id || null,
      last_episode_number: lastEp,
      total_episodes: totalEp,
      watch_status: payload.watch_status || (isDone ? 'Selesai' : 'Sedang Ditonton'),
      progress_percent: percent,
      watch_count:
        existing && payload.increment_watch_count
          ? (Number(existing.watch_count) || 1) + 1
          : Number(existing?.watch_count) || 1,
      notes: payload.notes !== undefined ? payload.notes : existing?.notes || '',
      watched_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      movie: movieObj || existing?.movie || null,
    }

    const filtered = list.filter((h) => String(h.movie_id) !== String(payload.movie_id))
    filtered.unshift(entry)
    saveStoredHistory(userId, filtered)
    return { success: true, data: entry, source: 'local' }
  }

  /**
   * Edit histori secara manual oleh user (status, episode, progres, jumlah tontonan, catatan)
   */
  async updateHistory(id, payload) {
    const userId = this.getCurrentUserId()
    if (!userId) return { success: false, requiresAuth: true }

    if (BASE_URL) {
      const updated = await apiClient.put(`/history/${id}`, payload)
      if (updated && updated.id) {
        const list = getStoredHistory(userId).map((h) =>
          String(h.id) === String(id) ? updated : h,
        )
        saveStoredHistory(userId, list)
        return { success: true, data: updated, source: 'api' }
      }
    }

    const list = getStoredHistory(userId)
    let updatedItem = null
    const nextList = list.map((h) => {
      if (String(h.id) !== String(id)) return h
      updatedItem = {
        ...h,
        ...payload,
        updated_at: new Date().toISOString(),
        watched_at: payload.touch_watched_at ? new Date().toISOString() : h.watched_at,
      }
      return updatedItem
    })
    saveStoredHistory(userId, nextList)
    return { success: true, data: updatedItem, source: 'local' }
  }

  async deleteHistory(id) {
    const userId = this.getCurrentUserId()
    if (!userId) return { success: false, requiresAuth: true }

    if (BASE_URL) {
      await apiClient.delete(`/history/${id}`)
    }
    const list = getStoredHistory(userId).filter((h) => String(h.id) !== String(id))
    saveStoredHistory(userId, list)
    return { success: true, id }
  }
}

export default new HistoryService()
