import { Bookmark } from 'lucide-react'
import { useWatchlist } from '../../hooks/useWatchlist'

export default function WatchlistButton({ movieId, onToggle }) {
  const { isWatchlisted, toggleWatchlist } = useWatchlist()
  const active = isWatchlisted(movieId)

  const handleClick = (e) => {
    e.stopPropagation()
    const result = toggleWatchlist(movieId)
    if (onToggle) onToggle(result)
  }

  return (
    <button
      type="button"
      className={`watchlist-btn ${active ? 'watchlist-btn--active' : ''}`}
      onClick={handleClick}
      aria-label={active ? 'Hapus dari Watchlist' : 'Tambah ke Watchlist'}
      title={active ? 'Tersimpan di Watchlist' : 'Simpan ke Watchlist'}
    >
      <Bookmark
        size={18}
        fill={active ? '#e5a93c' : 'none'}
        stroke={active ? '#e5a93c' : '#ffffff'}
      />
    </button>
  )
}
