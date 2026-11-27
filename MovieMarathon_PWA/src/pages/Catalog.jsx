import { useState, useMemo } from 'react'
import {
  Plus,
  RefreshCw,
  Loader,
  AlertCircle,
  Film,
  Flame,
  Clock,
  CheckCircle2,
  Radio,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { useMovies, useTrendingMovies } from '../hooks/useMovies'
import { useAuth } from '../context/AuthContext'
import MovieCard from '../components/movie/MovieCard'
import MovieDetail from '../components/movie/MovieDetail'
import TrendingCarousel from '../components/movie/TrendingCarousel'
import AdvancedFilter from '../components/common/AdvancedFilter'
import ConfirmModal from '../components/modals/ConfirmModal'
import movieService from '../services/movieService'
import {
  matchesSearch,
  matchesCategory,
  sortMovies,
  extractCategories,
} from '../utils/helpers'

export default function Catalog({ onNavigate }) {
  const { isAdmin } = useAuth()
  const { movies, loading, error, refetch, source } = useMovies()
  const { trending, refetch: refetchTrending } = useTrendingMovies(10)

  // Filter & Search states
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeStatus, setActiveStatus] = useState('All') // 'All' | 'Ongoing' | 'Tamat'
  const [sortKey, setSortKey] = useState('rating')
  const [sortOrder, setSortOrder] = useState('desc')

  // Selected for detail view
  const [selectedMovie, setSelectedMovie] = useState(null)

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const categories = useMemo(() => extractCategories(movies), [movies])

  // Filtered base list (search + category + status)
  const filteredMovies = useMemo(() => {
    const list = movies.filter((m) => {
      const matchStatus = activeStatus === 'All' || (m.status || 'Tamat') === activeStatus
      return matchesSearch(m, search) && matchesCategory(m, activeCategory) && matchStatus
    })
    return sortMovies(list, sortKey, sortOrder)
  }, [movies, search, activeCategory, activeStatus, sortKey, sortOrder])

  // Tampilkan 3 bagian utama saat belum mempersempit ke 1 status atau pencarian
  const showThreeSections = activeStatus === 'All' && !search.trim()

  // Bagian 1 (Paling Atas): Top 10 Trending Otomatis berdasarkan rata-rata bintang & ulasan
  const trendingMovies = useMemo(() => {
    const sourceList = trending.length > 0 ? trending : movies
    const base = sourceList.filter((m) => matchesCategory(m, activeCategory))
    return [...base]
      .sort((a, b) => {
        if (a.trending_rank && b.trending_rank && a.trending_rank !== b.trending_rank) {
          return a.trending_rank - b.trending_rank
        }
        const avgDiff =
          (Number(b.average_review_rating) || 0) - (Number(a.average_review_rating) || 0)
        if (avgDiff !== 0) return avgDiff
        const countDiff = (Number(b.review_count) || 0) - (Number(a.review_count) || 0)
        if (countDiff !== 0) return countDiff
        return (Number(b.rating) || 0) - (Number(a.rating) || 0)
      })
      .slice(0, 10)
      .map((m, idx) => ({
        ...m,
        trending_rank: activeCategory === 'All' ? m.trending_rank || idx + 1 : idx + 1,
      }))
  }, [trending, movies, activeCategory])

  // Bagian 2 (Di bawah Trending): Baru Saja Di-upload (urut berdasarkan timestamp upload episode / film terbaru)
  const recentlyUploadedMovies = useMemo(() => {
    const base = movies.filter((m) => matchesCategory(m, activeCategory))
    return [...base].sort((a, b) => {
      const timeA = new Date(
        a.latest_episode_uploaded_at || a.latest_upload_at || a.createdAt || a.created_at || 0,
      ).getTime()
      const timeB = new Date(
        b.latest_episode_uploaded_at || b.latest_upload_at || b.createdAt || b.created_at || 0,
      ).getTime()
      if (timeB !== timeA) return timeB - timeA
      return (Number(b.release_year) || 0) - (Number(a.release_year) || 0)
    })
  }, [movies, activeCategory])

  // Bagian 3 (Paling Bawah): Sudah Tamat (status === "Tamat")
  const completedMovies = useMemo(() => {
    const base = movies.filter(
      (m) => matchesCategory(m, activeCategory) && (m.status || 'Tamat') === 'Tamat',
    )
    return sortMovies(base, sortKey, sortOrder)
  }, [movies, activeCategory, sortKey, sortOrder])

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      setDeleteError('')
      await movieService.deleteMovie(deleteTarget.id)
      setDeleteTarget(null)
      refetch()
      refetchTrending()
    } catch (err) {
      setDeleteError(err.message || 'Gagal menghapus film.')
    } finally {
      setDeleting(false)
    }
  }

  // If in detail mode
  if (selectedMovie) {
    return (
      <MovieDetail
        movie={selectedMovie}
        onBack={() => {
          setSelectedMovie(null)
          refetch()
          refetchTrending()
        }}
        onEdit={isAdmin && onNavigate ? (m) => onNavigate('Edit', m) : undefined}
        onDelete={
          isAdmin
            ? (m) => {
                setSelectedMovie(null)
                setDeleteTarget(m)
              }
            : undefined
        }
      />
    )
  }

  const renderMovieGrid = (items, { showRank = false, showUploadMeta = false } = {}) => (
    <ul className="movies-grid">
      {items.map((movie, idx) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          trendingRank={showRank ? movie.trending_rank || idx + 1 : null}
          showUploadMeta={showUploadMeta}
          onSelect={setSelectedMovie}
          onEdit={isAdmin && onNavigate ? (m) => onNavigate('Edit', m) : undefined}
          onDelete={isAdmin ? setDeleteTarget : undefined}
        />
      ))}
    </ul>
  )

  return (
    <div className="catalog-page">
      {/* BAGIAN 1 (PALING ATAS): Hero Carousel Top 10 Trending Otomatis */}
      {!loading && showThreeSections && trendingMovies.length > 0 && (
        <TrendingCarousel movies={trendingMovies} onSelect={setSelectedMovie} />
      )}

      {/* Toolbar & Kontrol Katalog */}
      <div className="list-toolbar">
        <div className="list-toolbar__info">
          <h2 className="section-heading">Jelajahi Film &amp; Drama</h2>
          <span className="count-badge">{filteredMovies.length} Judul</span>
          <span
            className={`source-pill ${source === 'api' ? 'source-pill--api' : 'source-pill--local'}`}
          >
            {source === 'api' ? <Wifi size={12} /> : <WifiOff size={12} />}
            {source === 'api' ? 'Online' : 'Mode Offline'}
          </span>
        </div>

        {isAdmin && onNavigate && (
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => onNavigate('Create')}
          >
            <Plus size={16} /> Tambah Judul
          </button>
        )}
      </div>

      {/* Advanced Filters (Search + Kategori + Sort + Ongoing/Tamat) */}
      <AdvancedFilter
        search={search}
        onSearch={setSearch}
        categories={categories}
        activeCategory={activeCategory}
        onCategory={setActiveCategory}
        activeStatus={activeStatus}
        onStatus={setActiveStatus}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSort={({ key, order }) => {
          setSortKey(key)
          setSortOrder(order)
        }}
      />

      {/* Loading state */}
      {loading && (
        <div className="status-state">
          <Loader size={32} className="spin" />
          <p>Memuat katalog film dan drama...</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && movies.length === 0 && (
        <div className="status-state status-state--error">
          <AlertCircle size={32} />
          <p>{error}</p>
          <button type="button" className="btn btn--outline" onClick={refetch}>
            <RefreshCw size={15} /> Muat Ulang
          </button>
        </div>
      )}

      {/* Empty Search / Filter Result */}
      {!loading && filteredMovies.length === 0 && !error && (
        <div className="status-state">
          <Film size={36} color="#495a74" />
          <h3>Tidak ada film yang cocok</h3>
          <p>Coba gunakan kata kunci lain, pilih kategori berbeda, atau ubah status tayang.</p>
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={() => {
              setSearch('')
              setActiveCategory('All')
              setActiveStatus('All')
            }}
          >
            Reset Filter
          </button>
        </div>
      )}

      {/* MODE 1: 3 Bagian Utama Dashboard */}
      {!loading && filteredMovies.length > 0 && showThreeSections && (
        <div className="catalog-sections">
          {/* BAGIAN 1B: Top 10 Trending Otomatis Berdasarkan Ulasan */}
          {trendingMovies.length > 0 && (
            <section className="catalog-section">
              <div className="catalog-section__head">
                <div className="catalog-section__title-wrap">
                  <span className="section-icon-pill section-icon-pill--trending">
                    <Flame size={16} />
                  </span>
                  <div>
                    <h2 className="catalog-section__title">Top 10 Trending</h2>
                    <p className="catalog-section__sub">
                      Peringkat otomatis #1 hingga #{trendingMovies.length} berdasarkan rata-rata
                      bintang &amp; jumlah ulasan pengguna tertinggi
                    </p>
                  </div>
                </div>
                <span className="count-badge">Top {trendingMovies.length}</span>
              </div>
              {renderMovieGrid(trendingMovies, { showRank: true })}
            </section>
          )}

          {/* BAGIAN 2: Baru Saja Di-upload (episode terbaru & timestamp upload dari database) */}
          {recentlyUploadedMovies.length > 0 && (
            <section className="catalog-section">
              <div className="catalog-section__head">
                <div className="catalog-section__title-wrap">
                  <span className="section-icon-pill section-icon-pill--latest">
                    <Clock size={16} />
                  </span>
                  <div>
                    <h2 className="catalog-section__title">Baru Saja Di-upload</h2>
                    <p className="catalog-section__sub">
                      Menampilkan episode terbaru beserta waktu upload langsung dari database
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={() => setActiveStatus('Ongoing')}
                >
                  <Radio size={13} /> Filter Ongoing
                </button>
              </div>
              {renderMovieGrid(recentlyUploadedMovies, { showUploadMeta: true })}
            </section>
          )}

          {/* BAGIAN 3 (PALING BAWAH): Sudah Tamat (status === "Tamat") */}
          {completedMovies.length > 0 && (
            <section className="catalog-section">
              <div className="catalog-section__head">
                <div className="catalog-section__title-wrap">
                  <span className="section-icon-pill section-icon-pill--completed">
                    <CheckCircle2 size={16} />
                  </span>
                  <div>
                    <h2 className="catalog-section__title">Sudah Tamat</h2>
                    <p className="catalog-section__sub">
                      Daftar lengkap film dan drama berstatus Tamat yang siap maraton sampai selesai
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={() => setActiveStatus('Tamat')}
                >
                  <CheckCircle2 size={13} /> Lihat Khusus Tamat ({completedMovies.length})
                </button>
              </div>
              {renderMovieGrid(completedMovies)}
            </section>
          )}
        </div>
      )}

      {/* MODE 2: Hasil Filter Status (Ongoing / Tamat) atau Pencarian */}
      {!loading && filteredMovies.length > 0 && !showThreeSections && (
        <section className="catalog-section">
          <div className="catalog-section__head">
            <div className="catalog-section__title-wrap">
              <span
                className={`section-icon-pill ${
                  activeStatus === 'Ongoing'
                    ? 'section-icon-pill--latest'
                    : activeStatus === 'Tamat'
                      ? 'section-icon-pill--completed'
                      : 'section-icon-pill--trending'
                }`}
              >
                {activeStatus === 'Ongoing' ? (
                  <Radio size={16} />
                ) : activeStatus === 'Tamat' ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <Film size={16} />
                )}
              </span>
              <div>
                <h2 className="catalog-section__title">
                  {activeStatus === 'Ongoing'
                    ? 'Film & Drama Ongoing'
                    : activeStatus === 'Tamat'
                      ? 'Film & Drama Sudah Tamat'
                      : `Hasil Pencarian "${search.trim()}"`}
                </h2>
                <p className="catalog-section__sub">
                  Menampilkan {filteredMovies.length} judul sesuai filter aktif
                </p>
              </div>
            </div>
            {activeStatus !== 'All' && (
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={() => setActiveStatus('All')}
              >
                Kembali ke Semua Bagian
              </button>
            )}
          </div>
          {renderMovieGrid(filteredMovies)}
        </section>
      )}

      {source === 'local' && (
        <p className="offline-sync-notice">
          Menampilkan data dari penyimpanan offline. Hubungkan ke internet untuk menyinkronkan
          pembaruan terbaru.
        </p>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Hapus Film / Drama?"
        message={`Apakah Anda yakin ingin menghapus "${deleteTarget?.title}" dari database? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteTarget(null)
          setDeleteError('')
        }}
      />

      {deleteError && <div className="toast-bar toast-bar--error">{deleteError}</div>}
    </div>
  )
}
