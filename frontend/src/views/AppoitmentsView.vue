<template>
  <DashboardLayout title="Rendez-vous">
    <div class="page-header">
      <div>
        <h2>Gestion des rendez-vous</h2>
        <p class="subtitle">Traitez les demandes et consultez le calendrier.</p>
      </div>
      <button class="btn btn-primary" @click="openModal">+ Ajouter un rendez-vous</button>
    </div>

    <!-- Modal: add appointment -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <h3>Ajouter un rendez-vous</h3>
        <form @submit.prevent="addAppointment">
          <div class="form-row">
            <div class="form-group">
              <label>Prénom</label>
              <input v-model="newAppointment.firstName" required placeholder="Prénom" />
            </div>
            <div class="form-group">
              <label>Nom</label>
              <input v-model="newAppointment.lastName" required placeholder="Nom" />
            </div>
          </div>
          <div class="form-group">
            <label>Téléphone</label>
            <input v-model="newAppointment.phone" required placeholder="0600000000" />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="newAppointment.email" type="email" required placeholder="exemple@gmail.com" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Date</label>
              <input v-model="newAppointment.appointmentDate" type="date" required />
            </div>
            <div class="form-group">
              <label>Heure</label>
              <select
                v-model="newAppointment.appointmentTime"
                required
                :disabled="!newAppointment.appointmentDate || loadingSlots"
              >
                <option value="" disabled>{{ slotPlaceholder }}</option>
                <option v-for="s in availableSlots" :key="s.time" :value="s.time">
                  {{ s.time }} — {{ s.capacity - s.booked }} place(s) restante(s)
                </option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Service</label>
            <select v-model="newAppointment.service" required>
              <option value="" disabled>Choisir un service</option>
              <option v-for="service in services" :key="service._id" :value="service.name">
                {{ service.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Message (optionnel)</label>
            <textarea v-model="newAppointment.message" rows="2" placeholder="Notes..."></textarea>
          </div>
          <p v-if="error" class="error-text">{{ error }}</p>
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn btn-secondary">Annuler</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Création...' : 'Ajouter' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <PendingAppointmentsList />

    <div class="section-title">
      <h2>Calendrier des rendez-vous confirmés</h2>
    </div>

    <WeeklyCalendar />
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import DashboardLayout from '@/components/DashboardLayout.vue'
import { useAppointmentsStore } from '@/stores/appointments'
import { apiService } from '@/services/api'
import PendingAppointmentsList from '@/components/PendingAppointmentsList.vue'
import WeeklyCalendar from '@/components/WeeklyCalendar.vue'

const appointmentsStore = useAppointmentsStore()

const services = ref([])
const showModal = ref(false)
const saving = ref(false)
const error = ref('')

const availableSlots = ref([]) // only slots that still have room, for the chosen date
const loadingSlots = ref(false)

const emptyAppointment = () => ({
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  appointmentDate: '',
  appointmentTime: '',
  service: '',
  message: '',
})
const newAppointment = ref(emptyAppointment())

const slotPlaceholder = computed(() => {
  if (!newAppointment.value.appointmentDate) return "Choisissez d'abord une date"
  if (loadingSlots.value) return 'Chargement des créneaux...'
  if (availableSlots.value.length === 0) return 'Aucun créneau disponible ce jour'
  return 'Choisir un horaire'
})

// Loads the free slots for the selected date and keeps only the available ones.
const fetchAvailability = async () => {
  newAppointment.value.appointmentTime = '' // reset selection when the date changes
  availableSlots.value = []
  if (!newAppointment.value.appointmentDate) return
  loadingSlots.value = true
  try {
    const data = await apiService.getAvailability(newAppointment.value.appointmentDate)
    availableSlots.value = (data.slots || []).filter((s) => s.available)
  } catch (e) {
    console.error('Error fetching availability:', e)
  } finally {
    loadingSlots.value = false
  }
}

watch(() => newAppointment.value.appointmentDate, fetchAvailability)

const fetchServices = async () => {
  try {
    const data = await apiService.getServices()
    if (data.services) {
      services.value = data.services
    }
  } catch (err) {
    console.error('Error fetching services:', err)
  }
}

const openModal = () => {
  error.value = ''
  newAppointment.value = emptyAppointment()
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  error.value = ''
}

const addAppointment = async () => {
  error.value = ''
  saving.value = true
  try {
    const data = await apiService.createAppointment(newAppointment.value)
    if (data.appointment) {
      closeModal()
      await appointmentsStore.fetchAppointments()
    } else {
      error.value = data.message || 'Erreur lors de la création du rendez-vous'
      await fetchAvailability() // slot may have filled up — refresh the list
    }
  } catch (err) {
    console.error('Error creating appointment:', err)
    error.value = 'Erreur de connexion'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  appointmentsStore.fetchAppointments()
  fetchServices()
})
</script>

<style scoped>
.section-title {
  margin: 28px 0 18px;
}

.section-title h2 {
  font-size: 20px;
}
</style>
