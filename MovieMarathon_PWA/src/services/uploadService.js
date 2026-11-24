const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
const MAX_DIMENSION = 800
const JPEG_QUALITY = 0.82

/**
 * Validasi apakah string adalah URL gambar http/https yang valid
 */
export const isValidImageUrl = (value) => {
  if (!value || typeof value !== 'string') return false
  const trimmed = value.trim()
  if (trimmed.startsWith('data:image/')) return true
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Kompres & resize gambar lokal via Canvas agar ringan saat dikirim ke Express API
 * (aman di bawah batas payload Vercel 4.5MB dan kuota localStorage offline).
 */
const compressFileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'))
    reader.onload = () => {
      const originalDataUrl = reader.result
      const img = new Image()
      img.onerror = () => resolve(originalDataUrl)
      img.onload = () => {
        try {
          let { width, height } = img
          if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            if (width >= height) {
              height = Math.round((height * MAX_DIMENSION) / width)
              width = MAX_DIMENSION
            } else {
              width = Math.round((width * MAX_DIMENSION) / height)
              height = MAX_DIMENSION
            }
          }
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            resolve(originalDataUrl)
            return
          }
          ctx.drawImage(img, 0, 0, width, height)
          const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
          const compressed = canvas.toDataURL(outputType, JPEG_QUALITY)
          // Gunakan hasil kompresi hanya jika lebih kecil dari aslinya
          resolve(compressed.length < originalDataUrl.length ? compressed : originalDataUrl)
        } catch {
          resolve(originalDataUrl)
        }
      }
      img.src = originalDataUrl
    }
    reader.readAsDataURL(file)
  })

class UploadService {
  /**
   * Memvalidasi & mengompres file gambar lokal menjadi Data URL (Base64)
   * agar siap dikirim ke Custom Express RESTful API maupun disimpan offline PWA.
   */
  async uploadImage(file) {
    if (!file) {
      throw new Error('Pilih file gambar poster terlebih dahulu.')
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Format gambar tidak didukung. Gunakan JPG, PNG, atau WebP.')
    }
    if (file.size > MAX_SIZE_BYTES) {
      throw new Error('Ukuran file poster melebihi batas 5MB.')
    }

    const url = await compressFileToDataUrl(file)
    return {
      success: true,
      data: {
        url,
        filename: file.name,
      },
    }
  }
}

export default new UploadService()
