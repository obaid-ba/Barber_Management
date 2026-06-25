<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-brand">
        <span class="brand-mark">✂</span>
        <h1>Créer un compte</h1>
        <p class="auth-tagline">Rejoignez le salon en quelques secondes</p>
      </div>

      <form @submit.prevent="handleSignup">
        <div class="form-row">
          <div class="form-group">
            <label for="firstName">Prénom</label>
            <input id="firstName" v-model="firstName" type="text" placeholder="Prénom" required />
          </div>
          <div class="form-group">
            <label for="lastName">Nom</label>
            <input id="lastName" v-model="lastName" type="text" placeholder="Nom" required />
          </div>
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" placeholder="vous@exemple.com" required />
        </div>
        <div class="form-group">
          <label for="phone">Téléphone</label>
          <input id="phone" v-model="phone" type="tel" placeholder="0600000000" required />
        </div>
        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input id="password" v-model="password" type="password" placeholder="••••••••" required />
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirmer le mot de passe</label>
          <input id="confirmPassword" v-model="confirmPassword" type="password" placeholder="••••••••" required />
        </div>
        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          {{ loading ? 'Création...' : "S'inscrire" }}
        </button>
        <p v-if="error" class="error-text" style="text-align: center">{{ error }}</p>
      </form>

      <p class="auth-switch">
        Vous avez déjà un compte ?
        <router-link to="/login">Se connecter</router-link>
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

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

const handleSignup = async () => {
  error.value = ''

  if (!firstName.value || !lastName.value || !email.value || !phone.value || !password.value) {
    error.value = 'Veuillez remplir tous les champs'
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = 'Les mots de passe ne correspondent pas'
    return
  }

  loading.value = true
  const result = await authStore.signup({
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
    phone: phone.value,
    pwd: password.value,
  })
  loading.value = false

  if (result.success) {
    // New accounts are clients by default.
    router.push(authStore.isClient ? '/home' : '/dashboard')
  } else {
    error.value = result.message || "Erreur lors de l'inscription"
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
  max-width: 440px;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius);
  padding: 38px 34px;
  box-shadow: var(--shadow);
}

.auth-brand {
  text-align: center;
  margin-bottom: 26px;
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
  font-size: 26px;
}

.auth-tagline {
  color: var(--text-muted);
  font-size: 13px;
  margin-top: 4px;
}

.auth-switch {
  text-align: center;
  margin-top: 22px;
  color: var(--text-muted);
  font-size: 14px;
}
</style>
