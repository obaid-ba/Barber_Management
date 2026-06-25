import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginView from '../views/LoginView.vue'
import SignupView from '../views/SignupView.vue'
import DashboardView from '../views/DashboardView.vue'
import AppointmentsView from '../views/AppoitmentsView.vue'
import ClientsView from '../views/ClientsView.vue'
import ServicesView from '../views/ServicesView.vue'
import SettingsView from '../views/SettingsView.vue'
import ClientHomeView from '../views/ClientHomeView.vue'
import BookAppointmentView from '../views/BookAppointmentView.vue'
import MyAppointmentsView from '../views/MyAppointmentsView.vue'
import ProfileView from '../views/ProfileView.vue'

const STAFF = ['admin', 'barber']
const CLIENT = ['client']

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: LoginView },
    { path: '/signup', name: 'signup', component: SignupView },

    // Staff area
    { path: '/dashboard', name: 'dashboard', component: DashboardView, meta: { roles: STAFF } },
    { path: '/appointments', name: 'appointments', component: AppointmentsView, meta: { roles: STAFF } },
    { path: '/clients', name: 'clients', component: ClientsView, meta: { roles: STAFF } },
    { path: '/settings', name: 'settings', component: SettingsView, meta: { roles: STAFF } },

    // Client area
    { path: '/home', name: 'home', component: ClientHomeView, meta: { roles: CLIENT } },
    { path: '/book', name: 'book', component: BookAppointmentView, meta: { roles: CLIENT } },
    { path: '/my-appointments', name: 'my-appointments', component: MyAppointmentsView, meta: { roles: CLIENT } },
    { path: '/profile', name: 'profile', component: ProfileView, meta: { roles: CLIENT } },

    // Shared (role-aware content inside the view)
    { path: '/services', name: 'services', component: ServicesView, meta: { roles: [...STAFF, ...CLIENT] } },

    { path: '/', redirect: '/dashboard' },
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
  ],
})

// Landing page depends on the role.
const homeFor = (role) => (role === 'client' ? '/home' : '/dashboard')

router.beforeEach((to) => {
  const auth = useAuthStore()
  const isAuthRoute = to.path === '/login' || to.path === '/signup'
  const requiresAuth = Array.isArray(to.meta.roles)

  // Not logged in → only auth pages are allowed.
  if (requiresAuth && !auth.isAuthenticated) {
    return '/login'
  }

  // Already logged in → keep them out of login/signup.
  if (isAuthRoute && auth.isAuthenticated) {
    return homeFor(auth.role)
  }

  // Logged in but wrong role for this page → send to their own home.
  if (requiresAuth && !to.meta.roles.includes(auth.role)) {
    return homeFor(auth.role)
  }

  return true
})

export default router
