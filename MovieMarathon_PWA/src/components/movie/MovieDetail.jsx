import { useState, useEffect, useCallback } from 'react'
import {
  ArrowLeft,
  Star,
  Clock,
  Calendar,
  Tv,
  User,
  Film,
  Send,
  Loader,
  Edit2,
  Trash2,
  CheckCircle,
  Minus,
  Plus,
  RotateCcw,
  Play,
  Video,
  LogIn,
  Lock,
  X,
} from 'lucide-react'
import WatchlistButton from '../common/WatchlistButton'
import VideoPreviewPlayer from './VideoPreviewPlayer'
import { useReviews, useCreateReview } from '../../hooks/useReviews'
import { useAuth } from '../../context/AuthContext'
import episodeService from '../../services/episodeService'
import historyService from '../../services/historyService'
import watchProgressService from '../../services/watchProgressService'
import { formatRating } from '../../utils/helpers'

export default function MovieDetail({ movie, onBack, onEdit, onDelete }) {
  const { user, isAuthenticated, isAdmin, openAuthModal } = useAuth()

  const poster =
    movie.image_url ||
    movie.image ||
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80'

  const { reviews, loading: reviewsLoading, refetch: refetchReviews } = useReviews(movie.id)
  const { createReview, submitting } = useCreateReview()

  // Episodes & Video Preview state
  const [episodes, setEpisodes] = useState([])
  const [loadingEpisodes, setLoadingEpisodes] = useState(true)
  const [activeEpisode, setActiveEpisode] = useState(null)
  const [recordingHistory, setRecordingHistory] = useState(false)
  const [historyNotice, setHistoryNotice] = useState('')

  // Status episode yang sudah ditonton (per user & tersinkron ke database watch_history)
  const [watchedEpNumbers, setWatchedEpNumbers] = useState([])

  // Admin: tambah episode baru
  const [showAddEpisode, setShowAddEpisode] = useState(false)
  const [epForm, setEpForm] = useState({
    episode_number: 1,
    title: '',
    duration: '45 mins',
    video_url: '',
    synopsis: '',
  })
  const [savingEpisode, setSavingEpisode] = useState(false)
  const [epError, setEpError] = useState('')

  // Reviews form
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [msg, setMsg] = useState('')

  // Watch Progress
  const [progress, setProgress] = useState(() =>
    watchProgressService.getProgress(movie.id, movie.duration),
  )

  const loadEpisodes = useCallback(async () => {
    try {
      setLoadingEpisodes(true)
      const res = await episodeService.getEpisodes(movie.id)
      if (res.success) {
        const list = res.data || []
        setEpisodes(list)
        setEpForm((p) => ({
          ...p,
          episode_number: list.length + 1,
        }))
      }
    } finally {
      setLoadingEpisodes(false)
    }
  }, [movie.id])

  useEffect(() => {
    setActiveEpisode(null)
    setProgress(watchProgressService.getProgress(movie.id, movie.duration))
    loadEpisodes()
  }, [movie.id, movie.duration, loadEpisodes])

  // Sinkronkan daftar episode yang sudah ditonton dari database watch_history & cache lokal
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setWatchedEpNumbers([])
      return undefined
    }
    let active = true
    const syncWatchedFromDb = async () => {
      const localSaved = historyService.getWatchedEpisodeNumbers(movie.id)
      const dbEntry = await historyService.getMovieHistory(movie.id)
      if (!active) return

      if (dbEntry) {
        const dbLast = Number(dbEntry.last_episode_number) || 0
        const dbTotal = Math.max(Number(dbEntry.total_episodes) || 1, episodes.length, 1)
        watchProgressService.setProgress(movie.id, dbLast, `${dbTotal} Episodes`)
        setProgress(watchProgressService.getProgress(movie.id, `${dbTotal} Episodes`))

        if (localSaved && localSaved.length > 0 && dbLast > 0) {
          setWatchedEpNumbers(localSaved)
        } else if (dbLast > 0) {
          const derived = Array.from({ length: dbLast }, (_, i) => i + 1)
          setWatchedEpNumbers(derived)
          historyService.saveWatchedEpisodeNumbers(movie.id, derived)
        } else {
          setWatchedEpNumbers([])
        }
      } else if (localSaved) {
        setWatchedEpNumbers(localSaved)
      } else {
        setWatchedEpNumbers([])
      }
    }
    syncWatchedFromDb()
    return () => {
      active = false
    }
  }, [isAuthenticated, user?.id, movie.id, episodes.length])

  const effectiveTotalEpisodes = Math.max(episodes.length, progress.totalEpisodes, 1)

  const syncProgressToDatabase = useCallback(
    async ({ nextCount, nextWatchedNums, epObj = null, noticeText = '' }) => {
      const clamped = Math.min(effectiveTotalEpisodes, Math.max(0, nextCount))
      const updated = watchProgressService.setProgress(
        movie.id,
        clamped,
        `${effectiveTotalEpisodes} Episodes`,
      )
      setProgress(updated)
      if (Array.isArray(nextWatchedNums)) {
        setWatchedEpNumbers(nextWatchedNums)
        historyService.saveWatchedEpisodeNumbers(movie.id, nextWatchedNums)
      }

      try {
        setRecordingHistory(true)
        const pct = Math.round((clamped / effectiveTotalEpisodes) * 100)
        await historyService.recordWatch(
          {
            movie_id: movie.id,
            episode_id: epObj?.id || null,
            last_episode_number: clamped,
            total_episodes: effectiveTotalEpisodes,
            progress_percent: pct,
            watch_status: pct >= 100 ? 'Selesai' : 'Sedang Ditonton',
            increment_watch_count: pct >= 100,
            remove_if_empty: clamped === 0,
          },
          movie,
        )
        if (noticeText) {
          setHistoryNotice(noticeText)
          setTimeout(() => setHistoryNotice(''), 4200)
        }
      } finally {
        setRecordingHistory(false)
      }
    },
    [effectiveTotalEpisodes, movie],
  )

  const handleUpdateEpisodeProgress = async (nextCount, epObj = null) => {
    if (!isAuthenticated) {
      openAuthModal('login')
      return
    }
    const clamped = Math.min(effectiveTotalEpisodes, Math.max(0, nextCount))
    const derivedNums = Array.from({ length: clamped }, (_, i) => i + 1)
    const pct = Math.round((clamped / effectiveTotalEpisodes) * 100)
    await syncProgressToDatabase({
      nextCount: clamped,
      nextWatchedNums: derivedNums,
      epObj,
      noticeText:
        clamped === 0
          ? 'Progres tontonan direset & histori diperbarui di database.'
          : `Progres tersimpan di Histori Tontonan (${pct}%).`,
    })
  }

  /**
   * Toggle status "Sudah Ditonton" (otomatis saat video berakhir ATAU klik manual user)
   */
  const handleToggleEpisodeWatched = useCallback(
    async (ep, nextWatched, isAutoVideoEnd = false) => {
      if (!isAuthenticated) {
        openAuthModal('login')
        return
      }
      const epNum = Number(ep.episode_number) || 1
      const nextSet = new Set(watchedEpNumbers)
      if (nextWatched) {
        nextSet.add(epNum)
      } else {
        nextSet.delete(epNum)
      }
      const sortedNums = Array.from(nextSet).sort((a, b) => a - b)
      const nextCount = sortedNums.length

      const noticeText = nextWatched
        ? isAutoVideoEnd
          ? `Video selesai diputar — Episode ${epNum} otomatis ditandai Sudah Ditonton & tersimpan di Histori!`
          : `Episode ${epNum} ditandai Sudah Ditonton & tersimpan di Histori Tontonan.`
        : `Status Sudah Ditonton untuk Episode ${epNum} dibatalkan & diperbarui di database.`

      await syncProgressToDatabase({
        nextCount,
        nextWatchedNums: sortedNums,
        epObj: nextWatched ? ep : null,
        noticeText,
      })
    },
    [isAuthenticated, openAuthModal, watchedEpNumbers, syncProgressToDatabase],
  )

  const handleAddEpisode = async (e) => {
    e.preventDefault()
    setEpError('')
    if (!epForm.title.trim() || !epForm.video_url.trim()) {
      setEpError('Judul episode dan link video wajib diisi.')
      return
    }
    try {
      setSavingEpisode(true)
      await episodeService.createEpisode({
        movie_id: movie.id,
        episode_number: Number(epForm.episode_number) || episodes.length + 1,
        title: epForm.title.trim(),
        duration: epForm.duration.trim() || '45 mins',
        video_url: epForm.video_url.trim(),
        synopsis: epForm.synopsis.trim(),
      })
      setEpForm({
        episode_number: episodes.length + 2,
        title: '',
        duration: '45 mins',
        video_url: '',
        synopsis: '',
      })
      setShowAddEpisode(false)
      loadEpisodes()
    } catch (err) {
      setEpError(err?.message || 'Gagal menambahkan episode.')
    } finally {
      setSavingEpisode(false)
    }
  }

  const handleDeleteEpisode = async (e, epId) => {
    e.stopPropagation()
    try {
      await episodeService.deleteEpisode(epId)
      if (activeEpisode?.id === epId) setActiveEpisode(null)
      loadEpisodes()
    } catch (err) {
      alert(err?.message || 'Gagal menghapus episode.')
    }
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      openAuthModal('login')
      return
    }
    setMsg('')
    if (!comment.trim()) return

    const result = await createReview(movie.id, {
      user_name: user?.display_name || 'Penonton Marathon',
      rating,
      comment: comment.trim(),
    })

    if (result) {
      setMsg('Ulasan berhasil dikirim! Rating & peringkat Trending otomatis diperbarui.')
      setComment('')
      setRating(5)
      refetchReviews()
      setTimeout(() => setMsg(''), 3500)
    }
  }

  const progressPercent =
    effectiveTotalEpisodes > 0
      ? Math.min(100, Math.round((progress.watchedEpisodes / effectiveTotalEpisodes) * 100))
      : 0

  const hasRatingScore = Number(movie.rating) > 0
  const activeEpisodeWatched = Boolean(
    activeEpisode && watchedEpNumbers.includes(Number(activeEpisode.episode_number) || 1),
  )

  return (
    <div className="movie-detail">
      <button type="button" className="detail-back-btn" onClick={onBack}>
        <ArrowLeft size={18} /> Kembali ke Katalog
      </button>

      {/* Hero Section */}
      <div className="detail-hero">
        <div className="detail-poster-wrap">
          <img src={poster} alt={movie.title} className="detail-poster" />
        </div>

        <div className="detail-info">
          <div className="detail-badge-row">
            {movie.trending_rank && movie.trending_rank <= 10 && (
              <span className="trending-pill">TRENDING #{movie.trending_rank}</span>
            )}
            <span className="badge badge--primary">{movie.type || 'Movie'}</span>
            <span
              className={`badge ${movie.status === 'Ongoing' ? 'badge--ongoing' : 'badge--tamat'}`}
            >
              {movie.status === 'Ongoing' ? 'Ongoing' : 'Tamat'}
            </span>
            <span className="badge badge--outline">{movie.genre || 'Drama'}</span>
          </div>

          <h1 className="detail-title">{movie.title}</h1>

          <div className="detail-stats-bar">
            <div className="stat-pill">
              <Star size={16} fill="#e5a93c" stroke="#e5a93c" />
              <span>{hasRatingScore ? `${formatRating(movie.rating)} / 10` : 'Belum ada rating'}</span>
            </div>
            {movie.review_count > 0 && (
              <div className="stat-pill">
                <Star size={15} fill="#f59e0b" stroke="#f59e0b" />
                <span>
                  Ulasan: {Number(movie.average_review_rating || 0).toFixed(1)}/5 (
                  {movie.review_count})
                </span>
              </div>
            )}
            <div className="stat-pill">
              <Clock size={16} />
              <span>{movie.duration || 'Feature'}</span>
            </div>
            <div className="stat-pill">
              <Calendar size={16} />
              <span>{movie.release_year || movie.year || '2024'}</span>
            </div>
          </div>

          <div className="detail-crew-list">
            <div className="crew-item">
              <Film size={15} />
              <span>
                <strong>Sutradara:</strong> {movie.director || 'N/A'}
              </span>
            </div>
            <div className="crew-item">
              <User size={15} />
              <span>
                <strong>Pemeran:</strong> {movie.cast || 'N/A'}
              </span>
            </div>
            {movie.streaming_on && (
              <div className="crew-item">
                <Tv size={15} />
                <span>
                  <strong>Platform:</strong> {movie.streaming_on}
                </span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="detail-actions">
            <WatchlistButton movieId={movie.id} />
            {isAdmin && onEdit && (
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={() => onEdit(movie)}
              >
                <Edit2 size={15} /> Edit
              </button>
            )}
            {isAdmin && onDelete && (
              <button
                type="button"
                className="btn btn--danger btn--sm"
                onClick={() => onDelete(movie)}
              >
                <Trash2 size={15} /> Hapus
              </button>
            )}
          </div>
        </div>
      </div>

      {historyNotice && (
        <div className="toast-bar toast-bar--success" style={{ marginBottom: '18px' }}>
          <CheckCircle size={17} /> <span>{historyNotice}</span>
        </div>
      )}

      {/* DAFTAR EPISODE & PREVIEW VIDEO BERBASIS LINK */}
      <div className="detail-section">
        <div className="episode-tracker-head" style={{ marginBottom: '14px' }}>
          <div>
            <h2
              className="detail-section__title"
              style={{ marginBottom: '4px', borderBottom: 'none', paddingBottom: 0 }}
            >
              <Video size={17} color="#e5a93c" style={{ verticalAlign: 'middle', marginRight: '6px' }} />
              Daftar Episode &amp; Preview Video ({episodes.length})
            </h2>
            <p className="episode-tracker-sub">
              Klik salah satu episode untuk memutar preview. Status otomatis berubah menjadi{' '}
              <strong>Sudah Ditonton</strong> saat video selesai atau ubah secara manual.
            </p>
          </div>

          {isAdmin && (
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => {
                setShowAddEpisode((v) => !v)
                setEpError('')
              }}
            >
              {showAddEpisode ? <X size={14} /> : <Plus size={14} />}
              {showAddEpisode ? 'Tutup Form' : 'Tambah Episode'}
            </button>
          )}
        </div>

        {/* Active Video Preview Player */}
        {activeEpisode && (
          <VideoPreviewPlayer
            episode={activeEpisode}
            isAuthenticated={isAuthenticated}
            isWatched={activeEpisodeWatched}
            onToggleWatched={handleToggleEpisodeWatched}
            onOpenLogin={openAuthModal}
            onClose={() => setActiveEpisode(null)}
            recording={recordingHistory}
          />
        )}

        {/* Admin: Form Tambah Episode Baru */}
        {isAdmin && showAddEpisode && (
          <form onSubmit={handleAddEpisode} className="episode-add-box">
            <h3 style={{ margin: '0 0 12px', fontSize: '0.96rem', color: '#ffffff' }}>
              Tambah Episode &amp; Link Preview Video
            </h3>
            {epError && (
              <div className="toast-bar toast-bar--error" style={{ marginBottom: '12px' }}>
                {epError}
              </div>
            )}
            <div className="form-grid form-grid--3" style={{ marginBottom: 0 }}>
              <div className="form-field" style={{ marginBottom: 0 }}>
                <label htmlFor="ep-num" className="form-label">
                  No. Episode
                </label>
                <input
                  id="ep-num"
                  type="number"
                  min="1"
                  className="form-input"
                  value={epForm.episode_number}
                  onChange={(e) => setEpForm((p) => ({ ...p, episode_number: e.target.value }))}
                  required
                />
              </div>
              <div className="form-field" style={{ marginBottom: 0 }}>
                <label htmlFor="ep-title" className="form-label">
                  Judul Episode <span className="req">*</span>
                </label>
                <input
                  id="ep-title"
                  type="text"
                  className="form-input"
                  placeholder="misal: Episode 3: Rahasia Terungkap"
                  value={epForm.title}
                  onChange={(e) => setEpForm((p) => ({ ...p, title: e.target.value }))}
                  required
                />
              </div>
              <div className="form-field" style={{ marginBottom: 0 }}>
                <label htmlFor="ep-dur" className="form-label">
                  Durasi
                </label>
                <input
                  id="ep-dur"
                  type="text"
                  className="form-input"
                  placeholder="misal: 60 mins"
                  value={epForm.duration}
                  onChange={(e) => setEpForm((p) => ({ ...p, duration: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-field" style={{ marginTop: '10px', marginBottom: '10px' }}>
              <label htmlFor="ep-url" className="form-label">
                Link Video Eksternal (YouTube / Google Drive / Vimeo / MP4){' '}
                <span className="req">*</span>
              </label>
              <input
                id="ep-url"
                type="url"
                className="form-input"
                placeholder="https://www.youtube.com/watch?v=... atau https://.../video.mp4"
                value={epForm.video_url}
                onChange={(e) => setEpForm((p) => ({ ...p, video_url: e.target.value }))}
                required
              />
            </div>

            <div className="form-field" style={{ marginBottom: '12px' }}>
              <label htmlFor="ep-syn" className="form-label">
                Sinopsis Singkat Episode
              </label>
              <input
                id="ep-syn"
                type="text"
                className="form-input"
                placeholder="Ringkasan singkat isi episode..."
                value={epForm.synopsis}
                onChange={(e) => setEpForm((p) => ({ ...p, synopsis: e.target.value }))}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={() => setShowAddEpisode(false)}
              >
                Batal
              </button>
              <button type="submit" className="btn btn--primary btn--sm" disabled={savingEpisode}>
                {savingEpisode ? 'Menyimpan...' : 'Simpan Episode'}
              </button>
            </div>
          </form>
        )}

        {/* Episode List */}
        {loadingEpisodes ? (
          <div className="loading-state">
            <Loader size={18} className="spin" /> <span>Memuat daftar episode...</span>
          </div>
        ) : episodes.length === 0 ? (
          <p className="no-reviews">
            Belum ada episode yang terdaftar untuk judul ini.
            {isAdmin ? ' Klik "Tambah Episode" untuk menambahkan link video.' : ''}
          </p>
        ) : (
          <div className="episodes-list">
            {episodes.map((ep) => {
              const isPlaying = activeEpisode?.id === ep.id
              const epWatched = watchedEpNumbers.includes(Number(ep.episode_number) || 1)
              return (
                <div
                  key={ep.id}
                  className={`episode-row ${isPlaying ? 'episode-row--active' : ''} ${
                    epWatched ? 'episode-row--watched' : ''
                  }`}
                  onClick={() => setActiveEpisode(ep)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setActiveEpisode(ep)
                  }}
                >
                  <span className="episode-play-circle">
                    <Play
                      size={14}
                      fill={isPlaying ? '#0e131f' : '#e5a93c'}
                      color={isPlaying ? '#0e131f' : '#e5a93c'}
                    />
                  </span>
                  <div className="episode-row__info">
                    <div className="episode-row__top">
                      <span className="episode-num-tag">EP {ep.episode_number}</span>
                      <strong>{ep.title}</strong>
                      {isAuthenticated && epWatched && (
                        <span className="watched-status-pill">
                          <CheckCircle size={11} /> Sudah Ditonton
                        </span>
                      )}
                    </div>
                    <div className="episode-row__meta">
                      <span>{ep.duration || '45 mins'}</span>
                      {ep.synopsis && <span>&bull; {ep.synopsis}</span>}
                    </div>
                  </div>

                  <div className="episode-row__actions">
                    <span className="episode-preview-cta">
                      {isPlaying ? 'Sedang Diputar' : 'Putar'}
                    </span>

                    {isAuthenticated && (
                      <button
                        type="button"
                        className={`episode-watch-toggle ${
                          epWatched ? 'episode-watch-toggle--done' : ''
                        }`}
                        disabled={recordingHistory}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleEpisodeWatched(ep, !epWatched, false)
                        }}
                        title={
                          epWatched
                            ? 'Klik untuk membatalkan status Sudah Ditonton'
                            : 'Tandai episode ini sudah ditonton'
                        }
                      >
                        <CheckCircle size={13} />
                        <span>{epWatched ? 'Batalkan' : 'Tandai Selesai'}</span>
                      </button>
                    )}

                    {isAdmin && (
                      <button
                        type="button"
                        className="btn btn--danger btn--sm"
                        onClick={(e) => handleDeleteEpisode(e, ep.id)}
                        title="Hapus episode"
                        aria-label={`Hapus ${ep.title}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Progres Tontonan & Histori Otomatis */}
      <div className="detail-section">
        <div className="episode-tracker-head">
          <div>
            <h2
              className="detail-section__title"
              style={{ marginBottom: '4px', borderBottom: 'none', paddingBottom: 0 }}
            >
              Progres Tontonan {effectiveTotalEpisodes > 1 ? '& Episode' : ''}
            </h2>
            <p className="episode-tracker-sub">
              {!isAuthenticated
                ? 'Masuk untuk melacak progres & mencatat histori tontonan otomatis.'
                : effectiveTotalEpisodes > 1
                  ? `Episode ${progress.watchedEpisodes} dari ${effectiveTotalEpisodes} (${progressPercent}%)`
                  : progressPercent >= 100
                    ? 'Film ini sudah selesai Anda tonton (100%)'
                    : 'Belum selesai ditonton'}
            </p>
          </div>

          <div className="episode-tracker-controls">
            {!isAuthenticated ? (
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={() => openAuthModal('login')}
              >
                <Lock size={14} /> Masuk untuk Melacak Progres
              </button>
            ) : effectiveTotalEpisodes > 1 ? (
              <>
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={() => handleUpdateEpisodeProgress(progress.watchedEpisodes - 1)}
                  disabled={progress.watchedEpisodes <= 0 || recordingHistory}
                  aria-label="Kurangi episode"
                >
                  <Minus size={14} />
                </button>
                <span className="episode-counter-pill">
                  Ep {progress.watchedEpisodes}/{effectiveTotalEpisodes}
                </span>
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={() => handleUpdateEpisodeProgress(progress.watchedEpisodes + 1)}
                  disabled={progress.watchedEpisodes >= effectiveTotalEpisodes || recordingHistory}
                  aria-label="Tambah episode"
                >
                  <Plus size={14} /> Ep Berikutnya
                </button>
              </>
            ) : (
              <button
                type="button"
                className={`btn btn--sm ${progressPercent >= 100 ? 'btn--outline' : 'btn--primary'}`}
                disabled={recordingHistory}
                onClick={() => handleUpdateEpisodeProgress(progressPercent >= 100 ? 0 : 1)}
              >
                <CheckCircle size={14} />
                {progressPercent >= 100 ? 'Batalkan Status Ditonton' : 'Tandai Selesai Menonton'}
              </button>
            )}

            {isAuthenticated && progress.watchedEpisodes > 0 && (
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={() => handleUpdateEpisodeProgress(0)}
                title="Reset progres tontonan"
              >
                <RotateCcw size={13} />
              </button>
            )}
          </div>
        </div>

        {isAuthenticated && (
          <div className="marathon-progress-bar" style={{ marginTop: '12px' }}>
            <div className="marathon-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        )}
      </div>

      {/* Synopsis Section */}
      <div className="detail-section">
        <h2 className="detail-section__title">Sinopsis Cerita</h2>
        <p className="detail-synopsis">
          {movie.description || movie.synopsis || 'Belum ada sinopsis untuk judul ini.'}
        </p>

        {movie.tags && movie.tags.length > 0 && (
          <div className="detail-tags-wrap">
            {movie.tags.map((t, idx) => (
              <span key={idx} className="tag-pill">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Reviews & Ratings Section (Menghitung Skor Rating & Top 10 Trending Otomatis) */}
      <div className="detail-section">
        <h2 className="detail-section__title">Ulasan Komunitas &amp; Rating Bintang</h2>

        {!isAuthenticated ? (
          <div className="review-box" style={{ alignItems: 'center', textAlign: 'center' }}>
            <p style={{ margin: 0, color: 'var(--steel)', fontSize: '0.9rem' }}>
              Ingin memberi rating bintang dan memengaruhi skor film serta{' '}
              <strong>Top 10 Trending</strong>?
            </p>
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => openAuthModal('login')}
            >
              <LogIn size={14} /> Masuk untuk Tulis Ulasan
            </button>
          </div>
        ) : (
          <form onSubmit={handleReviewSubmit} className="review-box">
            <div className="review-box__head">
              <span className="review-box__label">Beri Rating Bintang ({user?.display_name}):</span>
              <div className="star-picker">
                {[1, 2, 3, 4, 5].map((starVal) => (
                  <button
                    key={starVal}
                    type="button"
                    className="star-picker__btn"
                    onClick={() => setRating(starVal)}
                    aria-label={`${starVal} Bintang`}
                  >
                    <Star
                      size={22}
                      fill={starVal <= rating ? '#e5a93c' : 'none'}
                      stroke={starVal <= rating ? '#e5a93c' : '#495a74'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              className="review-textarea"
              rows="3"
              placeholder="Tulis ulasan, kesan marathon, atau teori ending Anda..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />

            <div className="review-box__foot">
              {msg && (
                <span className="review-success">
                  <CheckCircle size={15} /> {msg}
                </span>
              )}
              <button
                type="submit"
                className="btn btn--primary btn--sm"
                disabled={submitting || !comment.trim()}
              >
                {submitting ? (
                  <>
                    <Loader size={14} className="spin" /> Mengirim...
                  </>
                ) : (
                  <>
                    <Send size={14} /> Kirim Ulasan
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* List of Reviews */}
        {reviewsLoading ? (
          <div className="loading-state">
            <Loader size={20} className="spin" />
            <span>Memuat ulasan...</span>
          </div>
        ) : reviews.length > 0 ? (
          <div className="reviews-list">
            {reviews.map((r) => (
              <div key={r.id} className="review-card">
                <div className="review-card__header">
                  <span className="review-card__user">{r.user_name}</span>
                  <div className="review-card__stars">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < r.rating ? '#e5a93c' : 'none'}
                        stroke={i < r.rating ? '#e5a93c' : '#495a74'}
                      />
                    ))}
                  </div>
                </div>
                <p className="review-card__comment">{r.comment}</p>
                <span className="review-card__date">
                  {new Date(r.created_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-reviews">
            Belum ada ulasan untuk judul ini. Jadilah yang pertama mengulas!
          </p>
        )}
      </div>
    </div>
  )
}
