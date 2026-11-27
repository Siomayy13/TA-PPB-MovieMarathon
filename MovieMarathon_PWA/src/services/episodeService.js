import { apiClient, BASE_URL } from '../config/api'

const LOCAL_EPISODES_KEY = 'movie_marathon_episodes_v2'

const hoursAgo = (h) => new Date(Date.now() - h * 3600 * 1000).toISOString()

const DEFAULT_EPISODES = [
  {
    id: 'ep-seed-1',
    movie_id: '22222222-2222-4222-8222-222222222201',
    episode_number: 1,
    title: 'Episode 1: Pernikahan di Ujung Tanduk',
    duration: '70 mins',
    video_url: 'https://www.youtube.com/watch?v=Gg2D8zrzlOA',
    synopsis:
      'Baek Hyun-woo mulai mempertimbangkan perceraian hingga sebuah kabar tak terduga mengubah segalanya.',
    created_at: hoursAgo(26),
  },
  {
    id: 'ep-seed-2',
    movie_id: '22222222-2222-4222-8222-222222222201',
    episode_number: 2,
    title: 'Episode 2: Kesempatan Kedua',
    duration: '72 mins',
    video_url: 'https://www.youtube.com/watch?v=Gg2D8zrzlOA',
    synopsis:
      'Hyun-woo mulai menunjukkan perhatian tak terduga kepada Hong Hae-in di tengah tekanan keluarga konglomerat.',
    created_at: hoursAgo(2),
  },
  {
    id: 'ep-seed-3',
    movie_id: '22222222-2222-4222-8222-222222222202',
    episode_number: 1,
    title: 'Full Feature Preview — Official Trailer',
    duration: '169 mins',
    video_url: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    synopsis: 'Misi Endurance menembus lubang cacing menuju galaksi baru untuk menyelamatkan umat manusia.',
    created_at: hoursAgo(18),
  },
  {
    id: 'ep-seed-4',
    movie_id: '22222222-2222-4222-8222-222222222203',
    episode_number: 1,
    title: 'Episode 1: Pendaratan Darurat',
    duration: '80 mins',
    video_url: 'https://www.youtube.com/watch?v=GVQGWgeVc4k',
    synopsis: 'Yoon Se-ri tersapu badai saat paralayang dan mendarat tepat di depan Kapten Ri Jeong-hyeok.',
    created_at: hoursAgo(6),
  },
  {
    id: 'ep-seed-5',
    movie_id: '22222222-2222-4222-8222-222222222204',
    episode_number: 1,
    title: 'Full Feature Preview — Official Trailer',
    duration: '125 mins',
    video_url: 'https://www.youtube.com/watch?v=ByXuk9QqQkk',
    synopsis: 'Chihiro memasuki dunia roh yang magis demi menyelamatkan orang tuanya.',
    created_at: hoursAgo(30),
  },
  {
    id: 'ep-seed-6',
    movie_id: '22222222-2222-4222-8222-222222222205',
    episode_number: 1,
    title: 'Full Feature Preview — Official Trailer',
    duration: '180 mins',
    video_url: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    synopsis: 'Kisah J. Robert Oppenheimer dalam Proyek Manhattan yang mengubah sejarah dunia.',
    created_at: hoursAgo(12),
  },
  {
    id: 'ep-seed-7',
    movie_id: '22222222-2222-4222-8222-222222222206',
    episode_number: 1,
    title: 'Episode 1: Consigliere Tiba di Seoul',
    duration: '80 mins',
    video_url: 'https://www.youtube.com/watch?v=_J8tYxgs_Xc',
    synopsis: 'Vincenzo Cassano kembali ke Korea dan langsung berhadapan dengan penghuni Geumga Plaza.',
    created_at: hoursAgo(9),
  },
  {
    id: 'ep-seed-8',
    movie_id: '22222222-2222-4222-8222-222222222207',
    episode_number: 1,
    title: 'Full Feature Preview — Official Trailer',
    duration: '132 mins',
    video_url: 'https://www.youtube.com/watch?v=5xH0HfJHsaY',
    synopsis: 'Keluarga Kim mulai masuk satu per satu ke kehidupan mewah keluarga Park.',
    created_at: hoursAgo(36),
  },
  {
    id: 'ep-seed-9',
    movie_id: '22222222-2222-4222-8222-222222222208',
    episode_number: 1,
    title: 'Episode 1: Awal Rencana Panjang',
    duration: '55 mins',
    video_url: 'https://www.youtube.com/watch?v=tqVVrTnewmo',
    synopsis: 'Moon Dong-eun menyiapkan langkah pertama setelah bertahun-tahun merencanakan balas dendam.',
    created_at: hoursAgo(4),
  },
  {
    id: 'ep-seed-10',
    movie_id: '22222222-2222-4222-8222-222222222209',
    episode_number: 1,
    title: 'Full Feature Preview — Official Trailer',
    duration: '106 mins',
    video_url: 'https://www.youtube.com/watch?v=xU47nhruN-Q',
    synopsis: 'Mitsuha dan Taki bertukar tubuh secara misterius dan mencari cara bertemu melintasi waktu.',
    created_at: hoursAgo(40),
  },
  {
    id: 'ep-seed-11',
    movie_id: '22222222-2222-4222-8222-222222222210',
    episode_number: 1,
    title: 'Episode 1: Secrets',
    duration: '52 mins',
    video_url: 'https://www.youtube.com/watch?v=rrwycJ08PSA',
    synopsis: 'Hilangnya seorang anak di Winden membuka rahasia kelam empat keluarga lintas generasi.',
    created_at: hoursAgo(15),
  },
]

