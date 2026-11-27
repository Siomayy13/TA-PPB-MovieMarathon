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
    // ignore
  }
}

export const normalizeGenre = (g) => {
  const movies = Array.isArray(g.movies) ? g.movies.map(normalizeMovie) : undefined
  const samplePosters = Array.isArray(g.sample_posters)
    ? g.sample_posters.filter(Boolean).slice(0, 4)
    : movies
      ? movies
          .map((m) => m.image_url)
          .filter(Boolean)
          .slice(0, 4)
      : []

  return {
    id: g.id || `gen-${Date.now()}`,
    name: g.name || 'Drama',
    slug: g.slug || String(g.name || 'drama').toLowerCase().replace(/\s+/g, '-'),
    description: g.description || `Kumpulan film dan drama bergenre ${g.name || 'Drama'}.`,
    accent_color: g.accent_color || '#e5a93c',
    cover_url:
      g.cover_url ||
      samplePosters[0] ||
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
    movie_count: g.movie_count ?? (movies ? movies.length : 0),
    sample_posters: samplePosters,
    movies,
  }
}

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
        console.info('[GenreService] API offline, memuat cache lokal:', err.message)
      }
    }

    const movieRes = await movieService.getMovies()
    const allMovies = movieRes.data || []
    const localGenres = getStoredGenres().map((g) => {
      const lower = (g.name || '').toLowerCase()
      const matched = allMovies.filter((m) => (m.genre || '').toLowerCase().includes(lower))
      const posters = matched
        .map((m) => m.image_url)
        .filter(Boolean)
        .slice(0, 4)
      return normalizeGenre({
        ...g,
        movie_count: matched.length,
        sample_posters: posters,
      })
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
        sample_posters: matched
          .map((m) => m.image_url)
          .filter(Boolean)
          .slice(0, 4),
        movies: matched,
      }),
      source: 'local',
    }
  }

  async createGenre(payload) {
    if (BASE_URL) {
      const created = await apiClient.post('/genres', payload)
      if (created && created.id) {
        const normalized = normalizeGenre(created)
        const cached = getStoredGenres()
        cached.push(normalized)
        saveStoredGenres(cached)
        return { success: true, data: normalized, source: 'api' }
      }
    }

    const localCreated = normalizeGenre({
      ...payload,
      id: `gen-${Date.now()}`,
      movie_count: 0,
      sample_posters: [],
    })
    const cached = getStoredGenres()
    cached.push(localCreated)
    saveStoredGenres(cached)
    return { success: true, data: localCreated, source: 'local' }
  }

  async deleteGenre(id) {
    if (BASE_URL) {
      await apiClient.delete(`/genres/${id}`)
    }
    const cached = getStoredGenres().filter((g) => String(g.id) !== String(id))
    saveStoredGenres(cached)
    return { success: true, id }
  }
}

export default new GenreService()
