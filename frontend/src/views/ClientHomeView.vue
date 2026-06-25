<template>
  <DashboardLayout title="Accueil">
    <section class="hero card">
      <div class="hero-content">
        <span class="hero-kicker">✂ BarberShop</span>
        <h2>Bonjour {{ firstName }}, prêt pour une nouvelle coupe ?</h2>
        <p class="subtitle">
          Réservez en quelques secondes et suivez vos rendez-vous depuis votre espace.
        </p>
        <div class="hero-actions">
          <RouterLink to="/book" class="btn btn-primary">Réserver maintenant</RouterLink>
          <RouterLink to="/services" class="btn btn-ghost">Voir les tarifs</RouterLink>
        </div>
      </div>
    </section>

    <div class="cols">
      <div class="card">
        <h3 class="card-title">Prochain rendez-vous</h3>
        <div v-if="loading" class="empty-state">Chargement...</div>
        <div v-else-if="nextAppt" class="next-appt">
          <div class="next-line">
            <span class="next-service">{{ nextAppt.service || 'Service' }}</span>
            <span class="badge" :class="statusClass(nextAppt.status)">{{ statusLabel(nextAppt.status) }}</span>
          </div>
          <p class="next-date">{{ formatDate(nextAppt.appointmentDate) }} à {{ nextAppt.appointmentTime }}</p>
          <RouterLink to="/my-appointments" class="btn btn-secondary btn-sm" style="margin-top: 8px">
            Voir tous mes rendez-vous
          </RouterLink>
        </div>
        <div v-else class="empty-state" style="padding: 24px 0">
          Aucun rendez-vous à venir.<br />
          <RouterLink to="/book">Réservez dès maintenant</RouterLink>.
        </div>
      </div>

      <div class="card">
        <h3 class="card-title">Nos prestations</h3>
        <ul class="svc-list">
          <li v-for="s in services.slice(0, 5)" :key="s._id">
            <span>{{ s.name }}</span>
            <span class="svc-price">{{ s.price }}€</span>
          </li>
          <li v-if="services.length === 0" class="empty-state" style="padding: 10px 0">
            Bientôt disponible.
          </li>
        </ul>
        <RouterLink to="/services" class="btn btn-ghost btn-sm btn-block" style="margin-top: 12px">
          Voir tous les services
        </RouterLink>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import DashboardLayout from '@/components/DashboardLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { apiService } from '@/services/api'

const authStore = useAuthStore()
const appointments = ref([])
const services = ref([])
const loading = ref(true)

const firstName = computed(() => authStore.user?.firstName || '')

const nextAppt = computed(() => {
  const now = new Date()
  return (
    appointments.value
      .filter((a) => a.status !== 'Cancelled' && new Date(a.appointmentDate) >= new Date(now.toDateString()))
      .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))[0] || null
  )
})

const formatDate = (d) =>
  new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

const statusClass = (s) => {
  const v = (s || '').toLowerCase()
  if (v === 'confirmed') return 'confirmed'
  if (v === 'cancelled') return 'cancelled'
  return 'pending'
}
const statusLabel = (s) => ({ Pending: 'En attente', Confirmed: 'Confirmé', Cancelled: 'Annulé' }[s] || s)

onMounted(async () => {
  try {
    const [appts, svc] = await Promise.all([
      apiService.getMyAppointments(),
      apiService.getServices(),
    ])
    appointments.value = appts.appointments || []
    services.value = svc.services || []
  } catch (e) {
    console.error('Error loading home:', e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.hero {
  background:
    linear-gradient(120deg, rgba(200, 162, 76, 0.12), rgba(28, 31, 38, 0.2)),
    var(--surface);
  border-color: var(--border-strong);
  margin-bottom: 22px;
  padding: 36px;
}

.hero-kicker {
  display: inline-block;
  color: var(--gold);
  font-weight: 600;
  letter-spacing: 1px;
  font-size: 13px;
  margin-bottom: 10px;
}

.hero h2 {
  font-size: 28px;
  max-width: 600px;
  margin-bottom: 10px;
}

.hero-actions {
  display: flex;
  gap: 12px;
  margin-top: 22px;
  flex-wrap: wrap;
}

.cols {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 20px;
}

.next-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.next-service {
  font-size: 17px;
  font-weight: 600;
  color: var(--gold-2);
}

.next-date {
  color: var(--text);
  text-transform: capitalize;
  font-size: 15px;
}

.svc-list {
  list-style: none;
}

.svc-list li {
  display: flex;
  justify-content: space-between;
  padding: 11px 0;
  border-bottom: 1px solid var(--border);
  font-size: 14.5px;
}

.svc-list li:last-child {
  border-bottom: none;
}

.svc-price {
  color: var(--gold-2);
  font-weight: 600;
}

@media (max-width: 800px) {
  .cols {
    grid-template-columns: 1fr;
  }
  .hero {
    padding: 26px;
  }
  .hero h2 {
    font-size: 22px;
  }
}
</style>
