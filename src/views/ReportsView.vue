<script setup>
import { ref, onMounted, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { fetchReportSummary, fetchAllCompletedSales } from '../services/api.js'

const summary = ref({ totalDue: 0, totalCollected: 0, currentMonthCollected: 0 })
const completedSales = ref([])
const isLoading = ref(true)
const isLoadingSales = ref(false)
const toast = useToast()

const dateRange = ref({
  start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
  end: new Date().toISOString().split('T')[0],
})

onMounted(async () => {
  try {
    const response = await fetchReportSummary()
    summary.value = response.data // Se accede a .data
    await handleDateFilter()
  } catch (error) {
    console.error('Error al cargar el resumen:', error)
    toast.error('No se pudo cargar el resumen de reportes.')
  } finally {
    isLoading.value = false
  }
})

async function handleDateFilter() {
  isLoadingSales.value = true
  try {
    const response = await fetchAllCompletedSales(dateRange.value.start, dateRange.value.end)
    completedSales.value = response.data // Se accede a .data
  } catch (error) {
    console.error('Error al buscar ventas:', error)
    toast.error('No se pudieron obtener las ventas completadas.')
  } finally {
    isLoadingSales.value = false
  }
}

const totalFilteredSales = computed(() => {
  return completedSales.value.reduce((sum, sale) => sum + sale.originalAmount, 0)
})

function formatCurrency(value) {
  if (typeof value !== 'number') return '$ 0'
  return value.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  })
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="reports-container">
    <div class="view-header">
      <h1>Reportes y Estadísticas</h1>
      <p>Un resumen del estado financiero de tu negocio.</p>
    </div>

    <div v-if="isLoading">Cargando resumen...</div>

    <div v-else>
      <!-- KPIs Principales -->
      <div class="summary-grid">
        <div class="summary-card">
          <span class="card-label">Dinero por Cobrar (Activo)</span>
          <span class="card-value">{{ formatCurrency(summary.totalDue) }}</span>
        </div>
        <div class="summary-card">
          <span class="card-label">Ingresos del Mes Actual</span>
          <span class="card-value collected">{{
            formatCurrency(summary.currentMonthCollected)
          }}</span>
        </div>
      </div>
      <!-- KPI Histórico -->
      <div class="historical-summary-card">
        <span class="card-label">Total Recaudado (Histórico)</span>
        <span class="card-value">{{ formatCurrency(summary.totalCollected) }}</span>
      </div>
    </div>

    <!-- Filtro y Tabla de Ventas Completadas -->
    <div class="card filter-section">
      <h3>Ventas Completadas por Fecha</h3>
      <div class="date-filters">
        <input type="date" v-model="dateRange.start" />
        <span>hasta</span>
        <input type="date" v-model="dateRange.end" />
        <button @click="handleDateFilter">Buscar</button>
      </div>

      <div v-if="isLoadingSales" class="loading-sales">Buscando ventas...</div>
      <div v-else>
        <div v-if="completedSales.length === 0" class="no-items">
          <p>No se encontraron ventas completadas en este rango de fechas.</p>
        </div>
        <div v-else class="table-container">
          <table>
            <thead>
              <tr>
                <th>Fecha Finalización</th>
                <th>Cliente</th>
                <th class="amount-header">Monto Total Vendido</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sale in completedSales" :key="sale._id">
                <td>{{ formatDate(sale.completionDate) }}</td>
                <td>{{ sale.client.fullName }}</td>
                <td class="amount">{{ formatCurrency(sale.originalAmount) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2">Total del Periodo</td>
                <td class="amount total-amount">{{ formatCurrency(totalFilteredSales) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reports-container {
  max-width: 1000px;
  margin: 0 auto;
}
.view-header {
  text-align: center;
  margin-bottom: 2rem;
}
.card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
}

/* KPIs */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}
.summary-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}
.card-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}
.card-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
}
.card-value.collected {
  color: var(--primary-accent);
}
.historical-summary-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 1rem 1.5rem;
  margin-top: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Filtros y Tabla */
.filter-section {
  margin-top: 2.5rem;
}
.filter-section h3 {
  margin-top: 0;
}
.date-filters {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.date-filters input[type='date'] {
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
  padding: 0.5rem;
  border-radius: 8px;
  font-family: inherit;
}
.date-filters button {
  background-color: var(--primary-accent);
  color: var(--dark-bg);
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}
.table-container {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--glass-border);
  white-space: nowrap;
}
thead {
  background-color: rgba(0, 0, 0, 0.2);
}
tbody tr:last-child td {
  border-bottom: none;
}
tfoot {
  border-top: 2px solid var(--glass-border);
  font-weight: bold;
}
td.amount,
th.amount-header,
td.total-amount {
  text-align: right;
}
td.amount {
  color: var(--text-primary);
}
td.total-amount {
  color: var(--primary-accent);
  font-size: 1.1rem;
}
.no-items,
.loading-sales {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}
</style>
