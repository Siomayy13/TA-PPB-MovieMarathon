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
import { useMovies } from '../hooks/useMovies'
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
  const { movies, loading, error, refetch, source } = useMovies()

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

  // Bagian 1 (Paling Atas): Trending (isTrending === true)
  const trendingMovies = useMemo(() => {
    const base = movies.filter((m) => matchesCategory(m, activeCategory))
    const trendingList = base.filter((m) => m.isTrending === true || m.featured === true)
    const fallback = trendingList.length > 0 ? trendingList : base.slice(0, 5)
    return sortMovies(fallback, 'rating', 'desc')
  }, [movies, activeCategory])

  // Bagian 2 (Di bawah Trending): Baru Saja Di-upload (urut createdAt terbaru)
  const recentlyUploadedMovies = useMemo(() => {
    const base = movies.filter((m) => matchesCategory(m, activeCategory))
    return [...base].sort((a, b) => {
      const timeA = new Date(a.createdAt || a.created_at || 0).getTime()
      const timeB = new Date(b.createdAt || b.created_at || 0).getTime()
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
        onBack={() => setSelectedMovie(null)}
        onEdit={(m) => onNavigate && onNavigate('Edit', m)}
        onDelete={(m) => {
          setSelectedMovie(null)
          setDeleteTarget(m)
        }}
      />
    )
  }

  const renderMovieGrid = (items) => (
    <ul className="movies-grid">
      {items.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          onSelect={setSelectedMovie}
          onEdit={onNavigate ? (m) => onNavigate('Edit', m) : undefined}
          onDelete={setDeleteTarget}
        />
      ))}
    </ul>
  )

  return (
    <div className="catalog-page">
      {/* BAGIAN 1 (PALING ATAS): Hero Carousel khusus Film Trending */}
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

        {onNavigate && (
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

      {/* MODE 1: Bagian 2 (Baru Saja Di-upload) & Bagian 3 (Sudah Tamat) di bawah Hero Trending */}
      {!loading && filteredMovies.length > 0 && showThreeSections && (
        <div className="catalog-sections">
          {/* Bagian 1B: Ringkasan Grid Trending (opsional cepat jika ingin lihat semua Trending dalam grid) */}
          {trendingMovies.length > 0 && (
            <section className="catalog-section">
              <div className="catalog-section__head">
                <div className="catalog-section__title-wrap">
                  <span className="section-icon-pill section-icon-pill--trending">
                    <Flame size={16} />
                  </span>
                  <div>
                    <h2 className="catalog-section__title">Sedang Trending</h2>
                    <p className="catalog-section__sub">
                      Deretan film dan drama pilihan terpopuler saat ini
                    </p>
                  </div>
                </div>
                <span className="count-badge">{trendingMovies.length} Trending</span>
              </div>
              {renderMovieGrid(trendingMovies)}
            </section>
          )}

          {/* BAGIAN 2: Baru Saja Di-upload (urut berdasarkan createdAt terbaru) */}
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
                      Diurutkan dari tayangan terbaru yang baru masuk ke katalog
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
              {renderMovieGrid(recentlyUploadedMovies)}
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
