<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { fetchAgendaData } from '../services/api.js'
import { creditToShow } from '../services/state.js'

const router = useRouter()
const toast = useToast()
const isLoading = ref(true)
const agenda = ref({
  today: [],
  upcoming: [],
})

onMounted(async () => {
  try {
    const response = await fetchAgendaData()
    agenda.value = response.data // Se accede a .data
  } catch (error) {
    console.error('Error al cargar la agenda:', error)
    toast.error('No se pudo cargar la agenda desde el servidor.')
  } finally {
    isLoading.value = false
  }
})

function showDetails(credit) {
  creditToShow.value = credit._id
  router.push('/credits/manage')
}

// Formatea la fecha futura para que sea más legible
function formatUpcomingDate(credit) {
  const date = new Date(credit.nextPaymentDate)
  if (credit.paymentFrequency === 'semanal') {
    const weekday = date.toLocaleDateString('es-CO', { weekday: 'long' })
    return `Este ${weekday}`
  } else {
    return `El ${date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}`
  }
}


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
  <div class="agenda-container">
    <div class="view-header">
      <h1>Agenda de Cobranza</h1>
      <p>Gestiona tus cobros de hoy y próximos.</p>
    </div>

    <div v-if="isLoading">Cargando agenda...</div>

    <div v-else>
      <!-- SECCIÓN DE COBROS DE HOY -->
      <div class="agenda-section">
        <h3 class="section-title today">Cobros de Hoy ({{ agenda.today.length }})</h3>
        <div v-if="agenda.today.length === 0" class="no-items-card">
          <p>No hay cobros programados para hoy.</p>
        </div>
        <div v-else class="agenda-list">
          <div
            v-for="item in agenda.today"
            :key="item._id"
            class="agenda-card today-card"
            @click="showDetails(item)"
          >
            <div class="info-section">
              <span class="client-name">{{ item.client.fullName }}</span>
              <span class="product-name">{{ item.products.map((p) => p.name).join(', ') }}</span>
            </div>
            <div class="amount-section">
              <span class="amount">{{
                formatCurrency(item.totalAmount / item.remainingInstallments)
              }}</span>
              <span class="cuota-label">Valor Cuota</span>
            </div>
          </div>
        </div>
      </div>

      <!-- SECCIÓN DE PRÓXIMOS COBROS -->
      <div class="agenda-section">
        <h3 class="section-title upcoming">Próximos 7 Días ({{ agenda.upcoming.length }})</h3>
        <div v-if="agenda.upcoming.length === 0" class="no-items-card">
          <p>No hay cobros programados para la próxima semana.</p>
        </div>
        <div v-else class="agenda-list">
          <div
            v-for="item in agenda.upcoming"
            :key="item._id"
            class="agenda-card"
            @click="showDetails(item)"
          >
            <div class="info-section">
              <span class="client-name">{{ item.client.fullName }}</span>
              <span class="product-name">{{ item.products.map((p) => p.name).join(', ') }}</span>
            </div>
            <div class="amount-section">
              <span class="amount">{{
                formatCurrency(item.totalAmount / item.remainingInstallments)
              }}</span>
              <span class="cuota-label due-date">{{ formatUpcomingDate(item) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.agenda-container {
  max-width: 900px;
  margin: 0 auto;
}
.view-header {
  text-align: center;
  margin-bottom: 2rem;
}
.agenda-section {
  margin-bottom: 2.5rem;
}
.section-title {
  font-size: 1.2rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--glass-border);
  margin-bottom: 1rem;
}
.section-title.today {
  color: var(--primary-accent);
}
.section-title.upcoming {
  color: #3b82f6;
}
.agenda-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.agenda-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}
.agenda-card:hover {
  transform: scale(1.02);
  border-color: var(--primary-accent);
}
.today-card {
  border-left: 5px solid var(--primary-accent);
}
.info-section {
  flex-grow: 1;
  min-width: 0; /* Para que text-overflow funcione */
}
.client-name {
  display: block;
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--text-primary);
}
.product-name {
  font-size: 0.9rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}
.amount-section {
  text-align: right;
}
.amount {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--text-primary);
  display: block;
}
.cuota-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
}
.no-items-card {
  text-align: center;
  font-size: 1rem;
  background: var(--glass-bg);
  border-radius: 16px;
  padding: 1.5rem;
  color: var(--text-secondary);
}

.due-date {
  font-weight: bold;
  text-transform: capitalize;
}

</style>
