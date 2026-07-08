<template>
  <div class="reports">
    <!-- Header -->
    <header class="page-header">
      <div class="header-content">
        <h2>Laporan</h2>
        <p class="subtitle">Analisis keuangan Anda</p>
      </div>
    </header>

    <!-- Date Range Filter -->
    <div class="toolbar">
      <div class="filter-tabs">
        <button
          v-for="tab in periodTabs"
          :key="tab.value"
          :class="['filter-tab', { active: activePeriod === tab.value }]"
          @click="activePeriod = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>

      <button class="btn-export" @click="exportToExcel">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Export Laporan
      </button>
    </div>

    <!-- Summary Cards -->
    <div class="summary-cards">
      <div class="summary-card">
        <div class="card-icon income">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
        </div>
        <div class="card-content">
          <p class="card-label">Total Pemasukan</p>
          <h3 class="card-value income">{{ formatCurrency(periodData.totalIncome) }}</h3>
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
          <p class="card-label">Total Pengeluaran</p>
          <h3 class="card-value expense">{{ formatCurrency(periodData.totalExpense) }}</h3>
        </div>
      </div>

      <div class="summary-card">
        <div class="card-icon balance">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
            <line x1="1" y1="10" x2="23" y2="10"></line>
          </svg>
        </div>
        <div class="card-content">
          <p class="card-label">Saldo Bersih</p>
          <h3 class="card-value" :class="periodData.netBalance >= 0 ? 'income' : 'expense'">
            {{ formatCurrency(periodData.netBalance) }}
          </h3>
        </div>
      </div>

      <div class="summary-card">
        <div class="card-icon average">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <div class="card-content">
          <p class="card-label">Rata-rata Harian</p>
          <h3 class="card-value">{{ formatCurrency(periodData.dailyAverage) }}</h3>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <div class="chart-card">
        <h3>Tren Pemasukan vs Pengeluaran</h3>
        <div class="chart-container">
          <canvas ref="trendChartCanvas"></canvas>
        </div>
      </div>

      <div class="chart-card">
        <h3>Breakdown per Kategori</h3>
        <div class="chart-container">
          <canvas ref="categoryChartCanvas"></canvas>
        </div>
      </div>
    </div>

    <!-- Detailed Analytics Section -->
    <div class="analytics-header">
      <h3 class="section-title">Analisis Detail</h3>
      <div class="stats-summary">
        <div class="stat-item">
          <span class="stat-label">Total Transaksi:</span>
          <span class="stat-value">{{ statsData.totalTransactions }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Rata-rata Pengeluaran/Hari:</span>
          <span class="stat-value">{{ formatCurrency(statsData.avgDailyExpense) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Hari Tersibuk:</span>
          <span class="stat-value">{{ statsData.busiestDay }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Jam Tersibuk:</span>
          <span class="stat-value">{{ statsData.busiestHour }}</span>
        </div>
      </div>
    </div>

    <!-- Additional Analytics Charts -->
    <div class="charts-section">
      <div class="chart-card">
        <h3>Breakdown per Jam</h3>
        <div class="chart-container">
          <canvas ref="hourlyChartCanvas"></canvas>
        </div>
      </div>

      <div class="chart-card">
        <h3>Breakdown per Hari</h3>
        <div class="chart-container">
          <canvas ref="dailyChartCanvas"></canvas>
        </div>
      </div>

      <div class="chart-card">
        <h3>Pola Mingguan</h3>
        <div class="chart-container">
          <canvas ref="weeklyChartCanvas"></canvas>
        </div>
      </div>

      <div class="chart-card">
        <h3>Breakdown per Tipe</h3>
        <div class="chart-container">
          <canvas ref="typeChartCanvas"></canvas>
        </div>
      </div>

      <div class="chart-card">
        <h3>Breakdown per Dompet</h3>
        <div class="chart-container">
          <canvas ref="walletChartCanvas"></canvas>
        </div>
      </div>

      <div class="chart-card">
        <h3>Breakdown per Metode Pembayaran</h3>
        <div class="chart-container">
          <canvas ref="paymentMethodChartCanvas"></canvas>
        </div>
      </div>
    </div>

    <!-- Top Categories Table -->
    <div class="categories-section">
      <h3 class="section-title">Kategori Pengeluaran Terbesar</h3>
      <div class="table-container">
        <table class="categories-table">
          <thead>
            <tr>
              <th>Kategori</th>
              <th>Jumlah Transaksi</th>
              <th>Total Pengeluaran</th>
              <th>Persentase</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="category in topCategories" :key="category.name">
              <td>
                <div class="category-cell">
                  <div class="category-color" :style="{ background: category.color }"></div>
                  <span>{{ category.name }}</span>
                </div>
              </td>
              <td>{{ category.transactionCount }}</td>
              <td class="amount">{{ formatCurrency(category.amount) }}</td>
              <td>
                <div class="percentage-cell">
                  <div class="percentage-bar">
                    <div class="percentage-fill" :style="{ width: category.percentage + '%', background: category.color }"></div>
                  </div>
                  <span class="percentage-text">{{ category.percentage }}%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { transactionService } from '../services/transactions'
import { categoryService } from '../services/categories'
import { analyticsService } from '../services/analytics'
import * as XLSX from 'xlsx'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const activePeriod = ref('30')
const loading = ref(true)
const error = ref(null)
const summaryData = ref({
  totalIncome: 0,
  totalExpense: 0,
  netBalance: 0,
  dailyAverage: 0
})
const trendChart = ref(null)
const categoryChart = ref(null)
const trendChartCanvas = ref(null)
const categoryChartCanvas = ref(null)
const isDarkMode = ref(false)
const topCategories = ref([])

// Additional analytics charts
const hourlyChart = ref(null)
const dailyChart = ref(null)
const weeklyChart = ref(null)
const typeChart = ref(null)
const walletChart = ref(null)
const paymentMethodChart = ref(null)
const hourlyChartCanvas = ref(null)
const dailyChartCanvas = ref(null)
const weeklyChartCanvas = ref(null)
const typeChartCanvas = ref(null)
const walletChartCanvas = ref(null)
const paymentMethodChartCanvas = ref(null)

// Analytics data
const hourlyData = ref([])
const dailyData = ref([])
const weeklyData = ref([])
const typeData = ref([])
const walletData = ref([])
const paymentMethodData = ref([])
const statsData = ref({
  totalTransactions: 0,
  avgDailyExpense: 0,
  busiestDay: '-',
  busiestHour: '-'
})

const periodTabs = [
  { label: '7 Hari', value: '7' },
  { label: '30 Hari', value: '30' },
  { label: '3 Bulan', value: '90' },
  { label: '1 Tahun', value: '365' }
]

function getDateRange(days) {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - parseInt(days))

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    days: parseInt(days)
  }
}

async function fetchReportData() {
  try {
    loading.value = true
    error.value = null

    const { startDate, endDate, days } = getDateRange(activePeriod.value)

    const summary = await transactionService.getSummary(startDate, endDate)
    const netBalance = (summary.income || 0) - (summary.expense || 0)

    summaryData.value = {
      totalIncome: summary.income || 0,
      totalExpense: summary.expense || 0,
      netBalance,
      dailyAverage: Math.round(netBalance / days)
    }

    await fetchChartData()
  } catch (err) {
    error.value = err.message || 'Gagal memuat laporan'
    console.error('Error fetching report data:', err)
  } finally {
    loading.value = false
  }
}

async function fetchChartData() {
  try {
    const { startDate, endDate } = getDateRange(activePeriod.value)

    const [transactionsData, categoriesData, hourly, daily, weekly, wallet, paymentMethod] = await Promise.all([
      transactionService.getTransactions({
        startDate,
        endDate,
        limit: 1000
      }),
      categoryService.getCategories(),
      analyticsService.getHourlyBreakdown(startDate, endDate),
      analyticsService.getDailyBreakdown(startDate, endDate),
      analyticsService.getWeeklyPattern(startDate, endDate),
      analyticsService.getWalletBreakdown(startDate, endDate),
      analyticsService.getPaymentMethodBreakdown(startDate, endDate)
    ])

    const transactions = transactionsData.transactions || []
    const categories = categoriesData.categories || []

    // Calculate type breakdown from transactions
    const typeBreakdown = {}
    transactions.forEach(t => {
      if (!typeBreakdown[t.type]) {
        typeBreakdown[t.type] = 0
      }
      typeBreakdown[t.type] += parseFloat(t.amount)
    })

    typeData.value = Object.entries(typeBreakdown).map(([type, total]) => ({
      type,
      total_amount: total
    }))

    hourlyData.value = hourly || []
    dailyData.value = daily || []
    weeklyData.value = weekly || []
    walletData.value = wallet || []
    paymentMethodData.value = paymentMethod || []

    calculateStats(transactions, hourly, weekly)
    createTrendChart(transactions, startDate, endDate)
    createCategoryChart(transactions, categories)
    calculateTopCategories(transactions, categories)
    createHourlyChart()
    createDailyChart()
    createWeeklyChart()
    createTypeChart()
    createWalletChart()
    createPaymentMethodChart()
  } catch (err) {
    console.error('Error fetching chart data:', err)
  }
}

function calculateTopCategories(transactions, categories) {
  const expenseTransactions = transactions.filter(t => t.type === 'expense')

  if (expenseTransactions.length === 0) {
    topCategories.value = []
    return
  }

  const categoryMap = {}
  expenseTransactions.forEach(t => {
    const catId = t.category_id
    if (!categoryMap[catId]) {
      categoryMap[catId] = {
        amount: 0,
        count: 0
      }
    }
    categoryMap[catId].amount += parseFloat(t.amount)
    categoryMap[catId].count += 1
  })

  const totalExpense = Object.values(categoryMap).reduce((sum, cat) => sum + cat.amount, 0)

  const results = Object.entries(categoryMap)
    .map(([catId, data]) => {
      const category = categories.find(c => c.id === parseInt(catId))
      return {
        name: category ? category.name : 'Lainnya',
        color: category ? category.color : '#6b7280',
        amount: data.amount,
        transactionCount: data.count,
        percentage: Math.round((data.amount / totalExpense) * 100)
      }
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10)

  topCategories.value = results
}

function createTrendChart(transactions, startDate, endDate) {
  if (!trendChartCanvas.value) return

  const start = new Date(startDate)
  const end = new Date(endDate)
  const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1

  const days = []
  const incomeData = []
  const expenseData = []

  for (let i = 0; i < daysDiff; i++) {
    const date = new Date(start)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]

    days.push(date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }))

    const dayIncome = transactions
      .filter(t => t.type === 'income' && t.date.startsWith(dateStr))
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    const dayExpense = transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(dateStr))
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    incomeData.push(dayIncome)
    expenseData.push(dayExpense)
  }

  if (trendChart.value) {
    trendChart.value.destroy()
  }

  const textColor = isDarkMode.value ? '#e5e7eb' : '#1f2937'
  const gridColor = isDarkMode.value ? 'rgba(102, 126, 234, 0.1)' : 'rgba(0, 0, 0, 0.1)'

  trendChart.value = new Chart(trendChartCanvas.value, {
    type: 'line',
    data: {
      labels: days,
      datasets: [
        {
          label: 'Pemasukan',
          data: incomeData,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Pengeluaran',
          data: expenseData,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColor
          },
          grid: {
            color: gridColor
          }
        },
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
        }
      }
    }
  })
}