const getStoredEpisodes = () => {
  try {
    const raw = localStorage.getItem(LOCAL_EPISODES_KEY)
    if (!raw) {
      localStorage.setItem(LOCAL_EPISODES_KEY, JSON.stringify(DEFAULT_EPISODES))
      return DEFAULT_EPISODES
    }
    return JSON.parse(raw)
  } catch {
    return DEFAULT_EPISODES
  }
}

const saveStoredEpisodes = (all) => {
  try {
    localStorage.setItem(LOCAL_EPISODES_KEY, JSON.stringify(all))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('episodes-updated'))
    }
  } catch {
    // ignore
  }
}

/**
 * Mengembalikan map movie_id -> info episode terbaru yang diupload (untuk mode offline/cache)
 */
export const getLocalLatestEpisodesMap = () => {
  const all = getStoredEpisodes()
  const sorted = [...all].sort((a, b) => {
    const tDiff = new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    if (tDiff !== 0) return tDiff
    return (Number(b.episode_number) || 0) - (Number(a.episode_number) || 0)
  })

  const map = new Map()
  sorted.forEach((ep) => {
    const key = String(ep.movie_id)
    const cur = map.get(key)
    if (!cur) {
      map.set(key, {
        episode_number: Number(ep.episode_number) || 1,
        title: ep.title,
        created_at: ep.created_at || null,
        episode_count: 1,
      })
    } else {
      cur.episode_count += 1
    }
  })
  return map
}

class EpisodeService {
  async getEpisodes(movieId) {
    if (BASE_URL) {
      try {
        const res = await apiClient.get(`/episodes/movie/${movieId}`)
        if (Array.isArray(res)) {
          return { success: true, data: res, source: 'api' }
        }
      } catch {
        // fallback ke lokal saat offline
      }
    }

    const all = getStoredEpisodes()
    const filtered = all
      .filter((ep) => String(ep.movie_id) === String(movieId))
      .sort((a, b) => (Number(a.episode_number) || 0) - (Number(b.episode_number) || 0))
    return { success: true, data: filtered, source: 'local' }
  }

  async createEpisode(payload) {
    if (BASE_URL) {
      const created = await apiClient.post('/episodes', payload)
      if (created && created.id) {
        const all = getStoredEpisodes()
        all.push(created)
        saveStoredEpisodes(all)
        return { success: true, data: created }
      }
    }
    const localEp = {
      ...payload,
      id: `ep-${Date.now()}`,
      created_at: new Date().toISOString(),
    }
    const all = getStoredEpisodes()
    all.push(localEp)
    saveStoredEpisodes(all)
    return { success: true, data: localEp }
  }

  async deleteEpisode(id) {
    if (BASE_URL) {
      await apiClient.delete(`/episodes/${id}`)
    }
    const all = getStoredEpisodes().filter((ep) => String(ep.id) !== String(id))
    saveStoredEpisodes(all)
    return { success: true, id }
  }
}

export default new EpisodeService()
