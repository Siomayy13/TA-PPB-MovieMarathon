import { useState, useEffect } from 'react'
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
} from 'lucide-react'
import WatchlistButton from '../common/WatchlistButton'
import { useReviews, useCreateReview } from '../../hooks/useReviews'
import { getUserProfile } from '../../services/userService'
import watchProgressService from '../../services/watchProgressService'
import { formatRating } from '../../utils/helpers'

export default function MovieDetail({ movie, onBack, onEdit, onDelete }) {
  const poster =
    movie.image_url ||
    movie.image ||
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80'

  const { reviews, loading: reviewsLoading, refetch: refetchReviews } = useReviews(movie.id)
  const { createReview, submitting } = useCreateReview()

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [msg, setMsg] = useState('')
  const [progress, setProgress] = useState(() =>
    watchProgressService.getProgress(movie.id, movie.duration),
  )

  useEffect(() => {
    setProgress(watchProgressService.getProgress(movie.id, movie.duration))
  }, [movie.id, movie.duration])

  const handleUpdateEpisode = (nextCount) => {
    const updated = watchProgressService.setProgress(movie.id, nextCount, movie.duration)
    setProgress(updated)
  }

  const progressPercent =
    progress.totalEpisodes > 0
      ? Math.round((progress.watchedEpisodes / progress.totalEpisodes) * 100)
      : 0

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    setMsg('')
    if (!comment.trim()) return

    const profile = getUserProfile()
    const result = await createReview(movie.id, {
      user_name: profile.nama || 'Penonton Marathon',
      rating,
      comment: comment.trim(),
    })

    if (result) {
      setMsg('Ulasan berhasil ditambahkan!')
      setComment('')
      setRating(5)
      refetchReviews()
      setTimeout(() => setMsg(''), 3000)
    }
  }

  return (
    <div className="movie-detail">
      {/* Navigation Back */}
      <button type="button" className="detail-back-btn" onClick={onBack}>
        <ArrowLeft size={18} /> Kembali ke Database
      </button>

      {/* Hero Section */}
      <div className="detail-hero">
        <div className="detail-poster-wrap">
          <img src={poster} alt={movie.title} className="detail-poster" />
        </div>

        <div className="detail-info">
          <div className="detail-badge-row">
            <span className="badge badge--primary">{movie.type || 'Movie'}</span>
            <span
              className={`badge ${
                movie.status === 'Ongoing' ? 'badge--ongoing' : 'badge--tamat'
              }`}
            >
              {movie.status === 'Ongoing' ? 'Ongoing' : 'Tamat'}
            </span>
            <span className="badge badge--outline">{movie.genre || 'Drama'}</span>
          </div>

          <h1 className="detail-title">{movie.title}</h1>

          <div className="detail-stats-bar">
            <div className="stat-pill">
              <Star size={16} fill="#e5a93c" stroke="#e5a93c" />
              <span>{formatRating(movie.rating)} / 10</span>
            </div>
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
              <span><strong>Sutradara:</strong> {movie.director || 'N/A'}</span>
            </div>
            <div className="crew-item">
              <User size={15} />
              <span><strong>Pemeran:</strong> {movie.cast || 'N/A'}</span>
            </div>
            {movie.streaming_on && (
              <div className="crew-item">
                <Tv size={15} />
                <span><strong>Platform:</strong> {movie.streaming_on}</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="detail-actions">
            <WatchlistButton movieId={movie.id} />
            {onEdit && (
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={() => onEdit(movie)}
              >
                <Edit2 size={15} /> Edit Film
              </button>
            )}
            {onDelete && (
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

      {/* Watch / Episode Progress Tracker (Persisten) */}
      <div className="detail-section">
        <div className="episode-tracker-head">
          <div>
            <h2 className="detail-section__title" style={{ marginBottom: '4px', borderBottom: 'none', paddingBottom: 0 }}>
              Progres Tontonan {progress.totalEpisodes > 1 ? '& Episode' : ''}
            </h2>
            <p className="episode-tracker-sub">
              {progress.totalEpisodes > 1
                ? `Episode ${progress.watchedEpisodes} dari ${progress.totalEpisodes} (${progressPercent}%)`
                : progress.completed
                  ? 'Film ini sudah selesai Anda tonton (100%)'
                  : 'Belum selesai ditonton'}
            </p>
          </div>

          <div className="episode-tracker-controls">
            {progress.totalEpisodes > 1 ? (
              <>
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={() => handleUpdateEpisode(progress.watchedEpisodes - 1)}
                  disabled={progress.watchedEpisodes <= 0}
                  aria-label="Kurangi episode"
                >
                  <Minus size={14} />
                </button>
                <span className="episode-counter-pill">
                  Ep {progress.watchedEpisodes}/{progress.totalEpisodes}
                </span>
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={() => handleUpdateEpisode(progress.watchedEpisodes + 1)}
                  disabled={progress.watchedEpisodes >= progress.totalEpisodes}
                  aria-label="Tambah episode"
                >
                  <Plus size={14} /> Ep Berikutnya
                </button>
              </>
            ) : (
              <button
                type="button"
                className={`btn btn--sm ${progress.completed ? 'btn--outline' : 'btn--primary'}`}
                onClick={() => handleUpdateEpisode(progress.completed ? 0 : 1)}
              >
                <CheckCircle size={14} />
                {progress.completed ? 'Tandai Belum Ditonton' : 'Tandai Selesai Ditonton'}
              </button>
            )}

            {progress.watchedEpisodes > 0 && (
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={() => handleUpdateEpisode(0)}
                title="Reset progres tontonan"
              >
                <RotateCcw size={13} />
              </button>
            )}
          </div>
        </div>

        <div className="marathon-progress-bar" style={{ marginTop: '12px' }}>
          <div className="marathon-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
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

      {/* Reviews & Ratings Section */}
      <div className="detail-section">
        <h2 className="detail-section__title">Ulasan Komunitas &amp; Rating</h2>

        {/* Submit Review Form */}
        <form onSubmit={handleReviewSubmit} className="review-box">
          <div className="review-box__head">
            <span className="review-box__label">Beri Rating Anda:</span>
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
          <p className="no-reviews">Belum ada ulasan untuk judul ini. Jadilah yang pertama mengulas!</p>
        )}
      </div>
    </div>
  )
}
