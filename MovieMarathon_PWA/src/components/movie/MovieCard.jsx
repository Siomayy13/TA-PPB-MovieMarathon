import { useState, useEffect } from 'react'
import { Star, Edit2, Trash2, CheckCircle2, Flame, Clock, Tv } from 'lucide-react'
import WatchlistButton from '../common/WatchlistButton'
import watchProgressService from '../../services/watchProgressService'
import { formatRating, formatUploadTime, truncate } from '../../utils/helpers'

export default function MovieCard({
  movie,
  onSelect,
  onEdit,
  onDelete,
  trendingRank = null,
  showUploadMeta = false,
}) {
  const [progress, setProgress] = useState(() =>
    watchProgressService.getProgress(movie.id, movie.duration),
  )

  useEffect(() => {
    const sync = () => setProgress(watchProgressService.getProgress(movie.id, movie.duration))
    sync()
    window.addEventListener('watch-progress-updated', sync)
    return () => window.removeEventListener('watch-progress-updated', sync)
  }, [movie.id, movie.duration])

  const poster =
    movie.image_url ||
    movie.image ||
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80'

  const hasRating = Number(movie.rating) > 0
  const uploadTimestamp =
    movie.latest_episode_uploaded_at ||
    movie.latest_upload_at ||
    movie.createdAt ||
    movie.created_at
  const formattedUpload = showUploadMeta ? formatUploadTime(uploadTimestamp) : ''

  return (
    <li className="movie-card">
      <div
        className="movie-card__clickable"
        onClick={() => onSelect(movie)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSelect(movie)
        }}
      >
        {/* Poster with overlay badges */}
        <div className="movie-card__poster-wrap">
          <img
            src={poster}
            alt={movie.title}
            className="movie-card__poster"
            loading="lazy"
          />
          {trendingRank ? (
            <div className="movie-card__rank-badge">
              <Flame size={11} /> #{trendingRank}
            </div>
          ) : showUploadMeta && movie.latest_episode_number ? (
            <div className="movie-card__eps-badge">
              <Tv size={11} /> Eps {movie.latest_episode_number}
            </div>
          ) : (
            <div className="movie-card__badge-type">{movie.type || 'Movie'}</div>
          )}
          <div
            className={`movie-card__status-badge ${
              movie.status === 'Ongoing'
                ? 'movie-card__status-badge--ongoing'
                : 'movie-card__status-badge--tamat'
            }`}
          >
            {movie.status === 'Ongoing' ? 'Ongoing' : 'Tamat'}
          </div>
          <div className="movie-card__rating-badge">
            <Star size={13} fill="#e5a93c" stroke="#e5a93c" />
            <span>
              {trendingRank && Number(movie.review_count) > 0
                ? `${Number(movie.average_review_rating || 0).toFixed(1)} (${movie.review_count})`
                : hasRating
                  ? formatRating(movie.rating)
                  : 'Baru'}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="movie-card__info">
          <h3 className="movie-card__title">{movie.title}</h3>
          <div className="movie-card__meta">
            <span>{movie.release_year || movie.year || '2024'}</span>
            <span>•</span>
            <span>{movie.duration || 'Feature'}</span>
          </div>
          <p className="movie-card__genre">{movie.genre || 'Drama'}</p>

          {/* Detail Episode & Waktu Upload khusus di bagian "Baru Saja Di-upload" */}
          {showUploadMeta && (
            <div className="movie-card__upload-meta">
              <span className="upload-meta__ep">
                {movie.latest_episode_number
                  ? `Eps ${movie.latest_episode_number}`
                  : movie.type === 'Movie'
                    ? 'Film Penuh'
                    : 'Baru Up'}
              </span>
              {formattedUpload && (
                <span className="upload-meta__time">
                  <Clock size={11} /> {formattedUpload}
                </span>
              )}
            </div>
          )}

          {movie.description && (
            <p className="movie-card__desc">{truncate(movie.description, 80)}</p>
          )}
          {progress.watchedEpisodes > 0 && (
            <div className="movie-card__progress">
              <CheckCircle2 size={12} color="#4ade80" />
              <span>
                {progress.completed
                  ? 'Selesai Ditonton'
                  : `Progres: Ep ${progress.watchedEpisodes}/${progress.totalEpisodes}`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="movie-card__actions">
        <WatchlistButton movieId={movie.id} />
        {onEdit && (
          <button
            type="button"
            className="movie-card__act-btn"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(movie)
            }}
            title="Edit Film/Drama"
            aria-label={`Edit ${movie.title}`}
          >
            <Edit2 size={14} />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            className="movie-card__act-btn movie-card__act-btn--danger"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(movie)
            }}
            title="Hapus Film/Drama"
            aria-label={`Hapus ${movie.title}`}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </li>
  )
}
