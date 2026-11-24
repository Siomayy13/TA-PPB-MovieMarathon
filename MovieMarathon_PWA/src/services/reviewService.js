import { apiClient, BASE_URL } from '../config/api'

const REVIEWS_STORAGE_KEY = 'movie_marathon_reviews_v2'

const DEFAULT_REVIEWS = [
  {
    id: '44444444-4444-4444-8444-444444444401',
    movie_id: '22222222-2222-4222-8222-222222222201',
    user_name: 'May Triastuti',
    rating: 5,
    comment:
      'Chemistry Kim Soo-hyun dan Kim Ji-won luar biasa! Wajib masuk paket maraton akhir pekan.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: '44444444-4444-4444-8444-444444444402',
    movie_id: '22222222-2222-4222-8222-222222222202',
    user_name: 'Cinephile99',
    rating: 5,
    comment:
      'Karya legendaris Nolan. Musik Hans Zimmer saat adegan docking benar-benar merinding.',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: '44444444-4444-4444-8444-444444444403',
    movie_id: '22222222-2222-4222-8222-222222222207',
    user_name: 'K-MovieFan',
    rating: 5,
    comment:
      'Plot twist di ruang bawah tanah tidak terduga sama sekali. Layak menang Oscar Best Picture!',
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
]

const getStoredReviews = () => {
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(DEFAULT_REVIEWS))
      return DEFAULT_REVIEWS
    }
    return JSON.parse(raw)
  } catch {
    return DEFAULT_REVIEWS
  }
}

const saveStoredReviews = (all) => {
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(all))
  } catch {
    // ignore quota error
  }
}

class ReviewService {
  async getReviews(movieId) {
    if (BASE_URL) {
      try {
        const res = await apiClient.get(`/reviews/movie/${movieId}`)
        if (Array.isArray(res)) {
          return { success: true, data: res, source: 'api' }
        }
      } catch {
        // fallback ke lokal saat offline
      }
    }

    const all = getStoredReviews()
    const filtered = all.filter((r) => String(r.movie_id) === String(movieId))
    return { success: true, data: filtered, source: 'local' }
  }

  async createReview(movieId, reviewData) {
    const payload = {
      movie_id: String(movieId),
      user_name: reviewData.user_name || 'Penonton Marathon',
      rating: Number(reviewData.rating) || 5,
      comment: reviewData.comment || '',
    }

    if (BASE_URL) {
      try {
        const created = await apiClient.post('/reviews', payload)
        if (created && created.id) {
          const all = getStoredReviews()
          all.unshift(created)
          saveStoredReviews(all)
          return { success: true, data: created, source: 'api' }
        }
      } catch {
        // fallback ke lokal saat offline
      }
    }

    const all = getStoredReviews()
    const newReview = {
      ...payload,
      id: `rev-${Date.now()}`,
      created_at: new Date().toISOString(),
    }
    all.unshift(newReview)
    saveStoredReviews(all)
    return { success: true, data: newReview, source: 'local' }
  }
}

export default new ReviewService()