function createCategoryChart(transactions, categories) {
  if (!categoryChartCanvas.value) return

  const expenseTransactions = transactions.filter(t => t.type === 'expense')

  if (expenseTransactions.length === 0) {
    if (categoryChart.value) {
      categoryChart.value.destroy()
      categoryChart.value = null
    }
    return
  }

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

  const colors = sortedCategories.map(([catId]) => {
    const cat = categories.find(c => c.id === parseInt(catId))
    return cat && cat.color ? cat.color : '#6b7280'
  })

  if (categoryChart.value) {
    categoryChart.value.destroy()
  }

  const textColor = isDarkMode.value ? '#e5e7eb' : '#1f2937'

  categoryChart.value = new Chart(categoryChartCanvas.value, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: isDarkMode.value ? '#1e1e2d' : '#fff'
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

function calculateStats(transactions, hourly, weekly) {
  statsData.value.totalTransactions = transactions.length

  const expenseTransactions = transactions.filter(t => t.type === 'expense')
  const days = Math.max(1, Math.ceil((new Date() - new Date(Math.min(...transactions.map(t => new Date(t.date))))) / (1000 * 60 * 60 * 24)))
  statsData.value.avgDailyExpense = expenseTransactions.length > 0
    ? Math.round(expenseTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0) / days)
    : 0

  if (hourly && hourly.length > 0) {
    const maxHour = hourly.reduce((max, h) => parseFloat(h.total_amount) > parseFloat(max.total_amount) ? h : max, hourly[0])
    statsData.value.busiestHour = `${maxHour.hour}:00`
  } else {
    statsData.value.busiestHour = '-'
  }

  if (weekly && weekly.length > 0) {
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const maxDay = weekly.reduce((max, d) => parseFloat(d.total_amount) > parseFloat(max.total_amount) ? d : max, weekly[0])
    statsData.value.busiestDay = dayNames[parseInt(maxDay.day_of_week)]
  } else {
    statsData.value.busiestDay = '-'
  }
}

function createHourlyChart() {
  if (!hourlyChartCanvas.value || !hourlyData.value || hourlyData.value.length === 0) return

  if (hourlyChart.value) {
    hourlyChart.value.destroy()
  }

  const labels = hourlyData.value.map(h => `${h.hour}:00`)
  const data = hourlyData.value.map(h => parseFloat(h.total_amount))

  const textColor = isDarkMode.value ? '#e5e7eb' : '#1f2937'
  const gridColor = isDarkMode.value ? 'rgba(102, 126, 234, 0.1)' : 'rgba(0, 0, 0, 0.1)'

  hourlyChart.value = new Chart(hourlyChartCanvas.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Total Transaksi',
        data,
        backgroundColor: 'rgba(102, 126, 234, 0.6)',
        borderColor: '#667eea',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => 'Rp ' + context.parsed.y.toLocaleString('id-ID')
          }
        }
      },
      scales: {
        x: {
          ticks: { color: textColor },
          grid: { color: gridColor }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: textColor,
            callback: (value) => 'Rp ' + value.toLocaleString('id-ID')
          },
          grid: { color: gridColor }
        }
      }
    }
  })
}

