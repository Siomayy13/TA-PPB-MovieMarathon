// ---------------------------------------------------------------------------
// watchProgressService.js — Penyimpanan persisten progres episode / tontonan
// per film atau drama di localStorage.
// ---------------------------------------------------------------------------

const EPISODE_PROGRESS_KEY = 'movie_marathon_episode_progress_v1'

/**
 * Ekstrak jumlah total episode dari teks durasi (misal "16 Episodes (70m)" -> 16).
 * Untuk film layar lebar tunggal mengembalikan 1.
 */
export const parseTotalEpisodes = (durationText = '') => {
  const match = String(durationText).match(/(\d+)\s*(episode|episodes|ep|eps)/i)
  if (match) {
    const count = Number(match[1])
    if (count > 0) return count
  }
  return 1
}

const readAllProgress = () => {
  try {
    const raw = localStorage.getItem(EPISODE_PROGRESS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const writeAllProgress = (map) => {
  try {
    localStorage.setItem(EPISODE_PROGRESS_KEY, JSON.stringify(map))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('watch-progress-updated'))
    }
  } catch {
    // ignore quota error
  }
}

class WatchProgressService {
  getProgress(movieId, durationText = '') {
    const all = readAllProgress()
    const totalEpisodes = parseTotalEpisodes(durationText)
    const saved = all[String(movieId)]
    if (!saved) {
      return {
        watchedEpisodes: 0,
        totalEpisodes,
        completed: false,
      }
    }
    const watched = Math.min(Math.max(0, Number(saved.watchedEpisodes) || 0), totalEpisodes)
    return {
      watchedEpisodes: watched,
      totalEpisodes,
      completed: watched >= totalEpisodes && totalEpisodes > 0,
      updatedAt: saved.updatedAt,
    }
  }

  setProgress(movieId, watchedEpisodes, durationText = '') {
    const totalEpisodes = parseTotalEpisodes(durationText)
    const clamped = Math.min(Math.max(0, Number(watchedEpisodes) || 0), totalEpisodes)
    const all = readAllProgress()
    all[String(movieId)] = {
      watchedEpisodes: clamped,
      totalEpisodes,
      completed: clamped >= totalEpisodes,
      updatedAt: new Date().toISOString(),
    }
    writeAllProgress(all)
    return all[String(movieId)]
  }
}

export default new WatchProgressService()
