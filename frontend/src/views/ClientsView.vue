<template>
  <DashboardLayout title="Clients">
    <div class="page-header">
      <div>
        <h2>Liste des clients</h2>
        <p class="subtitle">{{ clients.length }} client(s) enregistré(s).</p>
      </div>
      <button class="btn btn-primary" @click="openAddModal">+ Nouveau client</button>
    </div>

    <!-- Client Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>{{ isEditing ? 'Modifier' : 'Ajouter' }} un client</h3>
        <form @submit.prevent="saveClient">
          <div class="form-row">
            <div class="form-group">
              <label>Prénom</label>
              <input v-model="clientForm.firstName" required placeholder="Prénom" />
            </div>
            <div class="form-group">
              <label>Nom</label>
              <input v-model="clientForm.lastName" required placeholder="Nom" />
            </div>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="clientForm.email" type="email" required />
          </div>
          <div class="form-group">
            <label>Téléphone</label>
            <input v-model="clientForm.phone" required />
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn btn-secondary">Annuler</button>
            <button type="submit" class="btn btn-primary">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>

    <div class="card">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Téléphone</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="client in clients" :key="client._id">
              <td>{{ client.firstName }} {{ client.lastName }}</td>
              <td>{{ client.phone }}</td>
              <td>{{ client.email }}</td>
              <td class="actions-cell">
                <button class="btn btn-secondary btn-sm" @click="openEditModal(client)">Modifier</button>
                <button class="btn btn-danger btn-sm" @click="deleteClient(client._id)">Supprimer</button>
              </td>
            </tr>
            <tr v-if="clients.length === 0">
              <td colspan="4" class="empty-cell">Aucun client trouvé</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DashboardLayout from '@/components/DashboardLayout.vue'
import { apiService } from '@/services/api'

const clients = ref([])
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const clientForm = ref({ firstName: '', lastName: '', email: '', phone: '' })

const fetchClients = async () => {
  try {
    const data = await apiService.getClients()
    clients.value = data.clients || []
  } catch (error) {
    console.error('Error fetching clients:', error)
  }
}

onMounted(fetchClients)

const openAddModal = () => {
  isEditing.value = false
  clientForm.value = { firstName: '', lastName: '', email: '', phone: '' }
  showModal.value = true
}

const openEditModal = (client) => {
  isEditing.value = true
  editingId.value = client._id
  clientForm.value = { ...client }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveClient = async () => {
  try {
    const data = isEditing.value
      ? await apiService.updateClient(editingId.value, clientForm.value)
      : await apiService.createClient(clientForm.value)
    if (data.client || data.message) {
      closeModal()
      fetchClients()
    }
  } catch (error) {
    console.error('Error saving client:', error)
  }
}

const deleteClient = async (id) => {
  if (!confirm('Supprimer ce client ?')) return
  try {
    const data = await apiService.deleteClient(id)
    if (data.message) {
      fetchClients()
    }
  } catch (error) {
    console.error('Error deleting client:', error)
  }
}
</script>

<style scoped>
.table-scroll {
  overflow-x: auto;
}

.actions-cell {
  white-space: nowrap;
  display: flex;
  gap: 8px;
}

.empty-cell {
  text-align: center;
  color: var(--text-faint);
  padding: 36px !important;
}
</style>
