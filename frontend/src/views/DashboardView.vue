<template>
  <DashboardLayout title="Tableau de bord">
    <div class="stats-grid">
      <div class="stat-card card">
        <span class="stat-icon">📅</span>
        <h3>Rendez-vous aujourd'hui</h3>
        <p class="stat-number">{{ stats.todayCount }}</p>
        <p class="stat-detail">Confirmés aujourd'hui</p>
      </div>

      <div class="stat-card card">
        <span class="stat-icon">⏳</span>
        <h3>En attente</h3>
        <p class="stat-number">{{ stats.pendingCount }}</p>
        <p class="stat-detail">Demandes à traiter</p>
      </div>

      <div class="stat-card card">
        <span class="stat-icon">💶</span>
        <h3>Revenu aujourd'hui</h3>
        <p class="stat-number">{{ stats.todayRevenue }}€</p>
        <p class="stat-detail">{{ stats.todayCount }} rendez-vous confirmés</p>
      </div>

      <div class="stat-card card">
        <span class="stat-icon">✅</span>
        <h3>Taux de confirmation</h3>
        <p class="stat-number">{{ stats.confirmationRate }}%</p>
        <p class="stat-detail">{{ stats.totalConfirmed }} sur {{ stats.totalRequests }} demandes</p>
      </div>
    </div>

    <div class="card">
      <h2 class="card-title">Rendez-vous récents</h2>
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Heure</th>
              <th>Client</th>
              <th>Service</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            <AppointmentRow
              v-for="appointment in appointments"
              :key="appointment._id"
              :appointment="{
                time: appointment.appointmentTime,
                client: appointment.firstName + ' ' + appointment.lastName,
                service: appointment.service || 'Service',
                status: appointment.status.toLowerCase(),
                statusLabel: appointment.status,
              }"
            />
            <tr v-if="appointments.length === 0">
              <td colspan="4" class="empty-cell">Aucun rendez-vous récent</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import DashboardLayout from '@/components/DashboardLayout.vue'
import { useAppointmentsStore } from '@/stores/appointments'
import { apiService } from '@/services/api'
import AppointmentRow from '@/components/AppointmentRow.vue'

const appointmentsStore = useAppointmentsStore()

// Appointments store the service name, so look up the price from the services list.
const servicePrices = ref({})
const priceOf = (serviceName) => servicePrices.value[serviceName] || 0

const fetchServices = async () => {
  try {
    const data = await apiService.getServices()
    if (data.services) {
      servicePrices.value = Object.fromEntries(
        data.services.map((s) => [s.name, Number(s.price) || 0]),
      )
    }
  } catch (error) {
    console.error('Error fetching services:', error)
  }
}

const appointments = computed(() => {
  return [...appointmentsStore.pendingAppointments, ...appointmentsStore.confirmedAppointments]
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
    .slice(0, 5)
})

const stats = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  const todayAppts = appointmentsStore.confirmedAppointments.filter((a) => {
    const aDate = new Date(a.appointmentDate).toISOString().split('T')[0]
    return aDate === today
  })

  const monthlyAppts = appointmentsStore.confirmedAppointments.filter((a) => {
    const aDate = new Date(a.appointmentDate)
    const now = new Date()
    return aDate.getMonth() === now.getMonth() && aDate.getFullYear() === now.getFullYear()
  })

  const totalRevenue = monthlyAppts.reduce((acc, curr) => acc + priceOf(curr.service), 0)
  const todayRevenue = todayAppts.reduce((acc, curr) => acc + priceOf(curr.service), 0)

  const totalRequests =
    appointmentsStore.pendingAppointments.length + appointmentsStore.confirmedAppointments.length
  const confirmationRate =
    totalRequests > 0
      ? Math.round((appointmentsStore.confirmedAppointments.length / totalRequests) * 100)
      : 0

  return {
    todayCount: todayAppts.length,
    pendingCount: appointmentsStore.pendingAppointments.length,
    todayRevenue,
    monthlyRevenue: totalRevenue,
    confirmationRate,
    totalConfirmed: appointmentsStore.confirmedAppointments.length,
    totalRequests,
  }
})

onMounted(() => {
  appointmentsStore.fetchAppointments()
  fetchServices()
})
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
  margin-bottom: 24px;
}

.stat-card {
  position: relative;
  overflow: hidden;
}

.stat-icon {
  position: absolute;
  top: 18px;
  right: 18px;
  font-size: 22px;
  opacity: 0.55;
}

.stat-card h3 {
  font-family: var(--font-sans);
  margin-bottom: 12px;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 600;
}

.stat-number {
  font-size: 34px;
  font-weight: 700;
  font-family: var(--font-serif);
  color: var(--gold-2);
  margin-bottom: 6px;
}

.stat-detail {
  font-size: 12px;
  color: var(--text-faint);
}

.table-scroll {
  overflow-x: auto;
}

.empty-cell {
  text-align: center;
  color: var(--text-faint);
  padding: 32px !important;
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
