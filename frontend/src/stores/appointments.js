import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiService } from '@/services/api'

export const useAppointmentsStore = defineStore('appointments', () => {
  const pendingAppointments = ref([])
  const confirmedAppointments = ref([])

  const fetchAppointments = async () => {
    try {
      const data = await apiService.getAppointments()
      if (data.appointments) {
        pendingAppointments.value = data.appointments.filter(a => a.status === 'Pending')
        confirmedAppointments.value = data.appointments.filter(a => a.status === 'Confirmed')
      }
    } catch (error) {
      console.error('Fetch error:', error)
    }
  }

  const acceptAppointment = async (id) => {
    try {
      await apiService.updateAppointmentStatus(id, 'Confirmed')
      await fetchAppointments()
    } catch (error) {
      console.error('Accept error:', error)
    }
  }

  const rejectAppointment = async (id) => {
    try {
      await apiService.deleteAppointment(id)
      await fetchAppointments()
    } catch (error) {
      console.error('Reject error:', error)
    }
  }

  // Moves an appointment to a new date/time. Returns the API response so the
  // caller can react (e.g. show a double-booking warning via `conflict`).
  const rescheduleAppointment = async (id, { appointmentDate, appointmentTime }) => {
    try {
      const data = await apiService.rescheduleAppointment(id, { appointmentDate, appointmentTime })
      await fetchAppointments()
      return data
    } catch (error) {
      console.error('Reschedule error:', error)
      return null
    }
  }

  return {
    pendingAppointments,
    confirmedAppointments,
    fetchAppointments,
    acceptAppointment,
    rejectAppointment,
    rescheduleAppointment,
  }
})
