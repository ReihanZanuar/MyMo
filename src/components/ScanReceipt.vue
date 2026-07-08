<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Scan Struk</h3>
        <button class="btn-close" @click="$emit('close')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div v-if="step === 'capture'" class="capture-step">
          <div class="capture-options">
            <button @click="openCamera" class="btn-option">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
              <span>Buka Kamera</span>
            </button>

            <button @click="triggerFileInput" class="btn-option">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span>Upload Gambar</span>
            </button>
          </div>

          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleFileSelect"
          />

          <div v-if="showCamera" class="camera-container">
            <video ref="videoElement" autoplay playsinline></video>
            <button @click="capturePhoto" class="btn-capture">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
            </button>
            <button @click="closeCamera" class="btn-close-camera">Tutup Kamera</button>
          </div>
        </div>

        <div v-if="step === 'processing'" class="processing-step">
          <div class="spinner"></div>
          <p>{{ processingMessage }}</p>
          <div v-if="capturedImage" class="image-preview">
            <img :src="capturedImage" alt="Captured receipt" />
          </div>
        </div>

        <div v-if="step === 'result'" class="result-step">
          <div v-if="capturedImage" class="image-preview-small">
            <img :src="capturedImage" alt="Scanned receipt" />
          </div>

          <form @submit.prevent="submitTransaction" class="result-form">
            <div class="form-group">
              <label>Tipe Transaksi *</label>
              <div class="type-selector">
                <button
                  type="button"
                  class="type-btn"
                  :class="{ active: formData.type === 'income' }"
                  @click="formData.type = 'income'"
                >
                  Pemasukan
                </button>
                <button
                  type="button"
                  class="type-btn"
                  :class="{ active: formData.type === 'expense' }"
                  @click="formData.type = 'expense'"
                >
                  Pengeluaran
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>Jumlah *</label>
              <input
                v-model.number="formData.amount"
                type="number"
                class="form-input"
                placeholder="Masukkan jumlah"
                required
                min="0"
              />
            </div>

            <div class="form-group">
              <label>Dompet *</label>
              <select v-model="formData.walletId" class="form-input" required>
                <option value="">Pilih Dompet</option>
                <option
                  v-for="wallet in wallets"
                  :key="wallet.id"
                  :value="wallet.id"
                >
                  {{ wallet.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Kategori *</label>
              <select v-model="formData.categoryId" class="form-input" required>
                <option value="">Pilih Kategori</option>
                <option
                  v-for="category in filteredCategories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Deskripsi</label>
              <input
                v-model="formData.description"
                type="text"
                class="form-input"
                placeholder="Deskripsi transaksi"
              />
            </div>

            <div class="form-group">
              <label>Tanggal *</label>
              <input
                v-model="formData.date"
                type="date"
                class="form-input"
                required
              />
            </div>

            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="resetScan">
                Scan Ulang
              </button>
              <button type="submit" class="btn-primary" :disabled="submitting">
                {{ submitting ? 'Menyimpan...' : 'Simpan Transaksi' }}
              </button>
            </div>
          </form>
        </div>

        <div v-if="step === 'error'" class="error-step">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p class="error-message">{{ errorMessage }}</p>
          <button @click="resetScan" class="btn-primary">Coba Lagi</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ocrService } from '../services/ocr'
import { parseReceipt, decodeQRFromImage, parseQRISData } from '../utils/receiptParser'
import { transactionService } from '../services/transactions'
import { categoryService } from '../services/categories'
import { walletService } from '../services/wallets'

const emit = defineEmits(['close', 'success'])

const step = ref('capture')
const showCamera = ref(false)
const videoElement = ref(null)
const fileInput = ref(null)
const capturedImage = ref(null)
const mediaStream = ref(null)
const processingMessage = ref('Memproses gambar...')
const errorMessage = ref('')
const submitting = ref(false)
const categories = ref([])
const wallets = ref([])

const formData = ref({
  type: 'expense',
  amount: 0,
  categoryId: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  walletId: null
})

const filteredCategories = computed(() => {
  return categories.value.filter(cat => cat.type === formData.value.type)
})

onMounted(async () => {
  await fetchCategories()
  await fetchWallets()
})

onUnmounted(() => {
  if (mediaStream.value) {
    mediaStream.value.getTracks().forEach(track => track.stop())
  }
})

async function fetchCategories() {
  try {
    const data = await categoryService.getCategories()
    categories.value = data.categories || []
  } catch (err) {
    console.error('Error fetching categories:', err)
  }
}

async function fetchWallets() {
  try {
    const data = await walletService.getWallets()
    wallets.value = data.wallets || []
    if (wallets.value.length > 0 && !formData.value.walletId) {
      formData.value.walletId = wallets.value[0].id
    }
  } catch (err) {
    console.error('Error fetching wallets:', err)
  }
}

async function openCamera() {
  try {
    mediaStream.value = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    })
    showCamera.value = true
    await new Promise(resolve => setTimeout(resolve, 100))
    if (videoElement.value) {
      videoElement.value.srcObject = mediaStream.value
    }
  } catch (err) {
    console.error('Camera error:', err)
    errorMessage.value = 'Tidak dapat mengakses kamera'
    step.value = 'error'
  }
}