function createDailyChart() {
  if (!dailyChartCanvas.value || !dailyData.value || dailyData.value.length === 0) return

  if (dailyChart.value) {
    dailyChart.value.destroy()
  }

  const labels = dailyData.value.map(d => new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }))
  const data = dailyData.value.map(d => parseFloat(d.total_amount))

  const textColor = isDarkMode.value ? '#e5e7eb' : '#1f2937'
  const gridColor = isDarkMode.value ? 'rgba(102, 126, 234, 0.1)' : 'rgba(0, 0, 0, 0.1)'

  dailyChart.value = new Chart(dailyChartCanvas.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Total per Hari',
        data,
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => 'Rp ' + context.parsed.y.toLocaleString('id-ID')
          }
        }
      },
      scales: {
        x: {
          ticks: { color: textColor },
          grid: { color: gridColor }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: textColor,
            callback: (value) => 'Rp ' + value.toLocaleString('id-ID')
          },
          grid: { color: gridColor }
        }
      }
    }
  })
}

function createWeeklyChart() {
  if (!weeklyChartCanvas.value || !weeklyData.value || weeklyData.value.length === 0) return

  if (weeklyChart.value) {
    weeklyChart.value.destroy()
  }

  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const labels = weeklyData.value.map(d => dayNames[parseInt(d.day_of_week)])
  const data = weeklyData.value.map(d => parseFloat(d.total_amount))

  const textColor = isDarkMode.value ? '#e5e7eb' : '#1f2937'
  const gridColor = isDarkMode.value ? 'rgba(102, 126, 234, 0.1)' : 'rgba(0, 0, 0, 0.1)'

  weeklyChart.value = new Chart(weeklyChartCanvas.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Total Transaksi',
        data,
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: '#10b981',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => 'Rp ' + context.parsed.y.toLocaleString('id-ID')
          }
        }
      },
      scales: {
        x: {
          ticks: { color: textColor },
          grid: { color: gridColor }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: textColor,
            callback: (value) => 'Rp ' + value.toLocaleString('id-ID')
          },
          grid: { color: gridColor }
        }
      }
    }
  })
}

