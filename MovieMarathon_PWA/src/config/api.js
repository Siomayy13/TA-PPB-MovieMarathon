import axios from 'axios'

// ---------------------------------------------------------------------------
// Custom Express RESTful API Configuration (Modul 1 + Tugas Akhir PPB)
// Membaca VITE_API_BASE_URL dari .env (misal: http://localhost:3000/api
// atau https://movie-marathon-api.vercel.app/api)
// ---------------------------------------------------------------------------
const RAW_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').trim()
const BASE_URL = RAW_BASE_URL.replace(/\/+$/, '')

if (!BASE_URL) {
  console.info(
    '[MovieMarathon] VITE_API_BASE_URL belum disetel. Aplikasi berjalan pada mode cache offline PWA.',
  )
}

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
})

// Response interceptor — unwrap data & normalisasi pesan error
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = 'Terjadi kesalahan yang tidak terduga.'
    let status = null
    if (error.response) {
      status = error.response.status
      message =
        error.response.data?.error ||
        error.response.data?.message ||
        `Server error (${status})`
    } else if (error.request) {
      message = 'Tidak dapat terhubung ke server API. Menggunakan cache offline lokal.'
    } else {
      message = error.message || message
    }
    return Promise.reject({
      message,
      status,
      raw: error.response?.data,
    })
  },
)

/**
 * Cek koneksi ke endpoint /health pada Custom Express API
 */
export async function checkApiHealth() {
  if (!BASE_URL) {
    return {
      ok: false,
      message: 'VITE_API_BASE_URL belum diatur di file .env.',
    }
  }
  try {
    const res = await apiClient.get('/health')
    if (res?.status === 'ok') {
      return {
        ok: true,
        message: res.database_configured
          ? 'Terhubung ke server Movie Marathon secara real-time.'
          : 'Server aktif, namun koneksi database sedang belum siap.',
      }
    }
    return { ok: true, message: 'Server aktif dan merespons.' }
  } catch (err) {
    return {
      ok: false,
      message: `Server sedang tidak dapat dijangkau (${err.message}). Aplikasi berjalan dalam mode offline.`,
    }
  }
}

export { apiClient, BASE_URL }
