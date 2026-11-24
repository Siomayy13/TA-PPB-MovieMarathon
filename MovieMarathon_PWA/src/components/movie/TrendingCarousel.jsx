import { useState, useEffect } from 'react'
import { Flame, Star, Calendar, Clock, ChevronLeft, ChevronRight, Play } from 'lucide-react'
import WatchlistButton from '../common/WatchlistButton'
import { formatRating, truncate } from '../../utils/helpers'

export default function TrendingCarousel({ movies = [], onSelect }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const total = movies.length

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

  const activeMovie = movies[currentIndex] || movies[0]
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
      aria-label="Film dan Drama Sedang Trending"
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
              <Flame size={13} /> TRENDING #{currentIndex + 1}
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
            <span className="trending-meta-chip trending-meta-chip--gold">
              <Star size={14} fill="#e5a93c" stroke="#e5a93c" />
              {formatRating(activeMovie.rating)} / 10
            </span>
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
              <Play size={16} fill="#0e131f" /> Lihat Detail
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
          <img src={poster} alt={activeMovie.title} className="trending-hero__poster-img" />
        </div>
      </div>

      {/* Bottom Thumbnail Strip / Slide Selector */}
      {total > 1 && (
        <div className="trending-hero__strip" role="tablist" aria-label="Pilih film trending">
          {movies.map((m, idx) => {
            const isActive = idx === currentIndex
            return (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`trending-thumb ${isActive ? 'trending-thumb--active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
              >
                <img
                  src={
                    m.image_url ||
                    m.image ||
                    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&auto=format&fit=crop&q=80'
                  }
                  alt={m.title}
                  className="trending-thumb__img"
                />
                <div className="trending-thumb__text">
                  <span className="trending-thumb__rank">#{idx + 1}</span>
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