function closeCamera() {
  if (mediaStream.value) {
    mediaStream.value.getTracks().forEach(track => track.stop())
    mediaStream.value = null
  }
  showCamera.value = false
}

function capturePhoto() {
  const canvas = document.createElement('canvas')
  canvas.width = videoElement.value.videoWidth
  canvas.height = videoElement.value.videoHeight
  const ctx = canvas.getContext('2d')
  ctx.drawImage(videoElement.value, 0, 0)

  canvas.toBlob(blob => {
    processImage(blob)
  }, 'image/jpeg', 0.95)

  closeCamera()
}

function triggerFileInput() {
  fileInput.value.click()
}

function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) {
    processImage(file)
  }
}

async function processImage(imageFile) {
  step.value = 'processing'

  const reader = new FileReader()
  reader.onload = (e) => {
    capturedImage.value = e.target.result
  }
  reader.readAsDataURL(imageFile)

  try {
    processingMessage.value = 'Memeriksa QR code...'
    const qrData = await decodeQRFromImage(imageFile)

    if (qrData) {
      const qrisData = parseQRISData(qrData)
      if (qrisData && qrisData.amount) {
        formData.value.amount = qrisData.amount
        step.value = 'result'
        return
      }
    }

    processingMessage.value = 'Membaca teks dari gambar...'
    const text = await ocrService.processImage(imageFile)

    if (!text || text.trim().length < 10) {
      throw new Error('Tidak dapat membaca teks dari gambar')
    }

    processingMessage.value = 'Mengekstrak informasi...'
    const parsed = parseReceipt(text)

    formData.value.amount = parsed.amount || 0
    formData.value.date = parsed.date || new Date().toISOString().split('T')[0]

    step.value = 'result'
  } catch (err) {
    console.error('Processing error:', err)
    errorMessage.value = err.message || 'Gagal memproses gambar. Pastikan gambar jelas dan mengandung informasi transaksi.'
    step.value = 'error'
  }
}

function resetScan() {
  step.value = 'capture'
  capturedImage.value = null
  errorMessage.value = ''
  formData.value = {
    type: 'expense',
    amount: 0,
    categoryId: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    walletId: wallets.value.length > 0 ? wallets.value[0].id : null
  }
}

async function submitTransaction() {
  try {
    submitting.value = true

    await transactionService.createTransaction({
      type: formData.value.type,
      amount: formData.value.amount,
      walletId: formData.value.walletId,
      categoryId: formData.value.categoryId,
      description: formData.value.description,
      date: formData.value.date
    })

    emit('success')
    emit('close')
  } catch (err) {
    console.error('Submit error:', err)
    alert('Gagal menyimpan transaksi: ' + (err.message || 'Terjadi kesalahan'))
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #6b7280;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.modal-body {
  padding: 1.5rem;
}

.capture-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.btn-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem 1rem;
  background: rgba(102, 126, 234, 0.05);
  border: 2px dashed rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #667eea;
}

.btn-option:hover {
  background: rgba(102, 126, 234, 0.1);
  border-color: #667eea;
  transform: translateY(-2px);
}

.camera-container {
  position: relative;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
}

.camera-container video {
  width: 100%;
  display: block;
}

.btn-capture {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: white;
  border: 4px solid #667eea;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
}

.btn-close-camera {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.processing-step {
  text-align: center;
  padding: 2rem 0;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(102, 126, 234, 0.2);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.image-preview {
  margin-top: 1rem;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.image-preview-small {
  width: 150px;
  height: 150px;
  margin: 0 auto 1.5rem;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid rgba(102, 126, 234, 0.2);
}

.image-preview-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.result-form {
  max-width: 400px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.type-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.type-btn {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #6b7280;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.type-btn:hover {
  border-color: #667eea;
}

.type-btn.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #f9fafb;
}

.error-step {
  text-align: center;
  padding: 2rem 0;
}

.error-message {
  color: #ef4444;
  margin: 1rem 0;
}

.dark .modal-content {
  background: rgba(30, 30, 45, 0.98);
}

.dark .modal-header {
  border-bottom-color: rgba(102, 126, 234, 0.2);
}

.dark .modal-header h3 {
  color: #f3f4f6;
}

.dark .form-group label {
  color: #d1d5db;
}

.dark .form-input {
  background: rgba(15, 15, 25, 0.5);
  border-color: rgba(102, 126, 234, 0.2);
  color: #e5e7eb;
}

.dark .type-btn {
  background: rgba(15, 15, 25, 0.5);
  border-color: rgba(102, 126, 234, 0.2);
  color: #9ca3af;
}

.dark .btn-secondary {
  background: rgba(15, 15, 25, 0.5);
  border-color: rgba(102, 126, 234, 0.2);
  color: #9ca3af;
}
</style>
