<template>
  <div class="weekly-calendar">
    <div class="calendar-header">
      <button @click="previousWeek" class="nav-btn">← Semaine précédente</button>
      <h2>{{ weekTitle }}</h2>
      <button @click="nextWeek" class="nav-btn">Semaine suivante →</button>
    </div>

    <div class="calendar-grid">
      <div v-for="day in weekDays" :key="day.date" class="day-column">
        <div class="day-header">
          <h3>{{ day.name }}</h3>
          <p class="day-date">{{ day.date }}</p>
        </div>
        <div class="appointments-list">
          <div
            v-for="appointment in getAppointmentsForDay(day.date)"
            :key="appointment._id"
            class="appointment-item"
          >
            <div class="appointment-time">{{ appointment.appointmentTime }}</div>
            <div class="appointment-details">
              <p class="client-name">{{ appointment.firstName }} {{ appointment.lastName }}</p>
              <p class="service-name">{{ appointment.service || 'Service' }}</p>
            </div>
          </div>
          <div v-if="getAppointmentsForDay(day.date).length === 0" class="no-appointments">
            Aucun rendez-vous
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppointmentsStore } from '@/stores/appointments'

const store = useAppointmentsStore()
const currentDate = ref(new Date())

onMounted(() => {
  store.fetchAppointments()
})

const weekDays = computed(() => {
  const days = []
  const startOfWeek = new Date(currentDate.value)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())

  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek)
    date.setDate(date.getDate() + i)
    days.push({
      name: dayNames[date.getDay()],
      date: formatDate(date),
      dateObj: date,
    })
  }
  return days
})

const weekTitle = computed(() => {
  const start = weekDays.value[0].dateObj
  const end = weekDays.value[6].dateObj
  return `${start.toLocaleDateString('fr-FR')} - ${end.toLocaleDateString('fr-FR')}`
})

function formatDate(date) {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  return `${day}/${month}/${date.getFullYear()}`
}

function getAppointmentsForDay(dateStr) {
  return store.confirmedAppointments.filter((apt) => {
    if (!apt.appointmentDate) return false
    const aptDate = new Date(apt.appointmentDate)
    const day = aptDate.getDate().toString().padStart(2, '0')
    const month = (aptDate.getMonth() + 1).toString().padStart(2, '0')
    const formattedAptDate = `${day}/${month}/${aptDate.getFullYear()}`

    // Si c'est le même jour, on l'affiche
    return formattedAptDate === dateStr
  })
}

function previousWeek() {
  currentDate.value.setDate(currentDate.value.getDate() - 7)
  currentDate.value = new Date(currentDate.value)
}

function nextWeek() {
  currentDate.value.setDate(currentDate.value.getDate() + 7)
  currentDate.value = new Date(currentDate.value)
}
</script>

<style scoped>
.weekly-calendar {
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 24px;
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border);
}

.calendar-header h2 {
  margin: 0;
  font-size: 18px;
}

.nav-btn {
  background: var(--surface-2);
  color: var(--text);
  border: 1px solid var(--border-strong);
  padding: 8px 15px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.nav-btn:hover {
  border-color: var(--gold);
  color: var(--gold-2);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.day-column {
  background: var(--bg-2);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  overflow: hidden;
}

.day-header {
  background: var(--surface-2);
  color: var(--text);
  padding: 12px;
  text-align: center;
  border-bottom: 1px solid var(--border);
}

.day-header h3 {
  margin: 0 0 5px 0;
  font-size: 15px;
}

.day-date {
  margin: 0;
  font-size: 12px;
  color: var(--gold);
}

.appointments-list {
  padding: 12px;
  min-height: 200px;
}

.appointment-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 3px solid var(--gold);
  border-radius: var(--radius-sm);
  padding: 10px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.appointment-time {
  font-weight: 600;
  color: var(--gold-2);
  font-size: 14px;
}

.appointment-details {
  font-size: 12px;
}

.client-name {
  margin: 0;
  color: var(--text);
  font-weight: 500;
}

.service-name {
  margin: 0;
  color: var(--text-muted);
  font-size: 11px;
}

.no-appointments {
  text-align: center;
  color: var(--text-faint);
  font-size: 13px;
  padding: 50px 10px;
}

@media (max-width: 1024px) {
  .calendar-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }

  .calendar-header {
    flex-wrap: wrap;
    gap: 10px;
  }

  .calendar-header h2 {
    width: 100%;
    order: -1;
  }
}

@media (max-width: 768px) {
  .weekly-calendar {
    padding: 15px;
  }

  .calendar-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }

  .day-header {
    padding: 8px;
  }

  .day-header h3 {
    font-size: 14px;
  }

  .appointment-item {
    padding: 8px;
    margin-bottom: 8px;
  }

  .appointment-time {
    font-size: 12px;
  }

  .appointment-details {
    font-size: 11px;
  }

  .client-name {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .calendar-header {
    flex-direction: column;
  }

  .nav-btn {
    width: 100%;
  }

  .calendar-grid {
    grid-template-columns: 1fr;
  }

  .appointments-list {
    min-height: auto;
  }
}
</style>
