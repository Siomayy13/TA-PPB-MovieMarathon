import { useState, useEffect, useCallback } from 'react'
import marathonService from '../services/marathonService'

export function useMarathons(params = {}) {
  const [marathons, setMarathons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [source, setSource] = useState('local')

  const paramKey = JSON.stringify(params)

  const fetchMarathons = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await marathonService.getMarathons(params)
      if (res.success) {
        setMarathons(res.data || [])
        setSource(res.source || 'local')
      } else {
        setError('Gagal memuat paket marathon.')
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat memuat paket marathon.')
      setMarathons([])
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramKey])

  useEffect(() => {
    fetchMarathons()
  }, [fetchMarathons])

  return { marathons, loading, error, source, refetch: fetchMarathons }
}
