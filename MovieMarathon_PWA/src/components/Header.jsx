import { Plus, Film, Layers, LogIn, Shield, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Header({
  activeTab,
  onTabChange,
  onNavigateCreate,
  onNavigateCreateMarathon,
}) {
  const { user, isAuthenticated, isAdmin, openAuthModal } = useAuth()

  return (
    <header className="header">
      {/* Brand logo & title */}
      <div
        className="header-brand"
        onClick={() => onTabChange('Catalog')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onTabChange('Catalog')
        }}
      >
        <div className="header-logo-badge">
          <Film size={20} color="#e5a93c" />
        </div>
        <div className="header-brand-text">
          <span className="brand-name">MOVIE MARATHON</span>
          <span className="brand-sub">DRAMA &amp; MOVIE DATABASE</span>
        </div>
      </div>

      {/* Right controls: Admin CTA + Auth Status */}
      <div className="header-cta-wrap" style={{ gap: '10px' }}>
        {isAdmin &&
          (activeTab === 'Marathons' && onNavigateCreateMarathon ? (
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={onNavigateCreateMarathon}
              title="Buat Collection Baru"
            >
              <Layers size={15} />
              <span>Buat Collection</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={onNavigateCreate}
              title="Tambah Judul Film / Drama Baru"
            >
              <Plus size={16} />
              <span>Tambah Film</span>
            </button>
          ))}

        {isAuthenticated ? (
          <button
            type="button"
            className="header-user-chip"
            onClick={() => onTabChange('Profile')}
            title="Lihat Profil & Pengaturan Akun"
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.display_name} className="header-user-avatar" />
            ) : (
              <span className="header-user-fallback">
                {isAdmin ? <Shield size={14} color="#e5a93c" /> : <User size={14} color="#e5a93c" />}
              </span>
            )}
            <span className="header-user-name">{user?.display_name}</span>
            <span className={`role-chip ${isAdmin ? 'role-chip--admin' : 'role-chip--user'}`}>
              {isAdmin ? 'Admin' : 'Pengguna'}
            </span>
          </button>
        ) : (
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={() => openAuthModal('login')}
          >
            <LogIn size={15} />
            <span>Masuk</span>
          </button>
        )}
      </div>
    </header>
  )
}
