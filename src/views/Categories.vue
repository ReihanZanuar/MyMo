<template>
  <div class="categories">
    <!-- Header -->
    <header class="page-header">
      <div class="header-content">
        <h2>Kategori</h2>
        <p class="subtitle">Kelola kategori transaksi Anda</p>
      </div>
    </header>

    <!-- Toolbar -->
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

      <button class="btn-add" @click="openModal">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Tambah Kategori
      </button>
    </div>

    <!-- Categories Grid -->
    <div class="categories-grid">
      <div v-for="category in filteredCategories" :key="category.id" class="category-card">
        <div class="card-header">
          <div class="category-icon" :style="{ background: category.color }">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path v-if="category.type === 'income'" d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              <path v-else d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div class="card-actions">
            <button class="btn-icon" title="Edit" @click="editCategory(category)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="btn-icon delete" title="Hapus" @click="deleteCategory(category.id)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>

        <div class="card-body">
          <h3 class="category-name">{{ category.name }}</h3>
          <span class="badge" :class="category.type">
            {{ category.type === 'income' ? 'Pemasukan' : 'Pengeluaran' }}
          </span>
        </div>

        <div class="card-footer">
          <span class="transaction-count">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            {{ category.transactionCount }} transaksi
          </span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredCategories.length === 0" class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
      </svg>
      <p>Tidak ada kategori ditemukan</p>
    </div>

    <!-- Modal Tambah Kategori -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingCategoryId ? 'Edit Kategori' : 'Tambah Kategori' }}</h3>
          <button class="btn-close" @click="closeModal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Tab Navigation -->
        <div class="modal-tabs">
          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeTab === 'basic' }"
            @click="activeTab = 'basic'"
          >
            Info Dasar
          </button>
          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeTab === 'appearance' }"
            @click="activeTab = 'appearance'"
          >
            Tampilan
          </button>
          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeTab === 'advanced' }"
            @click="activeTab = 'advanced'"
          >
            Lanjutan
          </button>
        </div>

        <form @submit.prevent="submitCategory" class="modal-form">
          <!-- Tab 1: Info Dasar -->
          <div v-show="activeTab === 'basic'" class="tab-content">
            <div class="form-group">
              <label>Nama Kategori</label>
              <input
                v-model="formData.name"
                type="text"
                class="form-input"
                placeholder="Contoh: Gaji, Makan, Transport"
                required
              />
            </div>

            <div class="form-group">
              <label>Tipe Kategori</label>
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
                  Pemindahan
                </button>
              </div>
            </div>
          </div>

          <!-- Tab 2: Tampilan -->
          <div v-show="activeTab === 'appearance'" class="tab-content">
            <!-- Color Section -->
            <div class="form-group">
              <label>Warna Kategori</label>
              <div class="color-mode-toggle">
                <button
                  type="button"
                  class="mode-btn"
                  :class="{ active: !formData.isGradient }"
                  @click="formData.isGradient = false"
                >
                  Solid
                </button>
                <button
                  type="button"
                  class="mode-btn"
                  :class="{ active: formData.isGradient }"
                  @click="formData.isGradient = true"
                >
                  Gradient
                </button>
              </div>

              <!-- Solid Color Picker -->
              <div v-if="!formData.isGradient" class="color-picker-section">
                <div class="color-palette">
                  <button
                    v-for="preset in colorPresets"
                    :key="preset.color"
                    type="button"
                    class="color-option"
                    :class="{ active: formData.color === preset.color }"
                    :style="{ background: preset.color }"
                    :title="preset.label"
                    @click="formData.color = preset.color"
                  ></button>
                </div>
                <input
                  v-model="formData.color"
                  type="color"
                  class="form-input color-input"
                  title="Custom color"
                />
              </div>

              <!-- Gradient Color Picker -->
              <div v-else class="gradient-picker-section">
                <div class="gradient-palette">
                  <button
                    v-for="preset in gradientPresets"
                    :key="preset.label"
                    type="button"
                    class="gradient-option"
                    :class="{ active: formData.gradientStart === preset.start && formData.gradientEnd === preset.end }"
                    :style="{ background: `linear-gradient(135deg, ${preset.start} 0%, ${preset.end} 100%)` }"
                    :title="preset.label"
                    @click="formData.gradientStart = preset.start; formData.gradientEnd = preset.end"
                  ></button>
                </div>
                <div class="gradient-custom">
                  <div class="gradient-input-group">
                    <label>Start</label>
                    <input
                      v-model="formData.gradientStart"
                      type="color"
                      class="form-input color-input-small"
                    />
                  </div>
                  <div class="gradient-input-group">
                    <label>End</label>
                    <input
                      v-model="formData.gradientEnd"
                      type="color"
                      class="form-input color-input-small"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Icon/Emoji Section -->
            <div class="form-group">
              <label>Icon atau Emoji</label>
              <div class="icon-emoji-toggle">
                <button
                  type="button"
                  class="mode-btn"
                  :class="{ active: !useEmoji }"
                  @click="useEmoji = false"
                >
                  SVG Icon
                </button>
                <button
                  type="button"
                  class="mode-btn"
                  :class="{ active: useEmoji }"
                  @click="useEmoji = true"
                >
                  Emoji
                </button>
              </div>

              <!-- Icon Picker -->
              <div v-if="!useEmoji" class="icon-picker-section">
                <input
                  v-model="iconSearchQuery"
                  type="text"
                  class="form-input search-input"
                  placeholder="Cari icon..."
                />
                <div class="icon-grid">
                  <button
                    v-for="iconOption in filteredIcons"
                    :key="iconOption.name"
                    type="button"
                    class="icon-option"
                    :class="{ active: formData.icon === iconOption.name }"
                    @click="formData.icon = iconOption.name"
                    :title="iconOption.label"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path :d="iconOption.path"></path>
                      <path v-if="iconOption.path2" :d="iconOption.path2"></path>
                    </svg>
                  </button>
                </div>
                <p v-if="filteredIcons.length === 0" class="no-results">Tidak ada icon ditemukan</p>
              </div>

              <!-- Emoji Picker -->
              <div v-else class="emoji-picker-section">
                <input
                  v-model="emojiSearchQuery"
                  type="text"
                  class="form-input search-input"
                  placeholder="Cari emoji..."
                />
                <div class="emoji-categories">
                  <div
                    v-for="category in filteredEmojis"
                    :key="category.key"
                    class="emoji-category"
                  >
                    <h4 class="category-title">{{ category.name }}</h4>
                    <div class="emoji-grid">
                      <button
                        v-for="(emoji, index) in category.emojis"
                        :key="index"
                        type="button"
                        class="emoji-option"
                        :class="{ active: formData.emoji === emoji }"
                        @click="formData.emoji = emoji"
                      >
                        {{ emoji }}
                      </button>
                    </div>
                  </div>
                </div>
                <p v-if="filteredEmojis.length === 0" class="no-results">Tidak ada emoji ditemukan</p>
              </div>
            </div>
          </div>

          <!-- Tab 3: Lanjutan -->
          <div v-show="activeTab === 'advanced'" class="tab-content">
            <div class="form-group">
              <label>Budget Limit (Opsional)</label>
              <input
                v-model="formData.budget"
                type="number"
                class="form-input"
                placeholder="Contoh: 1000000"
                min="0"
                step="1000"
              />
              <p class="form-hint">Batas pengeluaran per bulan untuk kategori ini</p>
            </div>

            <div class="form-group">
              <label>Deskripsi (Opsional)</label>
              <textarea
                v-model="formData.description"
                class="form-input form-textarea"
                placeholder="Tambahkan catatan atau deskripsi kategori..."
                rows="4"
              ></textarea>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { categoryService } from '../services/categories'
