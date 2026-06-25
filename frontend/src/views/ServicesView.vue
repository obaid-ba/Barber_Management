<template>
  <DashboardLayout :title="isStaff ? 'Services' : 'Services & tarifs'">
    <div class="page-header">
      <div>
        <h2>{{ isStaff ? 'Gestion des services' : 'Nos prestations' }}</h2>
        <p class="subtitle">
          {{ isStaff ? 'Ajoutez et modifiez les prestations du salon.' : 'Découvrez nos prestations et nos tarifs.' }}
        </p>
      </div>
      <button v-if="isStaff" class="btn btn-primary" @click="showModal = true">+ Nouveau service</button>
      <RouterLink v-else to="/book" class="btn btn-primary">Réserver</RouterLink>
    </div>

    <!-- Modal (staff only) -->
    <div v-if="showModal && isStaff" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>{{ isEditing ? 'Modifier' : 'Ajouter' }} un service</h3>
        <form @submit.prevent="addService">
          <div class="form-group">
            <label>Nom du service</label>
            <input v-model="newService.name" required placeholder="Ex: Coupe homme" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Prix (€)</label>
              <input v-model.number="newService.price" type="number" required />
            </div>
            <div class="form-group">
              <label>Durée (min)</label>
              <input v-model.number="newService.duration" type="number" required />
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn btn-secondary">Annuler</button>
            <button type="submit" class="btn btn-primary">{{ isEditing ? 'Enregistrer' : 'Ajouter' }}</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="services.length === 0" class="card">
      <div class="empty-state">Aucun service disponible pour le moment.</div>
    </div>

    <div v-else class="services-grid">
      <div class="service-card card" v-for="service in services" :key="service._id">
        <div class="service-header">
          <h3>{{ service.name }}</h3>
          <span class="price-tag">{{ service.price }}€</span>
        </div>
        <p class="duration">⏱️ {{ service.duration }} min</p>
        <div v-if="isStaff" class="card-actions">
          <button class="btn btn-secondary btn-sm" @click="openEditModal(service)">Modifier</button>
          <button class="btn btn-danger btn-sm" @click="deleteService(service._id)">Supprimer</button>
        </div>
        <RouterLink v-else to="/book" class="btn btn-ghost btn-sm btn-block">Réserver</RouterLink>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import DashboardLayout from '@/components/DashboardLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { apiService } from '@/services/api'

const authStore = useAuthStore()
const isStaff = computed(() => authStore.isStaff)

const services = ref([])
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const newService = ref({ name: '', price: 30, duration: 30 })

const fetchServices = async () => {
  try {
    const data = await apiService.getServices()
    if (data.services) {
      services.value = data.services
    }
  } catch (error) {
    console.error('Error fetching services:', error)
  }
}

const openEditModal = (service) => {
  isEditing.value = true
  editingId.value = service._id
  newService.value = { name: service.name, price: service.price, duration: service.duration }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  isEditing.value = false
  editingId.value = null
  newService.value = { name: '', price: 30, duration: 30 }
}

const addService = async () => {
  try {
    const data = isEditing.value
      ? await apiService.updateService(editingId.value, newService.value)
      : await apiService.createService(newService.value)
    if (data.service || data.message) {
      closeModal()
      fetchServices()
    }
  } catch (error) {
    console.error('Error saving service:', error)
  }
}

const deleteService = async (id) => {
  if (!confirm('Supprimer ce service ?')) return
  try {
    const data = await apiService.deleteService(id)
    if (data.message) {
      fetchServices()
    }
  } catch (error) {
    console.error('Error deleting service:', error)
  }
}

onMounted(fetchServices)
</script>

<style scoped>
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 18px;
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.service-header h3 {
  font-size: 18px;
}

.price-tag {
  font-family: var(--font-serif);
  font-size: 22px;
  font-weight: 700;
  color: var(--gold-2);
}

.duration {
  color: var(--text-muted);
  font-size: 14px;
  margin-bottom: 16px;
}

.card-actions {
  display: flex;
  gap: 8px;
}
</style>
