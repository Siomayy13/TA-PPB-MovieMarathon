import { Film, Tag, Layers, History, Bookmark, User } from 'lucide-react'
import { useWatchlist } from '../hooks/useWatchlist'
import { useAuth } from '../context/AuthContext'

const BOTTOM_NAV_ITEMS = [
  { id: 'Catalog', label: 'Film', icon: Film },
  { id: 'Genres', label: 'Genre', icon: Tag },
  { id: 'Marathons', label: 'Collection', icon: Layers },
  { id: 'History', label: 'Histori', icon: History },
  { id: 'Watchlist', label: 'Watchlist', icon: Bookmark, hasBadge: true },
  { id: 'Profile', label: 'Profil', icon: User },
]

export default function BottomNav({ activeTab, onTabChange }) {
  const { watchlistCount } = useWatchlist()
  const { isAuthenticated } = useAuth()

  return (
    <nav className="bottom-nav" aria-label="Navigasi Utama Bawah">
      <div className="bottom-nav__inner">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              type="button"
              className={`bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}
              onClick={() => onTabChange(item.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="bottom-nav__icon-wrap">
                <Icon size={19} strokeWidth={isActive ? 2.4 : 1.9} />
                {item.hasBadge && isAuthenticated && watchlistCount > 0 && (
                  <span className="bottom-nav__badge">{watchlistCount}</span>
                )}
              </span>
              <span className="bottom-nav__label">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
