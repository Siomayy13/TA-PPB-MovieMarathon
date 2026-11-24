import { Plus, Film, Layers } from 'lucide-react'

export default function Header({ activeTab, onTabChange, onNavigateCreate, onNavigateCreateMarathon }) {
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

      {/* Contextual Action CTA */}
      <div className="header-cta-wrap">
        {activeTab === 'Marathons' && onNavigateCreateMarathon ? (
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
        )}
      </div>
    </header>
  )
}
