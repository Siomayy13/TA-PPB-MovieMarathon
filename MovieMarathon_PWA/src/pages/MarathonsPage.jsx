import { useState, useMemo } from 'react'
import {
  Layers,
  Plus,
  Search,
  Loader,
  AlertCircle,
  RefreshCw,
  Clapperboard,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { useMarathons } from '../hooks/useMarathons'
import { useAuth } from '../context/AuthContext'
import MarathonCard from '../components/marathon/MarathonCard'
import ConfirmModal from '../components/modals/ConfirmModal'
import marathonService from '../services/marathonService'

export default function MarathonsPage({
  onSelectMarathon,
  onCreateMarathon,
  onEditMarathon,
}) {
  const { isAdmin } = useAuth()
  const { marathons, loading, error, source, refetch } = useMarathons()

  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const filteredMarathons = useMemo(() => {
    const q = search.trim().toLowerCase()
    return marathons.filter((item) => {
      return (
        !q ||
        (item.title || '').toLowerCase().includes(q) ||
        (item.theme || '').toLowerCase().includes(q) ||
        (item.mood || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q)
      )
    })
  }, [marathons, search])

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      await marathonService.deleteMarathon(deleteTarget.id)
      setDeleteTarget(null)
      refetch()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="marathons-page">
      {/* Masthead */}
      <section className="catalog-masthead">
        <div className="masthead-content">
          <div className="masthead-badge">
            <Layers size={14} color="#e5a93c" />
            <span>Kurasi Pilihan &bull; Koleksi Tontonan</span>
          </div>
          <h1 className="masthead-title">Collections</h1>
          <p className="masthead-desc">
            Jelajahi berbagai koleksi film dan drama terkurasi dengan tampilan kolase poster film
            di dalamnya. Klik koleksi mana pun untuk melihat daftar tayangan lengkapnya.
          </p>
        </div>
      </section>

      {/* Toolbar */}
      <div className="list-toolbar">
        <div className="list-toolbar__info">
          <h2 className="section-heading">Daftar Collection</h2>
          <span className="count-badge">{filteredMarathons.length} Koleksi</span>
          <span
            className={`source-pill ${source === 'api' ? 'source-pill--api' : 'source-pill--local'}`}
          >
            {source === 'api' ? <Wifi size={12} /> : <WifiOff size={12} />}
            {source === 'api' ? 'Online' : 'Mode Offline'}
          </span>
        </div>

        {isAdmin && onCreateMarathon && (
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={onCreateMarathon}
          >
            <Plus size={16} /> Buat Collection
          </button>
        )}
      </div>

      {/* Search Box */}
      <div className="adv-filter">
        <div className="adv-filter__search">
          <Search size={18} className="adv-filter__icon" />
          <input
            type="search"
            placeholder="Cari collection berdasarkan judul, tema, atau mood..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="adv-filter__input"
            aria-label="Cari Collection"
          />
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className="status-state">
          <Loader size={32} className="spin" />
          <p>Memuat daftar collection...</p>
        </div>
      )}

      {!loading && error && marathons.length === 0 && (
        <div className="status-state status-state--error">
          <AlertCircle size={32} />
          <p>{error}</p>
          <button type="button" className="btn btn--outline" onClick={refetch}>
            <RefreshCw size={15} /> Coba Lagi
          </button>
        </div>
      )}

      {!loading && filteredMarathons.length === 0 && !error && (
        <div className="status-state">
          <Clapperboard size={36} color="#495a74" />
          <h3>Collection tidak ditemukan</h3>
          <p>Coba gunakan kata kunci pencarian lain.</p>
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={() => setSearch('')}
          >
            Reset Pencarian
          </button>
        </div>
      )}

      {/* Grid List */}
      {filteredMarathons.length > 0 && (
        <ul className="marathons-grid">
          {filteredMarathons.map((marathon) => (
            <MarathonCard
              key={marathon.id}
              marathon={marathon}
              onSelect={onSelectMarathon}
              onEdit={isAdmin ? onEditMarathon : undefined}
              onDelete={isAdmin ? setDeleteTarget : undefined}
            />
          ))}
        </ul>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Hapus Collection?"
        message={`Apakah Anda yakin ingin menghapus collection "${deleteTarget?.title}"?`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
