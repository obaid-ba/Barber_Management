<template>
  <DashboardLayout title="Paramètres">
    <div class="settings-wrap">
      <div class="card">
        <h2 class="card-title">Informations du salon</h2>
        <div class="form-group">
          <label>Nom du salon</label>
          <input v-model="settings.salonName" type="text" />
        </div>
        <div class="form-group">
          <label>Adresse</label>
          <input v-model="settings.address" type="text" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Téléphone</label>
            <input v-model="settings.phone" type="tel" />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="settings.email" type="email" />
          </div>
        </div>
      </div>

      <div class="card">
        <h2 class="card-title">Horaires d'ouverture</h2>
        <div class="form-group">
          <label>Lundi - Vendredi</label>
          <input v-model="settings.weekdayHours" type="text" placeholder="09:00 - 19:00" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Samedi</label>
            <input v-model="settings.saturdayHours" type="text" placeholder="09:00 - 17:00" />
          </div>
          <div class="form-group">
            <label>Dimanche</label>
            <input v-model="settings.sundayHours" type="text" placeholder="Fermé" />
          </div>
        </div>
      </div>

      <div class="settings-actions">
        <button class="btn btn-primary" @click="saveSettings">Enregistrer les modifications</button>
        <button class="btn btn-secondary" @click="resetSettings">Annuler</button>
      </div>
      <p v-if="savedMessage" class="success-text">{{ savedMessage }}</p>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref } from 'vue'
import DashboardLayout from '@/components/DashboardLayout.vue'

const STORAGE_KEY = 'salonSettings'
const defaultSettings = () => ({
  salonName: 'Barber Shop',
  address: '123 Rue de la Paix, 75000 Paris',
  phone: '+33 1 23 45 67 89',
  email: 'admin@gmail.com',
  weekdayHours: '09:00 - 19:00',
  saturdayHours: '09:00 - 17:00',
  sundayHours: 'Fermé',
})

const loadSettings = () => {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
  return saved ? { ...defaultSettings(), ...saved } : defaultSettings()
}

const settings = ref(loadSettings())
const savedMessage = ref('')

const saveSettings = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
  savedMessage.value = 'Modifications enregistrées ✓'
  setTimeout(() => (savedMessage.value = ''), 3000)
}

const resetSettings = () => {
  settings.value = loadSettings()
  savedMessage.value = ''
}
</script>

<style scoped>
.settings-wrap {
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-actions {
  display: flex;
  gap: 10px;
}

@media (max-width: 600px) {
  .settings-actions {
    flex-direction: column;
  }
}
</style>
