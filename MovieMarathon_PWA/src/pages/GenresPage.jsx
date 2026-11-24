import { useState, useMemo, useEffect } from 'react'
import {
  Tag,
  Search,
  Plus,
  X,
  ArrowLeft,
  Film,
  Loader,
  ChevronRight,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { useGenres } from '../hooks/useGenres'
import genreService from '../services/genreService'
import MovieCard from '../components/movie/MovieCard'
import { sortMovies } from '../utils/helpers'

const COLOR_OPTIONS = ['#e5a93c', '#ec4899', '#38bdf8', '#ef4444', '#a855f7', '#14b8a6', '#f97316']

export default function GenresPage({ onSelectMovie, onEditMovie }) {
  const { genres, loading, source, refetch } = useGenres()

  const [selectedGenre, setSelectedGenre] = useState(null)
  const [genreMovies, setGenreMovies] = useState([])
  const [loadingMovies, setLoadingMovies] = useState(false)

  const [searchGenre, setSearchGenre] = useState('')
  const [searchMovie, setSearchMovie] = useState('')
  const [sortOption, setSortOption] = useState('rating:desc')

  // Tambah genre baru
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newColor, setNewColor] = useState(COLOR_OPTIONS[0])
  const [savingGenre, setSavingGenre] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Muat film ketika genre dipilih
  useEffect(() => {
    if (!selectedGenre) {
      setGenreMovies([])
      return
    }
    let active = true
    const loadMovies = async () => {
      try {
        setLoadingMovies(true)
        const res = await genreService.getGenreById(selectedGenre)
        if (active && res.success) {
          setGenreMovies(res.data?.movies || [])
        }
      } finally {
        if (active) setLoadingMovies(false)
      }
    }
    loadMovies()
    return () => {
      active = false
    }
  }, [selectedGenre])

  const filteredGenres = useMemo(() => {
    const q = searchGenre.trim().toLowerCase()
    if (!q) return genres
    return genres.filter(
      (g) =>
        (g.name || '').toLowerCase().includes(q) ||
        (g.description || '').toLowerCase().includes(q),
    )
  }, [genres, searchGenre])

  const filteredMovies = useMemo(() => {
    const q = searchMovie.trim().toLowerCase()
    const list = genreMovies.filter((m) => {
      if (!q) return true
      return (
        (m.title || '').toLowerCase().includes(q) ||
        (m.director || '').toLowerCase().includes(q) ||
        (m.cast || '').toLowerCase().includes(q) ||
        (m.genre || '').toLowerCase().includes(q)
      )
    })
    const [key, order] = sortOption.split(':')
    return sortMovies(list, key, order)
  }, [genreMovies, searchMovie, sortOption])

  const handleCreateGenre = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    if (!newName.trim()) {
      setErrorMsg('Nama genre wajib diisi.')
      return
    }
    try {
      setSavingGenre(true)
      const res = await genreService.createGenre({
        name: newName.trim(),
        description: newDesc.trim() || `Kumpulan film dan drama bergenre ${newName.trim()}.`,
        accent_color: newColor,
      })
      if (res.success) {
        setNewName('')
        setNewDesc('')
        setShowAddForm(false)
        setFeedback(`Genre "${res.data.name}" berhasil ditambahkan!`)
        setTimeout(() => setFeedback(''), 3000)
        refetch()
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menambah genre.')
    } finally {
      setSavingGenre(false)
    }
  }

  // ---- Tampilan Daftar Film Berdasarkan Genre Terpilih ----
  if (selectedGenre) {
    return (
      <div className="genres-page">
        <button
          type="button"
          className="detail-back-btn"
          onClick={() => {
            setSelectedGenre(null)
            setSearchMovie('')
          }}
          style={{ marginBottom: '16px' }}
        >
          <ArrowLeft size={18} /> Kembali ke Semua Genre
        </button>

        {/* Genre Hero */}
        <section
          className="catalog-masthead"
          style={{
            borderColor: selectedGenre.accent_color || 'var(--accent)',
          }}
        >
          <div className="masthead-content">
            <div className="masthead-badge">
              <Tag size={14} color={selectedGenre.accent_color || '#e5a93c'} />
              <span>Filter Genre</span>
            </div>
            <h1 className="masthead-title">{selectedGenre.name}</h1>
            <p className="masthead-desc">{selectedGenre.description}</p>
          </div>
        </section>

        {/* Quick Switch Genre Pills */}
        <div className="adv-filter">
          <div className="adv-filter__search">
            <Search size={18} className="adv-filter__icon" />
            <input
              type="search"
              placeholder={`Cari film/drama di genre ${selectedGenre.name}...`}
              value={searchMovie}
              onChange={(e) => setSearchMovie(e.target.value)}
              className="adv-filter__input"
            />
          </div>

          <div className="adv-filter__row">
            <div className="adv-filter__pills">
              {genres.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={`pill ${selectedGenre.id === g.id ? 'pill--active' : ''}`}
                  onClick={() => setSelectedGenre(g)}
                >
                  {g.name} ({g.movie_count})
                </button>
              ))}
            </div>

            <div className="adv-filter__sort">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                aria-label="Urutkan film"
                className="adv-filter__select"
              >
                <option value="rating:desc">⭐ Rating: Tertinggi</option>
                <option value="rating:asc">⭐ Rating: Terendah</option>
                <option value="release_year:desc">📅 Tahun: Terbaru</option>
                <option value="release_year:asc">📅 Tahun: Terlama</option>
                <option value="title:asc">🔤 Judul: A - Z</option>
              </select>
            </div>
          </div>
        </div>

        <div className="list-toolbar">
          <div className="list-toolbar__info">
            <h2 className="section-heading">Film &amp; Drama Genre {selectedGenre.name}</h2>
            <span className="count-badge">{filteredMovies.length} Judul</span>
          </div>
        </div>

        {loadingMovies ? (
          <div className="status-state">
            <Loader size={30} className="spin" />
            <p>Memuat film bergenre {selectedGenre.name}...</p>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="status-state">
            <Film size={36} color="#495a74" />
            <h3>Belum ada film di genre {selectedGenre.name}</h3>
            <p>
              Tambahkan film baru dengan mencantumkan genre &ldquo;{selectedGenre.name}&rdquo; agar
              muncul di halaman ini.
            </p>
          </div>
        ) : (
          <ul className="movies-grid">
            {filteredMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelect={onSelectMovie}
                onEdit={onEditMovie}
              />
            ))}
          </ul>
        )}
      </div>
    )
  }

  // ---- Tampilan Utama Daftar Genre ----
  return (
    <div className="genres-page">
      <section className="catalog-masthead">
        <div className="masthead-content">
          <div className="masthead-badge">
            <Tag size={14} color="#e5a93c" />
            <span>Eksplorasi &bull; Filter Genre Film</span>
          </div>
          <h1 className="masthead-title">Genre Film &amp; Drama</h1>
          <p className="masthead-desc">
            Temukan tontonan berdasarkan genre kesukaan Anda — mulai dari Romance, Sci-Fi,
            Thriller, hingga Animation. Klik kartu genre untuk menampilkan seluruh film yang sesuai.
          </p>
        </div>
      </section>

      {feedback && (
        <div className="toast-bar toast-bar--success">
          <CheckCircle size={18} /> {feedback}
        </div>
      )}

      {errorMsg && (
        <div className="toast-bar toast-bar--error">
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      <div className="list-toolbar">
        <div className="list-toolbar__info">
          <h2 className="section-heading">Pilih Genre</h2>
          <span className="count-badge">{filteredGenres.length} Genre</span>
          <span
            className={`source-pill ${source === 'api' ? 'source-pill--api' : 'source-pill--local'}`}
          >
            {source === 'api' ? <Wifi size={12} /> : <WifiOff size={12} />}
            {source === 'api' ? 'Online' : 'Mode Offline'}
          </span>
        </div>

        <button
          type="button"
          className="btn btn--primary btn--sm"
          onClick={() => setShowAddForm((prev) => !prev)}
        >
          {showAddForm ? (
            <>
              <X size={16} /> Tutup Form
            </>
          ) : (
            <>
              <Plus size={16} /> Tambah Genre
            </>
          )}
        </button>
      </div>

      {/* Inline Add Genre Form */}
      {showAddForm && (
        <form onSubmit={handleCreateGenre} className="form-card" style={{ marginBottom: '22px' }}>
          <h3 className="form-card__title">Tambah Genre Baru</h3>
          <p className="form-card__desc">
            Genre baru akan tersimpan di database dan otomatis menyaring film yang cocok.
          </p>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="genre-name" className="form-label">
                Nama Genre <span className="req">*</span>
              </label>
              <input
                id="genre-name"
                type="text"
                className="form-input"
                placeholder="misal: Horror, Action, Documentary..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <span className="form-label">Warna Aksen</span>
              <div className="color-picker-row">
                {COLOR_OPTIONS.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    className={`color-dot ${newColor === hex ? 'color-dot--active' : ''}`}
                    style={{ backgroundColor: hex }}
                    onClick={() => setNewColor(hex)}
                    aria-label={`Pilih warna ${hex}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="genre-desc" className="form-label">
              Deskripsi Singkat
            </label>
            <input
              id="genre-desc"
              type="text"
              className="form-input"
              placeholder="Gambaran singkat tentang genre ini..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </div>

          <div className="crud-actions-bar" style={{ paddingTop: '4px' }}>
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => setShowAddForm(false)}
            >
              Batal
            </button>
            <button type="submit" className="btn btn--primary btn--sm" disabled={savingGenre}>
              {savingGenre ? 'Menyimpan...' : 'Simpan Genre'}
            </button>
          </div>
        </form>
      )}

      {/* Search Genre */}
      <div className="adv-filter">
        <div className="adv-filter__search">
          <Search size={18} className="adv-filter__icon" />
          <input
            type="search"
            placeholder="Cari genre (misal: Romance, Sci-Fi, Thriller, Comedy)..."
            value={searchGenre}
            onChange={(e) => setSearchGenre(e.target.value)}
            className="adv-filter__input"
            aria-label="Cari Genre"
          />
        </div>
      </div>

      {loading ? (
        <div className="status-state">
          <Loader size={32} className="spin" />
          <p>Memuat daftar genre...</p>
        </div>
      ) : filteredGenres.length === 0 ? (
        <div className="status-state">
          <Tag size={36} color="#495a74" />
          <h3>Genre tidak ditemukan</h3>
          <p>Coba kata kunci lain atau tambahkan genre baru.</p>
        </div>
      ) : (
        <ul className="genres-grid">
          {filteredGenres.map((genre) => (
            <li
              key={genre.id}
              className="genre-card"
              style={{ '--genre-accent': genre.accent_color || '#e5a93c' }}
            >
              <button
                type="button"
                className="genre-card__btn"
                onClick={() => setSelectedGenre(genre)}
              >
                <div className="genre-card__cover-wrap">
                  <img
                    src={genre.cover_url}
                    alt={genre.name}
                    className="genre-card__cover"
                    loading="lazy"
                  />
                  <div className="genre-card__gradient" />
                  <span className="genre-card__count">
                    <Film size={12} /> {genre.movie_count} Judul
                  </span>
                </div>

                <div className="genre-card__body">
                  <div className="genre-card__title-row">
                    <span className="genre-card__dot" />
                    <h3 className="genre-card__title">{genre.name}</h3>
                  </div>
                  <p className="genre-card__desc">{genre.description}</p>
                  <div className="genre-card__cta">
                    <span>Tampilkan Film</span>
                    <ChevronRight size={15} />
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
