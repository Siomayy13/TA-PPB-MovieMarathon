import { apiClient, BASE_URL } from '../config/api'
import { DEFAULT_MARATHONS } from '../data/marathons'
import { normalizeMovie } from './movieService'

const LOCAL_MARATHONS_KEY = 'movie_marathon_packages_v2'
const PROGRESS_KEY = 'movie_marathon_progress_v2'

const getStoredMarathons = () => {
  try {
    const raw = localStorage.getItem(LOCAL_MARATHONS_KEY)
    if (!raw) {
      localStorage.setItem(LOCAL_MARATHONS_KEY, JSON.stringify(DEFAULT_MARATHONS))
      return DEFAULT_MARATHONS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_MARATHONS
  } catch {
    return DEFAULT_MARATHONS
  }
}

const saveStoredMarathons = (list) => {
  try {
    localStorage.setItem(LOCAL_MARATHONS_KEY, JSON.stringify(list))
  } catch (err) {
    console.warn('Gagal menyimpan cache collection:', err)
  }
}

export const normalizeMarathon = (item) => {
  if (!item) return null
  const movies = Array.isArray(item.movies)
    ? item.movies.map((m, idx) => ({
        ...normalizeMovie(m),
        watch_order: m.watch_order || idx + 1,
        note: m.note || '',
      }))
    : []

  const samplePosters = Array.isArray(item.sample_posters) && item.sample_posters.length > 0
    ? item.sample_posters.filter(Boolean).slice(0, 4)
    : movies
        .map((m) => m.image_url)
        .filter(Boolean)
        .slice(0, 4)

  return {
    id: item.id || `mar-${Date.now()}`,
    title: item.title || 'Collection',
    theme: item.theme || 'Curated Collection',
    mood: item.mood || 'Seru & Santai',
    difficulty: 'Collection',
    total_duration: item.total_duration || '4 Jam',
    description: item.description || '',
    snack_recommendation: item.snack_recommendation || 'Popcorn & minuman favorit',
    break_schedule: item.break_schedule || 'Istirahat 15 menit setiap jeda film/episode.',
    cover_url:
      samplePosters[0] ||
      item.cover_url ||
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
    sample_posters: samplePosters,
    movie_count: item.movie_count ?? movies.length,
    movies,
    created_at: item.created_at || new Date().toISOString(),
  }
}

class MarathonService {
  async getMarathons(params = {}) {
    if (BASE_URL) {
      try {
        const res = await apiClient.get('/marathons', { params })
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : null
        if (list) {
          const normalized = list.map(normalizeMarathon)
          saveStoredMarathons(normalized)
          return { success: true, data: normalized, source: 'api' }
        }
      } catch (err) {
        console.info('[MarathonService] API offline, memuat cache lokal:', err.message)
      }
    }

    const localList = getStoredMarathons().map(normalizeMarathon)
    return { success: true, data: localList, source: 'local' }
  }

  async getMarathonById(id) {
    if (BASE_URL) {
      try {
        const res = await apiClient.get(`/marathons/${id}`)
        if (res && res.id) {
          return { success: true, data: normalizeMarathon(res), source: 'api' }
        }
      } catch {
        // fallback ke lokal
      }
    }

    const found = getStoredMarathons().find((item) => String(item.id) === String(id))
    if (found) {
      return { success: true, data: normalizeMarathon(found), source: 'local' }
    }
    throw new Error('Collection tidak ditemukan.')
  }

  async createMarathon(payload, selectedMovies = []) {
    if (BASE_URL) {
      const res = await apiClient.post('/marathons', payload)
      if (res && res.id) {
        const normalized = normalizeMarathon(res)
        const cached = getStoredMarathons()
        cached.unshift(normalized)
        saveStoredMarathons(cached)
        return { success: true, data: normalized, source: 'api' }
      }
    }

    const localCreated = normalizeMarathon({
      ...payload,
      id: `mar-${Date.now()}`,
      movies: selectedMovies.map((m, idx) => ({
        ...m,
        watch_order: idx + 1,
        note: `Urutan tonton #${idx + 1}`,
      })),
      created_at: new Date().toISOString(),
    })

    const cached = getStoredMarathons()
    cached.unshift(localCreated)
    saveStoredMarathons(cached)
    return { success: true, data: localCreated, source: 'local' }
  }

  async updateMarathon(id, payload, selectedMovies = []) {
    if (BASE_URL) {
      const res = await apiClient.put(`/marathons/${id}`, payload)
      if (res && res.id) {
        const normalized = normalizeMarathon(res)
        const cached = getStoredMarathons()
        const idx = cached.findIndex((item) => String(item.id) === String(id))
        if (idx !== -1) cached[idx] = normalized
        else cached.unshift(normalized)
        saveStoredMarathons(cached)
        return { success: true, data: normalized, source: 'api' }
      }
    }

    const cached = getStoredMarathons()
    const idx = cached.findIndex((item) => String(item.id) === String(id))
    const updated = normalizeMarathon({
      ...(idx !== -1 ? cached[idx] : {}),
      ...payload,
      id,
      movies: selectedMovies.map((m, i) => ({
        ...m,
        watch_order: i + 1,
        note: `Urutan tonton #${i + 1}`,
      })),
    })
    if (idx !== -1) cached[idx] = updated
    else cached.unshift(updated)
    saveStoredMarathons(cached)
    return { success: true, data: updated, source: 'local' }
  }

  async addMovieToMarathon(marathonId, movieId, note = '') {
    const res = await apiClient.post(`/marathons/${marathonId}/movies`, {
      movie_id: movieId,
      note,
    })
    const normalized = normalizeMarathon(res)
    const cached = getStoredMarathons()
    const idx = cached.findIndex((item) => String(item.id) === String(marathonId))
    if (idx !== -1) cached[idx] = normalized
    saveStoredMarathons(cached)
    return { success: true, data: normalized }
  }

  async removeMovieFromMarathon(marathonId, movieId) {
    const res = await apiClient.delete(`/marathons/${marathonId}/movies/${movieId}`)
    const normalized = normalizeMarathon(res)
    const cached = getStoredMarathons()
    const idx = cached.findIndex((item) => String(item.id) === String(marathonId))
    if (idx !== -1) cached[idx] = normalized
    saveStoredMarathons(cached)
    return { success: true, data: normalized }
  }

  async deleteMarathon(id) {
    if (BASE_URL) {
      await apiClient.delete(`/marathons/${id}`)
    }
    const cached = getStoredMarathons().filter((item) => String(item.id) !== String(id))
    saveStoredMarathons(cached)
    return { success: true, id }
  }

  getCompletedMovieIds(marathonId) {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY)
      const all = raw ? JSON.parse(raw) : {}
      return Array.isArray(all[marathonId]) ? all[marathonId] : []
    } catch {
      return []
    }
  }

  toggleMovieCompleted(marathonId, movieId) {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY)
      const all = raw ? JSON.parse(raw) : {}
      const list = Array.isArray(all[marathonId]) ? [...all[marathonId]] : []
      const idx = list.findIndex((x) => String(x) === String(movieId))
      if (idx === -1) list.push(String(movieId))
      else list.splice(idx, 1)
      all[marathonId] = list
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(all))
      return list
    } catch {
      return []
    }
  }
}

export default new MarathonService()
