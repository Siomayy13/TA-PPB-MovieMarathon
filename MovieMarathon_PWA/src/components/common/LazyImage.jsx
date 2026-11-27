import { useState, useEffect, useRef } from 'react'

const DEFAULT_FALLBACK =
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80'

/**
 * LazyImage — Pembungkus gambar poster/thumbnail dengan:
 * - loading="lazy" (kecuali eager=true untuk LCP/hero) & decoding="async"
 * - Shimmer skeleton tema gelap selama gambar dimuat agar tidak terjadi layout shift
 * - Transisi fade-in halus saat gambar selesai dimuat
 * - Fallback otomatis satu kali jika URL gambar gagal dimuat
 */
export default function LazyImage({
  src,
  alt = '',
  className = '',
  wrapperClassName = '',
  eager = false,
  fallbackSrc = DEFAULT_FALLBACK,
  ...rest
}) {
  const effectiveInitialSrc = src || fallbackSrc
  const [imgSrc, setImgSrc] = useState(effectiveInitialSrc)
  const [loaded, setLoaded] = useState(false)
  const [usedFallback, setUsedFallback] = useState(false)
  const imgRef = useRef(null)

  useEffect(() => {
    const next = src || fallbackSrc
    setImgSrc(next)
    setUsedFallback(false)
    // Jika gambar sudah ada di cache browser, langsung tampilkan tanpa kedip
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true)
    } else {
      setLoaded(false)
    }
  }, [src, fallbackSrc])

  const handleLoad = () => {
    setLoaded(true)
  }

  const handleError = () => {
    if (!usedFallback && fallbackSrc && imgSrc !== fallbackSrc) {
      setUsedFallback(true)
      setImgSrc(fallbackSrc)
    } else {
      setLoaded(true)
    }
  }

  return (
    <div className={`lazy-img-wrap ${loaded ? 'lazy-img-wrap--loaded' : ''} ${wrapperClassName}`}>
      {!loaded && <div className="lazy-img-skeleton" aria-hidden="true" />}
      <img
        ref={imgRef}
        src={imgSrc}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={`lazy-img ${loaded ? 'lazy-img--loaded' : ''} ${className}`}
        {...rest}
      />
    </div>
  )
}
