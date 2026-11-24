import { apiClient, BASE_URL } from '../config/api'
import { DEFAULT_MOVIES } from '../data/movies'

const LOCAL_STORAGE_KEY = 'movie_marathon_database_v2'

const getStoredMovies = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_MOVIES))
      return DEFAULT_MOVIES
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_MOVIES
  } catch {
    return DEFAULT_MOVIES
  }
}

const saveStoredMovies = (list) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list))
  } catch (e) {
    console.warn('LocalStorage save failed:', e)
  }
}

export const normalizeMovie = (item) => {
  if (!item) return null

  return {
    id: item.id || `mm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: item.title || item.name || 'Untitled Title',
    name: item.title || item.name || 'Untitled Title',
    type: item.type || item.category_name || item.categories?.name || 'Movie',
    category: item.type || item.category_name || item.categories?.name || 'Movie',
    category_id: item.category_id || item.categories?.id || null,
    genre: item.genre || 'Drama',
    release_year: Number(item.release_year || item.year || 2024),
    year: Number(item.release_year || item.year || 2024),
    duration: item.duration || '120 mins',
    rating: Number(item.rating ?? 8.5),
    director: item.director || 'Director unknown',
    cast: item.cast || item.cast_members || 'Various artists',
    cast_members: item.cast_members || item.cast || 'Various artists',
    streaming_on: item.streaming_on || 'Netflix / Cinema',
    description: item.description || item.synopsis || '',
    synopsis: item.description || item.synopsis || '',
    image_url:
      item.image_url ||
      item.image ||
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
    tags: Array.isArray(item.tags) ? item.tags : ['Trending'],
    status: item.status === 'Ongoing' ? 'Ongoing' : 'Tamat',
    featured: Boolean(item.isTrending ?? item.featured),
    isTrending: Boolean(item.isTrending ?? item.featured),
    created_at: item.created_at || item.createdAt || new Date().toISOString(),
    createdAt: item.createdAt || item.created_at || new Date().toISOString(),
  }
}

class MovieService {
  /**
   * GET /api/movies — ambil daftar film & drama dari Custom Express API,
   * dengan sinkronisasi otomatis ke localStorage untuk dukungan offline PWA.
   */
  async getMovies(params = {}) {
    if (BASE_URL) {
      try {
        const res = await apiClient.get('/movies', { params })
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : null
        if (list) {
          const normalized = list.map(normalizeMovie)
          saveStoredMovies(normalized)
          return { success: true, data: normalized, source: 'api' }
        }
      } catch (err) {
        console.info('[MovieService] Custom API offline, menggunakan cache lokal:', err.message)
      }
    }

    const localList = getStoredMovies().map(normalizeMovie)
    return {
      success: true,
      data: localList,
      source: 'local',
      pagination: {
        total: localList.length,
        page: params.page || 1,
        limit: params.limit || 50,
      },
    }
  }

  /**
   * GET /api/movies/:id
   */
  async getMovieById(id) {
    if (BASE_URL) {
      try {
        const res = await apiClient.get(`/movies/${id}`)
        if (res && res.id) {
          return { success: true, data: normalizeMovie(res), source: 'api' }
        }
      } catch {
        // fallback ke lokal
      }
    }

    const found = getStoredMovies().find((m) => String(m.id) === String(id))
    if (found) {
      return { success: true, data: normalizeMovie(found), source: 'local' }
    }
    throw new Error('Film atau drama tidak ditemukan.')
  }

  /**
   * POST /api/movies (CRUD: Create)
   */
  async createMovie(data) {
    const payload = {
      title: data.title || data.name,
      type: data.type || 'Movie',
      genre: data.genre || 'Drama',
      release_year: Number(data.release_year || data.year || 2024),
      duration: data.duration || '120 mins',
      rating: Number(data.rating ?? 8.0),
      director: data.director || 'Unknown',
      cast_members: data.cast_members || data.cast || 'Various Artists',
      streaming_on: data.streaming_on || 'Streaming',
      description: data.description || '',
      image_url: data.image_url || '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      status: data.status === 'Ongoing' ? 'Ongoing' : 'Tamat',
      featured: Boolean(data.isTrending ?? data.featured),
      isTrending: Boolean(data.isTrending ?? data.featured),
    }

    if (BASE_URL) {
      try {
        const created = await apiClient.post('/movies', payload)
        if (created && created.id) {
          const normalized = normalizeMovie(created)
          const localList = getStoredMovies()
          localList.unshift(normalized)
          saveStoredMovies(localList)
          return { success: true, data: normalized, source: 'api' }
        }
      } catch (e) {
        console.info('[MovieService] API tidak terjangkau, menyimpan ke cache lokal:', e.message)
      }
    }

    const localList = getStoredMovies()
    const normalized = normalizeMovie({
      ...payload,
      id: `mm-${Date.now()}`,
      created_at: new Date().toISOString(),
    })
    localList.unshift(normalized)
    saveStoredMovies(localList)
    return { success: true, data: normalized, source: 'local' }
  }

  /**
   * PUT /api/movies/:id (CRUD: Update)
   */
  async updateMovie(id, data) {
    const payload = {
      title: data.title || data.name,
      type: data.type,
      genre: data.genre,
      release_year: Number(data.release_year || data.year || 2024),
      duration: data.duration,
      rating: Number(data.rating ?? 8.0),
      director: data.director,
      cast_members: data.cast_members || data.cast,
      streaming_on: data.streaming_on,
      description: data.description,
      image_url: data.image_url,
      tags: Array.isArray(data.tags) ? data.tags : [],
      status: data.status === 'Ongoing' ? 'Ongoing' : 'Tamat',
      featured: Boolean(data.isTrending ?? data.featured),
      isTrending: Boolean(data.isTrending ?? data.featured),
    }

    if (BASE_URL) {
      try {
        const updatedApi = await apiClient.put(`/movies/${id}`, payload)
        if (updatedApi && updatedApi.id) {
          const normalized = normalizeMovie(updatedApi)
          const localList = getStoredMovies()
          const idx = localList.findIndex((m) => String(m.id) === String(id))
          if (idx !== -1) localList[idx] = normalized
          else localList.unshift(normalized)
          saveStoredMovies(localList)
          return { success: true, data: normalized, source: 'api' }
        }
      } catch (e) {
        console.info('[MovieService] API update gagal, memperbarui cache lokal:', e.message)
      }
    }

    const localList = getStoredMovies()
    const index = localList.findIndex((m) => String(m.id) === String(id))
    if (index === -1) {
      throw new Error('Data film/drama yang ingin diubah tidak ditemukan.')
    }

    const updated = normalizeMovie({
      ...localList[index],
      ...payload,
      id,
      updated_at: new Date().toISOString(),
    })
    localList[index] = updated
    saveStoredMovies(localList)
    return { success: true, data: updated, source: 'local' }
  }

  /**
   * DELETE /api/movies/:id (CRUD: Delete)
   */
  async deleteMovie(id) {
    const localList = getStoredMovies()
    const updated = localList.filter((m) => String(m.id) !== String(id))
    saveStoredMovies(updated)

    if (BASE_URL) {
      try {
        await apiClient.delete(`/movies/${id}`)
      } catch {
        // ignore saat offline
      }
    }

    return { success: true, id }
  }

  resetToDefaults() {
    saveStoredMovies(DEFAULT_MOVIES)
    return DEFAULT_MOVIES
  }
}

export default new MovieService()
