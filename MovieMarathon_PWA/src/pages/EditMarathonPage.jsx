import { useState, useEffect, useMemo } from 'react'
import {
  ArrowLeft,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Search,
  Loader,
  AlertCircle,
  CheckCircle,
  Film,
  Save,
} from 'lucide-react'
import { useMovies } from '../hooks/useMovies'
import marathonService from '../services/marathonService'
import PosterCollage from '../components/common/PosterCollage'

export default function EditMarathonPage({ marathon, marathonId, onBack, onSuccess }) {
  const targetId = marathonId || marathon?.id
  const { movies: allCatalogMovies } = useMovies()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [movieSearch, setMovieSearch] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    theme: '',
    mood: '',
    total_duration: '',
    description: '',
    snack_recommendation: '',
    break_schedule: '',
  })

  const [selectedMovieIds, setSelectedMovieIds] = useState([])

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        let data = marathon
        if (!data || !Array.isArray(data.movies)) {
          const res = await marathonService.getMarathonById(targetId)
          if (res.success) data = res.data
        }
        if (active && data) {
          setFormData({
            title: data.title || '',
            theme: data.theme || '',
            mood: data.mood || '',
            total_duration: data.total_duration || '',
            description: data.description || '',
            snack_recommendation: data.snack_recommendation || '',
            break_schedule: data.break_schedule || '',
          })
          setSelectedMovieIds((data.movies || []).map((m) => String(m.id)))
        }
      } catch (err) {
        if (active) setError(err?.message || 'Gagal memuat data collection.')
      } finally {
        if (active) setLoading(false)
      }
    }
    if (targetId) load()
    return () => {
      active = false
    }
  }, [targetId, marathon])

  const movieMap = useMemo(() => {
    const map = new Map()
    allCatalogMovies.forEach((m) => map.set(String(m.id), m))
    ;(marathon?.movies || []).forEach((m) => {
      if (!map.has(String(m.id))) map.set(String(m.id), m)
    })
    return map
  }, [allCatalogMovies, marathon])

  const selectedMovies = useMemo(
    () => selectedMovieIds.map((id) => movieMap.get(String(id))).filter(Boolean),
    [selectedMovieIds, movieMap],
  )

  const availableMovies = useMemo(() => {
    const q = movieSearch.trim().toLowerCase()
    const pickedSet = new Set(selectedMovieIds.map(String))
    return allCatalogMovies.filter((m) => {
      if (pickedSet.has(String(m.id))) return false
      if (!q) return true
      return (
        (m.title || '').toLowerCase().includes(q) ||
        (m.genre || '').toLowerCase().includes(q) ||
        (m.type || '').toLowerCase().includes(q)
      )
    })
  }, [allCatalogMovies, selectedMovieIds, movieSearch])

  const handleAddMovie = (movieId) => {
    setSelectedMovieIds((prev) =>
      prev.includes(String(movieId)) ? prev : [...prev, String(movieId)],
    )
  }

  const handleRemoveMovie = (movieId) => {
    setSelectedMovieIds((prev) => prev.filter((id) => String(id) !== String(movieId)))
  }

  const handleMove = (index, direction) => {
    const target = index + direction
    if (target < 0 || target >= selectedMovieIds.length) return
    setSelectedMovieIds((prev) => {
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (!formData.title.trim()) {
      setError('Nama collection wajib diisi.')
      return
    }
    if (selectedMovieIds.length === 0) {
      setError('Collection harus memiliki minimal 1 film/drama.')
      return
    }

    try {
      setSaving(true)
      const firstPoster = selectedMovies[0]?.image_url || marathon?.cover_url || ''
      const res = await marathonService.updateMarathon(
        targetId,
        {
          ...formData,
          title: formData.title.trim(),
          cover_url: firstPoster,
          movie_ids: selectedMovieIds,
        },
        selectedMovies,
      )
      if (res.success) {
        setSuccessMsg('Collection berhasil diperbarui!')
        if (onSuccess) onSuccess(res.data)
      }
    } catch (err) {
      setError(err?.message || 'Gagal memperbarui collection.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="status-state">
        <Loader size={30} className="spin" />
        <p>Memuat data collection...</p>
      </div>
    )
  }

  const previewPosters = selectedMovies
    .map((m) => m.image_url)
    .filter(Boolean)
    .slice(0, 4)

  return (
    <div className="crud-page">
      <div className="crud-header">
        <button type="button" className="detail-back-btn" onClick={onBack}>
          <ArrowLeft size={18} /> Kembali ke Collections
        </button>
      </div>

      <div className="crud-title-group">
        <h1 className="crud-title">Edit Collection &amp; Kelola Film</h1>
        <p className="crud-subtitle">
          Panel Admin — Perbarui info koleksi, ubah urutan, tambah film baru, atau hapus film dari
          collection ini. Poster koleksi otomatis mengikuti kolase film di dalamnya.
        </p>
      </div>

      {error && (
        <div className="toast-bar toast-bar--error">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {successMsg && (
        <div className="toast-bar toast-bar--success">
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="crud-form">
        {/* Live Poster Collage Preview + Metadata */}
        <div className="form-card">
          <h2 className="form-card__title">Pratinjau Kolase Poster &amp; Informasi Collection</h2>
          <p className="form-card__desc">
            Kartu collection otomatis menampilkan kolase poster dari hingga 4 film pertama di dalam
            koleksi ini.
          </p>

          <div className="edit-collection-preview-wrap">
            <div className="edit-collection-collage-box">
              <PosterCollage posters={previewPosters} alt={formData.title} />
            </div>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="em-title" className="form-label">
                    Nama Collection <span className="req">*</span>
                  </label>
                  <input
                    id="em-title"
                    type="text"
                    className="form-input"
                    value={formData.title}
                    onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="em-theme" className="form-label">
                    Tema <span className="req">*</span>
                  </label>
                  <input
                    id="em-theme"
                    type="text"
                    className="form-input"
                    value={formData.theme}
                    onChange={(e) => setFormData((p) => ({ ...p, theme: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="em-mood" className="form-label">
                    Mood / Suasana
                  </label>
                  <input
                    id="em-mood"
                    type="text"
                    className="form-input"
                    value={formData.mood}
                    onChange={(e) => setFormData((p) => ({ ...p, mood: e.target.value }))}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="em-dur" className="form-label">
                    Estimasi Durasi
                  </label>
                  <input
                    id="em-dur"
                    type="text"
                    className="form-input"
                    value={formData.total_duration}
                    onChange={(e) => setFormData((p) => ({ ...p, total_duration: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-field" style={{ marginTop: '14px' }}>
            <label htmlFor="em-desc" className="form-label">
              Deskripsi
            </label>
            <textarea
              id="em-desc"
              rows={3}
              className="form-textarea"
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
            />
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="em-snack" className="form-label">
                Rekomendasi Camilan
              </label>
              <input
                id="em-snack"
                type="text"
                className="form-input"
                value={formData.snack_recommendation}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, snack_recommendation: e.target.value }))
                }
              />
            </div>
            <div className="form-field">
              <label htmlFor="em-break" className="form-label">
                Jadwal Istirahat
              </label>
              <input
                id="em-break"
                type="text"
                className="form-input"
                value={formData.break_schedule}
                onChange={(e) => setFormData((p) => ({ ...p, break_schedule: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Film yang Saat Ini Ada di Collection */}
        <div className="form-card">
          <h2 className="form-card__title">
            Film di Dalam Collection ({selectedMovies.length} Judul)
          </h2>
          <p className="form-card__desc">
            Atur urutan tonton atau hapus film yang tidak lagi diperlukan dari collection ini.
          </p>

          {selectedMovies.length === 0 ? (
            <div className="status-state" style={{ margin: 0, padding: '28px' }}>
              <Film size={28} color="#505d73" />
              <p>Belum ada film dalam collection ini. Tambahkan dari katalog di bawah.</p>
            </div>
          ) : (
            <div className="collection-manage-list">
              {selectedMovies.map((movie, idx) => (
                <div key={movie.id} className="collection-manage-row">
                  <span className="lineup-order">#{idx + 1}</span>
                  <img src={movie.image_url} alt={movie.title} className="movie-pick-thumb" />
                  <div className="movie-pick-meta">
                    <strong>{movie.title}</strong>
                    <span>
                      {movie.type} &bull; {movie.genre} &bull; {movie.duration}
                    </span>
                  </div>
                  <div className="collection-manage-actions">
                    <button
                      type="button"
                      className="btn btn--outline btn--sm"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, -1)}
                      title="Geser ke atas"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      className="btn btn--outline btn--sm"
                      disabled={idx === selectedMovies.length - 1}
                      onClick={() => handleMove(idx, 1)}
                      title="Geser ke bawah"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      className="btn btn--danger btn--sm"
                      onClick={() => handleRemoveMovie(movie.id)}
                      title="Hapus dari collection"
                    >
                      <Trash2 size={14} /> Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tambah Film dari Katalog */}
        <div className="form-card">
          <h2 className="form-card__title">
            Tambahkan Film dari Katalog ({availableMovies.length} Tersedia)
          </h2>
          <p className="form-card__desc">
            Cari dan klik film di bawah untuk menambahkannya ke dalam collection.
          </p>

          <div className="adv-filter__search" style={{ marginBottom: '14px' }}>
            <Search size={16} className="adv-filter__icon" />
            <input
              type="search"
              className="adv-filter__input"
              placeholder="Cari judul atau genre film untuk ditambahkan..."
              value={movieSearch}
              onChange={(e) => setMovieSearch(e.target.value)}
            />
          </div>

          {availableMovies.length === 0 ? (
            <p style={{ color: 'var(--steel)', fontSize: '0.88rem', margin: 0 }}>
              Semua film yang cocok sudah masuk ke dalam collection ini.
            </p>
          ) : (
            <div className="movie-picker-grid">
              {availableMovies.map((movie) => (
                <button
                  key={movie.id}
                  type="button"
                  className="movie-pick-item"
                  onClick={() => handleAddMovie(movie.id)}
                >
                  <img src={movie.image_url} alt={movie.title} className="movie-pick-thumb" />
                  <div className="movie-pick-meta">
                    <strong>{movie.title}</strong>
                    <span>
                      {movie.type} &bull; {movie.duration}
                    </span>
                  </div>
                  <span className="movie-pick-add-pill">
                    <Plus size={13} /> Tambah
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="crud-actions-bar">
          <button type="button" className="btn btn--outline" onClick={onBack} disabled={saving}>
            Batal
          </button>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? (
              <>
                <Loader size={16} className="spin" /> Menyimpan Perubahan...
              </>
            ) : (
              <>
                <Save size={16} /> Simpan Perubahan Collection
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
