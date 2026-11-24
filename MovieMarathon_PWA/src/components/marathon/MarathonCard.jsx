import { Clock, Film, Layers, Sparkles, Trash2, ChevronRight } from 'lucide-react'
import { truncate } from '../../utils/helpers'

export default function MarathonCard({ marathon, onSelect, onDelete }) {
  const movieCount = marathon.movie_count ?? marathon.movies?.length ?? 0

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
          <img
            src={marathon.cover_url}
            alt={marathon.title}
            className="marathon-card__cover"
            loading="lazy"
          />
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

      {onDelete && (
        <button
          type="button"
          className="marathon-card__delete-btn"
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
    </li>
  )
}
