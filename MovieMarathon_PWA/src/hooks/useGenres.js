import { useState, useEffect, useCallback } from 'react'
import genreService from '../services/genreService'

export function useGenres() {
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [source, setSource] = useState('local')

  const fetchGenres = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await genreService.getGenres()
      if (res.success) {
        setGenres(res.data || [])
        setSource(res.source || 'local')
      } else {
        setError('Gagal memuat daftar genre.')
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat memuat genre.')
      setGenres([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGenres()
  }, [fetchGenres])

  return { genres, loading, error, source, refetch: fetchGenres }
}
