import { useMemo } from 'react'
import { Bookmark, ArrowRight, Lock, LogIn, UserPlus } from 'lucide-react'
import { useWatchlist } from '../hooks/useWatchlist'
import { useMovies } from '../hooks/useMovies'
import { useAuth } from '../context/AuthContext'
import MovieCard from '../components/movie/MovieCard'

export default function WatchlistPage({ onSelectMovie, onNavigateCatalog }) {
  const { isAuthenticated, openAuthModal } = useAuth()
  const { watchlistIds } = useWatchlist()
  const { movies, loading } = useMovies()

  const watchlistedMovies = useMemo(() => {
    if (!isAuthenticated) return []
    const map = new Map()
    movies.forEach((m) => map.set(String(m.id), m))
    return watchlistIds.map((id) => map.get(String(id))).filter(Boolean)
  }, [watchlistIds, movies, isAuthenticated])

  return (
    <div className="watchlist-page">
      <section className="catalog-masthead">
        <div className="masthead-content">
          <div className="masthead-badge">
            <Bookmark size={14} color="#e5a93c" />
            <span>Koleksi Pribadi</span>
          </div>
          <h1 className="masthead-title">Daftar Tontonan (Watchlist)</h1>
          <p className="masthead-desc">
            Simpan film dan drama pilihan Anda untuk ditonton berikutnya. Daftar tersinkronisasi
            permanen dengan akun Anda.
          </p>
        </div>
      </section>

      {!isAuthenticated ? (
        <div className="status-state auth-lock-state">
          <div className="auth-lock-icon">
            <Lock size={34} color="#e5a93c" />
          </div>
          <h3>Masuk untuk Menggunakan Watchlist Pribadi</h3>
          <p>
            Anda masih dapat menjelajahi katalog film dan menonton preview episode sebagai tamu,
            namun penyimpanan Watchlist pribadi memerlukan akun.
          </p>
          <div className="auth-lock-actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => openAuthModal('login')}
            >
              <LogIn size={16} /> Masuk ke Akun
            </button>
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => openAuthModal('register')}
            >
              <UserPlus size={16} /> Daftar Akun Baru
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="list-toolbar">
            <div className="list-toolbar__info">
              <h2 className="section-heading">Antrean Tontonan Anda</h2>
              <span className="count-badge">{watchlistedMovies.length} Judul Tersimpan</span>
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
                  Jelajahi Film <ArrowRight size={16} />
                </button>
              )}
            </div>
          )}

          {watchlistedMovies.length > 0 && (
            <ul className="movies-grid">
              {watchlistedMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} onSelect={onSelectMovie} />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
