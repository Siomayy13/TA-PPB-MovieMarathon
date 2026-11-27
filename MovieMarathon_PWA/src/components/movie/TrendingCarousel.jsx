import { useState, useEffect } from 'react'
import {
  Flame,
  Star,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Play,
  MessageSquare,
} from 'lucide-react'
import WatchlistButton from '../common/WatchlistButton'
import LazyImage from '../common/LazyImage'
import { formatRating, truncate } from '../../utils/helpers'

export default function TrendingCarousel({ movies = [], onSelect }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const topMovies = movies.slice(0, 10)
  const total = topMovies.length

  // Jaga agar index tetap valid jika daftar film berubah
  useEffect(() => {
    if (currentIndex >= total && total > 0) {
      setCurrentIndex(0)
    }
  }, [total, currentIndex])

  // Auto-advance carousel setiap 6 detik (jeda saat hover)
  useEffect(() => {
    if (total <= 1 || isPaused) return undefined
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total)
    }, 6000)
    return () => clearInterval(timer)
  }, [total, isPaused])

  if (total === 0) return null

  const activeMovie = topMovies[currentIndex] || topMovies[0]
  const rankNumber = activeMovie.trending_rank || currentIndex + 1
  const reviewCount = Number(activeMovie.review_count || 0)
  const avgStars = Number(activeMovie.average_review_rating || 0)

  const poster =
    activeMovie.image_url ||
    activeMovie.image ||
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80'

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total)
  }

  return (
    <section
      className="trending-hero"
      aria-label="Top 10 Film dan Drama Trending Berdasarkan Ulasan"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Blurred Ambient Backdrop */}
      <div
        className="trending-hero__backdrop"
        style={{ backgroundImage: `url(${poster})` }}
        aria-hidden="true"
      />
      <div className="trending-hero__scrim" aria-hidden="true" />

      {/* Main Slide Content */}
      <div className="trending-hero__inner">
        <div className="trending-hero__info">
          <div className="trending-hero__badges">
            <span className="trending-pill">
              <Flame size={13} /> TRENDING #{rankNumber}
            </span>
            <span className="badge badge--primary">{activeMovie.type || 'Movie'}</span>
            <span
              className={`badge ${
                activeMovie.status === 'Ongoing' ? 'badge--ongoing' : 'badge--tamat'
              }`}
            >
              {activeMovie.status === 'Ongoing' ? 'Ongoing' : 'Tamat'}
            </span>
          </div>

          <h1 className="trending-hero__title">{activeMovie.title}</h1>

          <div className="trending-hero__meta">
            {reviewCount > 0 ? (
              <span className="trending-meta-chip trending-meta-chip--gold">
                <Star size={14} fill="#e5a93c" stroke="#e5a93c" />
                {avgStars.toFixed(1)} / 5 ({reviewCount} ulasan)
              </span>
            ) : (
              <span className="trending-meta-chip trending-meta-chip--gold">
                <Star size={14} fill="#e5a93c" stroke="#e5a93c" />
                {Number(activeMovie.rating) > 0
                  ? `Skor ${formatRating(activeMovie.rating)} / 10`
                  : 'Belum ada rating'}
              </span>
            )}
            {reviewCount > 0 && (
              <span className="trending-meta-chip">
                <MessageSquare size={13} color="#e5a93c" /> {activeMovie.total_stars || 0} Total
                Bintang
              </span>
            )}
            <span className="trending-meta-chip">
              <Calendar size={14} /> {activeMovie.release_year || activeMovie.year || '2024'}
            </span>
            <span className="trending-meta-chip">
              <Clock size={14} /> {activeMovie.duration || 'Feature'}
            </span>
          </div>

          <p className="trending-hero__genre">{activeMovie.genre || 'Drama'}</p>

          {activeMovie.description && (
            <p className="trending-hero__desc">{truncate(activeMovie.description, 175)}</p>
          )}

          <div className="trending-hero__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => onSelect && onSelect(activeMovie)}
            >
              <Play size={16} fill="#0e131f" /> Lihat Detail &amp; Episode
            </button>
            <WatchlistButton movieId={activeMovie.id} />

            {total > 1 && (
              <div className="trending-hero__nav-btns">
                <button
                  type="button"
                  className="trending-nav-btn"
                  onClick={handlePrev}
                  aria-label="Film trending sebelumnya"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  className="trending-nav-btn"
                  onClick={handleNext}
                  aria-label="Film trending berikutnya"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Crisp Foreground Poster */}
        <div
          className="trending-hero__poster-card"
          onClick={() => onSelect && onSelect(activeMovie)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && onSelect) onSelect(activeMovie)
          }}
        >
          <LazyImage
            src={poster}
            alt={activeMovie.title}
            className="trending-hero__poster-img"
            eager
          />
        </div>
      </div>

      {/* Bottom Thumbnail Strip / Top 10 Slide Selector */}
      {total > 1 && (
        <div
          className="trending-hero__strip"
          role="tablist"
          aria-label="Pilih film Top 10 trending"
        >
          {topMovies.map((m, idx) => {
            const isActive = idx === currentIndex
            const itemRank = m.trending_rank || idx + 1
            const itemReviews = Number(m.review_count || 0)
            return (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`trending-thumb ${isActive ? 'trending-thumb--active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
              >
                <LazyImage
                  src={
                    m.image_url ||
                    m.image ||
                    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&auto=format&fit=crop&q=80'
                  }
                  alt={m.title}
                  className="trending-thumb__img"
                  wrapperClassName="trending-thumb__img-wrap"
                />
                <div className="trending-thumb__text">
                  <span className="trending-thumb__rank">
                    #{itemRank}
                    {itemReviews > 0 ? ` • ★ ${Number(m.average_review_rating || 0).toFixed(1)}` : ''}
                  </span>
                  <span className="trending-thumb__title">{m.title}</span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}
