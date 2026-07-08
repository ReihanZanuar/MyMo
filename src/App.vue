<template>
  <div class="app">
    <!-- Header -->
    <header class="app-header">
      <div class="header-left">
        <button class="menu-toggle" @click="toggleSidebar" v-if="isMobile">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h1>MyMo</h1>
      </div>
      <div class="header-search">
        <div class="search-container">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            v-model="searchQuery"
            @focus="showSearchResults = true"
            @keydown="handleSearchKeydown"
            placeholder="Cari di MyMo... (Cmd+K)"
            class="search-input"
            ref="searchInput"
          />
          <kbd class="search-shortcut">⌘K</kbd>
        </div>
        <div v-if="showSearchResults && searchQuery" class="search-results">
          <div v-if="filteredSearchResults.length === 0" class="search-empty">
            Tidak ada hasil untuk "{{ searchQuery }}"
          </div>
          <div v-else>
            <router-link
              v-for="result in filteredSearchResults"
              :key="result.path"
              :to="result.path"
              class="search-result-item"
              @click="handleSearchResultClick"
            >
              <component :is="result.icon" class="result-icon" />
              <div class="result-content">
                <div class="result-title">{{ result.title }}</div>
                <div class="result-description">{{ result.description }}</div>
              </div>
            </router-link>
          </div>
        </div>
      </div>
      <div class="header-right">
        <button class="btn-icon" title="Notifications">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </button>
        <button class="btn-icon" @click="toggleTheme" :title="isDarkMode ? 'Light Mode' : 'Dark Mode'">
          <svg v-if="isDarkMode" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </button>
        <div class="user-menu">
          <div class="user-avatar" :style="avatarStyle" @click="toggleUserDropdown">
            <img v-if="authStore.user?.avatar_url && !authStore.user.avatar_url.startsWith('gradient-')"
                 :src="authStore.user.avatar_url"
                 alt="Avatar" />
            <span v-else>{{ userInitial }}</span>
          </div>
          <div v-if="showUserDropdown" class="user-dropdown">
            <div class="dropdown-header">
              <p class="user-name">{{ authStore.user?.name || 'User' }}</p>
              <p class="user-email">{{ authStore.user?.email || '' }}</p>
            </div>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" @click="handleLogout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Overlay for mobile sidebar -->
    <div class="sidebar-overlay" v-if="sidebarOpen && isMobile" @click="closeSidebar"></div>

    <!-- Main Layout -->
    <div class="app-main">
      <!-- Sidebar -->
      <aside class="sidebar" :class="{ open: sidebarOpen, mobile: isMobile }">
        <nav class="sidebar-nav">
          <router-link to="/" class="nav-item" active-class="active" @click="closeSidebarIfMobile">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Dashboard</span>
          </router-link>
          <router-link to="/transaksi" class="nav-item" active-class="active" @click="closeSidebarIfMobile">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            <span>Transaksi</span>
          </router-link>
          <router-link to="/dompet" class="nav-item" active-class="active" @click="closeSidebarIfMobile">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
            <span>Dompet</span>
          </router-link>
          <router-link to="/kategori" class="nav-item" active-class="active" @click="closeSidebarIfMobile">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>Kategori</span>
          </router-link>
          <router-link to="/laporan" class="nav-item" active-class="active" @click="closeSidebarIfMobile">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            <span>Laporan</span>
          </router-link>
          <router-link to="/pengaturan" class="nav-item" active-class="active" @click="closeSidebarIfMobile">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span>Pengaturan</span>
          </router-link>
        </nav>
      </aside>

      <!-- Content Area -->
      <main class="content">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <!-- ChatBox -->
    <ChatBox />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from './stores/auth'
import ChatBox from './components/ChatBox.vue'
import { h } from 'vue'

const authStore = useAuthStore()
const sidebarOpen = ref(false)
const isMobile = ref(false)
const isDarkMode = ref(false)
const showUserDropdown = ref(false)
const searchQuery = ref('')
const showSearchResults = ref(false)
const searchInput = ref(null)

