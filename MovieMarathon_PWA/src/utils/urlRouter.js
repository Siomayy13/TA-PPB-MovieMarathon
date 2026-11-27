// ---------------------------------------------------------------------------
// urlRouter.js — Direct URL routing & History API helper untuk Movie Marathon
// Mendukung direct link /film/:id (dan /movie/:id atau ?film=:id) serta tab utama
// ---------------------------------------------------------------------------

const TAB_TO_PATH = {
  Catalog: '/',
  Genres: '/genre',
  Marathons: '/collections',
  History: '/histori',
  Watchlist: '/watchlist',
  Profile: '/profil',
  Tips: '/panduan',
}

const PATH_TO_TAB = Object.entries(TAB_TO_PATH).reduce((acc, [tab, path]) => {
  acc[path] = tab
  return acc
}, {})

export function getPathForTab(tab) {
  return TAB_TO_PATH[tab] || '/'
}

export function getMovieDetailPath(movieId) {
  return `/film/${encodeURIComponent(String(movieId))}`
}

export function getCollectionDetailPath(marathonId) {
  return `/collections/${encodeURIComponent(String(marathonId))}`
}

/**
 * Membangun URL absolut yang valid untuk dibagikan (Web Share API / copy clipboard)
 */
export function buildMovieShareUrl(movieOrId) {
  const id = typeof movieOrId === 'object' ? movieOrId?.id : movieOrId
  if (!id) return typeof window !== 'undefined' ? window.location.origin : ''
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}${getMovieDetailPath(id)}`
}

/**
 * Membaca URL browser saat ini (pathname & query) untuk menentukan halaman yang dibuka
 * saat aplikasi pertama kali dimuat, di-refresh, atau navigasi Back/Forward browser.
 */
export function parseRouteFromLocation(loc = typeof window !== 'undefined' ? window.location : null) {
  if (!loc) return { type: 'tab', tab: 'Catalog' }

  const rawPath = (loc.pathname || '/').replace(/\/+$/, '') || '/'
  const params = new URLSearchParams(loc.search || '')

  // Dukung query parameter fallback: ?film=<id> atau ?movie=<id>
  const queryMovieId = params.get('film') || params.get('movie')
  if (queryMovieId) {
    return { type: 'movie', movieId: decodeURIComponent(queryMovieId) }
  }

  // Direct route: /film/:id atau /movie/:id
  const movieMatch = rawPath.match(/^\/(?:film|movie)\/([^/]+)$/i)
  if (movieMatch && movieMatch[1]) {
    return { type: 'movie', movieId: decodeURIComponent(movieMatch[1]) }
  }

  // Direct route: /collections/:id
  const colMatch = rawPath.match(/^\/collections\/([^/]+)$/i)
  if (colMatch && colMatch[1]) {
    return { type: 'collection', marathonId: decodeURIComponent(colMatch[1]) }
  }

  // Tab utama
  const matchedTab = PATH_TO_TAB[rawPath.toLowerCase()]
  if (matchedTab) {
    return { type: 'tab', tab: matchedTab }
  }

  return { type: 'tab', tab: 'Catalog' }
}

export function pushRoute(path) {
  if (typeof window === 'undefined' || !window.history) return
  const normalized = path || '/'
  if (window.location.pathname + window.location.search === normalized) return
  window.history.pushState({ path: normalized }, '', normalized)
}

export function replaceRoute(path) {
  if (typeof window === 'undefined' || !window.history) return
  const normalized = path || '/'
  if (window.location.pathname + window.location.search === normalized) return
  window.history.replaceState({ path: normalized }, '', normalized)
}
