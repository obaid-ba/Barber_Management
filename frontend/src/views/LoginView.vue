<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-brand">
        <span class="brand-mark">✂</span>
        <h1>BarberShop</h1>
        <p class="auth-tagline">Votre salon, en un clic</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" placeholder="vous@exemple.com" required />
        </div>
        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input id="password" v-model="password" type="password" placeholder="••••••••" required />
        </div>
        <button type="submit" class="btn btn-primary btn-block">Se connecter</button>
        <p v-if="error" class="error-text" style="text-align: center">{{ error }}</p>
      </form>

      <p class="auth-switch">
        Pas encore de compte ?
        <router-link to="/signup">Créer un compte</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = 'Veuillez remplir tous les champs'
    return
  }
  const result = await authStore.login(email.value, password.value)
  if (result.success) {
    router.push(authStore.isClient ? '/home' : '/dashboard')
  } else {
    error.value = result.message || 'Email ou mot de passe invalide'
  }
}
</script>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background:
    radial-gradient(circle at 20% 20%, rgba(200, 162, 76, 0.08), transparent 40%),
    radial-gradient(circle at 80% 80%, rgba(200, 162, 76, 0.06), transparent 40%),
    var(--bg);
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius);
  padding: 40px 34px;
  box-shadow: var(--shadow);
}

.auth-brand {
  text-align: center;
  margin-bottom: 30px;
}

.brand-mark {
  display: inline-grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  font-size: 28px;
  background: linear-gradient(135deg, var(--gold) 0%, var(--gold-2) 100%);
  color: #1a1408;
  margin-bottom: 14px;
}

.auth-brand h1 {
  font-size: 28px;
}

.auth-tagline {
  color: var(--text-muted);
  font-size: 13px;
  margin-top: 4px;
}

.btn-block {
  margin-top: 6px;
}

.auth-switch {
  text-align: center;
  margin-top: 22px;
  color: var(--text-muted);
  font-size: 14px;
}
</style>
