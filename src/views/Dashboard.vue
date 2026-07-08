<template>
  <div class="dashboard-content">
    <div class="content-header">
      <div>
        <h2>Dashboard</h2>
        <p class="subtitle">Selamat datang kembali!</p>
      </div>
      <button class="btn-add-transaction-header" @click="openModal">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Tambah Transaksi
      </button>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="loading-skeleton">
      <div class="skeleton-card" v-for="i in 4" :key="i"></div>
    </div>

    <!-- Summary Cards -->
    <div v-else class="summary-cards">
      <div class="summary-card">
        <div class="card-icon total">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
            <line x1="1" y1="10" x2="23" y2="10"></line>
          </svg>
        </div>
        <div class="card-content">
          <p class="card-label">Total Saldo</p>
          <h3 class="card-value">{{ formatCurrency(totalBalance) }}</h3>
        </div>
      </div>

      <div class="summary-card">
        <div class="card-icon income">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
        </div>
        <div class="card-content">
          <p class="card-label">Pemasukan Bulan Ini</p>
          <h3 class="card-value income">{{ formatCurrency(monthlyIncome) }}</h3>
        </div>
      </div>

      <div class="summary-card">
        <div class="card-icon expense">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <polyline points="19 12 12 19 5 12"></polyline>
          </svg>
        </div>
        <div class="card-content">
          <p class="card-label">Pengeluaran Bulan Ini</p>
          <h3 class="card-value expense">{{ formatCurrency(monthlyExpense) }}</h3>
        </div>
      </div>

      <div class="summary-card">
        <div class="card-icon balance">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <div class="card-content">
          <p class="card-label">Selisih</p>
          <h3 class="card-value" :class="difference >= 0 ? 'income' : 'expense'">
            {{ formatCurrency(difference) }}
          </h3>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <div class="chart-card">
        <h3>Tren Pengeluaran 7 Hari Terakhir</h3>
        <div class="chart-container">
          <canvas ref="trendChartCanvas"></canvas>
        </div>
      </div>

      <div class="chart-card">
        <h3>Kategori Pengeluaran</h3>
        <div class="chart-container">
          <canvas ref="categoryChartCanvas"></canvas>
        </div>
      </div>
    </div>

    <!-- Recent Transactions -->
    <div class="transactions-section">
      <div class="section-header">
        <h3>Transaksi Terbaru</h3>
      </div>

      <div class="transactions-table">
        <table>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Deskripsi</th>
              <th>Kategori</th>
              <th>Jumlah</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="transaction in recentTransactions" :key="transaction.id">
              <td>{{ transaction.date }}</td>
              <td>{{ transaction.description }}</td>
              <td>
                <span class="category-badge" :class="transaction.type">
                  {{ transaction.category }}
                </span>
              </td>
              <td :class="transaction.type === 'income' ? 'amount-income' : 'amount-expense'">
                {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Tambah Transaksi -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Tambah Transaksi</h3>
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
            <label>Kategori</label>
            <select v-model="formData.category_id" class="form-input" required>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { transactionService } from '../services/transactions'
import { categoryService } from '../services/categories'
import { walletService } from '../services/wallets'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const loading = ref(true)
const error = ref(null)
const totalBalance = ref(0)
const monthlyIncome = ref(0)
const monthlyExpense = ref(0)
const recentTransactions = ref([])
const trendChart = ref(null)
const categoryChart = ref(null)
const trendChartCanvas = ref(null)
const categoryChartCanvas = ref(null)

const showModal = ref(false)
const submitting = ref(false)
const categories = ref([])

const formData = ref({
  type: 'expense',
  amount: 0,
  category_id: '',
  description: '',
  date: new Date().toISOString().split('T')[0]
})

const difference = computed(() => monthlyIncome.value - monthlyExpense.value)

const filteredCategories = computed(() => {
  return categories.value.filter(cat => cat.type === formData.value.type)
})

async function fetchDashboardData() {
  try {
    loading.value = true
    error.value = null

    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

    const [summary, walletsData, transactionsData] = await Promise.all([
      transactionService.getSummary(startDate, endDate),
      walletService.getWallets(),
      transactionService.getTransactions({ limit: 5, offset: 0 })
    ])

    monthlyIncome.value = summary.income || 0
    monthlyExpense.value = summary.expense || 0

    const wallets = walletsData.wallets || []
    totalBalance.value = wallets.reduce((sum, wallet) => sum + parseFloat(wallet.balance || 0), 0)

    recentTransactions.value = (transactionsData.transactions || []).map(t => ({
      id: t.id,
      date: new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      description: t.description || '-',
      category: t.category_name || '-',
      type: t.type,
      amount: t.amount
    }))
  } catch (err) {
    error.value = err.message || 'Gagal memuat data'
    console.error('Error fetching dashboard data:', err)
  } finally {
    loading.value = false
  }
}

async function fetchCategories() {
  try {
    const data = await categoryService.getCategories()
    categories.value = data.categories || []
  } catch (err) {
    console.error('Error fetching categories:', err)
    alert('Gagal memuat kategori')
  }
}

function openModal() {
  showModal.value = true
  formData.value = {
    type: 'expense',
    amount: 0,
    category_id: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  }
}

function closeModal() {
  showModal.value = false
}

async function submitTransaction() {
  try {
    submitting.value = true

    await transactionService.createTransaction({
      type: formData.value.type,
      amount: formData.value.amount,
      category_id: formData.value.category_id,
      description: formData.value.description,
      date: formData.value.date
    })

    closeModal()
    await fetchDashboardData()
    alert('Transaksi berhasil ditambahkan')
  } catch (err) {
    console.error('Error creating transaction:', err)
    alert('Gagal menambahkan transaksi: ' + err.message)
  } finally {
    submitting.value = false
  }
}

const themeObserver = ref(null)

onMounted(() => {
  fetchDashboardData()
  fetchChartData()
  fetchCategories()

  themeObserver.value = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        updateChartTheme()
      }
    })
  })

  themeObserver.value.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