const searchResults = [
  {
    title: 'Dashboard',
    description: 'Lihat ringkasan keuangan Anda',
    path: '/',
    icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('rect', { x: 3, y: 3, width: 7, height: 7 }),
      h('rect', { x: 14, y: 3, width: 7, height: 7 }),
      h('rect', { x: 14, y: 14, width: 7, height: 7 }),
      h('rect', { x: 3, y: 14, width: 7, height: 7 })
    ])
  },
  {
    title: 'Transaksi',
    description: 'Kelola semua transaksi keuangan',
    path: '/transaksi',
    icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('line', { x1: 12, y1: 1, x2: 12, y2: 23 }),
      h('path', { d: 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' })
    ])
  },
  {
    title: 'Dompet',
    description: 'Kelola dompet dan saldo Anda',
    path: '/dompet',
    icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('rect', { x: 1, y: 4, width: 22, height: 16, rx: 2, ry: 2 }),
      h('line', { x1: 1, y1: 10, x2: 23, y2: 10 })
    ])
  },
  {
    title: 'Kategori',
    description: 'Atur kategori transaksi Anda',
    path: '/kategori',
    icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('path', { d: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z' })
    ])
  },
  {
    title: 'Laporan',
    description: 'Analisis dan laporan keuangan',
    path: '/laporan',
    icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('line', { x1: 18, y1: 20, x2: 18, y2: 10 }),
      h('line', { x1: 12, y1: 20, x2: 12, y2: 4 }),
      h('line', { x1: 6, y1: 20, x2: 6, y2: 14 })
    ])
  },
  {
    title: 'Pengaturan',
    description: 'Kelola preferensi dan akun Anda',
    path: '/pengaturan',
    icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('circle', { cx: 12, cy: 12, r: 3 }),
      h('path', { d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z' })
    ])
  }
]

const filteredSearchResults = computed(() => {
  if (!searchQuery.value) return []
  const query = searchQuery.value.toLowerCase()
  return searchResults.filter(result =>
    result.title.toLowerCase().includes(query) ||
    result.description.toLowerCase().includes(query)
  )
})

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

const userInitial = computed(() => {
  return authStore.user?.name?.charAt(0).toUpperCase() || 'U'
})

const avatarStyle = computed(() => {
  const avatarUrl = authStore.user?.avatar_url
  if (avatarUrl && avatarUrl.startsWith('gradient-')) {
    const gradient = stockAvatars.find(g => g.id === avatarUrl)
    return gradient ? { background: gradient.style } : { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
  }
  return { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
})

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) {
    sidebarOpen.value = false
  }
}

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

const closeSidebarIfMobile = () => {
  if (isMobile.value) {
    closeSidebar()
  }
}

const applyDarkMode = () => {
  const preferences = localStorage.getItem('mymo_preferences')
  if (preferences) {
    try {
      const prefs = JSON.parse(preferences)
      isDarkMode.value = prefs.darkMode || false
      if (prefs.darkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } catch (e) {
      console.error('Error parsing preferences:', e)
      isDarkMode.value = false
    }
  } else {
    isDarkMode.value = false
  }
}

const toggleTheme = () => {
  const preferences = localStorage.getItem('mymo_preferences')
  let prefs = { currency: 'IDR', language: 'id', darkMode: false }

  if (preferences) {
    try {
      prefs = JSON.parse(preferences)
    } catch (e) {
      console.error('Error parsing preferences:', e)
    }
  }

  prefs.darkMode = !prefs.darkMode
  localStorage.setItem('mymo_preferences', JSON.stringify(prefs))
  applyDarkMode()
}

const toggleUserDropdown = () => {
  showUserDropdown.value = !showUserDropdown.value
}

const handleLogout = () => {
  authStore.logout()
  window.location.href = '/login.html'
}

const handleSearchKeydown = (event) => {
  if (event.key === 'Escape') {
    showSearchResults.value = false
    searchInput.value?.blur()
  }
}

const handleSearchResultClick = () => {
  showSearchResults.value = false
  searchQuery.value = ''
}

const handleGlobalKeydown = (event) => {
  // Cmd+K or Ctrl+K to focus search
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault()
    searchInput.value?.focus()
  }
}

