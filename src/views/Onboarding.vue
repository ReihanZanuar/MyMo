<template>
  <div class="onboarding-container">
    <div class="onboarding-card">
      <div class="onboarding-header">
        <h1>Selamat Datang di MyMo! 👋</h1>
        <p>Mari kita setup akun kamu dulu</p>
      </div>

      <div class="progress-indicator">
        <div class="progress-step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
          <div class="step-circle">1</div>
          <span>Dompet</span>
        </div>
        <div class="progress-line" :class="{ active: currentStep > 1 }"></div>
        <div class="progress-step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
          <div class="step-circle">2</div>
          <span>Foto Profil</span>
        </div>
        <div class="progress-line" :class="{ active: currentStep > 2 }"></div>
        <div class="progress-step" :class="{ active: currentStep >= 3 }">
          <div class="step-circle">3</div>
          <span>Selesai</span>
        </div>
      </div>

      <div class="onboarding-content">
        <div v-if="currentStep === 1" class="step-content">
          <h2>Buat Dompet Pertama</h2>
          <p class="step-description">Dompet untuk mencatat transaksi kamu</p>

          <form @submit.prevent="handleCreateWallet" class="onboarding-form">
            <div class="form-group">
              <label>Nama Dompet</label>
              <input
                v-model="walletForm.name"
                type="text"
                placeholder="Contoh: Dompet Utama"
                required
              />
            </div>

            <div class="form-group">
              <label>Saldo Awal</label>
              <input
                v-model.number="walletForm.balance"
                type="number"
                placeholder="0"
                min="0"
                step="1000"
              />
            </div>

            <div class="form-group">
              <label>Jenis Dompet</label>
              <select v-model="walletForm.type" required>
                <option value="cash">Tunai</option>
                <option value="bank">Bank</option>
                <option value="e-wallet">E-Wallet</option>
              </select>
            </div>

            <button type="submit" class="btn-primary" :disabled="loading">
              {{ loading ? 'Membuat...' : 'Lanjut' }}
            </button>
          </form>
        </div>

        <div v-if="currentStep === 2" class="step-content">
          <h2>Foto Profil</h2>
          <p class="step-description">Opsional - bisa dilewati jika tidak mau</p>

          <div class="avatar-upload">
            <div class="avatar-preview">
              <img v-if="imagePreviewUrl" :src="imagePreviewUrl" alt="Preview" />
              <div v-else class="avatar-placeholder">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            </div>

            <input
              type="file"
              ref="fileInput"
              accept="image/*"
              style="display: none"
              @change="handleImageSelect"
            />

            <button type="button" class="btn-secondary" @click="$refs.fileInput.click()">
              Pilih Foto
            </button>
          </div>

          <div class="button-group">
            <button type="button" class="btn-secondary" @click="skipAvatar">
              Lewati
            </button>
            <button
              type="button"
              class="btn-primary"
              @click="handleUploadAvatar"
              :disabled="loading || !selectedImage"
            >
              {{ loading ? 'Mengupload...' : 'Lanjut' }}
            </button>
          </div>
        </div>

        <div v-if="currentStep === 3" class="step-content step-complete">
          <div class="success-icon">✓</div>
          <h2>Semua Sudah Siap!</h2>
          <p class="step-description">Akun kamu sudah siap digunakan</p>

          <button type="button" class="btn-primary" @click="finishOnboarding" :disabled="loading">
            {{ loading ? 'Menyiapkan...' : 'Mulai Menggunakan MyMo' }}
          </button>
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { walletService } from '../services/wallets'
import { userService } from '../services/users'
import { authService } from '../services/auth'

export default {
  name: 'Onboarding',
  setup() {
    const router = useRouter()
    const currentStep = ref(1)
    const loading = ref(false)
    const error = ref('')

    const walletForm = ref({
      name: '',
      balance: 0,
      type: 'cash'
    })

    const selectedImage = ref(null)
    const imagePreviewUrl = ref(null)
    const fileInput = ref(null)

    const handleCreateWallet = async () => {
      try {
        loading.value = true
        error.value = ''

        const colorMap = {
          cash: '#10b981',
          bank: '#3b82f6',
          'e-wallet': '#8b5cf6'
        }

        await walletService.createWallet({
          name: walletForm.value.name,
          balance: walletForm.value.balance || 0,
          type: walletForm.value.type,
          provider: walletForm.value.name,
          color: colorMap[walletForm.value.type] || '#667eea'
        })

        currentStep.value = 2
      } catch (err) {
        error.value = 'Gagal membuat dompet: ' + (err.response?.data?.error || err.message)
      } finally {
        loading.value = false
      }
    }

    const handleImageSelect = (event) => {
      const file = event.target.files[0]
      if (file && file.type.startsWith('image/')) {
        selectedImage.value = file
        imagePreviewUrl.value = URL.createObjectURL(file)
        error.value = ''
      }
    }

    const handleUploadAvatar = async () => {
      if (!selectedImage.value) return

      try {
        loading.value = true
        error.value = ''

        const reader = new FileReader()
        reader.onloadend = async () => {
          try {
            await userService.updateAvatar(reader.result)
            currentStep.value = 3
          } catch (err) {
            error.value = 'Gagal mengupload foto: ' + (err.response?.data?.error || err.message)
          } finally {
            loading.value = false
          }
        }
        reader.readAsDataURL(selectedImage.value)
      } catch (err) {
        error.value = 'Gagal memproses foto: ' + err.message
        loading.value = false
      }
    }

    const skipAvatar = () => {
      currentStep.value = 3
    }

    const finishOnboarding = async () => {
      try {
        loading.value = true
        error.value = ''

        await authService.completeOnboarding()

        router.push('/')
      } catch (err) {
        error.value = 'Gagal menyelesaikan onboarding: ' + (err.response?.data?.error || err.message)
      } finally {
        loading.value = false
      }
    }

    return {
      currentStep,
      loading,
      error,
      walletForm,
      selectedImage,
      imagePreviewUrl,
      fileInput,
      handleCreateWallet,
      handleImageSelect,
      handleUploadAvatar,
      skipAvatar,
      finishOnboarding
    }
  }
}
</script>

<style scoped>
.onboarding-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.onboarding-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
  padding: 3rem;
}

.onboarding-header {
  text-align: center;
  margin-bottom: 2rem;
}

.onboarding-header h1 {
  font-size: 2rem;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.onboarding-header p {
  color: #6b7280;
  margin: 0;
}

.progress-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 3rem;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.3s ease;
}

.progress-step.active .step-circle {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.progress-step.completed .step-circle {
  background: #10b981;
  color: white;
}

.progress-step span {
  font-size: 0.875rem;
  color: #6b7280;
}

.progress-line {
  flex: 1;
  height: 2px;
  background: #e5e7eb;
  margin: 0 1rem;
  transition: all 0.3s ease;
}

.progress-line.active {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.onboarding-content {
  margin-top: 2rem;
}

.step-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.step-content h2 {
  font-size: 1.5rem;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.step-description {
  color: #6b7280;
  margin: 0 0 2rem 0;
}

.onboarding-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.avatar-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #e5e7eb;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.button-group {
  display: flex;
  gap: 1rem;
}

.button-group button {
  flex: 1;
}

.btn-primary,
.btn-secondary {
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.step-complete {
  text-align: center;
}

.success-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  font-size: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 0.875rem;
}

@media (max-width: 640px) {
  .onboarding-card {
    padding: 2rem 1.5rem;
  }

  .progress-indicator {
    font-size: 0.75rem;
  }

  .step-circle {
    width: 32px;
    height: 32px;
    font-size: 0.875rem;
  }
}
</style>
