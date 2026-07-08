<template>
  <div class="transactions">
    <!-- Header -->
    <header class="page-header">
      <div class="header-content">
        <h2>Transaksi</h2>
        <p class="subtitle">Kelola semua transaksi keuangan Anda</p>
      </div>
    </header>

    <!-- Filters and Search -->
    <div class="toolbar">
      <div class="filter-tabs">
        <button
          v-for="tab in filterTabs"
          :key="tab.value"
          :class="['filter-tab', { active: activeFilter === tab.value }]"
          @click="activeFilter = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="search-box">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Cari transaksi..."
        />
      </div>

      <button class="btn-scan" @click="showScanModal = true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
          <circle cx="12" cy="13" r="4"></circle>
        </svg>
        Scan Struk
      </button>

      <button class="btn-add" @click="openModal">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Tambah Transaksi
      </button>
    </div>

    <!-- Transactions Table -->
    <div class="table-container">
      <table class="transactions-table">
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Deskripsi</th>
            <th>Kategori</th>
            <th>Dompet</th>
            <th>Metode</th>
            <th>Jumlah</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="transaction in filteredTransactions" :key="transaction.id">
            <td>{{ transaction.date }}</td>
            <td>{{ transaction.description }}</td>
            <td>
              <span class="badge" :class="transaction.type">
                {{ transaction.category }}
              </span>
            </td>
            <td>
              <span v-if="transaction.type === 'transfer'">
                {{ transaction.wallet }} → {{ transaction.toWallet }}
              </span>
              <span v-else>{{ transaction.wallet }}</span>
            </td>
            <td>{{ transaction.method }}</td>
            <td :class="transaction.type === 'income' ? 'amount-income' : 'amount-expense'">
              {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
            </td>
            <td>
              <div class="actions">
                <button class="btn-icon" title="Edit" @click="editTransaction(transaction)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button class="btn-icon delete" title="Hapus" @click="deleteTransaction(transaction.id)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <span class="page-info">Menampilkan {{ filteredTransactions.length }} dari {{ allTransactions.length }} transaksi</span>
    </div>

    <!-- Modal Tambah Transaksi -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingTransactionId ? 'Edit Transaksi' : 'Tambah Transaksi' }}</h3>
          <button class="btn-close" @click="closeModal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form @submit.prevent="submitTransaction" class="modal-form">
          <div class="form-group">
            <label>Tipe Transaksi</label>
            <div class="type-selector">
              <button
                type="button"
                class="type-btn"
                :class="{ active: formData.type === 'income' }"
                @click="formData.type = 'income'"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="19" x2="12" y2="5"></line>
                  <polyline points="5 12 12 5 19 12"></polyline>
                </svg>
                Pemasukan
              </button>
              <button
                type="button"
                class="type-btn"
                :class="{ active: formData.type === 'expense' }"
                @click="formData.type = 'expense'"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <polyline points="19 12 12 19 5 12"></polyline>
                </svg>
                Pengeluaran
              </button>
              <button
                type="button"
                class="type-btn"
                :class="{ active: formData.type === 'transfer' }"
                @click="formData.type = 'transfer'"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="17 1 21 5 17 9"></polyline>
                  <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                  <polyline points="7 23 3 19 7 15"></polyline>
                  <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                </svg>
                Transfer
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>Jumlah</label>
            <input
              v-model.number="formData.amount"
              type="number"
              class="form-input"
              placeholder="Masukkan jumlah"
              required
              min="0"
              step="1"
            />
          </div>

          <div class="form-group">
            <label>Dompet {{ formData.type === 'transfer' ? 'Sumber' : '' }}</label>
            <select v-model.number="formData.walletId" class="form-input" required>
              <option value="">Pilih Dompet</option>
              <option
                v-for="wallet in wallets"
                :key="wallet.id"
                :value="wallet.id"
              >
                {{ wallet.name }} ({{ formatCurrency(wallet.balance) }})
              </option>
            </select>
          </div>

          <div class="form-group" v-if="formData.type === 'transfer'">
            <label>Dompet Tujuan</label>
            <select v-model.number="formData.toWalletId" class="form-input" :required="formData.type === 'transfer'">
              <option value="">Pilih Dompet Tujuan</option>
              <option
                v-for="wallet in wallets"
                :key="wallet.id"
                :value="wallet.id"
                :disabled="wallet.id === formData.walletId"
              >
                {{ wallet.name }} ({{ formatCurrency(wallet.balance) }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Kategori</label>
            <select v-model.number="formData.categoryId" class="form-input" required>
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
            <label>Metode Pembayaran</label>
            <select v-model="formData.paymentMethod" class="form-input">
              <option value="">Pilih Metode Pembayaran (opsional)</option>
              <option value="Cash">Tunai</option>
              <option value="Debit Card">Kartu Debit</option>
              <option value="Credit Card">Kartu Kredit</option>
              <option value="E-Wallet">E-Wallet</option>
              <option value="Bank Transfer">Transfer Bank</option>
              <option value="QRIS">QRIS</option>
            </select>
          </div>

          <div class="form-group">
            <label>Deskripsi</label>
            <textarea
              v-model="formData.description"
              class="form-input"
              placeholder="Deskripsi transaksi (opsional)"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Tanggal</label>
            <input
              v-model="formData.date"
              type="date"
              class="form-input"
              required
            />
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

    <!-- Modal Scan Struk -->
    <ScanReceipt
      v-if="showScanModal"
      @close="showScanModal = false"
      @success="handleScanSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { transactionService } from '../services/transactions'
import { categoryService } from '../services/categories'
import { walletService } from '../services/wallets'
import ScanReceipt from '../components/ScanReceipt.vue'

const searchQuery = ref('')
const activeFilter = ref('all')
const showAddModal = ref(false)
const showScanModal = ref(false)
const loading = ref(true)
const error = ref(null)
const allTransactions = ref([])
const categories = ref([])
const wallets = ref([])
const submitting = ref(false)
const editingTransactionId = ref(null)
const formData = ref({
  type: 'expense',
  amount: 0,
  walletId: '',
  toWalletId: '',
  categoryId: '',
  paymentMethod: '',
  description: '',
  date: new Date().toISOString().split('T')[0]
})

const filterTabs = [
  { label: 'Semua', value: 'all' },
  { label: 'Pemasukan', value: 'income' },
  { label: 'Pengeluaran', value: 'expense' },
  { label: 'Transfer', value: 'transfer' }
]

async function fetchTransactions() {
  try {
    loading.value = true
    error.value = null

    const [transactionsData, categoriesData, walletsData] = await Promise.all([
      transactionService.getTransactions({ limit: 100, offset: 0 }),
      categoryService.getCategories(),
      walletService.getWallets()
    ])

    categories.value = categoriesData.categories || []
    wallets.value = walletsData.wallets || []

    allTransactions.value = (transactionsData.transactions || []).map(t => ({
      id: t.id,
      date: new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      description: t.description || '-',
      category: t.category_name || '-',
      wallet: t.wallet_name || '-',
      toWallet: t.to_wallet_name || '-',
      method: t.payment_method || '-',
      type: t.type,
      amount: t.amount,
      original_date: t.date,
      category_id: t.category_id,
      wallet_id: t.wallet_id,
      to_wallet_id: t.to_wallet_id
    }))
  } catch (err) {
    error.value = err.message || 'Gagal memuat transaksi'
    console.error('Error fetching transactions:', err)
  } finally {
    loading.value = false
  }
}

const filteredTransactions = computed(() => {
  let filtered = allTransactions.value

  if (activeFilter.value !== 'all') {
    filtered = filtered.filter(t => t.type === activeFilter.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(t =>
      t.description.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query)
    )
  }

  return filtered
})

onMounted(() => {
  fetchTransactions()
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const filteredCategories = computed(() => {
  return categories.value.filter(cat => cat.type === formData.value.type)
})

function openModal() {
  showAddModal.value = true
  editingTransactionId.value = null
  formData.value = {
    type: 'expense',
    amount: 0,
    walletId: '',
    toWalletId: '',
    categoryId: '',
    paymentMethod: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  }
}

function closeModal() {
  showAddModal.value = false
  editingTransactionId.value = null
}

function editTransaction(transaction) {
  editingTransactionId.value = transaction.id
  formData.value = {
    type: transaction.type,
    amount: transaction.amount,
    walletId: transaction.wallet_id || '',
    toWalletId: transaction.to_wallet_id || '',
    categoryId: transaction.category_id,
    paymentMethod: transaction.method === '-' ? '' : transaction.method,
    description: transaction.description === '-' ? '' : transaction.description,
    date: transaction.original_date
  }
  showAddModal.value = true
}

async function deleteTransaction(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
    return
  }

  try {
    await transactionService.deleteTransaction(id)
    await fetchTransactions()
    alert('Transaksi berhasil dihapus')
  } catch (err) {
    console.error('Error deleting transaction:', err)
    alert('Gagal menghapus transaksi: ' + (err.message || 'Terjadi kesalahan'))
  }
}

async function handleScanSuccess() {
  await fetchTransactions()
  alert('Transaksi dari scan berhasil ditambahkan')
}

async function submitTransaction() {
  try {
    submitting.value = true

    if (editingTransactionId.value) {
      await transactionService.updateTransaction(editingTransactionId.value, {
        type: formData.value.type,
        amount: formData.value.amount,
        walletId: formData.value.walletId,
        toWalletId: formData.value.toWalletId || undefined,
        categoryId: formData.value.categoryId || undefined,
        paymentMethod: formData.value.paymentMethod || undefined,
        description: formData.value.description,
        date: formData.value.date
      })
      alert('Transaksi berhasil diupdate')
    } else {
      await transactionService.createTransaction({
        type: formData.value.type,
        amount: formData.value.amount,
        walletId: formData.value.walletId,
        toWalletId: formData.value.toWalletId || undefined,
        categoryId: formData.value.categoryId || undefined,
        paymentMethod: formData.value.paymentMethod || undefined,
        description: formData.value.description,
        date: formData.value.date
      })
      alert('Transaksi berhasil ditambahkan')
    }

    closeModal()
    await fetchTransactions()
  } catch (err) {
    console.error('Error saving transaction:', err)
    alert('Gagal menyimpan transaksi: ' + (err.message || 'Terjadi kesalahan'))
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.transactions {
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

.toolbar {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem;
  border-radius: 8px;
}

.filter-tab {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.filter-tab:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.filter-tab.active {
  background: white;
  color: #667eea;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  padding: 0.625rem 1rem;
  border-radius: 8px;
  flex: 1;
  max-width: 400px;
}

.search-box svg {
  color: #6b7280;
  flex-shrink: 0;
}

.search-box input {
  border: none;
  outline: none;
  font-size: 0.875rem;
  width: 100%;
}

.btn-scan,
.btn-add {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: white;
  color: #667eea;
  border: 1px solid #667eea;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
}

.btn-scan:hover,
.btn-add:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
}

.dark .btn-scan,
.dark .btn-add {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.dark .btn-scan:hover,
.dark .btn-add:hover {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.transactions-table {
  width: 100%;
  border-collapse: collapse;
}

.transactions-table thead {
  background: rgba(102, 126, 234, 0.05);
}

.transactions-table th {
  text-align: left;
  padding: 1rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: #4b5563;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
}

.transactions-table td {
  padding: 1rem;
  font-size: 0.875rem;
  color: #1f2937;
  border-bottom: 1px solid rgba(102, 126, 234, 0.05);
}

.transactions-table tbody tr {
  transition: background 0.2s ease;
}

.transactions-table tbody tr:hover {
  background: rgba(102, 126, 234, 0.03);
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge.income {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.badge.expense {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.amount-income {
  color: #10b981;
  font-weight: 600;
}

.amount-expense {
  color: #ef4444;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: none;
  border: none;
  padding: 0.375rem;
  cursor: pointer;
  color: #6b7280;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.btn-icon.delete:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.pagination {
  display: flex;
  justify-content: center;
  padding: 1rem;
}

.page-info {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
}

/* Modal Styles */
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

textarea.form-input {
  resize: vertical;
  min-height: 80px;
}

.type-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.type-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
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

.modal-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn-cancel,
.btn-submit {
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

@media (max-width: 768px) {
  .transactions {
    padding: 1rem;
  }

  .header-content h2 {
    font-size: 1.5rem;
  }

  .filter-tabs {
    overflow-x: auto;
    white-space: nowrap;
    padding-bottom: 0.5rem;
    -webkit-overflow-scrolling: touch;
    width: 100%;
  }
  
  .filter-tab {
    flex-shrink: 0;
  }

  .search-box {
    max-width: 100%;
    width: 100%;
  }

  .btn-scan,
  .btn-add {
    flex: 1;
    justify-content: center;
  }

  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    margin-bottom: 1rem;
  }

  .modal-content {
    max-width: 100%;
    margin: 0.5rem;
    max-height: calc(100vh - 1rem);
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-form {
    padding: 1rem;
  }

  .type-selector {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column;
  }
}

/* Dark Mode */
.dark .transactions {
  color: #e5e7eb;
}

.dark .page-header {
  color: #f3f4f6;
}

.dark .subtitle {
  color: rgba(229, 231, 235, 0.8);
}

.dark .filter-tabs {
  background: rgba(30, 30, 45, 0.6);
  border-color: rgba(102, 126, 234, 0.2);
}

.dark .filter-tab {
  color: #9ca3af;
}

.dark .filter-tab:hover {
  color: #d1d5db;
  background: rgba(102, 126, 234, 0.1);
}

.dark .filter-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.dark .search-box {
  background: rgba(15, 15, 25, 0.5);
  border-color: rgba(102, 126, 234, 0.2);
}

.dark .search-box input {
  background: transparent;
  color: #e5e7eb;
}

.dark .search-box input::placeholder {
  color: #6b7280;
}

.dark .table-container {
  background: rgba(30, 30, 45, 0.6);
  border-color: rgba(102, 126, 234, 0.2);
}

.dark .transactions-table {
  border-color: rgba(102, 126, 234, 0.15);
}

.dark .transactions-table th {
  color: #9ca3af;
  border-bottom-color: rgba(102, 126, 234, 0.2);
}

.dark .transactions-table td {
  color: #d1d5db;
  border-bottom-color: rgba(102, 126, 234, 0.1);
}

.dark .transactions-table tbody tr:hover {
  background: rgba(102, 126, 234, 0.05);
}

.dark .pagination-info {
  color: #9ca3af;
}

.dark .modal-content {
  background: rgba(30, 30, 45, 0.98);
  border-color: rgba(102, 126, 234, 0.2);
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

.dark .btn-add {
  background: rgba(102, 126, 234, 0.2);
  color: #8b9bea;
  border: 1px solid rgba(102, 126, 234, 0.3);
}

.dark .btn-add:hover {
  background: rgba(102, 126, 234, 0.3);
  color: #a8b5ea;
}
</style>
