<template>
  <div class="analytics-page">
    <div class="page-header">
      <h1>Analitik Keuangan</h1>
      <p class="subtitle">Analisis mendalam tentang pola keuangan Anda</p>
    </div>

    <div class="date-range-selector">
      <div class="range-buttons">
        <button
          v-for="range in dateRanges"
          :key="range.value"
          :class="['range-btn', { active: selectedRange === range.value }]"
          @click="selectDateRange(range.value)"
        >
          {{ range.label }}
        </button>
      </div>
      <div class="custom-date">
        <input
          v-model="customStartDate"
          type="date"
          @change="applyCustomDateRange"
          :disabled="selectedRange !== 'custom'"
        >
        <span>s/d</span>
        <input
          v-model="customEndDate"
          type="date"
          @change="applyCustomDateRange"
          :disabled="selectedRange !== 'custom'"
        >
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Memuat data analitik...</p>
    </div>

    <div v-else class="analytics-grid">
      <div class="chart-card large">
        <h2>Tren Pengeluaran & Pemasukan</h2>
        <p class="chart-subtitle">30 hari terakhir</p>
        <canvas ref="trendChart"></canvas>
      </div>

      <div class="chart-card">
        <h2>Total Berdasarkan Tipe</h2>
        <p class="chart-subtitle">Periode dipilih</p>
        <canvas ref="typeChart"></canvas>
      </div>

      <div class="chart-card">
        <h2>Pola Mingguan</h2>
        <p class="chart-subtitle">Hari dengan pengeluaran tertinggi</p>
        <canvas ref="weeklyChart"></canvas>
      </div>

      <div class="chart-card">
        <h2>Aktivitas Per Jam</h2>
        <p class="chart-subtitle">Jam berapa Anda paling sering bertransaksi</p>
        <canvas ref="hourlyChart"></canvas>
      </div>

      <div class="chart-card">
        <h2>Aktivitas Harian</h2>
        <p class="chart-subtitle">Transaksi per hari</p>
        <canvas ref="dailyChart"></canvas>
      </div>

      <div class="chart-card">
        <h2>Pengeluaran per Kategori</h2>
        <p class="chart-subtitle">Breakdown kategori pengeluaran</p>
        <canvas ref="categoryChart"></canvas>
      </div>

      <div class="chart-card">
        <h2>Transaksi per Dompet</h2>
        <p class="chart-subtitle">Distribusi penggunaan dompet</p>
        <canvas ref="walletChart"></canvas>
      </div>

      <div class="chart-card">
        <h2>Metode Pembayaran</h2>
        <p class="chart-subtitle">Cara pembayaran yang paling sering digunakan</p>
        <canvas ref="paymentMethodChart"></canvas>
      </div>

      <div class="stats-card">
        <h2>Statistik Ringkas</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Total Transaksi</span>
            <span class="stat-value">{{ totalTransactions }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Rata-rata Pengeluaran/Hari</span>
            <span class="stat-value">{{ formatCurrency(avgDailyExpense) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Hari Tersibuk</span>
            <span class="stat-value">{{ busiestDay }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Jam Tersibuk</span>
            <span class="stat-value">{{ busiestHour }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Chart, registerables } from 'chart.js'
import { analyticsService } from '../services/analytics'

Chart.register(...registerables)

export default {
  name: 'Analytics',
  setup() {
    const loading = ref(true)

    const dateRanges = [
      { label: '7 Hari', value: '7d' },
      { label: '30 Hari', value: '30d' },
      { label: '3 Bulan', value: '3m' },
      { label: '6 Bulan', value: '6m' },
      { label: '1 Tahun', value: '1y' },
      { label: 'Custom', value: 'custom' }
    ]

    const selectedRange = ref('30d')
    const customStartDate = ref('')
    const customEndDate = ref('')
    const startDate = ref('')
    const endDate = ref('')

    const trendChart = ref(null)
    const typeChart = ref(null)
    const weeklyChart = ref(null)
    const hourlyChart = ref(null)
    const dailyChart = ref(null)
    const categoryChart = ref(null)
    const walletChart = ref(null)
    const paymentMethodChart = ref(null)

    let trendChartInstance = null
    let typeChartInstance = null
    let weeklyChartInstance = null
    let hourlyChartInstance = null
    let dailyChartInstance = null
    let categoryChartInstance = null
    let walletChartInstance = null
    let paymentMethodChartInstance = null

    const trendData = ref([])
    const hourlyData = ref([])
    const dailyData = ref([])
    const weeklyData = ref([])
    const categoryData = ref([])
    const walletData = ref([])
    const paymentMethodData = ref([])

    const totalTransactions = computed(() => {
      const hourlyCount = hourlyData.value.reduce((sum, item) => sum + parseInt(item.count || 0), 0)
      return hourlyCount
    })

    const avgDailyExpense = computed(() => {
      if (!dailyData.value.length) return 0
      const expenses = dailyData.value.filter(d => d.type === 'expense')
      if (!expenses.length) return 0
      const total = expenses.reduce((sum, d) => sum + parseFloat(d.total || 0), 0)
      return total / expenses.length
    })

    const busiestDay = computed(() => {
      if (!weeklyData.value.length) return '-'
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
      const daySums = {}
      weeklyData.value.forEach(d => {
        const dayIndex = parseInt(d.day_of_week)
        daySums[dayIndex] = (daySums[dayIndex] || 0) + parseFloat(d.total || 0)
      })
      const maxDay = Object.entries(daySums).reduce((max, [day, total]) =>
        total > max.total ? { day, total } : max
      , { day: 0, total: 0 })
      return days[parseInt(maxDay.day)]
    })

    const busiestHour = computed(() => {
      if (!hourlyData.value.length) return '-'
      const hourSums = {}
      hourlyData.value.forEach(d => {
        const hour = parseInt(d.hour)
        hourSums[hour] = (hourSums[hour] || 0) + parseInt(d.count || 0)
      })
      const maxHour = Object.entries(hourSums).reduce((max, [hour, count]) =>
        count > max.count ? { hour, count } : max
      , { hour: 0, count: 0 })
      return `${String(maxHour.hour).padStart(2, '0')}:00`
    })

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount)
    }

    const selectDateRange = (range) => {
      selectedRange.value = range

      const today = new Date()
      const end = new Date(today)
      end.setHours(23, 59, 59, 999)
      endDate.value = end.toISOString().split('T')[0]

      let start = new Date(today)

      switch (range) {
        case '7d':
          start.setDate(today.getDate() - 7)
          break
        case '30d':
          start.setDate(today.getDate() - 30)
          break
        case '3m':
          start.setMonth(today.getMonth() - 3)
          break
        case '6m':
          start.setMonth(today.getMonth() - 6)
          break
        case '1y':
          start.setFullYear(today.getFullYear() - 1)
          break
        case 'custom':
          return
      }

      start.setHours(0, 0, 0, 0)
      startDate.value = start.toISOString().split('T')[0]

      if (range !== 'custom') {
        fetchAllAnalytics()
      }
    }

    const applyCustomDateRange = () => {
      if (customStartDate.value && customEndDate.value) {
        startDate.value = customStartDate.value
        endDate.value = customEndDate.value
        fetchAllAnalytics()
      }
    }

    const fetchAllAnalytics = async () => {
      loading.value = true
      try {
        const [
          trend,
          hourly,
          daily,
          weekly,
          category,
          wallet,
          paymentMethod
        ] = await Promise.all([
          analyticsService.getSpendingTrend(30),
          analyticsService.getHourlyBreakdown(startDate.value, endDate.value),
          analyticsService.getDailyBreakdown(startDate.value, endDate.value),
          analyticsService.getWeeklyPattern(startDate.value, endDate.value),
          analyticsService.getCategoryBreakdown(startDate.value, endDate.value),
          analyticsService.getWalletBreakdown(startDate.value, endDate.value),
          analyticsService.getPaymentMethodBreakdown(startDate.value, endDate.value)
        ])

        trendData.value = trend
        hourlyData.value = hourly
        dailyData.value = daily
        weeklyData.value = weekly
        categoryData.value = category
        walletData.value = wallet
        paymentMethodData.value = paymentMethod

        createTrendChart()
        createTypeChart()
        createWeeklyChart()
        createHourlyChart()
        createDailyChart()
        createCategoryChart()
        createWalletChart()
        createPaymentMethodChart()
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        loading.value = false
      }
    }

    const createTrendChart = () => {
      if (trendChartInstance) {
        trendChartInstance.destroy()
      }

      const days = {}
      trendData.value.forEach(item => {
        const day = item.day
        if (!days[day]) {
          days[day] = { income: 0, expense: 0 }
        }
        days[day][item.type] = parseFloat(item.total || 0)
      })

      const labels = Object.keys(days).sort().reverse().slice(0, 30).reverse()
      const incomeData = labels.map(day => days[day].income)
      const expenseData = labels.map(day => days[day].expense)

      const ctx = trendChart.value.getContext('2d')
      trendChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels.map(d => new Date(d).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })),
          datasets: [
            {
              label: 'Pemasukan',
              data: incomeData,
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.4
            },
            {
              label: 'Pengeluaran',
              data: expenseData,
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => formatCurrency(value)
              }
            }
          }
        }
      })
    }

    const createTypeChart = () => {
      if (typeChartInstance) {
        typeChartInstance.destroy()
      }

      const typeTotals = { income: 0, expense: 0, transfer: 0 }
      dailyData.value.forEach(item => {
        typeTotals[item.type] += parseFloat(item.total || 0)
      })

      const ctx = typeChart.value.getContext('2d')
      typeChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Pemasukan', 'Pengeluaran', 'Transfer'],
          datasets: [{
            label: 'Total',
            data: [typeTotals.income, typeTotals.expense, typeTotals.transfer],
            backgroundColor: ['#10b981', '#ef4444', '#3b82f6']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => formatCurrency(value)
              }
            }
          }
        }
      })
    }

    const createWeeklyChart = () => {
      if (weeklyChartInstance) {
        weeklyChartInstance.destroy()
      }

      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
      const weeklyTotals = Array(7).fill(0)
      const weeklyCounts = Array(7).fill(0)

      weeklyData.value.forEach(item => {
        const dayIndex = parseInt(item.day_of_week)
        weeklyTotals[dayIndex] += parseFloat(item.total || 0)
        weeklyCounts[dayIndex] += parseInt(item.count || 0)
      })

      const ctx = weeklyChart.value.getContext('2d')
      weeklyChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: days,
          datasets: [{
            label: 'Total Transaksi',
            data: weeklyTotals,
            backgroundColor: '#6366f1'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => formatCurrency(value)
              }
            }
          }
        }
      })
    }

    const createHourlyChart = () => {
      if (hourlyChartInstance) {
        hourlyChartInstance.destroy()
      }

      const hourlyTotals = Array(24).fill(0)
      const hourlyCounts = Array(24).fill(0)

      hourlyData.value.forEach(item => {
        const hour = parseInt(item.hour)
        hourlyTotals[hour] += parseFloat(item.total || 0)
        hourlyCounts[hour] += parseInt(item.count || 0)
      })

      const ctx = hourlyChart.value.getContext('2d')
      hourlyChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`),
          datasets: [{
            label: 'Jumlah Transaksi',
            data: hourlyCounts,
            backgroundColor: '#8b5cf6'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      })
    }

    const createDailyChart = () => {
      if (dailyChartInstance) {
        dailyChartInstance.destroy()
      }

      const dailyMap = {}
      dailyData.value.forEach(item => {
        const day = item.day
        if (!dailyMap[day]) {
          dailyMap[day] = { income: 0, expense: 0 }
        }
        dailyMap[day][item.type] = parseFloat(item.total || 0)
      })

      const labels = Object.keys(dailyMap).sort()
      const incomeData = labels.map(day => dailyMap[day].income)
      const expenseData = labels.map(day => dailyMap[day].expense)

      const ctx = dailyChart.value.getContext('2d')
      dailyChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels.map(d => new Date(d).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })),
          datasets: [
            {
              label: 'Pemasukan',
              data: incomeData,
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.4
            },
            {
              label: 'Pengeluaran',
              data: expenseData,
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => formatCurrency(value)
              }
            }
          }
        }
      })
    }

    const createCategoryChart = () => {
      if (categoryChartInstance) {
        categoryChartInstance.destroy()
      }

      const expenseCategories = categoryData.value.filter(c => c.type === 'expense')
      const labels = expenseCategories.map(c => c.name || 'Tanpa Kategori')
      const data = expenseCategories.map(c => parseFloat(c.total || 0))
      const colors = expenseCategories.map(c => c.color || '#6b7280')

      const ctx = categoryChart.value.getContext('2d')
      categoryChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: colors
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right'
            }
          }
        }
      })
    }

    const createWalletChart = () => {
      if (walletChartInstance) {
        walletChartInstance.destroy()
      }

      const walletMap = {}
      walletData.value.forEach(item => {
        const walletName = item.name || 'Unknown'
        if (!walletMap[walletName]) {
          walletMap[walletName] = { total: 0, color: item.color || '#6b7280' }
        }
        walletMap[walletName].total += parseFloat(item.total || 0)
      })

      const labels = Object.keys(walletMap)
      const data = labels.map(name => walletMap[name].total)
      const colors = labels.map(name => walletMap[name].color)

      const ctx = walletChart.value.getContext('2d')
      walletChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: colors
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right'
            }
          }
        }
      })
    }

    const createPaymentMethodChart = () => {
      if (paymentMethodChartInstance) {
        paymentMethodChartInstance.destroy()
      }

      const methodMap = {}
      paymentMethodData.value.forEach(item => {
        const method = item.payment_method || 'Lainnya'
        if (!methodMap[method]) {
          methodMap[method] = 0
        }
        methodMap[method] += parseFloat(item.total || 0)
      })

      const labels = Object.keys(methodMap)
      const data = labels.map(method => methodMap[method])

      const ctx = paymentMethodChart.value.getContext('2d')
      paymentMethodChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: [
              '#6366f1',
              '#8b5cf6',
              '#ec4899',
              '#f59e0b',
              '#10b981',
              '#3b82f6'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right'
            }
          }
        }
      })
    }

    onMounted(() => {
      selectDateRange('30d')
    })

    onUnmounted(() => {
      if (trendChartInstance) trendChartInstance.destroy()
      if (typeChartInstance) typeChartInstance.destroy()
      if (weeklyChartInstance) weeklyChartInstance.destroy()
      if (hourlyChartInstance) hourlyChartInstance.destroy()
      if (dailyChartInstance) dailyChartInstance.destroy()
      if (categoryChartInstance) categoryChartInstance.destroy()
      if (walletChartInstance) walletChartInstance.destroy()
      if (paymentMethodChartInstance) paymentMethodChartInstance.destroy()
    })

    return {
      loading,
      dateRanges,
      selectedRange,
      customStartDate,
      customEndDate,
      trendChart,
      typeChart,
      weeklyChart,
      hourlyChart,
      dailyChart,
      categoryChart,
      walletChart,
      paymentMethodChart,
      totalTransactions,
      avgDailyExpense,
      busiestDay,
      busiestHour,
      formatCurrency,
      selectDateRange,
      applyCustomDateRange
    }
  }
}
</script>

<style scoped>
.analytics-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

.date-range-selector {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
}

.range-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.range-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  background: white;
  color: #6b7280;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.range-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.range-btn.active {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border-color: transparent;
}

.custom-date {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.custom-date input[type="date"] {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
}

.custom-date input[type="date"]:disabled {
  background: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}

.custom-date span {
  color: #6b7280;
  font-size: 0.875rem;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  gap: 1rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading p {
  color: #6b7280;
  font-size: 0.875rem;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 350px;
  display: flex;
  flex-direction: column;
}

.chart-card.large {
  grid-column: 1 / -1;
  min-height: 400px;
}

.chart-card h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.chart-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 1rem 0;
}

.chart-card canvas {
  flex: 1;
  min-height: 250px;
}

.stats-card {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  color: white;
  grid-column: 1 / -1;
}

.stats-card h2 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.9;
  font-weight: 500;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
}

@media (max-width: 768px) {
  .analytics-page {
    padding: 1rem;
  }

  .analytics-grid {
    grid-template-columns: 1fr;
  }

  .chart-card.large {
    grid-column: 1;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .date-range-selector {
    flex-direction: column;
    align-items: stretch;
  }

  .range-buttons {
    justify-content: center;
  }

  .custom-date {
    justify-content: center;
  }
}
</style>
