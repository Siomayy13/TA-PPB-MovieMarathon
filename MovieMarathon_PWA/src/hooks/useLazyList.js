import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * useLazyList — Lazy rendering bertahap berbasis IntersectionObserver untuk daftar panjang
 * (katalog film, episode, histori, genre) agar render awal lebih ringan dan smooth saat di-scroll.
 */
export function useLazyList(
  items = [],
  { initialCount = 8, batchSize = 8, rootMargin = '220px', resetKey = '' } = {},
) {
  const [visibleCount, setVisibleCount] = useState(initialCount)
  const sentinelRef = useRef(null)

  // Reset jumlah tampil saat filter/pencarian/halaman berubah
  useEffect(() => {
    setVisibleCount(initialCount)
  }, [initialCount, resetKey])

  const total = items.length
  const hasMore = visibleCount < total
  const remainingCount = Math.max(0, total - visibleCount)

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(total, prev + batchSize))
  }, [total, batchSize])

  useEffect(() => {
    if (!hasMore) return undefined
    const node = sentinelRef.current
    if (!node || typeof IntersectionObserver === 'undefined') return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMore()
        }
      },
      { rootMargin, threshold: 0.01 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, loadMore, rootMargin])

  return {
    visibleItems: items.slice(0, visibleCount),
    visibleCount: Math.min(visibleCount, total),
    totalCount: total,
    hasMore,
    remainingCount,
    sentinelRef,
    loadMore,
  }
}