async function fetchChartData() {
  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 6)

    const [transactions, allCategories] = await Promise.all([
      transactionService.getTransactions({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        limit: 100
      }),
      Promise.resolve({ categories: categories.value })
    ])

    createTrendChart(transactions.transactions || [], startDate, endDate)
    createCategoryChart(transactions.transactions || [], allCategories.categories || [])
  } catch (err) {
    console.error('Error fetching chart data:', err)
  }
}

function updateChartTheme() {
  const isDark = document.documentElement.classList.contains('dark')
  const textColor = isDark ? '#e5e7eb' : '#6b7280'
  const gridColor = isDark ? 'rgba(102, 126, 234, 0.15)' : 'rgba(0, 0, 0, 0.1)'

  if (trendChart.value) {
    trendChart.value.options.plugins.legend.labels.color = textColor
    trendChart.value.options.scales.y.ticks.color = textColor
    trendChart.value.options.scales.y.grid.color = gridColor
    trendChart.value.options.scales.x.ticks.color = textColor
    trendChart.value.options.scales.x.grid.color = gridColor
    trendChart.value.update('none')
  }

  if (categoryChart.value) {
    const borderColor = isDark ? 'rgba(30, 30, 45, 0.8)' : '#fff'
    categoryChart.value.options.plugins.legend.labels.color = textColor
    categoryChart.value.data.datasets[0].borderColor = borderColor
    categoryChart.value.update('none')
  }
}

function createTrendChart(transactions, startDate, endDate) {
  if (!trendChartCanvas.value) return

  const days = []
  const dailyExpenses = []

  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]

    days.push(date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }))

    const dayTotal = transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(dateStr))
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    dailyExpenses.push(dayTotal)
  }

  if (trendChart.value) {
    trendChart.value.destroy()
  }

  const isDark = document.documentElement.classList.contains('dark')
  const textColor = isDark ? '#e5e7eb' : '#6b7280'
  const gridColor = isDark ? 'rgba(102, 126, 234, 0.15)' : 'rgba(0, 0, 0, 0.1)'

  trendChart.value = new Chart(trendChartCanvas.value, {
    type: 'line',
    data: {
      labels: days,
      datasets: [{
        label: 'Pengeluaran',
        data: dailyExpenses,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: textColor,
            callback: function(value) {
              return 'Rp ' + value.toLocaleString('id-ID')
            }
          },
          grid: {
            color: gridColor
          }
        },
        x: {
          ticks: {
            color: textColor
          },
          grid: {
            color: gridColor
          }
        }
      }
    }
  })
}

function createCategoryChart(transactions, categories) {
  if (!categoryChartCanvas.value) return

  const expenseTransactions = transactions.filter(t => t.type === 'expense')

  const categoryTotals = {}
  expenseTransactions.forEach(t => {
    const catId = t.category_id
    if (!categoryTotals[catId]) {
      categoryTotals[catId] = 0
    }
    categoryTotals[catId] += parseFloat(t.amount)
  })

  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const labels = sortedCategories.map(([catId]) => {
    const cat = categories.find(c => c.id === parseInt(catId))
    return cat ? cat.name : 'Lainnya'
  })

  const data = sortedCategories.map(([, amount]) => amount)

  const colors = [
    '#667eea',
    '#ef4444',
    '#10b981',
    '#f59e0b',
    '#8b5cf6'
  ]

  if (categoryChart.value) {
    categoryChart.value.destroy()
  }

  const isDark = document.documentElement.classList.contains('dark')
  const textColor = isDark ? '#e5e7eb' : '#6b7280'
  const borderColor = isDark ? 'rgba(30, 30, 45, 0.8)' : '#fff'

  categoryChart.value = new Chart(categoryChartCanvas.value, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: borderColor
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            usePointStyle: true,
            color: textColor
          }
        }
      }
    }
  })
}