function createTypeChart() {
  if (!typeChartCanvas.value || !typeData.value || typeData.value.length === 0) return

  if (typeChart.value) {
    typeChart.value.destroy()
  }

  const typeLabels = { income: 'Pemasukan', expense: 'Pengeluaran', transfer: 'Transfer' }
  const labels = typeData.value.map(t => typeLabels[t.type] || t.type)
  const data = typeData.value.map(t => parseFloat(t.total_amount))
  const colors = ['#10b981', '#ef4444', '#667eea']

  const textColor = isDarkMode.value ? '#e5e7eb' : '#1f2937'
  const gridColor = isDarkMode.value ? 'rgba(102, 126, 234, 0.1)' : 'rgba(0, 0, 0, 0.1)'

  typeChart.value = new Chart(typeChartCanvas.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Total per Tipe',
        data,
        backgroundColor: colors,
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => 'Rp ' + context.parsed.y.toLocaleString('id-ID')
          }
        }
      },
      scales: {
        x: {
          ticks: { color: textColor },
          grid: { color: gridColor }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: textColor,
            callback: (value) => 'Rp ' + value.toLocaleString('id-ID')
          },
          grid: { color: gridColor }
        }
      }
    }
  })
}

function createWalletChart() {
  if (!walletChartCanvas.value || !walletData.value || walletData.value.length === 0) return

  if (walletChart.value) {
    walletChart.value.destroy()
  }

  const labels = walletData.value.map(w => w.wallet_name || 'Unknown')
  const data = walletData.value.map(w => parseFloat(w.total_amount))
  const colors = ['#667eea', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

  const textColor = isDarkMode.value ? '#e5e7eb' : '#1f2937'

  walletChart.value = new Chart(walletChartCanvas.value, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: isDarkMode.value ? '#1e1e2d' : '#fff'
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
        },
        tooltip: {
          callbacks: {
            label: (context) => context.label + ': Rp ' + context.parsed.toLocaleString('id-ID')
          }
        }
      }
    }
  })
}

