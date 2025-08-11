<script setup>
import { ref, onMounted } from 'vue'
import { RouterView, RouterLink, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import SplashScreen from './components/SplashScreen.vue'

const isLoading = ref(true)
const isMenuOpen = ref(false)
const router = useRouter()
const toast = useToast()

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 3500)
})

function closeMenu() {
  isMenuOpen.value = false
}

// Lógica para cerrar la sesión del usuario
function handleLogout() {
  // 1. Borra el token de autenticación del almacenamiento local
  localStorage.removeItem('authToken')

  // 2. Cierra el menú lateral
  closeMenu()

  // 3. Muestra una notificación de éxito
  toast.success('Has cerrado sesión con éxito.')

  // 4. Redirige al usuario a la página de login
  router.push('/login')
}
</script>

<template>
  <SplashScreen v-if="isLoading" />

  <div id="app-layout" v-else>
    <header class="app-header">
      <div class="header-content">
        <RouterLink to="/" @click="closeMenu" class="logo-link">
          <!-- Reemplazamos el <span> por una imagen -->
          <img src="/logo.png" alt="Logo Sistema Arka" class="logo-img" />
          <h1>Sistema Arka</h1>
        </RouterLink>

        <!-- Solo muestra el menú si el usuario está logueado (no en la pantalla de login) -->
        <button
          v-if="$route.name !== 'login'"
          @click="isMenuOpen = !isMenuOpen"
          class="menu-toggle"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>
    </header>

    <Transition name="slide">
      <div v-if="isMenuOpen" class="mobile-menu-overlay" @click.self="closeMenu">
        <div class="mobile-menu-panel">
          <nav>
            <RouterLink to="/" @click="closeMenu" class="nav-link">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>Inicio</span>
            </RouterLink>
            <RouterLink to="/clients" @click="closeMenu" class="nav-link">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span>Clientes</span>
            </RouterLink>
            <RouterLink to="/agenda" @click="closeMenu" class="nav-link">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>Agenda</span>
            </RouterLink>
            <RouterLink to="/reports" @click="closeMenu" class="nav-link">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
              <span>Reportes</span>
            </RouterLink>
          </nav>

          <button @click="handleLogout" class="logout-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </Transition>

    <main class="app-main">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in"><component :is="Component" /></Transition>
      </RouterView>
    </main>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
:root {
  --primary-accent: #00dd99;
  --text-primary: #e4e6eb;
  --text-secondary: #b0b3b8;
  --dark-bg: #121829;
  --glass-bg: rgba(36, 43, 67, 0.7);
  --glass-border: rgba(255, 255, 255, 0.1);
}
body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  background-color: var(--dark-bg);
  color: var(--text-primary);
  overflow-x: hidden;
}
#app-layout {
  min-height: 100vh;
}
.app-header {
  padding: 1rem 1.5rem;
  background-color: var(--dark-bg);
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid var(--glass-border);
}
.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
}
.logo-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
}
.logo-img {
  height: 50px; /* Ajusta este valor al tamaño que prefieras */
  width: auto;
}
.app-header h1 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--text-primary);
}
.app-main {
  padding: 1rem 1.5rem;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.menu-toggle {
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: 0.5rem;
  z-index: 999;
}
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 998;
}
.mobile-menu-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 280px;
  height: 100%;
  background: var(--dark-bg);
  border-right: 1px solid var(--glass-border);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 6rem 1rem 2rem 1rem;
  display: flex;
  flex-direction: column;
}
.mobile-menu-panel nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-grow: 1;
}
.nav-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.2s;
}
.nav-link svg {
  flex-shrink: 0;
}
.nav-link:hover,
.router-link-exact-active {
  background-color: rgba(0, 221, 153, 0.1);
  color: var(--primary-accent);
}
.logout-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 0.75rem 1rem;
  margin-top: 1.5rem;
  border-radius: 8px;
  background: none;
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s;
}
.logout-btn:hover {
  background-color: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
  color: #ef4444;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.4s cubic-bezier(0.86, 0, 0.07, 1);
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}
.slide-enter-from .mobile-menu-panel,
.slide-leave-to .mobile-menu-panel {
  transform: translateX(-100%);
}

@media (min-width: 1024px) {
  .menu-toggle {
    display: none;
  }
}
</style>
