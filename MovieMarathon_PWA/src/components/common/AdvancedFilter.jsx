import { Search, SlidersHorizontal, Film, Radio, CheckCircle2 } from 'lucide-react'

const STATUS_OPTIONS = [
  { id: 'All', label: 'Semua Status' },
  { id: 'Ongoing', label: 'Ongoing' },
  { id: 'Tamat', label: 'Tamat' },
]

export default function AdvancedFilter({
  search,
  onSearch,
  categories,
  activeCategory,
  onCategory,
  activeStatus = 'All',
  onStatus,
  sortKey,
  sortOrder,
  onSort,
}) {
  return (
    <div className="adv-filter">
      {/* Search Input */}
      <div className="adv-filter__search">
        <Search size={18} className="adv-filter__icon" />
        <input
          type="search"
          placeholder="Cari judul film, drama, sutradara, aktor, atau genre..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="adv-filter__input"
          aria-label="Cari Film dan Drama"
        />
      </div>

      {/* Type / Category Pills + Sort */}
      <div className="adv-filter__row">
        <div className="adv-filter__pills">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`pill ${activeCategory === cat ? 'pill--active' : ''}`}
              onClick={() => onCategory(cat)}
            >
              {cat === 'All' && <Film size={14} style={{ marginRight: '4px' }} />}
              {cat}
            </button>
          ))}
        </div>

        {/* Sort Controls */}
        <div className="adv-filter__sort">
          <SlidersHorizontal size={15} />
          <select
            value={`${sortKey}:${sortOrder}`}
            onChange={(e) => {
              const [key, order] = e.target.value.split(':')
              onSort({ key, order })
            }}
            aria-label="Urutkan film"
            className="adv-filter__select"
          >
            <option value="rating:desc">⭐ Rating: Tertinggi</option>
            <option value="rating:asc">⭐ Rating: Terendah</option>
            <option value="release_year:desc">📅 Tahun: Terbaru</option>
            <option value="release_year:asc">📅 Tahun: Terlama</option>
            <option value="title:asc">🔤 Judul: A - Z</option>
            <option value="title:desc">🔤 Judul: Z - A</option>
          </select>
        </div>
      </div>

      {/* Status Filter Pills: Semua / Ongoing / Tamat */}
      {onStatus && (
        <div className="adv-filter__status-row">
          <span className="adv-filter__status-label">Status Tayang:</span>
          <div className="adv-filter__pills">
            {STATUS_OPTIONS.map((st) => {
              const isActive = activeStatus === st.id
              return (
                <button
                  key={st.id}
                  type="button"
                  className={`pill status-filter-pill ${
                    isActive
                      ? st.id === 'Ongoing'
                        ? 'status-filter-pill--ongoing-active'
                        : st.id === 'Tamat'
                          ? 'status-filter-pill--tamat-active'
                          : 'pill--active'
                      : ''
                  }`}
                  onClick={() => onStatus(st.id)}
                >
                  {st.id === 'Ongoing' && <Radio size={13} style={{ marginRight: '5px' }} />}
                  {st.id === 'Tamat' && <CheckCircle2 size={13} style={{ marginRight: '5px' }} />}
                  {st.label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
