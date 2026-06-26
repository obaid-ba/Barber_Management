const API_URL = 'http://localhost:3000/api'

// Builds request headers, including the auth token when the user is logged in.
function headers() {
  const token = localStorage.getItem('token')
  const base = { 'Content-Type': 'application/json' }
  return token ? { ...base, Authorization: `Bearer ${token}` } : base
}

export const apiService = {
  // Auth
  async login(credentials) {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(credentials),
    })
    return res.json()
  },

  async signup(userData) {
    const res = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(userData),
    })
    return res.json()
  },

  // Current user (self-service)
  async getMe() {
    const res = await fetch(`${API_URL}/me`, { headers: headers() })
    return res.json()
  },

  async updateMe(data) {
    const res = await fetch(`${API_URL}/me`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data),
    })
    return res.json()
  },

  async getMyAppointments() {
    const res = await fetch(`${API_URL}/me/appointments`, { headers: headers() })
    return res.json()
  },

  // Appointments
  async getAppointments() {
    const res = await fetch(`${API_URL}/appointments`, { headers: headers() })
    return res.json()
  },

  async createAppointment(data) {
    const res = await fetch(`${API_URL}/appointment`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    })
    return res.json()
  },

  async updateAppointmentStatus(id, status) {
    const res = await fetch(`${API_URL}/appointment/${id}/status`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ status }),
    })
    return res.json()
  },

  async rescheduleAppointment(id, { appointmentDate, appointmentTime }) {
    const res = await fetch(`${API_URL}/appointment/${id}/reschedule`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ appointmentDate, appointmentTime }),
    })
    return res.json()
  },

  async deleteAppointment(id) {
    const res = await fetch(`${API_URL}/appointment/${id}`, {
      method: 'DELETE',
      headers: headers(),
    })
    return res.json()
  },

  // Services
  async getServices() {
    const res = await fetch(`${API_URL}/services`, { headers: headers() })
    return res.json()
  },

  async createService(data) {
    const res = await fetch(`${API_URL}/service`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    })
    return res.json()
  },

  async deleteService(id) {
    const res = await fetch(`${API_URL}/service/${id}`, { method: 'DELETE', headers: headers() })
    return res.json()
  },

  async updateService(id, data) {
    const res = await fetch(`${API_URL}/service/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data),
    })
    return res.json()
  },

  // Clients
  async getClients() {
    const res = await fetch(`${API_URL}/clients`, { headers: headers() })
    return res.json()
  },

  async createClient(data) {
    const res = await fetch(`${API_URL}/client`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    })
    return res.json()
  },

  async updateClient(id, data) {
    const res = await fetch(`${API_URL}/client/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data),
    })
    return res.json()
  },

  async deleteClient(id) {
    const res = await fetch(`${API_URL}/client/${id}`, { method: 'DELETE', headers: headers() })
    return res.json()
  },
}
