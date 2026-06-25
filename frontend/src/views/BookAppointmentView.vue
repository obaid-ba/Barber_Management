<template>
  <DashboardLayout title="Réserver un rendez-vous">
    <div class="book-wrap">
      <div class="card">
        <h2 class="card-title">Prenez rendez-vous</h2>
        <p class="subtitle" style="margin-bottom: 22px">
          Choisissez une prestation, une date et un horaire. Votre demande sera confirmée par le salon.
        </p>

        <form @submit.prevent="submit">
          <div class="form-group">
            <label>Service</label>
            <select v-model="form.service" required>
              <option value="" disabled>Choisir une prestation</option>
              <option v-for="s in services" :key="s._id" :value="s.name">
                {{ s.name }} — {{ s.price }}€ · {{ s.duration }} min
              </option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Date</label>
              <input v-model="form.appointmentDate" type="date" :min="today" required />
            </div>
            <div class="form-group">
              <label>Heure</label>
              <input v-model="form.appointmentTime" type="time" required />
            </div>
          </div>

          <div class="form-group">
            <label>Message (optionnel)</label>
            <textarea v-model="form.message" rows="3" placeholder="Une précision pour le coiffeur ?"></textarea>
          </div>

          <p v-if="error" class="error-text">{{ error }}</p>
          <p v-if="success" class="success-text">{{ success }}</p>

          <button type="submit" class="btn btn-primary btn-block" :disabled="saving">
            {{ saving ? 'Envoi...' : 'Confirmer la demande' }}
          </button>
        </form>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/components/DashboardLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { apiService } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

const services = ref([])
const saving = ref(false)
const error = ref('')
const success = ref('')
const today = new Date().toISOString().split('T')[0]

const form = ref({
  appointmentDate: '',
  appointmentTime: '',
  service: '',
  message: '',
})

const fetchServices = async () => {
  try {
    const data = await apiService.getServices()
    services.value = data.services || []
  } catch (e) {
    console.error('Error fetching services:', e)
  }
}

const submit = async () => {
  error.value = ''
  success.value = ''
  saving.value = true
  try {
    const u = authStore.user || {}
    const payload = {
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      email: u.email || '',
      phone: u.phone || '',
      ...form.value,
    }
    const data = await apiService.createAppointment(payload)
    if (data.appointment) {
      success.value = 'Votre demande a bien été envoyée ✓ Redirection...'
      setTimeout(() => router.push('/my-appointments'), 1200)
    } else {
      error.value = data.message || 'Impossible de créer le rendez-vous'
    }
  } catch (e) {
    console.error('Error booking:', e)
    error.value = 'Erreur de connexion'
  } finally {
    saving.value = false
  }
}

onMounted(fetchServices)
</script>

<style scoped>
.book-wrap {
  max-width: 560px;
}
</style>