const handleClickOutside = (event) => {
  // User dropdown
  const dropdown = document.querySelector('.user-dropdown')
  const avatar = document.querySelector('.user-avatar')
  if (dropdown && avatar && !dropdown.contains(event.target) && !avatar.contains(event.target)) {
    showUserDropdown.value = false
  }

  // Search results
  const searchContainer = document.querySelector('.header-search')
  if (searchContainer && !searchContainer.contains(event.target)) {
    showSearchResults.value = false
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)

  applyDarkMode()
  window.addEventListener('storage', applyDarkMode)

  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  window.removeEventListener('storage', applyDarkMode)
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  height: 100dvh;
  overflow: hidden;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.app {
  height: 100%;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Header */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: calc(1rem + env(safe-area-inset-top, 0px)) 2rem 1rem 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  flex-shrink: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #4b5563;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.menu-toggle:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.logo {
  height: 40px;
  width: auto;
}

.app-header h1 {
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

/* Search */
.header-search {
  flex: 1;
  max-width: 600px;
  margin: 0 2rem;
  position: relative;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(102, 126, 234, 0.05);
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 12px;
  padding: 0.625rem 1rem;
  transition: all 0.3s ease;
}

.search-container:focus-within {
  background: white;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-icon {
  color: #9ca3af;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: none;
  outline: none;
  font-size: 0.875rem;
  color: #1f2937;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.search-input::placeholder {
  color: #9ca3af;
}

.search-shortcut {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 24px;
  padding: 0 0.5rem;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #667eea;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  margin-left: 0.75rem;
}

.search-results {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
  animation: slideDown 0.2s ease;
}

.search-empty {
  padding: 2rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1rem;
  text-decoration: none;
  color: #1f2937;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(102, 126, 234, 0.05);
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background: rgba(102, 126, 234, 0.05);
  color: #667eea;
}

.result-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 10px;
  color: #667eea;
  flex-shrink: 0;
}

.search-result-item:hover .result-icon {
  background: rgba(102, 126, 234, 0.15);
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-title {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.result-description {
  font-size: 0.75rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.user-menu {
  position: relative;
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  min-width: 240px;
  overflow: hidden;
  animation: slideDown 0.2s ease;
  z-index: 1000;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-header {
  padding: 1rem;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
}

.user-name {
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
}

.user-email {
  color: #6b7280;
  margin: 0;
  font-size: 0.75rem;
}

.dropdown-divider {
  height: 1px;
  background: rgba(102, 126, 234, 0.1);
  margin: 0.5rem 0;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.dropdown-item:hover {
  background: rgba(239, 68, 68, 0.05);
  color: #ef4444;
}

.dropdown-item svg {
  flex-shrink: 0;
}

/* Main Layout */
.app-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Sidebar */
.sidebar {
  width: 260px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(102, 126, 234, 0.1);
  padding: 2rem 0;
  overflow-y: auto;
  transition: transform 0.3s ease;
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
  overflow-y: auto;
  overflow-x: hidden;
}

/* Chat Panel Mode - Content Offset */
body.chat-panel-active .app-main {
  margin-right: 450px;
  transition: margin-right 0.3s ease;
}

body.chat-panel-active .app-header {
  margin-right: 450px;
  transition: margin-right 0.3s ease;
}

/* Sidebar Overlay (Mobile) */
.sidebar-overlay {
  display: none;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .app-header {
    padding: calc(1rem + env(safe-area-inset-top, 0px)) 1rem 1rem 1rem;
  }

  .menu-toggle {
    display: none;
  }

  .app-main {
    display: grid;
    grid-template-rows: 1fr auto;
    grid-template-columns: 1fr;
  }

  .sidebar {
    grid-row: 2;
    position: relative;
    width: 100%;
    height: auto;
    z-index: 999;
    padding: 0;
    border-right: none;
    border-top: 1px solid rgba(102, 126, 234, 0.2);
    box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: center;
    background: rgba(255, 255, 255, 0.98);
    flex-shrink: 0;
  }

  .sidebar-nav {
    flex-direction: row;
    justify-content: space-around;
    width: 100%;
    padding: 0.5rem 0.5rem calc(0.5rem + env(safe-area-inset-bottom));
    gap: 0;
  }

  .nav-item {
    flex-direction: column;
    padding: 0.5rem 0.25rem;
    gap: 0.25rem;
    flex: 1;
    text-align: center;
    justify-content: center;
    border-radius: 8px;
  }

  .nav-item span {
    font-size: 0.65rem;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }
  
  .nav-item svg {
    margin: 0 auto;
    width: 20px;
    height: 20px;
  }

  .sidebar-overlay {
    display: none !important;
  }

  .content {
    grid-row: 1;
    width: 100%;
    padding-bottom: 20px;
    min-height: 0; /* Fixes grid item overflow on mobile */
  }
}

/* Dark Mode */
.dark .app {
  background: linear-gradient(135deg, #1a1f3a 0%, #2d1b3d 100%);
}

.dark .app-header {
  background: rgba(30, 30, 45, 0.95);
  border-bottom: 1px solid rgba(102, 126, 234, 0.2);
}

.dark .app-header h1 {
  background: linear-gradient(135deg, #8b9bea 0%, #a78bca 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark .btn-icon {
  color: #d1d5db;
}

.dark .btn-icon:hover {
  background: rgba(102, 126, 234, 0.2);
  color: #8b9bea;
}

.dark .sidebar {
  background: rgba(30, 30, 45, 0.95);
  border-right: 1px solid rgba(102, 126, 234, 0.2);
}

.dark .nav-item {
  color: #9ca3af;
}

.dark .nav-item:hover {
  background: rgba(102, 126, 234, 0.2);
  color: #8b9bea;
}

.dark .nav-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.dark .sidebar-overlay {
  background: rgba(0, 0, 0, 0.7);
}

.dark .user-dropdown {
  background: rgba(30, 30, 45, 0.98);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.dark .dropdown-header {
  border-bottom-color: rgba(102, 126, 234, 0.2);
}

.dark .user-name {
  color: #f3f4f6;
}

.dark .user-email {
  color: #9ca3af;
}

.dark .dropdown-item {
  color: #d1d5db;
}

.dark .dropdown-item:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
}

/* Dark Mode - Search */
.dark .search-container {
  background: rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.2);
}

.dark .search-container:focus-within {
  background: rgba(30, 30, 45, 0.95);
  border-color: #8b9bea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.dark .search-icon {
  color: #9ca3af;
}

.dark .search-input {
  color: #f3f4f6;
}

.dark .search-input::placeholder {
  color: #6b7280;
}

.dark .search-shortcut {
  background: rgba(102, 126, 234, 0.2);
  border-color: rgba(102, 126, 234, 0.3);
  color: #8b9bea;
}

.dark .search-results {
  background: rgba(30, 30, 45, 0.98);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.dark .search-empty {
  color: #9ca3af;
}

.dark .search-result-item {
  color: #f3f4f6;
  border-bottom-color: rgba(102, 126, 234, 0.1);
}

.dark .search-result-item:hover {
  background: rgba(102, 126, 234, 0.15);
  color: #8b9bea;
}

.dark .result-icon {
  background: rgba(102, 126, 234, 0.2);
  color: #8b9bea;
}

.dark .search-result-item:hover .result-icon {
  background: rgba(102, 126, 234, 0.25);
}

.dark .result-description {
  color: #9ca3af;
}

/* Mobile Responsive - Search */
@media (max-width: 768px) {
  .header-search {
    display: none;
  }
}

/* Page Transitions */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Panel & Card Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Apply animations to common elements */
.summary-cards,
.charts-section,
.transactions-section,
.content-header {
  animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) backwards;
}

/* Staggered animations for cards */
.summary-card {
  animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) backwards;
}

.summary-card:nth-child(1) {
  animation-delay: 0.05s;
}

.summary-card:nth-child(2) {
  animation-delay: 0.1s;
}

.summary-card:nth-child(3) {
  animation-delay: 0.15s;
}

.summary-card:nth-child(4) {
  animation-delay: 0.2s;
}

/* Chart cards with delay */
.chart-card {
  animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) backwards;
}

.chart-card:nth-child(1) {
  animation-delay: 0.25s;
}

.chart-card:nth-child(2) {
  animation-delay: 0.3s;
}

/* Transactions section */
.transactions-section {
  animation-delay: 0.35s;
}

/* Smooth transitions for interactive elements */
.summary-card,
.chart-card,
.nav-item,
.search-result-item,
.dropdown-item,
.btn-icon,
.user-avatar {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Modal animations */
.modal-overlay {
  animation: fadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-content {
  animation: fadeInUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover scale effect for cards */
.summary-card:hover,
.chart-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(102, 126, 234, 0.15);
}

/* Content header animation */
.content-header {
  animation-delay: 0s;
}

/* Theme Transition - Smooth Light/Dark Mode Switch */
.app,
.app-header,
.sidebar,
.content,
.nav-item,
.btn-icon,
.search-container,
.search-input,
.search-results,
.search-result-item,
.result-icon,
.user-dropdown,
.dropdown-header,
.dropdown-item,
.summary-card,
.chart-card,
.transactions-section,
.modal-overlay,
.modal-content {
  transition: background 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Override untuk elemen yang punya transition lain */
.summary-card,
.chart-card,
.nav-item,
.btn-icon {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
