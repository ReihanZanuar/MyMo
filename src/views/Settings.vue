<template>
  <div class="settings">
    <header class="page-header">
      <div class="header-content">
        <h2>Pengaturan</h2>
        <p class="subtitle">Kelola akun dan preferensi Anda</p>
      </div>
    </header>

    <div class="settings-container">
      <!-- Profile Section -->
      <div class="settings-card">
        <h3 class="card-title">Profil</h3>
        <div class="form-group">
          <div class="avatar-section">
            <div class="avatar" :style="avatarStyle">
              <img v-if="profile.avatarUrl && !profile.avatarUrl.startsWith('gradient-')" :src="profile.avatarUrl" alt="Avatar" />
              <span v-else>{{ userInitial }}</span>
            </div>
            <button class="btn-secondary" @click="showAvatarModal = true">Ubah Foto</button>
          </div>
        </div>
        <div class="form-group">
          <label>Nama Lengkap</label>
          <input v-model="profile.name" type="text" class="form-input" />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input v-model="profile.email" type="email" class="form-input" />
        </div>
        <button class="btn-primary" @click="saveProfile" :disabled="saving">
          {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
        </button>
      </div>

      <!-- Security Section -->
      <div class="settings-card">
        <h3 class="card-title">Keamanan</h3>
        <div class="form-group">
          <label>Password Lama</label>
          <input v-model="security.oldPassword" type="password" class="form-input" />
        </div>
        <div class="form-group">
          <label>Password Baru</label>
          <input v-model="security.newPassword" type="password" class="form-input" />
        </div>
        <div class="form-group">
          <label>Konfirmasi Password Baru</label>
          <input v-model="security.confirmPassword" type="password" class="form-input" />
        </div>
        <button class="btn-primary" @click="changePassword">Ubah Password</button>
      </div>

      <!-- Preferences Section -->
      <div class="settings-card">
        <h3 class="card-title">Preferensi</h3>
        <div class="form-group">
          <label>Mata Uang</label>
          <select v-model="preferences.currency" class="form-input">
            <option value="IDR">IDR - Indonesian Rupiah</option>
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
          </select>
        </div>
        <div class="form-group">
          <label>Bahasa</label>
          <select v-model="preferences.language" class="form-input">
            <option value="id">Indonesia</option>
            <option value="en">English</option>
          </select>
        </div>
        <div class="form-group">
          <label>Dark Mode</label>
          <label class="toggle">
            <input v-model="preferences.darkMode" type="checkbox" />
            <span class="toggle-slider"></span>
          </label>
        </div>
        <button class="btn-primary" @click="savePreferences">Simpan Preferensi</button>
      </div>

      <!-- Notifications Section -->
      <div class="settings-card">
        <h3 class="card-title">Notifikasi</h3>
        <div class="form-group">
          <label>Email Notifikasi</label>
          <label class="toggle">
            <input v-model="notifications.email" type="checkbox" />
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="form-group">
          <label>Notifikasi Transaksi</label>
          <label class="toggle">
            <input v-model="notifications.transaction" type="checkbox" />
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="form-group">
          <label>Laporan Bulanan</label>
          <label class="toggle">
            <input v-model="notifications.monthlyReport" type="checkbox" />
            <span class="toggle-slider"></span>
          </label>
        </div>
        <button class="btn-primary" @click="saveNotifications">Simpan Notifikasi</button>
      </div>

      <!-- Data & Privacy Section -->
      <div class="settings-card">
        <h3 class="card-title">Data & Privasi</h3>
        <div class="data-actions">
          <button class="btn-secondary" @click="exportDataCSV">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export Data (CSV)
          </button>
          <button class="btn-secondary" @click="backupData">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Backup Data
          </button>
        </div>
        <p class="backup-info">Backup terakhir: 1 Juli 2026, 10:30</p>
      </div>

      <!-- Danger Zone Section -->
      <div class="settings-card danger">
        <h3 class="card-title">Danger Zone</h3>
        <p class="danger-warning">Tindakan ini tidak dapat dibatalkan. Semua data Anda akan dihapus secara permanen.</p>
        <button class="btn-danger" @click="deleteAccount">Hapus Akun</button>
      </div>
    </div>

    <!-- Avatar Modal -->
    <div v-if="showAvatarModal" class="modal-overlay" @click="showAvatarModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Pilih Foto Profil</h3>
          <button class="modal-close" @click="showAvatarModal = false">&times;</button>
        </div>

        <div class="modal-body">
          <div class="avatar-section-modal">
            <h4>Pilih Gradient</h4>
            <div class="stock-avatars">
              <div
                v-for="(gradient, index) in stockAvatars"
                :key="gradient.id"
                class="stock-avatar"
                :class="{ selected: selectedAvatar === gradient.id }"
                :style="{ background: gradient.style }"
                @click="selectedAvatar = gradient.id"
              >
                <span>{{ userInitial }}</span>
              </div>
            </div>
          </div>

          <div class="divider">ATAU</div>

          <div class="avatar-section-modal">
            <h4>Upload dari Galeri</h4>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleFileUpload"
            />
            <button class="btn-upload" @click="$refs.fileInput.click()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              Pilih File
            </button>
            <p class="upload-hint">JPG, PNG, atau GIF (max 2MB)</p>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="showAvatarModal = false">Batal</button>
          <button class="btn-primary" @click="saveAvatar" :disabled="!selectedAvatar">Simpan</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { userService } from '../services/users'
import { transactionService } from '../services/transactions'
import { categoryService } from '../services/categories'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const loading = ref(true)
const error = ref(null)
const saving = ref(false)

const profile = ref({
  name: '',
  email: '',
  avatarUrl: ''
})

const showAvatarModal = ref(false)
const selectedAvatar = ref(null)
const fileInput = ref(null)

const stockAvatars = [
  { id: 'gradient-1', style: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'gradient-2', style: 'linear-gradient(135deg, #ec4899 0%, #ef4444 100%)' },
  { id: 'gradient-3', style: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' },
  { id: 'gradient-4', style: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)' },
  { id: 'gradient-5', style: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' },
  { id: 'gradient-6', style: 'linear-gradient(135deg, #ef4444 0%, #a855f7 100%)' },
  { id: 'gradient-7', style: 'linear-gradient(135deg, #fbbf24 0%, #84cc16 100%)' },
  { id: 'gradient-8', style: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }
]

const security = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const preferences = ref({
  currency: 'IDR',
  language: 'id',
  darkMode: false
})

const notifications = ref({
  email: true,
  transaction: true,
  monthlyReport: false
})

const userInitial = computed(() => profile.value.name.charAt(0).toUpperCase())

const avatarStyle = computed(() => {
  if (profile.value.avatarUrl && profile.value.avatarUrl.startsWith('gradient-')) {
    const gradient = stockAvatars.find(g => g.id === profile.value.avatarUrl)
    return gradient ? { background: gradient.style } : { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
  }
  return { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
})

async function fetchProfile() {
  try {
    loading.value = true
    error.value = null

    const data = await userService.getProfile()
    profile.value = {
      name: data.user.name || '',
      email: data.user.email || '',
      avatarUrl: data.user.avatar_url || ''
    }
  } catch (err) {
    error.value = err.message || 'Gagal memuat profil'
    console.error('Error fetching profile:', err)
  } finally {
    loading.value = false
  }
}

async function saveProfile() {
  try {
    saving.value = true
    error.value = null

    const data = await userService.updateProfile({
      name: profile.value.name,
      email: profile.value.email
    })

    authStore.updateUser(data.user)
    alert('Profil berhasil diperbarui')
  } catch (err) {
    error.value = err.message || 'Gagal menyimpan profil'
    alert('Gagal menyimpan profil: ' + err.message)
  } finally {
    saving.value = false
  }
}

async function changePassword() {
  if (!security.value.oldPassword || !security.value.newPassword || !security.value.confirmPassword) {
    alert('Semua field password harus diisi')
    return
  }

  if (security.value.newPassword !== security.value.confirmPassword) {
    alert('Password baru dan konfirmasi password tidak cocok')
    return
  }

  if (security.value.newPassword.length < 6) {
    alert('Password baru minimal 6 karakter')
    return
  }

  try {
    await userService.changePassword({
      oldPassword: security.value.oldPassword,
      newPassword: security.value.newPassword
    })

    security.value = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }

    alert('Password berhasil diubah')
  } catch (err) {
    alert('Gagal mengubah password: ' + (err.message || 'Terjadi kesalahan'))
  }
}

function savePreferences() {
  localStorage.setItem('mymo_preferences', JSON.stringify(preferences.value))
  alert('Preferensi berhasil disimpan')
}

function saveNotifications() {
  localStorage.setItem('mymo_notifications', JSON.stringify(notifications.value))
  alert('Pengaturan notifikasi berhasil disimpan')
}

async function exportDataCSV() {
  try {
    const data = await transactionService.getTransactions({ limit: 100 })
    const transactions = data.transactions || []

    if (transactions.length === 0) {
      alert('Tidak ada data transaksi untuk di-export')
      return
    }

    const csvRows = []
    csvRows.push(['Tanggal', 'Tipe', 'Kategori', 'Deskripsi', 'Jumlah', 'Metode Pembayaran'])

    transactions.forEach(t => {
      csvRows.push([
        t.date,
        t.type,
        t.category_name || '',
        t.description || '',
        t.amount,
        t.payment_method || ''
      ])
    })

    const csvContent = csvRows.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `MyMo_Transactions_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    alert('Data berhasil di-export sebagai CSV')
  } catch (err) {
    alert('Gagal export data: ' + (err.message || 'Terjadi kesalahan'))
  }
}

async function backupData() {
  try {
    const [transactionsData, categoriesData, profileData] = await Promise.all([
      transactionService.getTransactions({ limit: 100 }),
      categoryService.getCategories(),
      userService.getProfile()
    ])

    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profile: profileData.user,
      categories: categoriesData.categories || [],
      transactions: transactionsData.transactions || []
    }

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `MyMo_Backup_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    window.URL.revokeObjectURL(url)

    alert('Backup berhasil dibuat')
  } catch (err) {
    alert('Gagal membuat backup: ' + (err.message || 'Terjadi kesalahan'))
  }
}

async function deleteAccount() {
  const confirmed = confirm(
    'PERINGATAN: Tindakan ini tidak dapat dibatalkan!\n\n' +
    'Semua data Anda (transaksi, kategori, profil) akan dihapus secara permanen.\n\n' +
    'Apakah Anda yakin ingin menghapus akun?'
  )

  if (!confirmed) return

  const doubleConfirm = confirm('Konfirmasi sekali lagi: Hapus akun saya secara permanen?')
  if (!doubleConfirm) return

  try {
    await userService.deleteAccount()
    alert('Akun berhasil dihapus')
    authStore.logout()
    window.location.href = '/login.html'
  } catch (err) {
    alert('Gagal menghapus akun: ' + (err.message || 'Terjadi kesalahan'))
  }
}

function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    alert('Ukuran file terlalu besar. Maksimal 2MB')
    return
  }

  if (!file.type.startsWith('image/')) {
    alert('File harus berupa gambar (JPG, PNG, atau GIF)')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    selectedAvatar.value = e.target.result
  }
  reader.onerror = () => {
    alert('Gagal membaca file')
  }
  reader.readAsDataURL(file)
}

async function saveAvatar() {
  if (!selectedAvatar.value) {
    alert('Pilih foto profil terlebih dahulu')
    return
  }

  try {
    const data = await userService.updateAvatar(selectedAvatar.value)
    profile.value.avatarUrl = data.user.avatar_url
    authStore.updateUser(data.user)

    showAvatarModal.value = false
    selectedAvatar.value = null

    alert('Foto profil berhasil diperbarui')
  } catch (err) {
    alert('Gagal memperbarui foto profil: ' + (err.message || 'Terjadi kesalahan'))
  }
}

onMounted(() => {
  fetchProfile()

  const savedPreferences = localStorage.getItem('mymo_preferences')
  if (savedPreferences) {
    preferences.value = JSON.parse(savedPreferences)
  }

  const savedNotifications = localStorage.getItem('mymo_notifications')
  if (savedNotifications) {
    notifications.value = JSON.parse(savedNotifications)
  }
})
</script>

<style scoped>
.settings {
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content h2 {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.settings-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.settings-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.settings-card.danger {
  border-color: rgba(239, 68, 68, 0.3);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1.5rem 0;
}

.form-group {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: 600;
}

.btn-primary, .btn-secondary, .btn-danger {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: white;
  color: #667eea;
  border: 1px solid #667eea;
}

.btn-secondary:hover {
  background: rgba(102, 126, 234, 0.05);
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.toggle {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d1d5db;
  transition: 0.3s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle input:checked + .toggle-slider {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.toggle input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

.data-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.backup-info {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.danger-warning {
  font-size: 0.875rem;
  color: #ef4444;
  margin: 0 0 1rem 0;
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
}

@media (max-width: 768px) {
  .settings {
    padding: 1rem;
  }

  .settings-container {
    max-width: 100%;
  }

  .settings-card {
    padding: 1.5rem;
  }

  .data-actions {
    flex-direction: column;
  }

  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.modal-close {
  background: none;
  border: none;
  font-size: 2rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.modal-body {
  padding: 1.5rem;
}

.avatar-section-modal {
  margin-bottom: 1.5rem;
}

.avatar-section-modal h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4b5563;
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stock-avatars {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.stock-avatar {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: 600;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.3s ease;
}

.stock-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stock-avatar.selected {
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
  transform: scale(1.05);
}

.divider {
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
  font-weight: 600;
  margin: 2rem 0;
  position: relative;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background: #e5e7eb;
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.btn-upload {
  width: 100%;
  padding: 1rem;
  background: white;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-upload:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.upload-hint {
  margin: 0.5rem 0 0 0;
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

@media (max-width: 640px) {
  .stock-avatars {
    grid-template-columns: repeat(3, 1fr);
  }

  .modal-content {
    width: 95%;
  }
}

/* Dark Mode */
.dark .settings {
  color: #e5e7eb;
}

.dark .page-header {
  color: #f3f4f6;
}

.dark .subtitle {
  color: rgba(229, 231, 235, 0.8);
}

.dark .settings-card {
  background: rgba(30, 30, 45, 0.6);
  border-color: rgba(102, 126, 234, 0.2);
}

.dark .settings-card.danger {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(30, 30, 45, 0.6);
}

.dark .card-title {
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

.dark .form-input:focus {
  border-color: #8b9bea;
  background: rgba(15, 15, 25, 0.7);
  box-shadow: 0 0 0 3px rgba(139, 155, 234, 0.1);
}

.dark .avatar-section {
  color: #e5e7eb;
}

.dark .toggle-slider {
  background-color: #4b5563;
}

.dark .toggle input:checked + .toggle-slider {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.dark .data-actions .btn-secondary {
  background: rgba(15, 15, 25, 0.5);
  border-color: rgba(102, 126, 234, 0.2);
  color: #9ca3af;
}

.dark .data-actions .btn-secondary:hover {
  background: rgba(102, 126, 234, 0.1);
  border-color: #8b9bea;
  color: #d1d5db;
}

.dark .backup-info {
  color: #9ca3af;
}

.dark .danger-warning {
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.dark .btn-danger {
  background: #dc2626;
}

.dark .btn-danger:hover {
  background: #b91c1c;
}

.dark .modal-overlay {
  background: rgba(0, 0, 0, 0.7);
}

.dark .modal-content {
  background: rgba(30, 30, 45, 0.98);
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.dark .modal-header {
  border-bottom-color: rgba(102, 126, 234, 0.2);
}

.dark .modal-header h3 {
  color: #f3f4f6;
}

.dark .modal-close {
  color: #9ca3af;
}

.dark .modal-close:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #e5e7eb;
}

.dark .avatar-section-modal h4 {
  color: #d1d5db;
}

.dark .divider {
  color: #6b7280;
}

.dark .divider::before,
.dark .divider::after {
  background: rgba(102, 126, 234, 0.2);
}

.dark .btn-upload {
  background: rgba(15, 15, 25, 0.5);
  border-color: rgba(102, 126, 234, 0.3);
  color: #8b9bea;
}

.dark .btn-upload:hover {
  border-color: #8b9bea;
  background: rgba(102, 126, 234, 0.1);
}

.dark .upload-hint {
  color: #9ca3af;
}
</style>
