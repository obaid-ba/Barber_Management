<template>
  <DashboardLayout title="Mes rendez-vous">
    <div class="page-header">
      <div>
        <h2>Mes rendez-vous</h2>
        <p class="subtitle">Suivez l'état de vos demandes.</p>
      </div>
      <RouterLink to="/book" class="btn btn-primary">+ Nouvelle réservation</RouterLink>
    </div>

    <div v-if="loading" class="empty-state">Chargement...</div>

    <div v-else-if="appointments.length === 0" class="card">
      <div class="empty-state">
        Vous n'avez aucun rendez-vous pour le moment.<br />
        <RouterLink to="/book">Réservez votre première séance</RouterLink>.
      </div>
    </div>

    <div v-else class="appt-grid">
      <div v-for="a in appointments" :key="a._id" class="appt-card card">
        <div class="appt-top">
          <span class="appt-service">{{ a.service || 'Service' }}</span>
          <span class="badge" :class="statusClass(a.status)">{{ statusLabel(a.status) }}</span>
        </div>
        <div class="appt-date">
          <span class="appt-day">{{ formatDate(a.appointmentDate) }}</span>
          <span class="appt-time">{{ a.appointmentTime }}</span>
        </div>
        <p v-if="a.message" class="appt-note">« {{ a.message }} »</p>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import DashboardLayout from '@/components/DashboardLayout.vue'
import { apiService } from '@/services/api'

const appointments = ref([])
const loading = ref(true)

const formatDate = (d) =>
  new Date(d).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

const statusClass = (s) => {
  const v = (s || '').toLowerCase()
  if (v === 'confirmed') return 'confirmed'
  if (v === 'cancelled') return 'cancelled'
  return 'pending'
}

const statusLabel = (s) => {
  const map = { Pending: 'En attente', Confirmed: 'Confirmé', Cancelled: 'Annulé' }
  return map[s] || s
}

const fetch = async () => {
  loading.value = true
  try {
    const data = await apiService.getMyAppointments()
    appointments.value = data.appointments || []
  } catch (e) {
    console.error('Error fetching my appointments:', e)
  } finally {
    loading.value = false
  }
}

onMounted(fetch)
</script>

<style scoped>
.appt-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 18px;
}

.appt-card {
  padding: 20px;
}

.appt-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.appt-service {
  font-weight: 600;
  font-size: 16px;
  color: var(--gold-2);
}

.appt-date {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.appt-day {
  font-size: 15px;
  text-transform: capitalize;
}

.appt-time {
  font-size: 20px;
  font-weight: 700;
  font-family: var(--font-serif);
  color: var(--text);
}

.appt-note {
  margin-top: 12px;
  color: var(--text-muted);
  font-size: 13px;
  font-style: italic;
}
</style>
