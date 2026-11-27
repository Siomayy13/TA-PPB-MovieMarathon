/**
 * Komponen skeleton shimmer tema gelap (konsisten dengan kartu Movie Marathon)
 * untuk mencegah layout shift saat katalog, batch lazy load, atau direct link detail dimuat.
 */
export function MovieGridSkeleton({ count = 4 }) {
  return (
    <ul className="movies-grid" aria-label="Memuat daftar film..." aria-busy="true">
      {Array.from({ length: count }, (_, idx) => (
        <li key={idx} className="movie-card skeleton-card" aria-hidden="true">
          <div className="movie-card__poster-wrap skeleton-box" />
          <div className="movie-card__info">
            <div className="skeleton-line skeleton-line--title" />
            <div className="skeleton-line skeleton-line--meta" />
            <div className="skeleton-line skeleton-line--genre" />
            <div className="skeleton-line skeleton-line--desc" />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function MovieDetailSkeleton() {
  return (
    <div className="movie-detail" aria-label="Memuat detail film..." aria-busy="true">
      <div className="skeleton-line skeleton-btn-back" />

      <div className="detail-hero">
        <div className="detail-poster-wrap skeleton-box skeleton-detail-poster" />
        <div className="detail-info" style={{ gap: '14px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div className="skeleton-pill" />
            <div className="skeleton-pill" />
            <div className="skeleton-pill" />
          </div>
          <div className="skeleton-line skeleton-detail-title" />
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div className="skeleton-pill skeleton-pill--lg" />
            <div className="skeleton-pill skeleton-pill--lg" />
            <div className="skeleton-pill skeleton-pill--lg" />
          </div>
          <div className="skeleton-line" style={{ width: '75%', height: '14px' }} />
          <div className="skeleton-line" style={{ width: '65%', height: '14px' }} />
          <div className="skeleton-line" style={{ width: '50%', height: '14px' }} />
          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <div className="skeleton-pill skeleton-pill--btn" />
            <div className="skeleton-pill skeleton-pill--btn" />
          </div>
        </div>
      </div>

      <div className="detail-section">
        <div className="skeleton-line" style={{ width: '240px', height: '18px', marginBottom: '14px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="skeleton-box" style={{ height: '62px', borderRadius: '11px' }} />
          <div className="skeleton-box" style={{ height: '62px', borderRadius: '11px' }} />
          <div className="skeleton-box" style={{ height: '62px', borderRadius: '11px' }} />
        </div>
      </div>
    </div>
  )
}
