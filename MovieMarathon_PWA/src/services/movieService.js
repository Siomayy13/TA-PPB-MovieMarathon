import { apiClient, BASE_URL } from '../config/api'
import { DEFAULT_MOVIES } from '../data/movies'
import { getLocalLatestEpisodesMap } from './episodeService'

const LOCAL_STORAGE_KEY = 'movie_marathon_database_v2'
const REVIEWS_STORAGE_KEY = 'movie_marathon_reviews_v2'

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

const getStoredReviews = () => {
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * Fallback perhitungan Top 10 Trending otomatis, rating dari ulasan,
 * serta info episode terbaru saat mode offline.
 */
const attachLocalMetrics = (movies) => {
  const reviews = getStoredReviews()
  const latestEpMap = getLocalLatestEpisodesMap()
  const statsMap = new Map()

  reviews.forEach((r) => {
    const key = String(r.movie_id)
    const cur = statsMap.get(key) || { count: 0, sum: 0 }
    cur.count += 1
    cur.sum += Number(r.rating) || 0
    statsMap.set(key, cur)
  })

  const enriched = movies.map((m) => {
    const localStat = statsMap.get(String(m.id))
    const reviewCount = m.review_count || (localStat ? localStat.count : 0)
    const totalStars = m.total_stars || (localStat ? localStat.sum : 0)
    const averageReviewRating =
      m.average_review_rating ||
      (reviewCount > 0 ? Number((totalStars / reviewCount).toFixed(2)) : 0)

    const effectiveRating =
      reviewCount > 0
        ? Math.round(averageReviewRating * 2 * 10) / 10
        : Number(m.rating ?? 0)

    const localEp = latestEpMap.get(String(m.id))
    const latestEpNum = m.latest_episode_number ?? localEp?.episode_number ?? null
    const latestEpTitle = m.latest_episode_title ?? localEp?.title ?? null
    const latestEpUploadedAt = m.latest_episode_uploaded_at ?? localEp?.created_at ?? null
    const latestUploadAt =
      latestEpUploadedAt || m.latest_upload_at || m.createdAt || m.created_at

    return {
      ...m,
      rating: effectiveRating,
      review_count: Number(reviewCount) || 0,
      total_stars: Number(totalStars) || 0,
      average_review_rating: Number(averageReviewRating) || 0,
      episode_count: m.episode_count ?? localEp?.episode_count ?? 0,
      latest_episode_number: latestEpNum,
      latest_episode_title: latestEpTitle,
      latest_episode_uploaded_at: latestEpUploadedAt,
      latest_upload_at: latestUploadAt,
    }
  })

  const ranked = [...enriched].sort((a, b) => {
    const hasRevA = a.review_count > 0 ? 1 : 0
    const hasRevB = b.review_count > 0 ? 1 : 0
    if (hasRevB !== hasRevA) return hasRevB - hasRevA
    if (b.average_review_rating !== a.average_review_rating) {
      return b.average_review_rating - a.average_review_rating
    }
    if (b.review_count !== a.review_count) {
      return b.review_count - a.review_count
    }
    if (b.total_stars !== a.total_stars) {
      return b.total_stars - a.total_stars
    }
    return (Number(b.rating) || 0) - (Number(a.rating) || 0)
  })

  const rankMap = new Map()
  ranked.slice(0, 10).forEach((m, idx) => {
    rankMap.set(String(m.id), idx + 1)
  })

  return enriched.map((m) => {
    const rank = m.trending_rank || rankMap.get(String(m.id)) || null
    return {
      ...m,
      trending_rank: rank,
      isTrending: Boolean(rank && rank <= 10),
      featured: Boolean(rank && rank <= 10),
    }
  })
}

export const normalizeMovie = (item) => {
  if (!item) return null

  const trendingRank = item.trending_rank != null ? Number(item.trending_rank) : null
  const parsedRating =
    item.rating !== null && item.rating !== undefined && item.rating !== ''
      ? Number(item.rating)
      : 0

  const createdAt = item.created_at || item.createdAt || new Date().toISOString()
  const latestEpUploadedAt = item.latest_episode_uploaded_at || null

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
    rating: Number.isNaN(parsedRating) ? 0 : parsedRating,
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
    review_count: Number(item.review_count ?? 0),
    total_stars: Number(item.total_stars ?? 0),
    average_review_rating: Number(item.average_review_rating ?? 0),
    trending_rank: trendingRank,
    featured: trendingRank ? trendingRank <= 10 : Boolean(item.isTrending ?? item.featured),
    isTrending: trendingRank ? trendingRank <= 10 : Boolean(item.isTrending ?? item.featured),
    episode_count: Number(item.episode_count ?? 0),
    latest_episode_number:
      item.latest_episode_number != null ? Number(item.latest_episode_number) : null,
    latest_episode_title: item.latest_episode_title || null,
    latest_episode_uploaded_at: latestEpUploadedAt,
    latest_upload_at: item.latest_upload_at || latestEpUploadedAt || createdAt,
    episodes: Array.isArray(item.episodes) ? item.episodes : undefined,
    created_at: createdAt,
    createdAt,
  }
}

