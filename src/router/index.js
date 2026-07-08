import { createRouter, createWebHashHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Transactions from '../views/Transactions.vue'
import Wallets from '../views/Wallets.vue'
import Categories from '../views/Categories.vue'
import Reports from '../views/Reports.vue'
import Settings from '../views/Settings.vue'
import Onboarding from '../views/Onboarding.vue'
import { authService } from '../services/auth'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/onboarding',
      name: 'Onboarding',
      component: Onboarding,
      meta: { requiresAuth: true, skipOnboardingCheck: true }
    },
    {
      path: '/',
      name: 'Dashboard',
      component: Dashboard,
      meta: { requiresAuth: true }
    },
    {
      path: '/transaksi',
      name: 'Transactions',
      component: Transactions,
      meta: { requiresAuth: true }
    },
    {
      path: '/dompet',
      name: 'Wallets',
      component: Wallets,
      meta: { requiresAuth: true }
    },
    {
      path: '/kategori',
      name: 'Categories',
      component: Categories,
      meta: { requiresAuth: true }
    },
    {
      path: '/laporan',
      name: 'Reports',
      component: Reports,
      meta: { requiresAuth: true }
    },
    {
      path: '/pengaturan',
      name: 'Settings',
      component: Settings,
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = authService.isAuthenticated()
  const onboardingCompleted = authService.isOnboardingCompleted()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const skipOnboardingCheck = to.matched.some(record => record.meta.skipOnboardingCheck)

  if (requiresAuth && !isAuthenticated) {
    window.location.href = '/login.html'
    return
  }

  if (isAuthenticated && !onboardingCompleted && !skipOnboardingCheck) {
    next('/onboarding')
    return
  }

  if (to.path === '/onboarding' && onboardingCompleted) {
    next('/')
    return
  }

  next()
})

export default router