onUnmounted(() => {
  if (trendChart.value) {
    trendChart.value.destroy()
  }
  if (categoryChart.value) {
    categoryChart.value.destroy()
  }
  if (themeObserver.value) {
    themeObserver.value.disconnect()
  }
})
</script>

<style scoped>
.dashboard-content {
  padding: 2rem;
}

/* Header */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  height: 40px;
  width: auto;
}

.dashboard-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-icon {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #4b5563;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn-icon:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
}

/* Main Layout */
.dashboard-main {
  display: flex;
  min-height: calc(100vh - 73px);
}

/* Sidebar */
.sidebar {
  width: 260px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(102, 126, 234, 0.1);
  padding: 2rem 0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0 1rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  color: #6b7280;
  font-weight: 500;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.nav-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.nav-item svg {
  flex-shrink: 0;
}

/* Content Area */
.content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
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

/* Feature Grid */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.feature-placeholder {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  border: 2px dashed rgba(102, 126, 234, 0.3);
}

.placeholder-icon {
  display: inline-flex;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 12px;
  margin-bottom: 1rem;
  color: #667eea;
}

.feature-placeholder h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.feature-placeholder p {
  color: #6b7280;
  margin: 0;
}

/* Summary Cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.summary-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.2);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.card-icon.income {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.card-icon.expense {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.card-icon.balance {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.card-content {
  flex: 1;
}

.card-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.card-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.card-value.income {
  color: #10b981;
}

.card-value.expense {
  color: #ef4444;
}

/* Charts Section */
.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(102, 126, 234, 0.1);
  min-width: 0; /* Prevents CSS Grid blowout on mobile */
}

.chart-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.chart-container {
  position: relative;
  height: 280px;
  padding: 1rem;
}

/* Transactions Section */
.transactions-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.btn-add-transaction {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-add-transaction:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.transactions-table {
  overflow-x: auto;
}

.transactions-table table {
  width: 100%;
  border-collapse: collapse;
}

.transactions-table thead {
  background: rgba(102, 126, 234, 0.05);
}

.transactions-table th {
  text-align: left;
  padding: 0.875rem 1rem;
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

.category-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.category-badge.income {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.category-badge.expense {
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

/* Loading Skeleton */
.loading-skeleton {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.skeleton-card {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.95) 25%, rgba(240, 240, 240, 0.95) 50%, rgba(255, 255, 255, 0.95) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 12px;
  height: 120px;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.dark .skeleton-card {
  background: linear-gradient(90deg, rgba(30, 30, 45, 0.6) 25%, rgba(40, 40, 55, 0.6) 50%, rgba(30, 30, 45, 0.6) 75%);
  background-size: 200% 100%;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    width: 70px;
  }

  .nav-item span {
    display: none;
  }

  .content {
    padding: 1rem;
  }

  .summary-cards {
    grid-template-columns: 1fr;
  }

  .charts-section {
    grid-template-columns: 1fr;
  }

  .chart-card {
    padding: 1rem;
  }
  
  .chart-container {
    padding: 0.5rem;
    height: 250px;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .btn-add-transaction {
    width: 100%;
    justify-content: center;
  }

  .transactions-table {
    font-size: 0.75rem;
  }

  .transactions-table th,
  .transactions-table td {
    padding: 0.5rem;
  }
}

/* Button Tambah Transaksi di Header */
.btn-add-transaction-header {
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

.btn-add-transaction-header:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
}

.dark .btn-add-transaction-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.dark .btn-add-transaction-header:hover {
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

/* Modal Overlay */
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

/* Modal Content */
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

/* Modal Header */
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

/* Modal Form */
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

/* Type Selector */
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

/* Modal Actions */
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

/* Responsive Modal */
@media (max-width: 768px) {
  .content-header {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-add-transaction-header {
    width: 100%;
    justify-content: center;
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
.dark .dashboard {
  color: #e5e7eb;
}

.dark .page-header {
  color: #f3f4f6;
}

.dark .subtitle {
  color: rgba(229, 231, 235, 0.8);
}

.dark .summary-card {
  background: rgba(30, 30, 45, 0.6);
  border-color: rgba(102, 126, 234, 0.2);
}

.dark .card-label {
  color: #9ca3af;
}

.dark .card-value {
  color: #f3f4f6;
}

.dark .chart-card {
  background: rgba(30, 30, 45, 0.6);
  border-color: rgba(102, 126, 234, 0.2);
}

.dark .chart-card h3 {
  color: #f3f4f6;
}

.dark .transactions-section {
  background: rgba(30, 30, 45, 0.6);
  border-color: rgba(102, 126, 234, 0.2);
}

.dark .section-header h3 {
  color: #f3f4f6;
}

.dark .transactions-table {
  border-color: rgba(102, 126, 234, 0.15);
}

.dark .transactions-table th {
  color: #f3f4f6;
  border-bottom-color: rgba(102, 126, 234, 0.2);
}

.dark .transactions-table td {
  color: #e5e7eb;
  border-bottom-color: rgba(102, 126, 234, 0.1);
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
</style>
