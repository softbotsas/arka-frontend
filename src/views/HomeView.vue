<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useToast } from 'vue-toastification'
import { fetchReportSummary } from '../services/api.js'

const summary = ref({ totalDue: 0, currentMonthCollected: 0 })
const isLoading = ref(true)
const toast = useToast()

onMounted(async () => {
  try {
    const response = await fetchReportSummary()
    summary.value = response.data
  } catch (error) {
    console.error('Error al cargar el resumen del dashboard:', error)
    toast.error('No se pudo cargar el resumen financiero.')
  } finally {
    isLoading.value = false
  }
})

function formatCurrency(value) {
  if (typeof value !== 'number') return '$ 0'
  return value.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  })
}
</script>

<template>
  <div class="home-container">
    <div class="hero-section">
      <h2 class="hero-title">Tu centro de control financiero</h2>
      <p class="hero-subtitle">Un resumen del estado actual de tu negocio.</p>
    </div>

    <!-- KPIs Dinámicos -->
    <div v-if="isLoading" class="loading-state">Cargando resumen...</div>
    <div v-else class="kpi-grid">
      <div class="kpi-card">
        <span class="kpi-label">Dinero por Cobrar (Activo)</span>
        <span class="kpi-value">{{ formatCurrency(summary.totalDue) }}</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Ingresos del Mes Actual</span>
        <span class="kpi-value collected">{{ formatCurrency(summary.currentMonthCollected) }}</span>
      </div>
    </div>

    <!-- Menú de Navegación -->
    <h3 class="section-title">Gestionar</h3>
    <div class="dashboard-grid">
      <RouterLink to="/credits" class="card main-card">
        <div class="card-content">
          <div class="card-icon-wrapper primary">
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
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
              <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
            </svg>
          </div>
          <h3>Gestionar Créditos</h3>
          <p>El núcleo de tu operación. Crea, edita y da seguimiento a cada crédito.</p>
        </div>
        <div class="card-footer">
          <span>Acceder ahora &rarr;</span>
        </div>
      </RouterLink>

      <RouterLink to="/clients" class="card secondary-card">
        <div class="card-content">
          <div class="card-icon-wrapper">
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
          </div>
          <h4>Gestionar Clientes</h4>
          <p>Consulta, edita y ve el historial de cada uno de tus clientes.</p>
        </div>
      </RouterLink>

      <RouterLink to="/agenda" class="card secondary-card">
        <div class="card-content">
          <div class="card-icon-wrapper">
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
          </div>
          <h4>Agenda de Cobranza</h4>
          <p>Revisa los cobros del día, atrasados y próximos.</p>
        </div>
      </RouterLink>

      <RouterLink to="/reports" class="card secondary-card">
        <div class="card-content">
          <div class="card-icon-wrapper">
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
          </div>
          <h4>Reportes Completos</h4>
          <p>Analiza ventas completadas y el historial de ingresos.</p>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeInUp 0.8s ease-out;
}
.hero-section {
  text-align: center;
  margin-bottom: 2rem;
}
.hero-title {
  font-size: 2.5rem;
  font-weight: 900;
  margin-bottom: 0.5rem;
  background: linear-gradient(90deg, var(--primary-accent), #fff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}
.hero-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
}
.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-top: 3rem;
  margin-bottom: 1.5rem;
  text-align: center;
}
.loading-state {
  text-align: center;
  color: var(--text-secondary);
  padding: 2rem;
  font-size: 1.1rem;
}

/* ESTILOS PARA LOS KPIs */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.kpi-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}
.kpi-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}
.kpi-value {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--text-primary);
}
.kpi-value.collected {
  color: var(--primary-accent);
}

/* ESTILOS PARA EL GRID DE NAVEGACIÓN */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}
.card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  text-decoration: none;
  color: var(--text-primary);
  transition:
    transform 0.3s ease,
    border 0.3s ease,
    box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.card:hover {
  transform: translateY(-8px);
  border-color: var(--primary-accent);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}
.card-icon-wrapper {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  color: var(--primary-accent);
}
.card h3 {
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
}
.card h4 {
  font-size: 1.2rem;
  margin: 0 0 0.5rem 0;
}
.card p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
  flex-grow: 1;
}
.card-footer {
  margin-top: 1rem;
  font-weight: 700;
  color: var(--primary-accent);
}

@media (min-width: 1024px) {
  .main-card {
    grid-column: span 2;
  }
  .main-card h3 {
    font-size: 2rem;
  }
  .main-card p {
    font-size: 1rem;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
