import api from './api'

class OCRService {
  async processImage(imageFile) {
    try {
      const formData = new FormData()
      formData.append('image', imageFile)

      const response = await api.post('/ocr', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 90000
      })

      return response.data.text
    } catch (error) {
      console.error('OCR Error:', error)

      if (error.response?.status === 503) {
        throw new Error('Layanan OCR tidak tersedia')
      }

      throw new Error('Gagal memproses gambar')
    }
  }
}

export const ocrService = new OCRService()