import { colorPresets, gradientPresets, availableIcons } from '../data/categoryIcons'
import { emojiCategories } from '../data/categoryEmojis'

const activeFilter = ref('all')
const showAddModal = ref(false)
const loading = ref(true)
const error = ref(null)
const allCategories = ref([])
const submitting = ref(false)
const editingCategoryId = ref(null)

// Modal tabs
const activeTab = ref('basic')
const iconSearchQuery = ref('')
const emojiSearchQuery = ref('')
const useEmoji = ref(false)

const formData = ref({
  name: '',
  type: 'expense',
  color: '#667eea',
  icon: 'shopping-cart',
  emoji: '',
  isGradient: false,
  gradientStart: '#667eea',
  gradientEnd: '#764ba2',
  budget: '',
  description: ''
})

const filterTabs = [
  { label: 'Semua', value: 'all' },
  { label: 'Pemasukan', value: 'income' },
  { label: 'Pengeluaran', value: 'expense' }
]

const defaultColors = {
  income: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  expense: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)'
}

async function fetchCategories() {
  try {
    loading.value = true
    error.value = null

    const data = await categoryService.getCategories()
    allCategories.value = (data.categories || []).map(cat => ({
      id: cat.id,
      name: cat.name,
      type: cat.type,
      color: cat.color || defaultColors[cat.type],
      icon: cat.icon || 'shopping-cart',
      transactionCount: cat.transaction_count || 0
    }))
  } catch (err) {
    error.value = err.message || 'Gagal memuat kategori'
    console.error('Error fetching categories:', err)
  } finally {
    loading.value = false
  }
}

