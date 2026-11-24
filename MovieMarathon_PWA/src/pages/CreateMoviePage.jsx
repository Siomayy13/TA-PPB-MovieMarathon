import { useState, useEffect, useCallback } from 'react'
import {
  ArrowLeft,
  Upload,
  Link2,
  X,
  Loader,
  Save,
  CheckCircle,
  AlertCircle,
  Film,
} from 'lucide-react'
import movieService from '../services/movieService'
import uploadService, { isValidImageUrl } from '../services/uploadService'
import {
  saveDraft,
  loadDraft,
  deleteDraft,
  hasDraft,
  getDraftTimestamp,
  formatDraftTime,
} from '../utils/draftStorage'
import ConfirmModal from '../components/modals/ConfirmModal'

const POSTER_PRESETS = [
  {
    name: 'K-Drama Cinema',
    url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Sci-Fi Cosmos',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Action & Noir',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Anime Aesthetic',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
  },
]

export default function CreateMoviePage({ onBack, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'K-Drama',
    genre: 'Romance / Drama',
    release_year: 2024,
    duration: '16 Episode (70m)',
    rating: 8.8,
    director: '',
    cast: '',
    streaming_on: 'Netflix',
    status: 'Ongoing',
    featured: false,
    description: '',
    tags: 'Binge-Worthy, Trending',
  })

  const [imagePreview, setImagePreview] = useState(POSTER_PRESETS[0].url)
  const [posterUrlInput, setPosterUrlInput] = useState(POSTER_PRESETS[0].url)
  const [posterSourceLabel, setPosterSourceLabel] = useState('Preset')
  const [previewBroken, setPreviewBroken] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Draft state
  const [showDraftModal, setShowDraftModal] = useState(() => hasDraft('create_movie'))
  const [draftTimestamp, setDraftTimestamp] = useState(() => getDraftTimestamp('create_movie'))

  const handleSaveDraft = useCallback(
    (notify = true) => {
      const draftData = {
        formData,
        imagePreview,
      }
      const saved = saveDraft(draftData, 'create_movie')
      if (saved) {
        const ts = getDraftTimestamp('create_movie')
        setDraftTimestamp(ts)
        if (notify) {
          setSuccessMsg(`Draf berhasil disimpan (${formatDraftTime(ts)})`)
          setTimeout(() => setSuccessMsg(''), 3000)
        }
      }
    },
    [formData, imagePreview],
  )

  // Auto-save draft every 25 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      handleSaveDraft(false)
    }, 25000)
    return () => clearInterval(timer)
  }, [handleSaveDraft])

  const handleLoadDraft = () => {
    const draft = loadDraft('create_movie')
    if (draft) {
      if (draft.formData) setFormData(draft.formData)
      if (draft.imagePreview) {
        setImagePreview(draft.imagePreview)
        setPosterUrlInput(draft.imagePreview.startsWith('http') ? draft.imagePreview : '')
        setPosterSourceLabel(draft.imagePreview.startsWith('data:') ? 'File Lokal' : 'Link URL')
        setPreviewBroken(false)
      }
      setShowDraftModal(false)
      setSuccessMsg('Draf sebelumnya berhasil dimuat!')
      setTimeout(() => setSuccessMsg(''), 3500)
    }
  }

  const handleDiscardDraft = () => {
    deleteDraft('create_movie')
    setShowDraftModal(false)
    setDraftTimestamp(null)
  }

  const handleImageFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      setUploading(true)
      setError('')
      const res = await uploadService.uploadImage(file)
      setImagePreview(res.data.url)
      setPosterUrlInput('')
      setPosterSourceLabel(`File Lokal (${file.name})`)
      setPreviewBroken(false)
      setSuccessMsg('Poster lokal berhasil dimuat!')
      setTimeout(() => setSuccessMsg(''), 2500)
    } catch (err) {
      setError(err.message || 'Gagal memproses gambar.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handlePosterUrlChange = (e) => {
    const val = e.target.value
    setPosterUrlInput(val)
    const trimmed = val.trim()
    if (!trimmed) {
      return
    }
    if (isValidImageUrl(trimmed)) {
      setImagePreview(trimmed)
      setPosterSourceLabel('Link URL')
      setPreviewBroken(false)
      setError('')
    }
  }

  const handleApplyUrl = () => {
    const trimmed = posterUrlInput.trim()
    if (!trimmed) {
      setError('Masukkan link URL gambar terlebih dahulu.')
      return
    }
    if (!isValidImageUrl(trimmed)) {
      setError('URL gambar harus diawali dengan http:// atau https://')
      return
    }
    setImagePreview(trimmed)
    setPosterSourceLabel('Link URL')
    setPreviewBroken(false)
    setError('')
    setSuccessMsg('Link poster diterapkan!')
    setTimeout(() => setSuccessMsg(''), 2500)
  }

  const handleSelectPreset = (preset) => {
    setImagePreview(preset.url)
    setPosterUrlInput(preset.url)
    setPosterSourceLabel(`Preset (${preset.name})`)
    setPreviewBroken(false)
    setError('')
  }

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.title.trim()) {
      setError('Judul film atau drama wajib diisi.')
      return
    }

    const finalImage =
      posterUrlInput.trim() && isValidImageUrl(posterUrlInput.trim())
        ? posterUrlInput.trim()
        : imagePreview

    if (posterUrlInput.trim() && !isValidImageUrl(posterUrlInput.trim())) {
      setError('Link URL poster tidak valid. Pastikan diawali http:// atau https://')
      return
    }

    const cleanTags = formData.tags
      ? formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : ['Trending']

    const payload = {
      title: formData.title.trim(),
      type: formData.type,
      category: formData.type,
      genre: formData.genre.trim(),
      release_year: Number(formData.release_year) || 2024,
      duration: formData.duration.trim() || '120 mins',
      rating: Number(formData.rating) || 8.0,
      director: formData.director.trim() || 'Unknown',
      cast: formData.cast.trim() || 'Various Artists',
      streaming_on: formData.streaming_on.trim() || 'Streaming',
      status: formData.status || 'Tamat',
      featured: Boolean(formData.featured),
      description: formData.description.trim(),
      image_url: finalImage || POSTER_PRESETS[0].url,
      tags: cleanTags,
    }

    try {
      setCreating(true)
      const res = await movieService.createMovie(payload)
      if (res.success) {
        deleteDraft('create_movie')
        if (onSuccess) onSuccess(res.data)
        else if (onBack) onBack()
      } else {
        throw new Error('Gagal menyimpan data ke database.')
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="crud-page">
      <div className="crud-header">
        <button type="button" className="detail-back-btn" onClick={onBack}>
          <ArrowLeft size={18} /> Kembali
        </button>
        <button
          type="button"
          className="btn btn--outline btn--sm"
          onClick={() => handleSaveDraft(true)}
        >
          <Save size={15} /> Simpan Draf
        </button>
      </div>

      <div className="crud-title-group">
        <h1 className="crud-title">Tambah Judul Film / Drama Baru</h1>
        <p className="crud-subtitle">
          Daftarkan tayangan baru ke dalam database Movie Marathon. Poster bisa diunggah dari
          perangkat lokal, ditempel lewat link URL, atau dipilih dari preset.
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
        {/* Poster Picker Section */}
        <div className="form-card">
          <div className="poster-card-head">
            <div>
              <h2 className="form-card__title">Poster Film / Drama</h2>
              <p className="form-card__desc" style={{ marginBottom: 0 }}>
                Pilih gambar dari perangkat lokal (JPG, PNG, WebP) atau masukkan link URL gambar.
              </p>
            </div>
            <span className="poster-source-badge">{posterSourceLabel}</span>
          </div>

          <div className="poster-picker-row" style={{ marginTop: '16px' }}>
            <div className="poster-preview-box">
              {imagePreview && !previewBroken ? (
                <img
                  src={imagePreview}
                  alt="Preview Poster"
                  className="poster-preview-img"
                  onError={() => setPreviewBroken(true)}
                />
              ) : (
                <div className="poster-preview-empty">
                  <Film size={36} color="#8e9bb0" />
                  <span>{previewBroken ? 'Link gambar gagal dimuat' : 'Belum ada poster'}</span>
                </div>
              )}
            </div>

            <div className="poster-controls">
              {/* Opsi 1: Unggah Lokal */}
              <div className="poster-method-block">
                <span className="preset-label">1. Unggah dari Perangkat (Lokal):</span>
                <label htmlFor="poster-file" className="btn btn--primary btn--sm file-upload-label">
                  <Upload size={16} />
                  <span>{uploading ? 'Mengompres...' : 'Pilih File dari Komputer / HP'}</span>
                  <input
                    id="poster-file"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageFileChange}
                    className="hidden-input"
                  />
                </label>
              </div>

              {/* Opsi 2: Link URL Gambar */}
              <div className="poster-method-block">
                <label htmlFor="poster-url-input" className="preset-label">
                  2. Atau Tempel Link URL Gambar:
                </label>
                <div className="url-input-row">
                  <div className="url-input-wrap">
                    <Link2 size={15} className="url-input-icon" />
                    <input
                      id="poster-url-input"
                      type="url"
                      value={posterUrlInput}
                      onChange={handlePosterUrlChange}
                      placeholder="https://contoh.com/poster-film.jpg"
                      className="form-input url-input-field"
                    />
                    {posterUrlInput && (
                      <button
                        type="button"
                        className="url-clear-btn"
                        onClick={() => setPosterUrlInput('')}
                        aria-label="Hapus URL"
                        title="Kosongkan URL"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn btn--outline btn--sm"
                    onClick={handleApplyUrl}
                  >
                    Terapkan Link
                  </button>
                </div>
                {previewBroken && (
                  <span className="url-error-hint">
                    Gambar dari link tersebut tidak dapat ditampilkan. Pastikan URL mengarah langsung ke file gambar.
                  </span>
                )}
              </div>

              {/* Opsi 3: Preset Poster */}
              <div className="preset-group">
                <span className="preset-label">3. Atau gunakan preset poster:</span>
                <div className="preset-pills">
                  {POSTER_PRESETS.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`pill ${imagePreview === p.url ? 'pill--active' : ''}`}
                      onClick={() => handleSelectPreset(p)}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Metadata */}
        <div className="form-card">
          <h2 className="form-card__title">Informasi Utama Tayangan</h2>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="title" className="form-label">
                Judul Film / Drama <span className="req">*</span>
              </label>
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                placeholder="misal: Queen of Tears, Interstellar..."
                className="form-input"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="type" className="form-label">
                Kategori / Tipe <span className="req">*</span>
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleFormChange}
                className="form-select"
              >
                <option value="K-Drama">K-Drama (Serial Korea)</option>
                <option value="Movie">Movie (Film Layar Lebar)</option>
                <option value="Anime">Anime (Jepang)</option>
                <option value="Series">Western / International Series</option>
              </select>
            </div>
          </div>

          <div className="form-grid form-grid--3">
            <div className="form-field">
              <label htmlFor="genre" className="form-label">
                Genre <span className="req">*</span>
              </label>
              <input
                id="genre"
                type="text"
                name="genre"
                value={formData.genre}
                onChange={handleFormChange}
                placeholder="misal: Romance / Drama / Thriller"
                className="form-input"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="release_year" className="form-label">
                Tahun Rilis <span className="req">*</span>
              </label>
              <input
                id="release_year"
                type="number"
                name="release_year"
                value={formData.release_year}
                onChange={handleFormChange}
                min="1950"
                max="2035"
                className="form-input"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="rating" className="form-label">
                Skor Rating (0 - 10) <span className="req">*</span>
              </label>
              <input
                id="rating"
                type="number"
                step="0.1"
                min="1"
                max="10"
                name="rating"
                value={formData.rating}
                onChange={handleFormChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="duration" className="form-label">
                Durasi / Jumlah Episode
              </label>
              <input
                id="duration"
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleFormChange}
                placeholder="misal: 16 Episodes (70m) atau 148 mins"
                className="form-input"
              />
            </div>

            <div className="form-field">
              <label htmlFor="streaming_on" className="form-label">
                Platform Streaming
              </label>
              <input
                id="streaming_on"
                type="text"
                name="streaming_on"
                value={formData.streaming_on}
                onChange={handleFormChange}
                placeholder="misal: Netflix, Disney+ Hotstar, Bioskop"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="director" className="form-label">
                Sutradara / Creator
              </label>
              <input
                id="director"
                type="text"
                name="director"
                value={formData.director}
                onChange={handleFormChange}
                placeholder="misal: Christopher Nolan, Bong Joon-ho"
                className="form-input"
              />
            </div>

            <div className="form-field">
              <label htmlFor="cast" className="form-label">
                Pemeran / Bintang Utama
              </label>
              <input
                id="cast"
                type="text"
                name="cast"
                value={formData.cast}
                onChange={handleFormChange}
                placeholder="misal: Kim Soo-hyun, Kim Ji-won"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="status" className="form-label">
                Status Tayang <span className="req">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                className="form-select"
              >
                <option value="Ongoing">Ongoing (Sedang Tayang / Baru Up)</option>
                <option value="Tamat">Tamat (Sudah Selesai)</option>
              </select>
            </div>

            <div className="form-field">
              <span className="form-label">Sorotan Katalog</span>
              <label htmlFor="featured" className="checkbox-inline-box">
                <input
                  id="featured"
                  type="checkbox"
                  name="featured"
                  checked={Boolean(formData.featured)}
                  onChange={handleFormChange}
                />
                <span>Tampilkan di bagian Trending</span>
              </label>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="description" className="form-label">
              Sinopsis Lengkap
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              rows={4}
              placeholder="Ceritakan gambaran alur cerita dan latar belakang film/drama..."
              className="form-textarea"
            />
          </div>

          <div className="form-field">
            <label htmlFor="tags" className="form-label">
              Tag Marathon (Pisahkan dengan koma)
            </label>
            <input
              id="tags"
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleFormChange}
              placeholder="Binge-Worthy, Masterpiece, Mind-Bending"
              className="form-input"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="crud-actions-bar">
          <button
            type="button"
            className="btn btn--outline"
            onClick={onBack}
            disabled={creating}
          >
            Batal
          </button>
          <button type="submit" className="btn btn--primary" disabled={creating}>
            {creating ? (
              <>
                <Loader size={16} className="spin" /> Menyimpan ke Database...
              </>
            ) : (
              'Simpan Film ke Database'
            )}
          </button>
        </div>
      </form>

      {/* Restore Draft Modal */}
      <ConfirmModal
        open={showDraftModal}
        title="Lanjutkan Draf Sebelumnya?"
        message={`Ditemukan draf pembuatan film yang tersimpan ${
          draftTimestamp ? formatDraftTime(draftTimestamp) : 'sebelumnya'
        }. Apakah Anda ingin memulihkan draf tersebut?`}
        confirmLabel="Pulihkan Draf"
        cancelLabel="Buang Draf"
        onConfirm={handleLoadDraft}
        onCancel={handleDiscardDraft}
      />
    </div>
  )
}
