<template>
  <div class="weekly-calendar">
    <div class="calendar-header">
      <button @click="previousWeek" class="nav-btn">← Semaine précédente</button>
      <h2>{{ weekTitle }}</h2>
      <button @click="nextWeek" class="nav-btn">Semaine suivante →</button>
    </div>

    <p class="drag-hint">Glissez-déposez un rendez-vous sur un autre créneau pour le déplacer.</p>

    <div class="time-grid" :style="gridStyle">
      <!-- top-left empty corner -->
      <div class="grid-corner"></div>

      <!-- day headers -->
      <div v-for="day in weekDays" :key="day.date" class="grid-day-header">
        <h3>{{ day.name }}</h3>
        <p class="day-date">{{ day.date }}</p>
      </div>

      <!-- one row per time slot -->
      <template v-for="slot in timeSlots" :key="slot">
        <div class="grid-time-label">{{ slot }}</div>
        <div
          v-for="day in weekDays"
          :key="day.date + slot"
          class="grid-cell"
          :class="{ 'drag-over': dragOverKey === cellKey(day.date, slot) }"
          @dragover.prevent="dragOverKey = cellKey(day.date, slot)"
          @dragleave="onDragLeave(day.date, slot)"
          @drop="onDrop(day, slot)"
        >
          <div
            v-for="appointment in appointmentsByCell[cellKey(day.date, slot)] || []"
            :key="appointment._id"
            class="appointment-item"
            :class="{ dragging: draggedId === appointment._id }"
            draggable="true"
            @dragstart="onDragStart(appointment, $event)"
            @dragend="onDragEnd"
            @click="openDetails(appointment)"
          >
            <div class="appointment-time">{{ appointment.appointmentTime }}</div>
            <div class="appointment-details">
              <p class="client-name">{{ appointment.firstName }} {{ appointment.lastName }}</p>
              <p class="service-name">{{ appointment.service || 'Service' }}</p>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Appointment details modal -->
    <div v-if="selectedAppointment" class="modal-overlay" @click.self="closeDetails">
      <div class="modal" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3>Détails du rendez-vous</h3>
          <button class="modal-close" @click="closeDetails" aria-label="Fermer">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-row">
            <span class="detail-label">Client</span>
            <span class="detail-value">{{ selectedAppointment.firstName }} {{ selectedAppointment.lastName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Service</span>
            <span class="detail-value">{{ selectedAppointment.service || '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date</span>
            <span class="detail-value">{{ selectedAppointment.appointmentDay }} {{ formatDate(new Date(selectedAppointment.appointmentDate)) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Heure</span>
            <span class="detail-value">{{ selectedAppointment.appointmentTime }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Statut</span>
            <span class="detail-value">
              <span class="status-badge" :class="`status-${(selectedAppointment.status || '').toLowerCase()}`">
                {{ selectedAppointment.status }}
              </span>
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Téléphone</span>
            <span class="detail-value">
              <a v-if="selectedAppointment.phone" :href="`tel:${selectedAppointment.phone}`">{{ selectedAppointment.phone }}</a>
              <template v-else>—</template>
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Email</span>
            <span class="detail-value">
              <a v-if="selectedAppointment.email" :href="`mailto:${selectedAppointment.email}`">{{ selectedAppointment.email }}</a>
              <template v-else>—</template>
            </span>
          </div>
          <div v-if="selectedAppointment.message" class="detail-row detail-row-block">
            <span class="detail-label">Message</span>
            <span class="detail-value">{{ selectedAppointment.message }}</span>
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

// --- Time grid configuration: 09:00 → 18:00 in 30-minute slots ---
const START_MIN = 9 * 60 // 09:00
const END_MIN = 18 * 60 // 18:00 (exclusive end of the last slot)
const STEP_MIN = 30

onMounted(() => {
  store.fetchAppointments()
})

const timeSlots = computed(() => {
  const slots = []
  for (let m = START_MIN; m < END_MIN; m += STEP_MIN) {
    slots.push(minutesToTime(m))
  }
  return slots
})

const gridStyle = computed(() => ({
  gridTemplateColumns: `70px repeat(${weekDays.value.length}, minmax(120px, 1fr))`,
}))

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

// Buckets every confirmed appointment into its grid cell ("date|slot").
// Times that don't land exactly on a slot are clamped to the nearest slot so
// no appointment ever disappears from the calendar.
const appointmentsByCell = computed(() => {
  const map = {}
  for (const apt of store.confirmedAppointments) {
    if (!apt.appointmentDate) continue
    const dateStr = formatDate(new Date(apt.appointmentDate))
    const slot = bucketSlot(apt.appointmentTime)
    const key = cellKey(dateStr, slot)
    ;(map[key] ||= []).push(apt)
  }
  return map
})

// --- Helpers ---
function formatDate(date) {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  return `${day}/${month}/${date.getFullYear()}`
}

function timeToMinutes(time) {
  if (!time) return START_MIN
  const [h, m] = time.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

function minutesToTime(mins) {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, '0')
  const m = (mins % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

// Snaps an arbitrary appointment time to the slot that contains it.
function bucketSlot(time) {
  const mins = timeToMinutes(time)
  const clamped = Math.min(Math.max(mins, START_MIN), END_MIN - STEP_MIN)
  const snapped = START_MIN + Math.floor((clamped - START_MIN) / STEP_MIN) * STEP_MIN
  return minutesToTime(snapped)
}

function cellKey(dateStr, slot) {
  return `${dateStr}|${slot}`
}

// --- Details modal ---
const selectedAppointment = ref(null)

function openDetails(appointment) {
  // Ignore the click that ends a drag, so dragging doesn't pop the modal open.
  if (draggedId.value) return
  selectedAppointment.value = appointment
}

function closeDetails() {
  selectedAppointment.value = null
}

// --- Drag and drop ---
const draggedId = ref(null)
const dragOverKey = ref(null)

function onDragStart(appointment, event) {
  draggedId.value = appointment._id
  event.dataTransfer.effectAllowed = 'move'
  // Some browsers need data set for the drag to start.
  event.dataTransfer.setData('text/plain', String(appointment._id))
}

function onDragEnd() {
  draggedId.value = null
  dragOverKey.value = null
}

function onDragLeave(dateStr, slot) {
  if (dragOverKey.value === cellKey(dateStr, slot)) {
    dragOverKey.value = null
  }
}

async function onDrop(day, slot) {
  const id = draggedId.value
  dragOverKey.value = null
  if (!id) return

  const moved = store.confirmedAppointments.find((a) => a._id === id)
  // Dropped on the exact same cell it came from → nothing to do.
  if (moved && formatDate(new Date(moved.appointmentDate)) === day.date && bucketSlot(moved.appointmentTime) === slot) {
    draggedId.value = null
    return
  }

  // Warn (but allow) if the target slot is already taken by someone else.
  const occupants = (appointmentsByCell.value[cellKey(day.date, slot)] || []).filter((a) => a._id !== id)
  if (occupants.length > 0) {
    const names = occupants.map((a) => `${a.firstName} ${a.lastName}`).join(', ')
    const ok = window.confirm(
      `Le créneau ${day.name} ${day.date} à ${slot} est déjà pris par : ${names}.\nVoulez-vous quand même déplacer le rendez-vous ici ?`,
    )
    if (!ok) {
      draggedId.value = null
      return
    }
  }

  // Build the new date at the dropped slot time (local time).
  const [h, m] = slot.split(':').map(Number)
  const newDate = new Date(day.dateObj)
  newDate.setHours(h, m, 0, 0)

  await store.rescheduleAppointment(id, {
    appointmentDate: newDate.toISOString(),
    appointmentTime: slot,
  })
  draggedId.value = null
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
  margin-bottom: 16px;
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

.drag-hint {
  margin: 0 0 16px 0;
  font-size: 12px;
  color: var(--text-muted);
}

.time-grid {
  display: grid;
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.grid-corner {
  background: var(--surface-2);
}

.grid-day-header {
  background: var(--surface-2);
  color: var(--text);
  padding: 10px 8px;
  text-align: center;
}

.grid-day-header h3 {
  margin: 0 0 4px 0;
  font-size: 14px;
}

.day-date {
  margin: 0;
  font-size: 11px;
  color: var(--gold);
}

.grid-time-label {
  background: var(--surface-2);
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
  padding: 8px;
  text-align: right;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
}

.grid-cell {
  background: var(--bg-2);
  min-height: 54px;
  padding: 4px;
  transition: background 0.12s;
}

.grid-cell.drag-over {
  background: color-mix(in srgb, var(--gold) 22%, var(--bg-2));
  outline: 2px dashed var(--gold);
  outline-offset: -2px;
}

.appointment-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 3px solid var(--gold);
  border-radius: var(--radius-sm);
  padding: 6px 8px;
  margin-bottom: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  cursor: grab;
}

.appointment-item:active {
  cursor: grabbing;
}

.appointment-item.dragging {
  opacity: 0.4;
}

.appointment-time {
  font-weight: 600;
  color: var(--gold-2);
  font-size: 12px;
}

.appointment-details {
  font-size: 11px;
}

.client-name {
  margin: 0;
  color: var(--text);
  font-weight: 500;
}

.service-name {
  margin: 0;
  color: var(--text-muted);
  font-size: 10px;
}

/* --- Details modal --- */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
}

.modal {
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--gold-2);
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  padding: 0 4px;
}

.modal-close:hover {
  color: var(--text);
}

.modal-body {
  padding: 16px 20px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row-block {
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  color: var(--text-muted);
  font-weight: 600;
}

.detail-value {
  color: var(--text);
  text-align: right;
}

.detail-row-block .detail-value {
  text-align: left;
}

.detail-value a {
  color: var(--gold-2);
  text-decoration: none;
}

.detail-value a:hover {
  text-decoration: underline;
}

.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.status-confirmed {
  background: rgba(46, 160, 67, 0.18);
  color: #4ade80;
}

.status-pending {
  background: rgba(234, 179, 8, 0.18);
  color: var(--gold);
}

.status-cancelled {
  background: rgba(239, 68, 68, 0.18);
  color: #f87171;
}

@media (max-width: 768px) {
  .weekly-calendar {
    padding: 15px;
  }

  .time-grid {
    overflow-x: auto;
  }

  .calendar-header {
    flex-wrap: wrap;
    gap: 10px;
  }

  .calendar-header h2 {
    width: 100%;
    order: -1;
    text-align: center;
  }
}
</style>
