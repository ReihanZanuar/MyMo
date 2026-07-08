# MyMo - Frontend Components Documentation

## Frontend Technology Stack

**Core Framework:** Vue.js 3 with Composition API  
**Build Tool:** Vite 5.2.0  
**Router:** Vue Router 4.3.0  
**State Management:** Pinia 2.1.7  
**HTTP Client:** Axios 1.6.8  
**Styling:** Vanilla CSS with custom design system

---

## Project Structure

```
src/
├── main.js                    # Application entry point
├── App.vue                    # Root component
├── router/
│   └── index.js              # Route definitions
├── stores/
│   └── auth.js               # Authentication store
├── views/                    # Page-level components
│   ├── Dashboard.vue         # Main dashboard view
│   ├── Transactions.vue      # Transaction management
│   ├── Categories.vue        # Category management
│   ├── Reports.vue           # Analytics and reports
│   └── Settings.vue          # User settings
├── components/               # Reusable components
│   ├── ChatBox.vue          # AI chat assistant
│   └── ScanReceipt.vue      # OCR receipt scanner
├── services/                 # API service layer
│   ├── api.js               # Axios instance configuration
│   ├── auth.js              # Auth API calls
│   ├── transactions.js      # Transaction API calls
│   ├── categories.js        # Category API calls
│   ├── users.js             # User API calls
│   ├── chat.js              # Chat API calls
│   └── ocr.js               # OCR processing
├── data/                     # Static data
│   ├── categoryIcons.js     # Icon mappings
│   └── categoryEmojis.js    # Emoji mappings
└── utils/                    # Helper functions
    └── receiptParser.js     # Receipt text parsing
```

---

## Entry Point: main.js

```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')
```

