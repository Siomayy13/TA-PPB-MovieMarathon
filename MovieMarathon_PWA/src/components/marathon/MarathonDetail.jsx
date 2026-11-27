import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Clock,
  Film,
  Layers,
  Coffee,
  Popcorn,
  Star,
  CheckCircle2,
  Circle,
  Sparkles,
  Edit2,
  Trash2,
  ChevronRight,
  X,
} from 'lucide-react'
import marathonService from '../../services/marathonService'
import { useAuth } from '../../context/AuthContext'
import PosterCollage from '../common/PosterCollage'
import { formatRating } from '../../utils/helpers'

export default function MarathonDetail({
  marathon,
  onBack,
  onSelectMovie,
  onEdit,
  onDelete,
  onUpdated,
}) {
  const { isAdmin } = useAuth()
  const [currentMarathon, setCurrentMarathon] = useState(marathon)
  const [completedIds, setCompletedIds] = useState([])
  const [removingMovieId, setRemovingMovieId] = useState(null)

  useEffect(() => {
    setCurrentMarathon(marathon)
  }, [marathon])

  useEffect(() => {
    if (currentMarathon?.id) {
      setCompletedIds(marathonService.getCompletedMovieIds(currentMarathon.id))
    }
  }, [currentMarathon?.id])

  const movies = Array.isArray(currentMarathon?.movies) ? currentMarathon.movies : []
  const posters =
    Array.isArray(currentMarathon?.sample_posters) && currentMarathon.sample_posters.length > 0
      ? currentMarathon.sample_posters
      : movies.map((m) => m.image_url).filter(Boolean).slice(0, 4)

  const completedCount = movies.filter((m) => completedIds.includes(String(m.id))).length
  const progressPercent =
    movies.length > 0 ? Math.round((completedCount / movies.length) * 100) : 0

  const handleToggleDone = (e, movieId) => {
    e.stopPropagation()
    const next = marathonService.toggleMovieCompleted(currentMarathon.id, movieId)
    setCompletedIds(next)
  }

  const handleQuickRemoveMovie = async (e, movieId) => {
    e.stopPropagation()
    try {
      setRemovingMovieId(movieId)
      const res = await marathonService.removeMovieFromMarathon(currentMarathon.id, movieId)
      if (res.success && res.data) {
        setCurrentMarathon(res.data)
        if (onUpdated) onUpdated(res.data)
      }
    } catch (err) {
      alert(err?.message || 'Gagal menghapus film dari collection.')
    } finally {
      setRemovingMovieId(null)
    }
  }

  return (
    <div className="movie-detail">
      <button type="button" className="detail-back-btn" onClick={onBack}>
        <ArrowLeft size={18} /> Kembali ke Collections
      </button>

      {/* Hero Banner with Poster Collage */}
      <div className="detail-hero">
        <div className="detail-poster-wrap">
          <PosterCollage
            posters={posters}
            fallbackUrl={currentMarathon.cover_url}
            alt={currentMarathon.title}
          />
        </div>

        <div className="detail-info">
          <div className="detail-badge-row">
            <span className="badge badge--primary">Collection</span>
            <span className="badge badge--outline">{currentMarathon.theme}</span>
          </div>

          <h1 className="detail-title">{currentMarathon.title}</h1>

          <div className="detail-stats-bar">
            <div className="stat-pill">
              <Clock size={16} color="#e5a93c" />
              <span>{currentMarathon.total_duration}</span>
            </div>
            <div className="stat-pill">
              <Film size={16} color="#e5a93c" />
              <span>{movies.length} Tayangan</span>
            </div>
            <div className="stat-pill">
              <Sparkles size={16} color="#e5a93c" />
              <span>{currentMarathon.mood}</span>
            </div>
          </div>

          <p className="detail-synopsis" style={{ marginBottom: '18px' }}>
            {currentMarathon.description || 'Koleksi kurasi khusus untuk pengalaman menonton terbaik.'}
          </p>

          {/* Progress Tracker */}
          <div className="marathon-progress-box">
            <div className="marathon-progress-head">
              <span>Progres Tontonan</span>
              <strong>
                {completedCount}/{movies.length} Selesai ({progressPercent}%)
              </strong>
            </div>
            <div className="marathon-progress-bar">
              <div className="marathon-progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          {/* Admin Controls */}
          {isAdmin && (
            <div className="detail-actions" style={{ marginTop: '16px', flexWrap: 'wrap' }}>
              {onEdit && (
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={() => onEdit(currentMarathon)}
                >
                  <Edit2 size={15} /> Edit Collection &amp; Kelola Film
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  className="btn btn--danger btn--sm"
                  onClick={() => onDelete(currentMarathon)}
                >
                  <Trash2 size={15} /> Hapus Collection
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tips & Snack Grid */}
      <div className="marathon-info-grid">
        <div className="detail-section">
          <h2 className="detail-section__title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Popcorn size={18} color="#e5a93c" /> Rekomendasi Camilan
          </h2>
          <p className="detail-synopsis" style={{ margin: 0 }}>
            {currentMarathon.snack_recommendation || 'Popcorn, teh hangat, dan air mineral.'}
          </p>
        </div>

        <div className="detail-section">
          <h2 className="detail-section__title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Coffee size={18} color="#27ae60" /> Jadwal Istirahat Sehat
          </h2>
          <p className="detail-synopsis" style={{ margin: 0 }}>
            {currentMarathon.break_schedule || 'Ambil jeda 15 menit setelah setiap film atau 2 episode.'}
          </p>
        </div>
      </div>

      {/* Ordered Lineup of Movies */}
      <div className="detail-section">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '12px',
            paddingBottom: '8px',
            borderBottom: '1px solid var(--line)',
          }}
        >
          <h2
            className="detail-section__title"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, border: 'none', padding: 0 }}
          >
            <Layers size={18} color="#e5a93c" /> Daftar Film dalam Collection ({movies.length})
          </h2>
          {isAdmin && onEdit && (
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => onEdit(currentMarathon)}
            >
              <Edit2 size={13} /> Tambah / Atur Film
            </button>
          )}
        </div>

        {movies.length === 0 ? (
          <p className="no-reviews">Belum ada film yang ditautkan pada collection ini.</p>
        ) : (
          <div className="marathon-lineup">
            {movies.map((movie, idx) => {
              const isDone = completedIds.includes(String(movie.id))
              return (
                <div
                  key={movie.id}
                  className={`lineup-item ${isDone ? 'lineup-item--done' : ''}`}
                  onClick={() => onSelectMovie && onSelectMovie(movie)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && onSelectMovie) onSelectMovie(movie)
                  }}
                >
                  <button
                    type="button"
                    className="lineup-check-btn"
                    onClick={(e) => handleToggleDone(e, movie.id)}
                    title={isDone ? 'Tandai belum selesai' : 'Tandai sudah ditonton'}
                    aria-label={`Tandai ${movie.title}`}
                  >
                    {isDone ? (
                      <CheckCircle2 size={22} color="#27ae60" />
                    ) : (
                      <Circle size={22} color="#505d73" />
                    )}
                  </button>

                  <span className="lineup-order">#{movie.watch_order || idx + 1}</span>

                  <img
                    src={movie.image_url}
                    alt={movie.title}
                    className="lineup-thumb"
                    loading="lazy"
                  />

                  <div className="lineup-info">
                    <div className="lineup-title-row">
                      <h3 className="lineup-title">{movie.title}</h3>
                      <span className="lineup-type">{movie.type}</span>
                    </div>
                    <div className="lineup-meta">
                      <span>
                        <Star size={12} fill="#e5a93c" stroke="#e5a93c" />{' '}
                        {formatRating(movie.rating)}
                      </span>
                      <span>&bull;</span>
                      <span>{movie.duration}</span>
                      <span>&bull;</span>
                      <span>{movie.release_year}</span>
                    </div>
                    {movie.note && <p className="lineup-note">{movie.note}</p>}
                  </div>

                  {isAdmin && (
                    <button
                      type="button"
                      className="btn btn--outline btn--sm"
                      disabled={removingMovieId === movie.id}
                      onClick={(e) => handleQuickRemoveMovie(e, movie.id)}
                      title="Hapus film ini dari collection"
                      aria-label={`Hapus ${movie.title} dari collection`}
                    >
                      <X size={14} />
                    </button>
                  )}

                  <ChevronRight size={18} className="lineup-arrow" />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
