<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { fetchClients } from '../services/api.js'
import { useToast } from 'vue-toastification'

const clients = ref([])
const isLoading = ref(true)
const router = useRouter()
const searchTerm = ref('')
const toast = useToast()

onMounted(async () => {
  try {
    const response = await fetchClients()
    clients.value = response.data
  } catch (error) {
    toast.error('No se pudieron cargar los clientes.')
  } finally {
    isLoading.value = false
  }
})

const filteredClients = computed(() => {
  if (!searchTerm.value) return clients.value
  const lowerCaseSearch = searchTerm.value.toLowerCase()
  return clients.value.filter(
    (client) =>
      client.fullName.toLowerCase().includes(lowerCaseSearch) ||
      client.cedula.includes(lowerCaseSearch),
  )
})

function goToDetails(clientId) {
  router.push({ name: 'client-detail', params: { id: clientId } })
}
</script>

<template>
  <div class="clients-container">
    <div class="view-header">
      <h1>Gestión de Clientes</h1>
      <p>Lista completa de todos tus clientes registrados.</p>
    </div>

    <div class="search-bar-container">
      <input
        type="text"
        v-model="searchTerm"
        placeholder="Buscar por nombre o cédula..."
        class="search-input"
      />
    </div>

    <div v-if="isLoading">Cargando clientes...</div>

    <div v-else-if="filteredClients.length === 0" class="no-items-card">
      <p>{{ searchTerm ? 'No se encontraron clientes.' : 'No hay clientes registrados.' }}</p>
    </div>

    <div v-else class="clients-list">
      <div
        v-for="client in filteredClients"
        :key="client._id"
        class="client-item"
        @click="goToDetails(client._id)"
      >
        <div class="item-icon">
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
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <div class="item-content">
          <span class="client-name">{{ client.fullName }}</span>
          <span class="client-cedula">CC: {{ client.cedula }}</span>
        </div>
        <div class="item-action">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.clients-container {
  max-width: 900px;
  margin: 0 auto;
}
.view-header {
  text-align: center;
  margin-bottom: 2rem;
}
.search-bar-container {
  margin-bottom: 1.5rem;
}
.search-input {
  width: 100%;
  padding: 0.8rem 1rem;
  background-color: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 1rem;
}
.search-input::placeholder {
  color: var(--text-secondary);
}
.clients-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.client-item {
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
.client-item:hover {
  border-color: var(--primary-accent);
  background-color: rgba(0, 221, 153, 0.1);
}
.item-icon {
  color: var(--primary-accent);
}
.item-content {
  flex-grow: 1;
}
.client-name {
  display: block;
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--text-primary);
}
.client-cedula {
  font-size: 0.9rem;
  color: var(--text-secondary);
}
.item-action {
  color: var(--text-secondary);
}
.no-items-card {
  text-align: center;
  font-size: 1.2rem;
  background: var(--glass-bg);
  border-radius: 16px;
  padding: 2rem;
}
</style>
