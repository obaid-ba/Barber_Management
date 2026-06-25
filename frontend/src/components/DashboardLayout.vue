<template>
  <div class="layout">
    <!-- Mobile backdrop -->
    <div v-if="sidebarOpen" class="backdrop" @click="sidebarOpen = false"></div>

    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="brand">
        <span class="brand-mark">✂</span>
        <div>
          <h2>BarberShop</h2>
          <span class="brand-sub">{{ roleLabel }}</span>
        </div>
        <button class="close-sidebar" @click="sidebarOpen = false">✕</button>
      </div>

      <nav class="nav">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="nav-item"
          @click="sidebarOpen = false"
        >
          <span class="nav-icon">{{ link.icon }}</span>
          <span>{{ link.label }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <div class="user-chip">
          <div class="avatar">{{ initials }}</div>
          <div class="user-meta">
            <span class="user-name">{{ authStore.userName || 'Utilisateur' }}</span>
            <span class="user-email">{{ authStore.userEmail }}</span>
          </div>
        </div>
        <button @click="handleLogout" class="logout-btn">Déconnexion</button>
      </div>
    </aside>

    <main class="main">
      <header class="topbar">
        <button class="menu-toggle" @click="sidebarOpen = true">☰</button>
        <h1>{{ title }}</h1>
        <div class="topbar-spacer"></div>
        <span class="role-pill" :class="authStore.isClient ? 'client' : 'staff'">
          {{ roleLabel }}
        </span>
      </header>

      <div class="content">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

defineProps({
  title: { type: String, default: '' },
})

const router = useRouter()
const authStore = useAuthStore()
const sidebarOpen = ref(false)

const staffLinks = [
  { to: '/dashboard', label: 'Tableau de bord', icon: '📊' },
  { to: '/appointments', label: 'Rendez-vous', icon: '📅' },
  { to: '/clients', label: 'Clients', icon: '👥' },
  { to: '/services', label: 'Services', icon: '✂️' },
  { to: '/settings', label: 'Paramètres', icon: '⚙️' },
]

const clientLinks = [
  { to: '/home', label: 'Accueil', icon: '🏠' },
  { to: '/book', label: 'Réserver', icon: '➕' },
  { to: '/my-appointments', label: 'Mes rendez-vous', icon: '📅' },
  { to: '/services', label: 'Services & tarifs', icon: '✂️' },
  { to: '/profile', label: 'Mon profil', icon: '👤' },
]

const links = computed(() => (authStore.isClient ? clientLinks : staffLinks))

const roleLabel = computed(() => {
  if (authStore.role === 'admin') return 'Administrateur'
  if (authStore.role === 'barber') return 'Coiffeur'
  return 'Espace client'
})

const initials = computed(() => {
  const name = authStore.userName?.trim()
  if (name) {
    return name
      .split(/\s+/)
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }
  return (authStore.userEmail || '?').slice(0, 2).toUpperCase()
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg);
}

/* ---------- Sidebar ---------- */
.sidebar {
  width: 256px;
  background: var(--sidebar);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 22px 16px;
  position: fixed;
  inset: 0 auto 0 0;
  height: 100vh;
  overflow-y: auto;
  z-index: 1000;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 20px;
  margin-bottom: 14px;
  border-bottom: 1px solid var(--border);
}

.brand-mark {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 10px;
  font-size: 22px;
  background: linear-gradient(135deg, var(--gold) 0%, var(--gold-2) 100%);
  color: #1a1408;
}

.brand h2 {
  font-size: 19px;
  line-height: 1.1;
}

.brand-sub {
  font-size: 11px;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--gold);
}

.close-sidebar {
  display: none;
  margin-left: auto;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 20px;
  cursor: pointer;
}

.nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  font-weight: 500;
  font-size: 14.5px;
  transition: all 0.18s ease;
}

.nav-item:hover {
  background: var(--surface);
  color: var(--text);
}

.nav-item.router-link-active {
  background: var(--gold-soft);
  color: var(--gold-2);
  box-shadow: inset 3px 0 0 var(--gold);
}

.nav-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

/* ---------- Sidebar footer ---------- */
.sidebar-footer {
  border-top: 1px solid var(--border);
  padding-top: 14px;
  margin-top: 10px;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.avatar {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--surface-2);
  border: 1px solid var(--border-strong);
  color: var(--gold-2);
  font-weight: 700;
  font-size: 13px;
}

.user-meta {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-name {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 11.5px;
  color: var(--text-faint);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn {
  width: 100%;
  padding: 10px;
  background: transparent;
  color: var(--danger-2);
  border: 1px solid rgba(192, 71, 59, 0.4);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;
  font-size: 13.5px;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: var(--danger);
  color: #fff;
  border-color: var(--danger);
}

/* ---------- Main ---------- */
.main {
  flex: 1;
  margin-left: 256px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 500;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 30px;
  background: rgba(20, 22, 27, 0.85);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border);
}

.topbar h1 {
  font-size: 22px;
}

.topbar-spacer {
  flex: 1;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  color: var(--text);
  font-size: 22px;
  cursor: pointer;
}

.role-pill {
  font-size: 12px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 999px;
}

.role-pill.staff {
  background: var(--gold-soft);
  color: var(--gold-2);
  border: 1px solid rgba(200, 162, 76, 0.4);
}

.role-pill.client {
  background: rgba(63, 143, 95, 0.16);
  color: var(--success-2);
  border: 1px solid rgba(63, 143, 95, 0.4);
}

.content {
  padding: 30px;
  flex: 1;
}

.backdrop {
  display: none;
}

/* ---------- Responsive ---------- */
@media (max-width: 900px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.28s ease;
  }
  .sidebar.open {
    transform: translateX(0);
  }
  .close-sidebar {
    display: block;
  }
  .menu-toggle {
    display: block;
  }
  .main {
    margin-left: 0;
  }
  .backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    z-index: 999;
  }
}

@media (max-width: 600px) {
  .topbar {
    padding: 14px 18px;
  }
  .topbar h1 {
    font-size: 18px;
  }
  .content {
    padding: 18px;
  }
  .role-pill {
    display: none;
  }
}
</style>
