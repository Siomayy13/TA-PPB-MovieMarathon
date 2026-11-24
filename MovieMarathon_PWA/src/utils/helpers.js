// ---------------------------------------------------------------------------
// helpers.js — pure utility functions for Movie Marathon
// ---------------------------------------------------------------------------

/**
 * Format rating (e.g. 9.3 -> '9.3 / 10')
 */
export const formatRating = (rating) => {
  const num = Number(rating)
  if (Number.isNaN(num) || num <= 0) return 'NR'
  return num.toFixed(1)
}

/**
 * Client-side search match (searches title, director, cast, synopsis, and genres)
 */
export const matchesSearch = (item, query) => {
  if (!query) return true
  const q = query.toLowerCase().trim()
  return (
    (item.title || item.name || '').toLowerCase().includes(q) ||
    (item.description || item.synopsis || '').toLowerCase().includes(q) ||
    (item.director || '').toLowerCase().includes(q) ||
    (item.cast || '').toLowerCase().includes(q) ||
    (item.genre || '').toLowerCase().includes(q)
  )
}

/**
 * Filter by Type / Category (e.g. 'All', 'Movie', 'K-Drama', 'Anime', 'Series')
 */
export const matchesCategory = (item, category) => {
  if (!category || category === 'All') return true
  const itemType = (item.type || item.category || '').toLowerCase()
  return itemType === category.toLowerCase()
}

/**
 * Sort movies by key (rating, title, year)
 */
export const sortMovies = (items, key = 'rating', order = 'desc') => {
  const sorted = [...items].sort((a, b) => {
    if (key === 'rating') {
      const rA = Number(a.rating) || 0
      const rB = Number(b.rating) || 0
      return rA - rB
    }
    if (key === 'release_year' || key === 'year') {
      const yA = Number(a.release_year || a.year) || 0
      const yB = Number(b.release_year || b.year) || 0
      return yA - yB
    }
    const tA = String(a.title || a.name || '').toLowerCase()
    const tB = String(b.title || b.name || '').toLowerCase()
    return tA.localeCompare(tB)
  })
  return order === 'desc' ? sorted.reverse() : sorted
}

/**
 * Truncate text to a maximum length with ellipsis
 */
export const truncate = (str, max = 110) => {
  if (!str || str.length <= max) return str || ''
  return str.slice(0, max).trimEnd() + '…'
}

/**
 * Extract distinct types / categories from movie list
 */
export const extractCategories = (items) => {
  const set = new Set()
  items.forEach((i) => {
    const t = i.type || i.category
    if (t) set.add(t)
  })
  return ['All', ...Array.from(set).sort()]
}

/**
 * Compute average rating from review items
 */
export const averageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0
  const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0)
  return Math.round((sum / reviews.length) * 10) / 10
}