const filteredCategories = computed(() => {
  if (activeFilter.value === 'all') {
    return allCategories.value
  }
  return allCategories.value.filter(cat => cat.type === activeFilter.value)
})

// Filtered icons based on search query
const filteredIcons = computed(() => {
  if (!iconSearchQuery.value) return availableIcons
  const query = iconSearchQuery.value.toLowerCase()
  return availableIcons.filter(icon =>
    icon.label.toLowerCase().includes(query) ||
    icon.name.toLowerCase().includes(query) ||
    (icon.category && icon.category.toLowerCase().includes(query))
  )
})

// Filtered emojis based on search query
const filteredEmojis = computed(() => {
  if (!emojiSearchQuery.value) return emojiCategories
  const query = emojiSearchQuery.value.toLowerCase()
  return emojiCategories
    .map(category => ({
      ...category,
      emojis: category.emojis.filter(emoji =>
        category.name.toLowerCase().includes(query) ||
        category.key.toLowerCase().includes(query)
      )
    }))
    .filter(category => category.emojis.length > 0)
})

onMounted(() => {
  fetchCategories()
})

function openModal() {
  showAddModal.value = true
  editingCategoryId.value = null
  activeTab.value = 'basic'
  iconSearchQuery.value = ''
  emojiSearchQuery.value = ''
  useEmoji.value = false
  formData.value = {
    name: '',
    type: 'expense',
    color: '#667eea',
    icon: 'shopping-cart',
    emoji: '',
    isGradient: false,
    gradientStart: '#667eea',
    gradientEnd: '#764ba2',
    budget: '',
    description: ''
  }
}

function closeModal() {
  showAddModal.value = false
  editingCategoryId.value = null
  activeTab.value = 'basic'
}

function editCategory(category) {
  editingCategoryId.value = category.id
  activeTab.value = 'basic'
  iconSearchQuery.value = ''
  emojiSearchQuery.value = ''

  // Parse color to detect gradient
  const isGrad = category.color && category.color.includes('gradient')
  let gradStart = '#667eea'
  let gradEnd = '#764ba2'

  if (isGrad) {
    const matches = category.color.match(/#[0-9a-fA-F]{6}/g)
    if (matches && matches.length >= 2) {
      gradStart = matches[0]
      gradEnd = matches[1]
    }
  }

  formData.value = {
    name: category.name,
    type: category.type,
    color: isGrad ? gradStart : (category.color || '#667eea'),
    icon: category.icon || 'shopping-cart',
    emoji: category.emoji || '',
    isGradient: isGrad,
    gradientStart: gradStart,
    gradientEnd: gradEnd,
    budget: category.budget || '',
    description: category.description || ''
  }

  useEmoji.value = !!(category.emoji)
  showAddModal.value = true
}

async function submitCategory() {
  try {
    submitting.value = true

    // Build color value
    let finalColor = formData.value.color
    if (formData.value.isGradient) {
      finalColor = `linear-gradient(135deg, ${formData.value.gradientStart} 0%, ${formData.value.gradientEnd} 100%)`
    }

    const payload = {
      name: formData.value.name,
      type: formData.value.type,
      color: finalColor,
      icon: useEmoji.value ? '' : formData.value.icon,
      emoji: useEmoji.value ? formData.value.emoji : '',
      budget: formData.value.budget ? parseFloat(formData.value.budget) : null,
      description: formData.value.description || null
    }

    if (editingCategoryId.value) {
      await categoryService.updateCategory(editingCategoryId.value, payload)
      alert('Kategori berhasil diupdate')
    } else {
      await categoryService.createCategory(payload)
      alert('Kategori berhasil ditambahkan')
    }

    closeModal()
    await fetchCategories()
  } catch (err) {
    console.error('Error saving category:', err)
    alert('Gagal menyimpan kategori: ' + (err.message || 'Terjadi kesalahan'))
  } finally {
    submitting.value = false
  }
}

async function deleteCategory(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
    return
  }

  try {
    await categoryService.deleteCategory(id)
    await fetchCategories()
    alert('Kategori berhasil dihapus')
  } catch (err) {
    console.error('Error deleting category:', err)
    alert('Gagal menghapus kategori: ' + (err.message || 'Terjadi kesalahan'))
  }
}
</script>

