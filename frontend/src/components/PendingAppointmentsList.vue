<template>
  <div class="pending-appointments">
    <h2>Demandes de rendez-vous ({{ pendingList.length }})</h2>

    <div v-if="pendingList.length === 0" class="no-requests">Aucune demande en attente</div>

    <template v-else>
      <p class="drag-hint">Glissez-déposez une demande pour changer l'ordre.</p>

      <div class="appointments-simple-list">
        <div
          v-for="(appointment, index) in pendingList"
          :key="appointment._id"
          class="appointment-row"
          :class="{ dragging: draggedIndex === index, 'drag-over': dragOverIndex === index }"
          draggable="true"
          @dragstart="onDragStart(index, $event)"
          @dragover.prevent="onDragOver(index)"
          @dragleave="onDragLeave(index)"
          @drop.prevent="onDrop(index)"
          @dragend="onDragEnd"
          @click="openModal(appointment)"
        >
          <span class="drag-handle" aria-hidden="true">⋮⋮</span>
          <div class="appointment-info">
            <p class="client-name">{{ appointment.firstName }} {{ appointment.lastName }}</p>
            <p class="appointment-time">{{ new Date(appointment.appointmentDate).toLocaleDateString() }} à {{ appointment.appointmentTime }}</p>
          </div>
          <span class="service-badge">{{ appointment.service || 'Service' }}</span>
        </div>
      </div>
    </template>

    <!-- Modal -->
    <div v-if="selectedAppointment" class="modal-overlay" @click="closeModal">
      <div class="modal-box" @click.stop>
        <button class="close-btn" @click="closeModal">✕</button>

        <h2>{{ selectedAppointment.firstName }} {{ selectedAppointment.lastName }}</h2>

        <div class="modal-details">
          <div class="detail-item">
            <span class="label">📅 Date/Heure:</span>
            <span class="value"
              >{{ new Date(selectedAppointment.appointmentDate).toLocaleDateString() }} à {{ selectedAppointment.appointmentTime }}</span
            >
          </div>
          <div class="detail-item">
            <span class="label">✂️ Service:</span>
            <span class="value">{{ selectedAppointment.service || 'Service' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">⏱️ Durée:</span>
            <span class="value">{{ selectedAppointment.service?.duration || 30 }} min</span>
          </div>
          <div class="detail-item">
            <span class="label">📧 Email:</span>
            <span class="value">{{ selectedAppointment.email }}</span>
          </div>
          <div class="detail-item">
            <span class="label">📱 Téléphone:</span>
            <span class="value">{{ selectedAppointment.phone }}</span>
          </div>
          <div v-if="selectedAppointment.message" class="detail-item">
            <span class="label">📝 Notes:</span>
            <span class="value">{{ selectedAppointment.message }}</span>
          </div>
        </div>

        <div class="modal-actions">
          <button @click="confirmAccept" class="btn-accept">✓ Accepter</button>
          <button @click="showRejectConfirm = true" class="btn-reject">✕ Refuser</button>
        </div>

        <!-- Confirmation pour refus -->
        <div v-if="showRejectConfirm" class="confirm-overlay">
          <div class="confirm-box">
            <p>
              Êtes-vous sûr(e) de vouloir refuser le rendez-vous de
              <strong>{{ selectedAppointment.firstName }} {{ selectedAppointment.lastName }}</strong> ?
            </p>
            <div class="confirm-actions">
              <button @click="confirmReject" class="btn-confirm-reject">Oui, refuser</button>
              <button @click="showRejectConfirm = false" class="btn-cancel">Annuler</button>
            </div>
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
const pendingList = computed(() => store.pendingAppointments)

onMounted(() => {
  store.fetchAppointments()
})

// --- Drag-and-drop reordering of the pending list ---
const draggedIndex = ref(null)
const dragOverIndex = ref(null)

const onDragStart = (index, event) => {
  draggedIndex.value = index
  event.dataTransfer.effectAllowed = 'move'
  // Required for Firefox to start the drag.
  event.dataTransfer.setData('text/plain', String(index))
}

const onDragOver = (index) => {
  dragOverIndex.value = index
}

const onDragLeave = (index) => {
  if (dragOverIndex.value === index) dragOverIndex.value = null
}

const onDrop = (targetIndex) => {
  const from = draggedIndex.value
  if (from === null || from === targetIndex) return

  const ids = pendingList.value.map((a) => a._id)
  const [moved] = ids.splice(from, 1)
  ids.splice(targetIndex, 0, moved)

  store.reorderPendingAppointments(ids)
  draggedIndex.value = null
  dragOverIndex.value = null
}

const onDragEnd = () => {
  draggedIndex.value = null
  dragOverIndex.value = null
}

const selectedAppointment = ref(null)
const showRejectConfirm = ref(false)

const openModal = (appointment) => {
  selectedAppointment.value = appointment
  showRejectConfirm.value = false
}

const closeModal = () => {
  selectedAppointment.value = null
  showRejectConfirm.value = false
}

const confirmAccept = () => {
  if (selectedAppointment.value) {
    store.acceptAppointment(selectedAppointment.value._id)
    closeModal()
  }
}

const confirmReject = () => {
  if (selectedAppointment.value) {
    store.rejectAppointment(selectedAppointment.value._id)
    closeModal()
  }
}
</script>

<style scoped>
.pending-appointments {
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 24px;
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  margin-bottom: 26px;
}

.pending-appointments h2 {
  margin: 0 0 18px 0;
  font-size: 18px;
}

.no-requests {
  text-align: center;
  color: var(--text-faint);
  padding: 40px 20px;
  font-size: 14px;
}

.drag-hint {
  margin: 0 0 12px 0;
  color: var(--text-faint);
  font-size: 12px;
}

.appointments-simple-list {
  display: grid;
  gap: 10px;
}

.appointment-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: var(--bg-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s,
    opacity 0.2s;
}

.appointment-row:hover {
  border-color: var(--gold);
  background: var(--surface-2);
}

.drag-handle {
  color: var(--text-faint);
  font-size: 16px;
  line-height: 1;
  letter-spacing: -2px;
  cursor: grab;
  user-select: none;
}

.appointment-row.dragging {
  opacity: 0.5;
}

.appointment-row.drag-over {
  border-color: var(--gold);
  border-style: dashed;
  background: var(--surface-2);
}

.appointment-info {
  flex: 1;
}

.client-name {
  margin: 0;
  color: var(--text);
  font-weight: 600;
  font-size: 14px;
}

.appointment-time {
  margin: 5px 0 0 0;
  color: var(--text-muted);
  font-size: 12px;
}

.service-badge {
  background: var(--gold-soft);
  color: var(--gold-2);
  border: 1px solid rgba(200, 162, 76, 0.4);
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(8, 9, 12, 0.7);
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 20px;
}

.modal-box {
  background: var(--surface);
  border: 1px solid var(--border-strong);
  padding: 26px;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  max-width: 450px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: var(--text-muted);
}

.close-btn:hover {
  color: var(--text);
}

.modal-box h2 {
  margin: 0 0 20px 0;
  font-size: 20px;
}

.modal-details {
  background: var(--bg-2);
  border: 1px solid var(--border);
  padding: 16px;
  border-radius: var(--radius-sm);
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  margin-bottom: 12px;
  font-size: 13px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-item .label {
  font-weight: 600;
  color: var(--text-muted);
  min-width: 110px;
}

.detail-item .value {
  color: var(--text);
  flex: 1;
  word-break: break-word;
}

.modal-actions {
  display: flex;
  gap: 10px;
}

.btn-accept,
.btn-reject {
  flex: 1;
  padding: 12px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  font-size: 14px;
}

.btn-accept {
  background: rgba(63, 143, 95, 0.18);
  color: var(--success-2);
  border-color: rgba(63, 143, 95, 0.4);
}

.btn-accept:hover {
  background: var(--success);
  color: #fff;
}

.btn-reject {
  background: transparent;
  color: var(--danger-2);
  border-color: rgba(192, 71, 59, 0.4);
}

.btn-reject:hover {
  background: var(--danger);
  color: #fff;
}

/* Confirmation Box */
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(8, 9, 12, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
}

.confirm-box {
  background: var(--surface);
  border: 1px solid var(--border-strong);
  padding: 22px;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  max-width: 350px;
}

.confirm-box p {
  margin: 0 0 20px 0;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.6;
}

.confirm-actions {
  display: flex;
  gap: 10px;
}

.btn-confirm-reject,
.btn-cancel {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  font-size: 13px;
}

.btn-confirm-reject {
  background: var(--danger);
  color: #fff;
}

.btn-confirm-reject:hover {
  filter: brightness(1.1);
}

.btn-cancel {
  background: var(--surface-2);
  color: var(--text);
  border: 1px solid var(--border-strong);
}

.btn-cancel:hover {
  background: #2c313c;
}

@media (max-width: 480px) {
  .modal-box {
    padding: 20px;
    max-height: 95vh;
  }

  .modal-box h2 {
    font-size: 18px;
  }

  .appointment-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .service-badge {
    width: 100%;
    text-align: center;
  }
}
</style>
