<template>
  <DashboardLayout title="Mon profil">
    <div class="profile-wrap">
      <div class="card">
        <h2 class="card-title">Mes informations</h2>

        <form @submit.prevent="save">
          <div class="form-row">
            <div class="form-group">
              <label>Prénom</label>
              <input v-model="form.firstName" required />
            </div>
            <div class="form-group">
              <label>Nom</label>
              <input v-model="form.lastName" required />
            </div>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="form.email" type="email" required />
          </div>
          <div class="form-group">
            <label>Téléphone</label>
            <input v-model="form.phone" />
          </div>

          <hr class="divider" />
          <h3 class="card-title" style="font-size: 16px">Changer le mot de passe</h3>
          <div class="form-group">
            <label>Nouveau mot de passe (optionnel)</label>
            <input v-model="form.pwd" type="password" placeholder="Laisser vide pour conserver" />
          </div>

          <p v-if="error" class="error-text">{{ error }}</p>
          <p v-if="success" class="success-text">{{ success }}</p>

          <div class="modal-actions" style="justify-content: flex-start">
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DashboardLayout from '@/components/DashboardLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { apiService } from '@/services/api'

const authStore = useAuthStore()
const saving = ref(false)
const error = ref('')
const success = ref('')

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  pwd: '',
})

const load = async () => {
  try {
    const data = await apiService.getMe()
    if (data.user) {
      form.value = {
        firstName: data.user.firstName || '',
        lastName: data.user.lastName || '',
        email: data.user.email || '',
        phone: data.user.phone || '',
        pwd: '',
      }
    }
  } catch (e) {
    console.error('Error loading profile:', e)
  }
}

const save = async () => {
  error.value = ''
  success.value = ''
  saving.value = true
  try {
    const data = await apiService.updateMe(form.value)
    if (data.user) {
      success.value = 'Profil mis à jour ✓'
      form.value.pwd = ''
      // Keep the cached user (name/email shown in the sidebar) in sync.
      authStore.setUser({
        ...authStore.user,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email,
      })
    } else {
      error.value = data.message || 'Impossible de mettre à jour le profil'
    }
  } catch (e) {
    console.error('Error saving profile:', e)
    error.value = 'Erreur de connexion'
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.profile-wrap {
  max-width: 560px;
}

.divider {
  border: none;
  border-top: 1px solid var(--border);
  margin: 24px 0 20px;
}
</style>
