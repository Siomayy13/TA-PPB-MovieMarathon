import { useMemo } from 'react'
import { Bookmark, Film, ArrowRight } from 'lucide-react'
import { useWatchlist } from '../hooks/useWatchlist'
import { useMovies } from '../hooks/useMovies'
import MovieCard from '../components/movie/MovieCard'

export default function WatchlistPage({ onSelectMovie, onNavigateCatalog }) {
  const { watchlistIds } = useWatchlist()
  const { movies, loading } = useMovies()

  // Match IDs with full movie items
  const watchlistedMovies = useMemo(() => {
    const map = new Map()
    movies.forEach((m) => {
      map.set(String(m.id), m)
    })

    return watchlistIds
      .map((id) => map.get(String(id)))
      .filter(Boolean)
  }, [watchlistIds, movies])

  return (
    <div className="watchlist-page">
      <section className="catalog-masthead">
        <div className="masthead-content">
          <div className="masthead-badge">
            <Bookmark size={14} color="#e5a93c" />
            <span>Koleksi Disimpan</span>
          </div>
          <h1 className="masthead-title">Daftar Tontonan (Watchlist)</h1>
          <p className="masthead-desc">
            Kumpulan film dan drama yang Anda jadwalkan untuk ditonton berikutnya. Daftar ini
            tersimpan otomatis di perangkat dan dapat diakses kapan saja meski tanpa internet.
          </p>
        </div>
      </section>

      <div className="list-toolbar">
        <div className="list-toolbar__info">
          <h2 className="section-heading">Antrean Tontonan Anda</h2>
          <span className="count-badge">
            {watchlistedMovies.length} Judul Tersimpan
          </span>
        </div>
      </div>

      {!loading && watchlistedMovies.length === 0 && (
        <div className="status-state">
          <Bookmark size={42} color="#495a74" />
          <h3>Watchlist Anda masih kosong</h3>
          <p>
            Jelajahi database film dan drama, lalu klik ikon bookmark untuk menyimpan judul ke
            daftar tontonan Anda.
          </p>
          {onNavigateCatalog && (
            <button
              type="button"
              className="btn btn--primary"
              onClick={onNavigateCatalog}
              style={{ marginTop: '16px' }}
            >
              Jelajahi Database <ArrowRight size={16} />
            </button>
          )}
        </div>
      )}

      {watchlistedMovies.length > 0 && (
        <ul className="movies-grid">
          {watchlistedMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onSelect={onSelectMovie}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
