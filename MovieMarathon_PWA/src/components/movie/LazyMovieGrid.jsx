import { ChevronDown } from 'lucide-react'
import { useLazyList } from '../../hooks/useLazyList'
import MovieCard from './MovieCard'

/**
 * LazyMovieGrid — Merender daftar kartu film secara bertahap menggunakan IntersectionObserver,
 * dilengkapi skeleton mini + tombol manual "Muat Lebih Banyak" agar smooth tanpa layout shift.
 */
export default function LazyMovieGrid({
  movies = [],
  initialCount = 8,
  batchSize = 8,
  resetKey = '',
  showRank = false,
  showUploadMeta = false,
  onSelect,
  onEdit,
  onDelete,
}) {
  const { visibleItems, hasMore, remainingCount, sentinelRef, loadMore } = useLazyList(movies, {
    initialCount,
    batchSize,
    resetKey,
  })

  return (
    <div className="lazy-grid-wrap">
      <ul className="movies-grid">
        {visibleItems.map((movie, idx) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            trendingRank={showRank ? movie.trending_rank || idx + 1 : null}
            showUploadMeta={showUploadMeta}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </ul>

      {hasMore && (
        <div ref={sentinelRef} className="lazy-load-sentinel">
          <div className="lazy-sentinel-skeletons" aria-hidden="true">
            <span className="skeleton-dot" />
            <span className="skeleton-dot" />
            <span className="skeleton-dot" />
          </div>
          <button type="button" className="btn btn--outline btn--sm" onClick={loadMore}>
            <ChevronDown size={14} /> Muat Lebih Banyak ({remainingCount} judul lagi)
          </button>
        </div>
      )}
    </div>
  )
}