**Initialization Order:**
1. Create Vue app instance
2. Create Pinia store instance
3. Register Pinia plugin
4. Register Vue Router
5. Mount to DOM (#app)

---

## Root Component: App.vue

```vue
<template>
  <div id="app" :class="{ 'dark': isDarkMode }">
    <router-view />
    <ChatBox v-if="isAuthenticated" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from './stores/auth'
import ChatBox from './components/ChatBox.vue'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isDarkMode = computed(() => /* dark mode logic */)
</script>
```

**Responsibilities:**
- Render current route via `<router-view />`
- Show ChatBox only for authenticated users
- Apply dark mode class globally
- Serve as component tree root

---

## Router Configuration

### router/index.js

```javascript
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/transactions',
    name: 'transactions',
    component: () => import('../views/Transactions.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/categories',
    name: 'categories',
    component: () => import('../views/Categories.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reports',
    name: 'reports',
    component: () => import('../views/Reports.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../views/Settings.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
```

**Features:**
- Lazy loading via dynamic imports
- Authentication guard
- Redirect logged-in users away from /login
- SPA routing with History API

---

## State Management: Pinia Auth Store

### stores/auth.js

```javascript
import { defineStore } from 'pinia'
import { authService } from '../services/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user
  },
  
  actions: {
    async login(email, password) {
      const response = await authService.login(email, password)
      this.setAuth(response.token, response.user)
      return response
    },
    
    async register(email, password, name) {
      const response = await authService.register(email, password, name)
      this.setAuth(response.token, response.user)
      return response
    },
    
    async googleAuth(googleData) {
      const response = await authService.googleAuth(googleData)
      this.setAuth(response.token, response.user)
      return response
    },
    
    setAuth(token, user) {
      this.token = token
      this.user = user
      localStorage.setItem('token', token)
    },
    
    async logout() {
      await authService.logout()
      this.token = null
      this.user = null
      localStorage.removeItem('token')
    }
  }
})
```

---

## API Service Layer

### services/api.js (Base Configuration)

```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Handle 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

### services/chat.js (Example)

```javascript
import api from './api'

export const chatService = {
  async sendMessage(message, conversationHistory = []) {
    const response = await api.post('/chat', {
      message,
      conversationHistory
    })
    return response.data
  },

  async checkConnection() {
    const response = await api.get('/chat/status')
    return response.data
  }
}
```

---

## View Components

### 1. Dashboard.vue

**Purpose:** Main landing page dengan financial summary

**Key Features:**
- Total balance display (income - expense)
- Quick stats: monthly income, expense, balance
- Recent transactions list
- Budget status overview
- Quick actions (add transaction, view reports)

**Data Fetched:**
- Transaction summary (current month)
- Recent transactions (last 10)
- Category budget status

### 2. Transactions.vue

**Purpose:** Transaction list dengan CRUD operations

**Key Features:**
- Filterable transaction list (by date, type, category)
- Pagination (50 per page)
- Add new transaction modal
- Edit transaction modal
- Delete confirmation
- Search functionality

**Data Managed:**
- Transactions array
- Categories for dropdown
- Filter state (dates, type, category)
- Pagination state (offset, limit)

### 3. Categories.vue

**Purpose:** Category management

**Key Features:**
- Category cards dengan color, icon, emoji
- Transaction count per category
- Budget display and progress bar
- Add category modal
- Edit category modal
- Delete confirmation (warns about uncategorized transactions)

**Data Managed:**
- Categories array dengan transaction_count
- Selected category for editing
- Form state for add/edit

### 4. Reports.vue

**Purpose:** Analytics dan visualizations

**Key Features:**
- Income vs Expense chart (bar/line)
- Category breakdown (pie/donut chart)
- Date range selector
- Budget tracking overview
- Export data (CSV) - future feature

**Data Fetched:**
- Transaction summary for period
- Transactions grouped by category
- Budget vs actual per category

### 5. Settings.vue

**Purpose:** User profile and app settings

**Key Features:**
- Profile information (name, email, avatar)
- Change password
- Dark mode toggle
- Account deletion
- Logout button

**Data Managed:**
- User profile from auth store
- Form state for updates
- Dark mode preference

---

## Reusable Components

### ChatBox.vue

**Full Component:** (See previous documentation for complete code)

**Key Features:**
- Floating chat button (bottom-right)
- Expandable chat window (350x500px)
- Message history with user/bot distinction
- Loading indicator while AI thinks
- Conversation context maintained in session
- Auto-scroll to bottom
- Dark mode support

**Props:** None (uses internal state)

**State:**
```javascript
{
  isOpen: false,              // Chat window visibility
  inputMessage: '',           // Current input
  messages: []                // Chat history
}
```

**Message Format:**
```javascript
{
  type: 'user' | 'bot',
  text: 'Message content',
  time: '14:30',
  isLoading: false            // For loading messages
}
```

### ScanReceipt.vue

**Purpose:** OCR receipt scanning (future enhancement)

**Key Features:**
- Camera interface
- Photo capture
- Tesseract.js OCR processing
- Receipt text parsing
- Auto-fill transaction form

**Status:** Frontend implemented, backend integration pending

---

## Data Files

### data/categoryIcons.js

Maps category names to Font Awesome icon names:

```javascript
export const categoryIcons = {
  'Makanan & Minuman': 'utensils',
  'Transportasi': 'car',
  'Rumah & Tagihan': 'home',
  // ... etc
}
```

### data/categoryEmojis.js

Maps category names to emoji characters:

```javascript
export const categoryEmojis = {
  'Makanan & Minuman': '🍔',
  'Transportasi': '🚗',
  'Rumah & Tagihan': '🏠',
  // ... etc
}
```

---

## Styling Approach

### Design System Variables

**Colors:**
```css
--primary: #667eea;           /* Indigo */
--secondary: #764ba2;         /* Purple */
--gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--text-dark: #1f2937;
--text-light: #f3f4f6;
--background-light: #ffffff;
--background-dark: #1e1e2d;
```

**Typography:**
```css
font-family: 'Inter', sans-serif;
--text-xs: 0.75rem;           /* 12px */
--text-sm: 0.875rem;          /* 14px */
--text-base: 1rem;            /* 16px */
--text-lg: 1.125rem;          /* 18px */
```

**Spacing:**
```css
--spacing-1: 0.25rem;         /* 4px */
--spacing-2: 0.5rem;          /* 8px */
--spacing-3: 0.75rem;         /* 12px */
--spacing-4: 1rem;            /* 16px */
```

### Component Styling

**Convention:** Scoped styles in each `.vue` file

```vue
<style scoped>
.component-class {
  /* Component-specific styles */
}
</style>
```

**Dark Mode:**
```css
.dark .component-class {
  /* Dark mode overrides */
}
```

---

## Responsive Design

**Breakpoints:**
```css
/* Mobile: default styles */
/* Tablet: 768px and up */
@media (min-width: 768px) { }
/* Desktop: 1024px and up */
@media (min-width: 1024px) { }
```

**Mobile-First Approach:**
- Base styles for mobile
- Progressive enhancement for larger screens
- Touch-friendly interface (44px minimum touch targets)
- Simplified layouts on small screens

---

## Performance Optimizations

### Code Splitting
```javascript
// Lazy-loaded routes
component: () => import('../views/Dashboard.vue')
```

### Computed Values
```javascript
// Memoized calculations
const totalBalance = computed(() => {
  return income.value - expense.value
})
```

### Debounced Inputs
```javascript
// Debounce search input
const debouncedSearch = debounce((query) => {
  searchTransactions(query)
}, 300)
```

---

## Environment Variables

### .env files

```bash
# .env.development
VITE_API_URL=http://localhost:3000/api

# .env.production
VITE_API_URL=https://api.mymo.app/api
```

**Access in Code:**
```javascript
const apiUrl = import.meta.env.VITE_API_URL
```

---

## Build Configuration

### vite.config.js

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['axios']
        }
      }
    }
  }
})
```

---

## Development Workflow

### Local Development
```bash
npm run dev
# Runs Vite dev server on http://localhost:5173
# Hot Module Replacement enabled
# API proxy to backend:3000
```

### Production Build
```bash
npm run build
# Creates optimized bundle in dist/
# Minified JS and CSS
# Code splitting applied
# Static assets hashed
```

### Preview Production Build
```bash
npm run preview
# Preview production build locally
# Tests build output before deployment
```

---

## Error Handling

### API Error Handling
```javascript
try {
  const response = await api.post('/transactions', data)
  // Success handling
} catch (error) {
  if (error.response) {
    // Server responded with error
    console.error(error.response.data.error)
    showErrorMessage(error.response.data.error)
  } else if (error.request) {
    // No response received
    showErrorMessage('Server tidak dapat dijangkau')
  } else {
    // Request setup error
    showErrorMessage('Terjadi kesalahan')
  }
}
```

### Global Error Handler
```javascript
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err)
  console.error('Error info:', info)
}
```

---

## Testing Strategy (Future)

### Unit Tests
- Component logic testing with Vitest
- Store testing with Pinia Testing
- Service layer mocking

### Integration Tests
- User flow testing with Cypress
- API integration testing
- Router navigation testing

### E2E Tests
- Critical path testing
- Authentication flow
- Transaction CRUD operations