class MovieService {
  /**
   * GET /api/movies — ambil daftar film & drama dari Custom Express API,
   * lengkap dengan statistik ulasan, peringkat Top 10 Trending otomatis,
   * serta detail episode terbaru & waktu upload.
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

    const localList = attachLocalMetrics(getStoredMovies().map(normalizeMovie))
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
   * GET /api/movies/trending?limit=10 — Top 10 Trending otomatis berdasarkan ulasan/bintang.
   */
  async getTrending(limit = 10) {
    if (BASE_URL) {
      try {
        const res = await apiClient.get('/movies/trending', { params: { limit } })
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : null
        if (list) {
          return {
            success: true,
            data: list.map(normalizeMovie),
            source: 'api',
          }
        }
      } catch (err) {
        console.info('[MovieService] Trending API offline, menghitung ranking lokal:', err.message)
      }
    }

    const enriched = attachLocalMetrics(getStoredMovies().map(normalizeMovie))
    const topRanked = [...enriched]
      .filter((m) => m.trending_rank != null)
      .sort((a, b) => a.trending_rank - b.trending_rank)
      .slice(0, limit)

    return { success: true, data: topRanked, source: 'local' }
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
   * POST /api/movies (Admin CRUD: Create)
   * Rating awal default 0 (belum ada rating; dihitung otomatis dari ulasan pengguna).
   */
  async createMovie(data) {
    const payload = {
      title: data.title || data.name,
      type: data.type || 'Movie',
      genre: data.genre || 'Drama',
      release_year: Number(data.release_year || data.year || 2024),
      duration: data.duration || '120 mins',
      rating: data.rating !== undefined && data.rating !== null ? Number(data.rating) : 0,
      director: data.director || 'Unknown',
      cast_members: data.cast_members || data.cast || 'Various Artists',
      streaming_on: data.streaming_on || 'Streaming',
      description: data.description || '',
      image_url: data.image_url || '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      status: data.status === 'Ongoing' ? 'Ongoing' : 'Tamat',
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
        if (e?.status === 401 || e?.status === 403) {
          throw new Error(e?.message || 'Hanya Admin yang dapat menambahkan judul film.')
        }
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
   * PUT /api/movies/:id (Admin CRUD: Update)
   */
  async updateMovie(id, data) {
    const payload = {
      title: data.title || data.name,
      type: data.type,
      genre: data.genre,
      release_year: Number(data.release_year || data.year || 2024),
      duration: data.duration,
      director: data.director,
      cast_members: data.cast_members || data.cast,
      streaming_on: data.streaming_on,
      description: data.description,
      image_url: data.image_url,
      tags: Array.isArray(data.tags) ? data.tags : [],
      status: data.status === 'Ongoing' ? 'Ongoing' : 'Tamat',
    }
    if (data.rating !== undefined && data.rating !== null && data.rating !== '') {
      payload.rating = Number(data.rating)
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
        if (e?.status === 401 || e?.status === 403) {
          throw new Error(e?.message || 'Hanya Admin yang dapat mengubah data film.')
        }
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
   * DELETE /api/movies/:id (Admin CRUD: Delete)
   */
  async deleteMovie(id) {
    if (BASE_URL) {
      try {
        await apiClient.delete(`/movies/${id}`)
      } catch (e) {
        if (e?.status === 401 || e?.status === 403) {
          throw new Error(e?.message || 'Hanya Admin yang dapat menghapus data film.')
        }
      }
    }

    const localList = getStoredMovies()
    const updated = localList.filter((m) => String(m.id) !== String(id))
    saveStoredMovies(updated)

    return { success: true, id }
  }

  resetToDefaults() {
    saveStoredMovies(DEFAULT_MOVIES)
    return DEFAULT_MOVIES
  }
}

export default new MovieService()
