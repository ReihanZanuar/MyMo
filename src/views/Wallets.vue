<template>
  <div class="wallets-content">
    <div class="content-header">
      <div>
        <h2>Dompet</h2>
        <p class="subtitle">Kelola dompet dan saldo Anda</p>
      </div>
      <button class="btn-add-wallet-header" @click="openModal()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Tambah Dompet
      </button>
    </div>

    <!-- Total Balance Card -->
    <div class="total-balance-card">
      <div class="balance-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
          <line x1="1" y1="10" x2="23" y2="10"></line>
        </svg>
      </div>
      <div class="balance-content">
        <p class="balance-label">Total Saldo Semua Dompet</p>
        <h3 class="balance-value">{{ formatCurrency(totalBalance) }}</h3>
      </div>
    </div>

    <!-- Wallets Grid -->
    <div class="wallets-grid">
      <div v-for="wallet in wallets" :key="wallet.id" class="wallet-card" :class="wallet.type">
        <div class="wallet-header">
          <div class="wallet-icon" :style="{ background: wallet.color }">
            <svg v-if="wallet.type === 'bank'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <svg v-else-if="wallet.type === 'ewallet'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
            <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div class="wallet-actions">
            <button class="btn-icon" @click="openModal(wallet)" title="Edit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="btn-icon btn-delete" @click="confirmDelete(wallet)" title="Delete">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="wallet-body">
          <div class="wallet-type-badge">
            {{ getTypeBadge(wallet.type) }}
          </div>
          <h3 class="wallet-name">{{ wallet.name }}</h3>
          <p class="wallet-provider">{{ wallet.provider }}</p>
          <div class="wallet-balance">{{ formatCurrency(wallet.balance) }}</div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="wallets.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
            <line x1="1" y1="10" x2="23" y2="10"></line>
          </svg>
        </div>
        <h3>Belum Ada Dompet</h3>
        <p>Tambahkan dompet pertama Anda untuk mulai mengelola keuangan</p>
        <button class="btn-add-empty" @click="openModal()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Tambah Dompet
        </button>
      </div>
    </div>

    <!-- Modal Add/Edit Wallet -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingWallet ? 'Edit Dompet' : 'Tambah Dompet' }}</h3>
          <button class="btn-close" @click="closeModal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form @submit.prevent="submitWallet" class="modal-form">
          <div class="form-group">
            <label>Tipe Dompet</label>
            <div class="type-selector">
              <button
                type="button"
                class="type-btn"
                :class="{ active: formData.type === 'bank' }"
                @click="formData.type = 'bank'"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Bank
              </button>
              <button
                type="button"
                class="type-btn"
                :class="{ active: formData.type === 'ewallet' }"
                @click="formData.type = 'ewallet'"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                  <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
                E-Wallet
              </button>
              <button
                type="button"
                class="type-btn"
                :class="{ active: formData.type === 'cash' }"
                @click="formData.type = 'cash'"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                Tunai
              </button>
            </div>
          </div>

          <div class="form-group" v-if="formData.type === 'bank'">
            <label>Nama Bank</label>
            <select v-model="formData.provider" class="form-input" required>
              <option value="">Pilih Bank</option>
              <option value="BCA">BCA</option>
              <option value="Mandiri">Mandiri</option>
              <option value="BNI">BNI</option>
              <option value="BRI">BRI</option>
              <option value="CIMB Niaga">CIMB Niaga</option>
              <option value="Permata">Permata</option>
              <option value="Danamon">Danamon</option>
              <option value="BTN">BTN</option>
              <option value="BCA Syariah">BCA Syariah</option>
              <option value="Bank Syariah Indonesia">Bank Syariah Indonesia</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div class="form-group" v-if="formData.type === 'ewallet'">
            <label>E-Wallet</label>
            <select v-model="formData.provider" class="form-input" required>
              <option value="">Pilih E-Wallet</option>
              <option value="GoPay">GoPay</option>
              <option value="OVO">OVO</option>
              <option value="Dana">Dana</option>
              <option value="ShopeePay">ShopeePay</option>
              <option value="LinkAja">LinkAja</option>
              <option value="Jenius">Jenius</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div class="form-group">
            <label>Nama Dompet</label>
            <input
              v-model="formData.name"
              type="text"
              class="form-input"
              placeholder="Contoh: Tabungan Utama, Dompet Belanja"
              required
            />
          </div>

          <div class="form-group">
            <label>Saldo Awal</label>
            <input
              v-model.number="formData.balance"
              type="number"
              class="form-input"
              placeholder="0"
              required
              min="0"
              step="1"
            />
          </div>

          <div class="form-group">
            <label>Warna</label>
            <div class="color-picker">
              <button
                type="button"
                v-for="color in colorOptions"
                :key="color"
                class="color-option"
                :class="{ active: formData.color === color }"
                :style="{ background: color }"
                @click="formData.color = color"
              ></button>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="closeModal">
              Batal
            </button>
            <button type="submit" class="btn-submit" :disabled="submitting">
              {{ submitting ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content modal-small" @click.stop>
        <div class="modal-header">
          <h3>Hapus Dompet</h3>
          <button class="btn-close" @click="showDeleteModal = false">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p>Apakah Anda yakin ingin menghapus dompet <strong>{{ walletToDelete?.name }}</strong>?</p>
          <p class="warning-text">Tindakan ini tidak dapat dibatalkan.</p>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="showDeleteModal = false">
            Batal
          </button>
          <button type="button" class="btn-delete-confirm" @click="deleteWallet" :disabled="deleting">
            {{ deleting ? 'Menghapus...' : 'Hapus' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { walletService } from '../services/wallets'

const wallets = ref([])
const loading = ref(true)
const error = ref(null)
const showModal = ref(false)
const submitting = ref(false)
const editingWallet = ref(null)
const showDeleteModal = ref(false)
const walletToDelete = ref(null)
const deleting = ref(false)

const colorOptions = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
  'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
  'linear-gradient(135deg, #84cc16 0%, #65a30d 100%)',
]

const formData = ref({
  type: 'bank',
  provider: '',
  name: '',
  balance: 0,
  color: colorOptions[0]
})

const totalBalance = computed(() => {
  return wallets.value.reduce((sum, wallet) => sum + parseFloat(wallet.balance || 0), 0)
})

async function fetchWallets() {
  try {
    loading.value = true
    error.value = null
    const data = await walletService.getWallets()
    wallets.value = data.wallets || []
  } catch (err) {
    error.value = err.message || 'Gagal memuat data dompet'
    console.error('Error fetching wallets:', err)
  } finally {
    loading.value = false
  }
}

function openModal(wallet = null) {
  editingWallet.value = wallet
  if (wallet) {
    formData.value = {
      type: wallet.type,
      provider: wallet.provider || '',
      name: wallet.name,
      balance: wallet.balance,
      color: wallet.color || colorOptions[0]
    }
  } else {
    formData.value = {
      type: 'bank',
      provider: '',
      name: '',
      balance: 0,
      color: colorOptions[0]
    }
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingWallet.value = null
}

async function submitWallet() {
  try {
    submitting.value = true

    const walletData = {
      type: formData.value.type,
      provider: formData.value.type === 'cash' ? 'Cash' : formData.value.provider,
      name: formData.value.name,
      balance: formData.value.balance,
      color: formData.value.color
    }

    if (editingWallet.value) {
      await walletService.updateWallet(editingWallet.value.id, walletData)
      alert('Dompet berhasil diperbarui')
    } else {
      await walletService.createWallet(walletData)
      alert('Dompet berhasil ditambahkan')
    }

    closeModal()
    await fetchWallets()
  } catch (err) {
    console.error('Error saving wallet:', err)
    alert('Gagal menyimpan dompet: ' + err.message)
  } finally {
    submitting.value = false
  }
}

function confirmDelete(wallet) {
  walletToDelete.value = wallet
  showDeleteModal.value = true
}

async function deleteWallet() {
  try {
    deleting.value = true
    await walletService.deleteWallet(walletToDelete.value.id)
    showDeleteModal.value = false
    walletToDelete.value = null
    await fetchWallets()
    alert('Dompet berhasil dihapus')
  } catch (err) {
    console.error('Error deleting wallet:', err)
    alert('Gagal menghapus dompet: ' + err.message)
  } finally {
    deleting.value = false
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

function getTypeBadge(type) {
  const badges = {
    bank: 'Bank',
    ewallet: 'E-Wallet',
    cash: 'Tunai'
  }
  return badges[type] || type
}

onMounted(() => {
  fetchWallets()
})
</script>

<style scoped>
.wallets-content {
  padding: 2rem;
}

.content-header {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.content-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  margin: 0;
}

.btn-add-wallet-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: white;
  color: #667eea;
  border: 1px solid #667eea;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
}

.btn-add-wallet-header:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
}

.total-balance-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 2rem;
  border: 1px solid rgba(102, 126, 234, 0.1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.balance-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.balance-content {
  flex: 1;
}

.balance-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.balance-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.wallets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.wallet-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(102, 126, 234, 0.1);
  transition: all 0.3s ease;
}

.wallet-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
}

.wallet-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.wallet-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.wallet-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: rgba(102, 126, 234, 0.1);
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #667eea;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background: rgba(102, 126, 234, 0.2);
}

.btn-icon.btn-delete {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.btn-icon.btn-delete:hover {
  background: rgba(239, 68, 68, 0.2);
}

.wallet-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.wallet-type-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  width: fit-content;
}

.wallet-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.wallet-provider {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.wallet-balance {
  font-size: 1.5rem;
  font-weight: 700;
  color: #10b981;
  margin-top: 0.5rem;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 2px dashed rgba(102, 126, 234, 0.3);
}

.empty-icon {
  display: inline-flex;
  padding: 1.5rem;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 16px;
  color: #667eea;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: #6b7280;
  font-size: 1rem;
  margin: 0 0 1.5rem 0;
}

.btn-add-empty {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-add-empty:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

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
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

.modal-content.modal-small {
  max-width: 400px;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body p {
  color: #4b5563;
  margin: 0 0 0.75rem 0;
  line-height: 1.5;
}

.warning-text {
  color: #ef4444;
  font-weight: 500;
  font-size: 0.875rem;
}

.modal-form {
  padding: 1.5rem;
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
  color: #1f2937;
  transition: all 0.2s ease;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

.type-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 0.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #6b7280;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.type-btn:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.type-btn.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.color-picker {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.color-option {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  border: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.active {
  border-color: white;
  box-shadow: 0 0 0 2px #667eea;
  transform: scale(1.1);
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn-cancel,
.btn-submit,
.btn-delete-confirm {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-cancel:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-delete-confirm {
  background: #ef4444;
  color: white;
}

.btn-delete-confirm:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-delete-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .wallets-content {
    padding: 1rem;
  }

  .content-header {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-add-wallet-header {
    width: 100%;
    justify-content: center;
  }

  .wallets-grid {
    grid-template-columns: 1fr;
  }

  .type-selector {
    grid-template-columns: 1fr;
  }

  .modal-content {
    max-width: 100%;
    margin: 0.5rem;
    max-height: calc(100vh - 1rem);
  }

  .modal-actions {
    flex-direction: column;
  }
}

/* Dark Mode */
.dark .btn-add-wallet-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.dark .btn-add-wallet-header:hover {
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.dark .total-balance-card {
  background: rgba(30, 30, 45, 0.6);
  border-color: rgba(102, 126, 234, 0.2);
}

.dark .balance-label {
  color: #9ca3af;
}

.dark .balance-value {
  color: #f3f4f6;
}

.dark .wallet-card {
  background: rgba(30, 30, 45, 0.6);
  border-color: rgba(102, 126, 234, 0.2);
}

.dark .wallet-name {
  color: #f3f4f6;
}

.dark .wallet-provider {
  color: #9ca3af;
}

.dark .empty-state {
  background: rgba(30, 30, 45, 0.6);
  border-color: rgba(102, 126, 234, 0.3);
}

.dark .empty-state h3 {
  color: #f3f4f6;
}

.dark .empty-state p {
  color: #9ca3af;
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

.dark .modal-body p {
  color: #d1d5db;
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
}

.dark .form-input::placeholder {
  color: #6b7280;
}

.dark .type-btn {
  background: rgba(15, 15, 25, 0.5);
  border-color: rgba(102, 126, 234, 0.2);
  color: #9ca3af;
}

.dark .type-btn:hover {
  border-color: #8b9bea;
  background: rgba(102, 126, 234, 0.1);
}

.dark .type-btn.active {
  border-color: #667eea;
  color: white;
}

.dark .btn-cancel {
  background: rgba(15, 15, 25, 0.5);
  border-color: rgba(102, 126, 234, 0.2);
  color: #9ca3af;
}

.dark .btn-cancel:hover {
  background: rgba(102, 126, 234, 0.1);
  border-color: #8b9bea;
}
</style>