<style scoped>
.categories {
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

.btn-add:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
}

.dark .btn-add {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.dark .btn-add:hover {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.category-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.category-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-actions {
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

.card-body {
  margin-bottom: 1rem;
}

.category-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
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

.card-footer {
  padding-top: 1rem;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
}

.transaction-count {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.transaction-count svg {
  color: #667eea;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  color: #6b7280;
}

.empty-state svg {
  margin-bottom: 1rem;
  opacity: 0.3;
}

.empty-state p {
  margin: 0;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .categories {
    padding: 1rem;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-add {
    width: 100%;
    justify-content: center;
  }

  .categories-grid {
    grid-template-columns: 1fr;
  }
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
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
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
  flex-shrink: 0;
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

/* Tab Navigation */
.modal-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 0 1.5rem;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  background: rgba(102, 126, 234, 0.02);
  flex-shrink: 0;
}

.tab-btn {
  padding: 0.875rem 1.25rem;
  border: none;
  background: transparent;
  color: #6b7280;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  position: relative;
}

.tab-btn:hover {
  color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.tab-btn.active {
  color: #667eea;
  border-bottom-color: #667eea;
  font-weight: 600;
}

/* Modal Form */
.modal-form {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.tab-content {
  animation: fadeInContent 0.2s ease;
}

@keyframes fadeInContent {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Color Mode Toggle & Icon/Emoji Toggle */
.color-mode-toggle,
.icon-emoji-toggle {
  display: flex;
  gap: 0.5rem;
  background: rgba(102, 126, 234, 0.05);
  padding: 0.25rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.mode-btn {
  flex: 1;
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: #6b7280;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.mode-btn:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.mode-btn.active {
  background: white;
  color: #667eea;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-weight: 600;
}

/* Color Palette */
.color-picker-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.color-palette {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.5rem;
}

.color-option {
  width: 100%;
  aspect-ratio: 1;
  border: 3px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
}

.color-option:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.color-option.active {
  border-color: #667eea;
  box-shadow: 0 0 0 2px white, 0 0 0 4px #667eea;
  transform: scale(1.05);
}

/* Gradient Picker */
.gradient-picker-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.gradient-palette {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.gradient-option {
  width: 100%;
  aspect-ratio: 2;
  border: 3px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
}

.gradient-option:hover {
  transform: scale(1.02);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.gradient-option.active {
  border-color: #667eea;
  box-shadow: 0 0 0 2px white, 0 0 0 4px #667eea;
  transform: scale(1.02);
}

.gradient-custom {
  display: flex;
  gap: 0.75rem;
}

.gradient-input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.gradient-input-group label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.color-input-small {
  height: 50px;
  cursor: pointer;
  border: 2px solid #e5e7eb;
}

/* Search Input */
.search-input {
  margin-bottom: 0.75rem;
  padding-left: 2.5rem;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: 0.75rem center;
  background-size: 16px;
}

/* Icon Picker */
.icon-picker-section {
  display: flex;
  flex-direction: column;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 0.5rem;
  max-height: 280px;
  overflow-y: auto;
  padding: 0.5rem;
  background: rgba(102, 126, 234, 0.02);
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.icon-option {
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
  padding: 0;
}

.icon-option:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
  color: #667eea;
  transform: translateY(-2px);
}

.icon-option.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
}

/* Emoji Picker */
.emoji-picker-section {
  display: flex;
  flex-direction: column;
}

.emoji-categories {
  max-height: 320px;
  overflow-y: auto;
  padding: 0.5rem;
  background: rgba(102, 126, 234, 0.02);
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.emoji-category {
  margin-bottom: 1rem;
}

.emoji-category:last-child {
  margin-bottom: 0;
}

.category-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 0.5rem 0;
  padding: 0 0.25rem;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 0.25rem;
}

.emoji-option {
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.5rem;
  padding: 0;
}

.emoji-option:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
  transform: scale(1.1);
}

.emoji-option.active {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.2);
  transform: scale(1.1);
}

/* No Results */
.no-results {
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
  padding: 2rem 1rem;
  margin: 0;
}

/* Form Hint */
.form-hint {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0.5rem 0 0 0;
}

/* Form Textarea */
.form-textarea {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .modal-content {
    max-width: 100%;
    margin: 0.5rem;
    max-height: calc(100vh - 1rem);
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-tabs {
    padding: 0 1rem;
    overflow-x: auto;
  }

  .tab-btn {
    padding: 0.75rem 1rem;
    font-size: 0.8125rem;
    white-space: nowrap;
  }

  .modal-form {
    padding: 1rem;
  }

  .type-selector {
    grid-template-columns: 1fr;
  }

  .color-palette {
    grid-template-columns: repeat(4, 1fr);
  }

  .gradient-palette {
    grid-template-columns: repeat(2, 1fr);
  }

  .icon-grid {
    grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
    max-height: 220px;
  }

  .emoji-categories {
    max-height: 240px;
  }

  .emoji-grid {
    grid-template-columns: repeat(auto-fill, minmax(36px, 1fr));
  }

  .modal-actions {
    flex-direction: column;
  }
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

.color-input {
  height: 50px;
  cursor: pointer;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  padding: 0.5rem;
  background: rgba(102, 126, 234, 0.02);
  border-radius: 8px;
}

.icon-option {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
}

.icon-option:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
  color: #667eea;
  transform: translateY(-2px);
}

.icon-option.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
}

.type-selector {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
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
  flex-direction: column;
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
.dark .categories {
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

.dark .category-card {
  background: rgba(30, 30, 45, 0.6);
  border-color: rgba(102, 126, 234, 0.2);
}

.dark .category-card:hover {
  border-color: rgba(102, 126, 234, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.dark .category-name {
  color: #f3f4f6;
}

.dark .category-count {
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

.dark .color-picker {
  background: rgba(15, 15, 25, 0.5);
  border-color: rgba(102, 126, 234, 0.2);
}

.dark .color-option {
  border-color: rgba(102, 126, 234, 0.2);
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

/* Dark Mode - New Components */
.dark .modal-content {
  background: rgba(30, 30, 45, 0.98);
}

.dark .modal-tabs {
  background: rgba(15, 15, 25, 0.6);
  border-bottom-color: rgba(102, 126, 234, 0.2);
}

.dark .tab-btn {
  color: #9ca3af;
}

.dark .tab-btn:hover {
  color: #8b9bea;
  background: rgba(102, 126, 234, 0.1);
}

.dark .tab-btn.active {
  color: #8b9bea;
  border-bottom-color: #8b9bea;
}

.dark .color-mode-toggle,
.dark .icon-emoji-toggle {
  background: rgba(15, 15, 25, 0.6);
}

.dark .mode-btn {
  color: #9ca3af;
}

.dark .mode-btn:hover {
  background: rgba(102, 126, 234, 0.2);
  color: #8b9bea;
}

.dark .mode-btn.active {
  background: rgba(30, 30, 45, 0.8);
  color: #8b9bea;
}

.dark .color-option {
  border-color: rgba(102, 126, 234, 0.3);
}

.dark .color-option.active {
  border-color: #8b9bea;
  box-shadow: 0 0 0 2px rgba(30, 30, 45, 0.98), 0 0 0 4px #8b9bea;
}

.dark .gradient-option {
  border-color: rgba(102, 126, 234, 0.3);
}

.dark .gradient-option.active {
  border-color: #8b9bea;
  box-shadow: 0 0 0 2px rgba(30, 30, 45, 0.98), 0 0 0 4px #8b9bea;
}

.dark .gradient-input-group label {
  color: #9ca3af;
}

.dark .color-input-small {
  border-color: rgba(102, 126, 234, 0.3);
  background: rgba(15, 15, 25, 0.5);
}

.dark .search-input {
  background-color: rgba(15, 15, 25, 0.5);
  border-color: rgba(102, 126, 234, 0.2);
  color: #e5e7eb;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E");
}

.dark .icon-grid,
.dark .emoji-categories {
  background: rgba(15, 15, 25, 0.6);
  border-color: rgba(102, 126, 234, 0.2);
}

.dark .icon-option {
  background: rgba(30, 30, 45, 0.8);
  border-color: rgba(102, 126, 234, 0.2);
  color: #9ca3af;
}

.dark .icon-option:hover {
  border-color: #8b9bea;
  background: rgba(102, 126, 234, 0.2);
  color: #8b9bea;
}

.dark .icon-option.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.dark .category-title {
  color: #9ca3af;
}

.dark .emoji-option {
  background: rgba(30, 30, 45, 0.8);
  border-color: transparent;
}

.dark .emoji-option:hover {
  border-color: #8b9bea;
  background: rgba(102, 126, 234, 0.2);
}

.dark .emoji-option.active {
  border-color: #8b9bea;
  background: rgba(102, 126, 234, 0.2);
}

.dark .form-hint {
  color: #9ca3af;
}

.dark .no-results {
  color: #6b7280;
}

</style>
