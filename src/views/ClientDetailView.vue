<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { fetchClientById, fetchCreditsByClientId, updateClient } from '../services/api.js'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const client = ref(null)
const credits = ref([])
const isLoading = ref(true)

onMounted(async () => {
  const clientId = route.params.id
  try {
    const [clientResponse, creditsResponse] = await Promise.all([
      fetchClientById(clientId),
      fetchCreditsByClientId(clientId),
    ])
    client.value = clientResponse.data
    credits.value = creditsResponse.data
  } catch (error) {
    toast.error('No se pudo encontrar al cliente.')
    router.push('/clients')
  } finally {
    isLoading.value = false
  }
})

async function saveChanges() {
  if (!client.value) return
  try {
    await updateClient(client.value._id, client.value)
    toast.success('¡Cliente actualizado!')
    router.push('/clients')
  } catch (error) {
    toast.error('Hubo un error al guardar los cambios.')
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
  <div class="client-detail-container">
    <div v-if="isLoading" class="loading-state">Cargando datos del cliente...</div>

    <div v-else-if="client">
      <div class="view-header">
        <h1>{{ client.fullName }}</h1>
        <p>Edita la información del cliente y consulta su historial.</p>
      </div>

      <form @submit.prevent="saveChanges" class="card">
        <h3>Datos Personales</h3>
        <div class="form-grid">
          <div class="form-group">
            <label for="fullName">Nombre Completo</label>
            <input id="fullName" type="text" v-model="client.fullName" required />
          </div>
          <div class="form-group">
            <label for="cedula">Cédula</label>
            <input id="cedula" type="text" v-model="client.cedula" required />
          </div>
          <div class="form-group">
            <label for="phone">Teléfono</label>
            <input id="phone" type="tel" v-model="client.phone" required />
          </div>
          <div class="form-group">
            <label for="address">Dirección</label>
            <input id="address" type="text" v-model="client.address" required />
          </div>
        </div>
        <button type="submit" class="submit-btn">Guardar Cambios</button>
      </form>

      <div class="card history-section">
        <h3>Historial de Créditos</h3>
        <div v-if="credits.length === 0" class="no-items">
          <p>Este cliente no tiene créditos registrados.</p>
        </div>
        <div v-else class="credits-list">
          <div v-for="credit in credits" :key="credit._id" class="credit-item-history">
            <span class="product-name">{{ credit.products.map((p) => p.name).join(', ') }}</span>
            <span class="amount">{{ formatCurrency(credit.originalAmount) }}</span>
            <span :class="['status', credit.status]">{{ credit.status }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.client-detail-container {
  max-width: 900px;
  margin: 0 auto;
}
.loading-state {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: var(--text-secondary);
}
.view-header {
  text-align: center;
  margin-bottom: 2rem;
}
.card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem 2rem;
  margin-bottom: 2rem;
}
.card h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}
input {
  width: 100%;
  padding: 0.8rem;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 1rem;
}
.submit-btn {
  width: 100%;
  padding: 1rem;
  margin-top: 1.5rem;
  border: none;
  border-radius: 8px;
  background-color: var(--primary-accent);
  color: var(--dark-bg);
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
}
.history-section {
  padding-bottom: 0.5rem;
}
.credits-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.credit-item-history {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  align-items: center;
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid var(--glass-border);
}
.credit-item-history:last-child {
  border-bottom: none;
}
.product-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.amount {
  font-weight: 700;
  text-align: right;
  padding-right: 1rem;
}
.status {
  justify-self: end;
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: capitalize;
}
.status.activo {
  background-color: rgba(0, 221, 153, 0.2);
  color: var(--primary-accent);
}
.status.pagado {
  background-color: rgba(176, 179, 184, 0.2);
  color: #b0b3b8;
}
.no-items {
  text-align: center;
  color: var(--text-secondary);
  padding: 1rem 0;
}
@media (min-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
