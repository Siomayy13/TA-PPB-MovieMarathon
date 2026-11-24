import { apiClient, BASE_URL } from '../config/api'
import { DEFAULT_GENRES } from '../data/genres'
import movieService, { normalizeMovie } from './movieService'

const LOCAL_GENRES_KEY = 'movie_marathon_genres_v1'

const getStoredGenres = () => {
  try {
    const raw = localStorage.getItem(LOCAL_GENRES_KEY)
    if (!raw) {
      localStorage.setItem(LOCAL_GENRES_KEY, JSON.stringify(DEFAULT_GENRES))
      return DEFAULT_GENRES
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_GENRES
  } catch {
    return DEFAULT_GENRES
  }
}

const saveStoredGenres = (list) => {
  try {
    localStorage.setItem(LOCAL_GENRES_KEY, JSON.stringify(list))
  } catch {
    // ignore quota error
  }
}

export const normalizeGenre = (g) => ({
  id: g.id || `gen-${Date.now()}`,
  name: g.name || 'Drama',
  slug: g.slug || String(g.name || 'drama').toLowerCase().replace(/\s+/g, '-'),
  description: g.description || `Kumpulan film dan drama bergenre ${g.name || 'Drama'}.`,
  accent_color: g.accent_color || '#e5a93c',
  cover_url:
    g.cover_url ||
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
  movie_count: g.movie_count ?? 0,
  movies: Array.isArray(g.movies) ? g.movies.map(normalizeMovie) : undefined,
})

class GenreService {
  async getGenres() {
    if (BASE_URL) {
      try {
        const res = await apiClient.get('/genres')
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : null
        if (list) {
          const normalized = list.map(normalizeGenre)
          saveStoredGenres(normalized)
          return { success: true, data: normalized, source: 'api' }
        }
      } catch (err) {
        console.info('[GenreService] API offline/tabel belum siap, memuat cache lokal:', err.message)
      }
    }

    // Fallback offline: hitung jumlah film yang cocok di database lokal
    const movieRes = await movieService.getMovies()
    const allMovies = movieRes.data || []
    const localGenres = getStoredGenres().map((g) => {
      const lower = (g.name || '').toLowerCase()
      const count = allMovies.filter((m) => (m.genre || '').toLowerCase().includes(lower)).length
      return normalizeGenre({ ...g, movie_count: count })
    })

    return { success: true, data: localGenres, source: 'local' }
  }

  async getGenreById(genre) {
    const id = typeof genre === 'object' ? genre.id : genre
    if (BASE_URL && id) {
      try {
        const res = await apiClient.get(`/genres/${id}`)
        if (res && res.id) {
          return { success: true, data: normalizeGenre(res), source: 'api' }
        }
      } catch {
        // fallback ke lokal
      }
    }

    const genreObj =
      typeof genre === 'object'
        ? genre
        : getStoredGenres().find((g) => String(g.id) === String(id))
    const movieRes = await movieService.getMovies()
    const allMovies = movieRes.data || []
    const lower = (genreObj?.name || '').toLowerCase()
    const matched = allMovies.filter((m) => (m.genre || '').toLowerCase().includes(lower))

    return {
      success: true,
      data: normalizeGenre({
        ...(genreObj || {}),
        movie_count: matched.length,
        movies: matched,
      }),
      source: 'local',
    }
  }

  async createGenre(payload) {
    if (BASE_URL) {
      try {
        const created = await apiClient.post('/genres', payload)
        if (created && created.id) {
          const normalized = normalizeGenre(created)
          const cached = getStoredGenres()
          cached.push(normalized)
          saveStoredGenres(cached)
          return { success: true, data: normalized, source: 'api' }
        }
      } catch (err) {
        console.info('[GenreService] API create gagal, menyimpan ke lokal:', err.message)
      }
    }

    const localCreated = normalizeGenre({
      ...payload,
      id: `gen-${Date.now()}`,
      movie_count: 0,
    })
    const cached = getStoredGenres()
    cached.push(localCreated)
    saveStoredGenres(cached)
    return { success: true, data: localCreated, source: 'local' }
  }

  async deleteGenre(id) {
    const cached = getStoredGenres().filter((g) => String(g.id) !== String(id))
    saveStoredGenres(cached)
    if (BASE_URL) {
      try {
        await apiClient.delete(`/genres/${id}`)
      } catch {
        // ignore saat offline
      }
    }
    return { success: true, id }
  }
}

export default new GenreService()