function createPaymentMethodChart() {
  if (!paymentMethodChartCanvas.value || !paymentMethodData.value || paymentMethodData.value.length === 0) return

  if (paymentMethodChart.value) {
    paymentMethodChart.value.destroy()
  }

  const labels = paymentMethodData.value.map(p => p.payment_method || 'Unknown')
  const data = paymentMethodData.value.map(p => parseFloat(p.total_amount))
  const colors = ['#667eea', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  const textColor = isDarkMode.value ? '#e5e7eb' : '#1f2937'

  paymentMethodChart.value = new Chart(paymentMethodChartCanvas.value, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: isDarkMode.value ? '#1e1e2d' : '#fff'
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
        },
        tooltip: {
          callbacks: {
            label: (context) => context.label + ': Rp ' + context.parsed.toLocaleString('id-ID')
          }
        }
      }
    }
  })
}

const periodData = computed(() => summaryData.value)

let darkModeObserver = null

watch(activePeriod, () => {
  fetchReportData()
})

watch(isDarkMode, () => {
  if (trendChartCanvas.value || categoryChartCanvas.value) {
    fetchChartData()
  }
})

onMounted(() => {
  darkModeObserver = observeDarkMode()
  fetchReportData()
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

function checkDarkMode() {
  isDarkMode.value = document.documentElement.classList.contains('dark')
}

function observeDarkMode() {
  checkDarkMode()
  const observer = new MutationObserver(checkDarkMode)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
  return observer
}

function exportToExcel() {
  const { startDate, endDate } = getDateRange(activePeriod.value)

  const wb = XLSX.utils.book_new()

  const data = [
    ['MyMo Export Management'],
    [],
    ['Laporan Keuangan'],
    ['Periode', `${startDate} s/d ${endDate}`],
    [],
    ['Ringkasan'],
    ['Total Pemasukan', summaryData.value.totalIncome],
    ['Total Pengeluaran', summaryData.value.totalExpense],
    ['Saldo Bersih', summaryData.value.netBalance],
    ['Rata-rata Harian', summaryData.value.dailyAverage],
  ]

  const ws = XLSX.utils.aoa_to_sheet(data)

  ws['!cols'] = [{ wch: 25 }, { wch: 20 }]

  XLSX.utils.book_append_sheet(wb, ws, 'Laporan')

  const fileName = `MyMo_Laporan_${startDate}_${endDate}.xlsx`
  XLSX.writeFile(wb, fileName)
}

onUnmounted(() => {
  if (trendChart.value) {
    trendChart.value.destroy()
  }
  if (categoryChart.value) {
    categoryChart.value.destroy()
  }
  if (hourlyChart.value) {
    hourlyChart.value.destroy()
  }
  if (dailyChart.value) {
    dailyChart.value.destroy()
  }
  if (weeklyChart.value) {
    weeklyChart.value.destroy()
  }
  if (typeChart.value) {
    typeChart.value.destroy()
  }
  if (walletChart.value) {
    walletChart.value.destroy()
  }
  if (paymentMethodChart.value) {
    paymentMethodChart.value.destroy()
  }
  if (darkModeObserver) {
    darkModeObserver.disconnect()
  }
})
</script>

<style scoped>
.reports {
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
  justify-content: space-between;
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
  color: rgba(255, 255, 255, 0.6);
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.filter-tab:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

.filter-tab.active {
  background: white;
  color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
}

.dark .filter-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.btn-export {
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

.btn-export:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
}

.dark .btn-export {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.dark .btn-export:hover {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

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
  color: white;
}

.card-icon.income {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.card-icon.expense {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.card-icon.balance {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card-icon.average {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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

.analytics-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.analytics-header .section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #667eea;
}

.categories-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1.5rem 0;
}

.table-container {
  overflow-x: auto;
}

.categories-table {
  width: 100%;
  border-collapse: collapse;
}

.categories-table thead {
  background: rgba(102, 126, 234, 0.05);
}

.categories-table th {
  text-align: left;
  padding: 0.875rem 1rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: #4b5563;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
}

.categories-table td {
  padding: 1rem;
  font-size: 0.875rem;
  color: #1f2937;
  border-bottom: 1px solid rgba(102, 126, 234, 0.05);
}

.categories-table tbody tr {
  transition: background 0.2s ease;
}

.categories-table tbody tr:hover {
  background: rgba(102, 126, 234, 0.03);
}

.category-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.category-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.amount {
  font-weight: 600;
  color: #1f2937;
}

.percentage-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.percentage-bar {
  flex: 1;
  height: 8px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.percentage-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.percentage-text {
  font-weight: 600;
  color: #6b7280;
  min-width: 40px;
  text-align: right;
}

@media (max-width: 768px) {
  .reports {
    padding: 1rem;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-export {
    width: 100%;
    justify-content: center;
  }

  .summary-cards {
    grid-template-columns: 1fr;
  }

  .charts-section {
    grid-template-columns: 1fr;
  }
}

/* Dark Mode */
.dark .reports {
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
  color: #e5e7eb;
}

.dark .card-value.income {
  color: #10b981;
}

.dark .card-value.expense {
  color: #ef4444;
}

.dark .chart-card {
  background: rgba(30, 30, 45, 0.6);
  border-color: rgba(102, 126, 234, 0.2);
}

.dark .chart-card h3 {
  color: #f3f4f6;
}

.dark .categories-section {
  background: rgba(30, 30, 45, 0.6);
  border-color: rgba(102, 126, 234, 0.2);
}

.dark .section-title {
  color: #f3f4f6;
}

.dark .categories-table {
  border-color: rgba(102, 126, 234, 0.15);
}

.dark .categories-table thead {
  background: rgba(102, 126, 234, 0.08);
}

.dark .categories-table th {
  color: #9ca3af;
  border-bottom-color: rgba(102, 126, 234, 0.2);
}

.dark .categories-table td {
  color: #d1d5db;
  border-bottom-color: rgba(102, 126, 234, 0.1);
}

.dark .categories-table tbody tr:hover {
  background: rgba(102, 126, 234, 0.05);
}

.dark .amount {
  color: #e5e7eb;
}

.dark .percentage-text {
  color: #9ca3af;
}

.dark .analytics-header {
  background: rgba(30, 30, 45, 0.6);
  border-color: rgba(102, 126, 234, 0.2);
}

.dark .analytics-header .section-title {
  color: #f3f4f6;
}

.dark .stat-label {
  color: #9ca3af;
}

.dark .stat-value {
  color: #8b9bea;
}
</style>
