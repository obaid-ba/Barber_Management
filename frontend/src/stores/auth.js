import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)
  const token = ref(localStorage.getItem('token') || '')
  const isAuthenticated = ref(!!localStorage.getItem('token'))

  const userEmail = computed(() => user.value?.email || '')
  const userName = computed(() =>
    user.value ? `${user.value.firstName || ''} ${user.value.lastName || ''}`.trim() : '',
  )
  const role = computed(() => user.value?.role || 'client')
  const isClient = computed(() => role.value === 'client')
  const isStaff = computed(() => role.value === 'admin' || role.value === 'barber')

  // Keep the stored user in sync (e.g. after a profile update).
  const setUser = (newUser) => {
    user.value = newUser
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  const login = async (email, pwd) => {
    try {
      const data = await apiService.login({ email, pwd })
      if (data.token) {
        user.value = data.user
        token.value = data.token
        isAuthenticated.value = true
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('token', data.token)
        return { success: true }
      }
      return { success: false, message: data.message }
    } catch {
      return { success: false, message: 'Erreur de connexion' }
    }
  }

  const signup = async (userData) => {
    try {
      const data = await apiService.signup(userData)
      if (data.token) {
        user.value = data.user
        token.value = data.token
        isAuthenticated.value = true
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('token', data.token)
        return { success: true }
      }
      return { success: false, message: data.message }
    } catch {
      return { success: false, message: 'Erreur de connexion' }
    }
  }

  const logout = () => {
    user.value = null
    token.value = ''
    isAuthenticated.value = false
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  return {
    user,
    token,
    isAuthenticated,
    userEmail,
    userName,
    role,
    isClient,
    isStaff,
    setUser,
    login,
    signup,
    logout
  }
})
