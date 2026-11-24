import { useState } from 'react'
import {
  ArrowLeft,
  Upload,
  Link2,
  X,
  Loader,
  AlertCircle,
  CheckCircle,
  Film,
} from 'lucide-react'
import { useMovies } from '../hooks/useMovies'
import marathonService from '../services/marathonService'
import uploadService, { isValidImageUrl } from '../services/uploadService'

const COVER_PRESETS = [
  {
    label: 'Sci-Fi Space',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Cinema Hall',
    url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'K-Drama Glow',
    url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Anime Sky',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
  },
]

export default function CreateMarathonPage({ onBack, onSuccess }) {
  const { movies } = useMovies()

  const [formData, setFormData] = useState({
    title: '',
    theme: 'Weekend Special',
    mood: 'Seru & Santai',
    difficulty: 'Collection',
    total_duration: '5 Jam',
    description: '',
    snack_recommendation: 'Popcorn karamel, teh hangat, dan air mineral',
    break_schedule: 'Istirahat 15 menit setiap selesai 1 film atau 2 episode.',
    cover_url: COVER_PRESETS[0].url,
  })

  const [coverUrlInput, setCoverUrlInput] = useState(COVER_PRESETS[0].url)
  const [coverSourceLabel, setCoverSourceLabel] = useState('Preset')
  const [coverBroken, setCoverBroken] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)

  const [selectedMovieIds, setSelectedMovieIds] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleCoverFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      setUploadingCover(true)
      setError('')
      const res = await uploadService.uploadImage(file)
      setFormData((p) => ({ ...p, cover_url: res.data.url }))
      setCoverUrlInput('')
      setCoverSourceLabel(`File Lokal (${file.name})`)
      setCoverBroken(false)
      setSuccessMsg('Banner lokal berhasil dimuat!')
      setTimeout(() => setSuccessMsg(''), 2500)
    } catch (err) {
      setError(err.message || 'Gagal memproses gambar banner.')
    } finally {
      setUploadingCover(false)
      e.target.value = ''
    }
  }

  const handleCoverUrlChange = (e) => {
    const val = e.target.value
    setCoverUrlInput(val)
    const trimmed = val.trim()
    if (trimmed && isValidImageUrl(trimmed)) {
      setFormData((p) => ({ ...p, cover_url: trimmed }))
      setCoverSourceLabel('Link URL')
      setCoverBroken(false)
      setError('')
    }
  }

  const handleApplyCoverUrl = () => {
    const trimmed = coverUrlInput.trim()
    if (!trimmed) {
      setError('Masukkan link URL banner terlebih dahulu.')
      return
    }
    if (!isValidImageUrl(trimmed)) {
      setError('URL banner harus diawali http:// atau https://')
      return
    }
    setFormData((p) => ({ ...p, cover_url: trimmed }))
    setCoverSourceLabel('Link URL')
    setCoverBroken(false)
    setError('')
    setSuccessMsg('Link banner diterapkan!')
    setTimeout(() => setSuccessMsg(''), 2500)
  }

  const toggleMovieId = (id) => {
    setSelectedMovieIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.title.trim()) {
      setError('Nama collection wajib diisi.')
      return
    }
    if (coverUrlInput.trim() && !isValidImageUrl(coverUrlInput.trim())) {
      setError('Link URL banner tidak valid. Pastikan diawali http:// atau https://')
      return
    }
    if (selectedMovieIds.length === 0) {
      setError('Pilih minimal 1 film/drama untuk dimasukkan ke collection.')
      return
    }

    const finalCover =
      coverUrlInput.trim() && isValidImageUrl(coverUrlInput.trim())
        ? coverUrlInput.trim()
        : formData.cover_url

    const selectedMovieObjects = selectedMovieIds
      .map((id) => movies.find((m) => String(m.id) === String(id)))
      .filter(Boolean)

    try {
      setSubmitting(true)
      const res = await marathonService.createMarathon(
        {
          ...formData,
          difficulty: 'Collection',
          cover_url: finalCover || COVER_PRESETS[0].url,
          title: formData.title.trim(),
          movie_ids: selectedMovieIds,
        },
        selectedMovieObjects,
      )
      if (res.success) {
        if (onSuccess) onSuccess(res.data)
        else if (onBack) onBack()
      }
    } catch (err) {
      setError(err.message || 'Gagal menyimpan collection.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="crud-page">
      <div className="crud-header">
        <button type="button" className="detail-back-btn" onClick={onBack}>
          <ArrowLeft size={18} /> Kembali ke Collections
        </button>
      </div>

      <div className="crud-title-group">
        <h1 className="crud-title">Buat Collection Baru</h1>
        <p className="crud-subtitle">
          Rancang koleksi tontonan pilihan Anda sendiri dengan memilih film dan drama dari katalog
          Movie Marathon.
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
        {/* Banner / Cover Picker */}
        <div className="form-card">
          <div className="poster-card-head">
            <div>
              <h2 className="form-card__title">Cover Banner Collection</h2>
              <p className="form-card__desc" style={{ marginBottom: 0 }}>
                Unggah gambar dari perangkat lokal, tempel link URL gambar, atau pilih preset.
              </p>
            </div>
            <span className="poster-source-badge">{coverSourceLabel}</span>
          </div>

          <div className="poster-picker-row" style={{ marginTop: '16px' }}>
            <div className="poster-preview-box poster-preview-box--wide">
              {formData.cover_url && !coverBroken ? (
                <img
                  src={formData.cover_url}
                  alt="Preview Cover Collection"
                  className="poster-preview-img"
                  onError={() => setCoverBroken(true)}
                />
              ) : (
                <div className="poster-preview-empty">
                  <Film size={32} color="#8e9bb0" />
                  <span>{coverBroken ? 'Link gambar gagal dimuat' : 'Belum ada banner'}</span>
                </div>
              )}
            </div>

            <div className="poster-controls">
              <div className="poster-method-block">
                <span className="preset-label">1. Unggah dari Perangkat (Lokal):</span>
                <label htmlFor="marathon-cover-file" className="btn btn--primary btn--sm file-upload-label">
                  <Upload size={16} />
                  <span>{uploadingCover ? 'Mengompres...' : 'Pilih File dari Komputer / HP'}</span>
                  <input
                    id="marathon-cover-file"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleCoverFileChange}
                    className="hidden-input"
                  />
                </label>
              </div>

              <div className="poster-method-block">
                <label htmlFor="marathon-cover-url" className="preset-label">
                  2. Atau Tempel Link URL Gambar:
                </label>
                <div className="url-input-row">
                  <div className="url-input-wrap">
                    <Link2 size={15} className="url-input-icon" />
                    <input
                      id="marathon-cover-url"
                      type="url"
                      value={coverUrlInput}
                      onChange={handleCoverUrlChange}
                      placeholder="https://contoh.com/banner-collection.jpg"
                      className="form-input url-input-field"
                    />
                    {coverUrlInput && (
                      <button
                        type="button"
                        className="url-clear-btn"
                        onClick={() => setCoverUrlInput('')}
                        aria-label="Hapus URL"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn btn--outline btn--sm"
                    onClick={handleApplyCoverUrl}
                  >
                    Terapkan Link
                  </button>
                </div>
                {coverBroken && (
                  <span className="url-error-hint">
                    Gambar dari link tersebut tidak dapat ditampilkan. Pastikan URL mengarah langsung ke file gambar.
                  </span>
                )}
              </div>

              <div className="preset-group">
                <span className="preset-label">3. Atau gunakan preset banner:</span>
                <div className="preset-pills">
                  {COVER_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      className={`pill ${formData.cover_url === preset.url ? 'pill--active' : ''}`}
                      onClick={() => {
                        setFormData((p) => ({ ...p, cover_url: preset.url }))
                        setCoverUrlInput(preset.url)
                        setCoverSourceLabel(`Preset (${preset.label})`)
                        setCoverBroken(false)
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-card">
          <h2 className="form-card__title">Informasi Collection</h2>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="m-title" className="form-label">
                Nama Collection <span className="req">*</span>
              </label>
              <input
                id="m-title"
                type="text"
                className="form-input"
                placeholder="misal: Sabtu Malam Sci-Fi Seru"
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="m-theme" className="form-label">
                Tema Collection <span className="req">*</span>
              </label>
              <input
                id="m-theme"
                type="text"
                className="form-input"
                placeholder="misal: Sci-Fi & Time Travel"
                value={formData.theme}
                onChange={(e) => setFormData((p) => ({ ...p, theme: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="m-mood" className="form-label">
                Mood / Suasana
              </label>
              <input
                id="m-mood"
                type="text"
                className="form-input"
                placeholder="misal: Baper, Tegang, Healing"
                value={formData.mood}
                onChange={(e) => setFormData((p) => ({ ...p, mood: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label htmlFor="m-dur" className="form-label">
                Estimasi Durasi Total
              </label>
              <input
                id="m-dur"
                type="text"
                className="form-input"
                placeholder="misal: 6 Jam 15 Menit"
                value={formData.total_duration}
                onChange={(e) => setFormData((p) => ({ ...p, total_duration: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="m-desc" className="form-label">
              Deskripsi Collection
            </label>
            <textarea
              id="m-desc"
              rows={3}
              className="form-textarea"
              placeholder="Jelaskan kenapa rangkaian tontonan ini menarik untuk dikoleksi..."
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
            />
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="m-snack" className="form-label">
                Rekomendasi Camilan
              </label>
              <input
                id="m-snack"
                type="text"
                className="form-input"
                value={formData.snack_recommendation}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, snack_recommendation: e.target.value }))
                }
              />
            </div>

            <div className="form-field">
              <label htmlFor="m-break" className="form-label">
                Jadwal Istirahat
              </label>
              <input
                id="m-break"
                type="text"
                className="form-input"
                value={formData.break_schedule}
                onChange={(e) => setFormData((p) => ({ ...p, break_schedule: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Select Movies to include */}
        <div className="form-card">
          <h2 className="form-card__title">
            Pilih Daftar Film / Drama ({selectedMovieIds.length} Dipilih)
          </h2>
          <p className="form-card__desc">
            Klik film atau drama di bawah ini untuk memasukkannya ke dalam urutan tontonan
            collection Anda.
          </p>

          <div className="movie-picker-grid">
            {movies.map((movie) => {
              const selectedIndex = selectedMovieIds.indexOf(movie.id)
              const isSelected = selectedIndex !== -1
              return (
                <button
                  key={movie.id}
                  type="button"
                  className={`movie-pick-item ${isSelected ? 'movie-pick-item--selected' : ''}`}
                  onClick={() => toggleMovieId(movie.id)}
                >
                  <img src={movie.image_url} alt={movie.title} className="movie-pick-thumb" />
                  <div className="movie-pick-meta">
                    <strong>{movie.title}</strong>
                    <span>
                      <Film size={11} /> {movie.type} &bull; {movie.duration}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="movie-pick-order">
                      <CheckCircle size={13} /> #{selectedIndex + 1}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="crud-actions-bar">
          <button
            type="button"
            className="btn btn--outline"
            onClick={onBack}
            disabled={submitting}
          >
            Batal
          </button>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? (
              <>
                <Loader size={16} className="spin" /> Menyimpan Collection...
              </>
            ) : (
              'Simpan Collection'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
