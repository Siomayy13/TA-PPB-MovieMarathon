import { Clock, Film, Layers, Sparkles, Edit2, Trash2, ChevronRight } from 'lucide-react'
import PosterCollage from '../common/PosterCollage'
import { truncate } from '../../utils/helpers'

export default function MarathonCard({ marathon, onSelect, onEdit, onDelete }) {
  const movieCount = marathon.movie_count ?? marathon.movies?.length ?? 0
  const posters =
    Array.isArray(marathon.sample_posters) && marathon.sample_posters.length > 0
      ? marathon.sample_posters
      : (marathon.movies || []).map((m) => m.image_url).filter(Boolean).slice(0, 4)

  return (
    <li className="marathon-card">
      <div
        className="marathon-card__clickable"
        onClick={() => onSelect(marathon)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onSelect(marathon)
          }
        }}
      >
        <div className="marathon-card__cover-wrap">
          <PosterCollage posters={posters} fallbackUrl={marathon.cover_url} alt={marathon.title} />
          <div className="marathon-card__overlay" />
          <span className="diff-badge diff-badge--collection">
            <Layers size={12} /> Collection
          </span>
          <span className="marathon-card__count">
            <Film size={12} /> {movieCount} Judul
          </span>
        </div>

        <div className="marathon-card__body">
          <div className="marathon-card__theme">
            <Sparkles size={13} color="#e5a93c" />
            <span>{marathon.theme}</span>
          </div>

          <h3 className="marathon-card__title">{marathon.title}</h3>

          <div className="marathon-card__meta">
            <span className="marathon-meta-pill">
              <Clock size={13} /> {marathon.total_duration}
            </span>
            <span className="marathon-meta-pill">{marathon.mood}</span>
          </div>

          {marathon.description && (
            <p className="marathon-card__desc">{truncate(marathon.description, 110)}</p>
          )}

          <div className="marathon-card__cta">
            <span>Lihat Isi Collection</span>
            <ChevronRight size={15} />
          </div>
        </div>
      </div>

      {/* Admin floating action buttons */}
      {(onEdit || onDelete) && (
        <div className="marathon-card__admin-actions">
          {onEdit && (
            <button
              type="button"
              className="movie-card__act-btn"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(marathon)
              }}
              title="Edit Collection & Kelola Film"
              aria-label={`Edit ${marathon.title}`}
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
                onDelete(marathon)
              }}
              title="Hapus Collection"
              aria-label={`Hapus ${marathon.title}`}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}
    </li>
  )
}
