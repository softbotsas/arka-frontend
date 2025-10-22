<script setup>
import AddProductsModal from '../components/AddProductsModal.vue'
import BalanceModal from '../components/BalanceModal.vue'
import EditPaymentModal from '../components/EditPaymentModal.vue'
import { addProductsToCredit, addInstallmentsToCredit, editPayment, deletePayment, fetchCompletedCredits } from '../services/api.js'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { fetchCredits, deleteCredit, registerPayment } from '../services/api.js'
import CreditDetailModal from '../components/CreditDetailModal.vue'
import PaymentModal from '../components/PaymentModal.vue'
import { creditToShow } from '../services/state.js'

const router = useRouter()
const toast = useToast()
const credits = ref([])
const completedCredits = ref([])
const isLoading = ref(true)
const searchTerm = ref('')
const isDetailModalVisible = ref(false)
const isPaymentModalVisible = ref(false)
const selectedCredit = ref(null)
const isAddProductsModalVisible = ref(false)
const isBalanceModalVisible = ref(false)
const remainingBalance = ref(0)
const isEditPaymentModalVisible = ref(false)
const selectedPaymentIndex = ref(null)
const selectedPayment = ref(null)
const showCompletedCredits = ref(false)

const filteredCredits = computed(() => {
  if (!searchTerm.value) return credits.value
  const lowerCaseSearch = searchTerm.value.toLowerCase()
  return credits.value.filter(
    (credit) =>
      credit.client.fullName.toLowerCase().includes(lowerCaseSearch) ||
      credit.client.cedula.includes(lowerCaseSearch),
  )
})

const filteredCompletedCredits = computed(() => {
  if (!searchTerm.value) return completedCredits.value
  const lowerCaseSearch = searchTerm.value.toLowerCase()
  return completedCredits.value.filter(
    (credit) =>
      credit.client.fullName.toLowerCase().includes(lowerCaseSearch) ||
      credit.client.cedula.includes(lowerCaseSearch),
  )
})

function openAddProductsModal() {
  isDetailModalVisible.value = false // Cierra el modal de detalles
  isAddProductsModalVisible.value = true // Abre el nuevo modal
}

async function handleAddProductsSubmit(data) {
  try {
    await addProductsToCredit(selectedCredit.value._id, data)
    isAddProductsModalVisible.value = false
    toast.success('Productos añadidos y crédito actualizado!')
    await refreshData()
  } catch (error) {
    toast.error('Error al actualizar el crédito.')
  }
}

async function refreshData() {
  isLoading.value = true
  try {
    const [creditsResponse, completedResponse] = await Promise.all([
      fetchCredits(),
      fetchCompletedCredits()
    ])
    credits.value = creditsResponse.data
    completedCredits.value = completedResponse.data
  } catch (error) {
    toast.error('No se pudieron cargar los créditos.')
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await refreshData()
  if (creditToShow.value) {
    const creditToOpen = credits.value.find((c) => c._id === creditToShow.value)
    if (creditToOpen) openDetailsModal(creditToOpen)
    creditToShow.value = null
  }
})

function openDetailsModal(credit) {
  selectedCredit.value = credit
  isDetailModalVisible.value = true
}
function openPaymentModal() {
  isDetailModalVisible.value = false
  isPaymentModalVisible.value = true
}

async function handleDeleteCredit(creditId) {
  if (window.confirm('¿Estás seguro?')) {
    try {
      await deleteCredit(creditId)
      isDetailModalVisible.value = false
      toast.success('Crédito eliminado.')
      await refreshData()
    } catch (error) {
      toast.error('Error al eliminar el crédito.')
    }
  }
}

async function handlePaymentSubmit(amountPaid) {
  try {
    const response = await registerPayment(selectedCredit.value._id, amountPaid)

    // Verificar si necesita más cuotas
    if (response.data.needsMoreInstallments) {
      isPaymentModalVisible.value = false
      remainingBalance.value = response.data.remainingBalance
      isBalanceModalVisible.value = true
    } else {
      isPaymentModalVisible.value = false
      toast.success('¡Abono registrado!')
      await refreshData()
    }
  } catch (error) {
    toast.error('Error al registrar el pago.')
  }
}

async function handleAddInstallments(additionalInstallments) {
  try {
    await addInstallmentsToCredit(selectedCredit.value._id, additionalInstallments)
    isBalanceModalVisible.value = false
    toast.success(`Se agregaron ${additionalInstallments} cuota(s) adicional(es)`)
    await refreshData()
  } catch (error) {
    toast.error('Error al agregar las cuotas adicionales.')
  }
}

function handleEditCredit(creditId) {
  isDetailModalVisible.value = false
  router.push({ name: 'edit-credit', params: { id: creditId } })
}

async function handleEditPayment(paymentIndex, payment) {
  selectedPaymentIndex.value = paymentIndex
  selectedPayment.value = payment
  isEditPaymentModalVisible.value = true
}

async function handleEditPaymentSubmit(newAmount) {
  try {
    const response = await editPayment(selectedCredit.value._id, selectedPaymentIndex.value, newAmount)
    isEditPaymentModalVisible.value = false
    toast.success('Abono actualizado correctamente')
    
    // Actualizar el crédito seleccionado con los nuevos datos
    selectedCredit.value = response.data
    
    // Actualizar la lista completa
    await refreshData()
  } catch (error) {
    toast.error('Error al actualizar el abono')
  }
}

async function handleDeletePayment(paymentIndex) {
  if (window.confirm('¿Estás seguro de que quieres eliminar este abono? Esta acción no se puede deshacer.')) {
    try {
      const response = await deletePayment(selectedCredit.value._id, paymentIndex)
      toast.success('Abono eliminado correctamente')
      
      // Actualizar el crédito seleccionado con los nuevos datos
      selectedCredit.value = response.data
      
      // Actualizar la lista completa
      await refreshData()
    } catch (error) {
      toast.error('Error al eliminar el abono')
    }
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

function toggleCompletedCredits() {
  showCompletedCredits.value = !showCompletedCredits.value
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  return new Date(dateString).toLocaleDateString('es-CO', options)
}
</script>

<template>
  <div>
  <CreditDetailModal
    v-if="isDetailModalVisible"
    :credit="selectedCredit"
    @close="isDetailModalVisible = false"
    @open-payment-modal="openPaymentModal"
    @open-add-products-modal="openAddProductsModal"
    @delete-credit="handleDeleteCredit"
    @edit-credit="handleEditCredit"
    @edit-payment="handleEditPayment"
    @delete-payment="handleDeletePayment"
  />
  <PaymentModal
    v-if="isPaymentModalVisible"
    :credit="selectedCredit"
    @close="isPaymentModalVisible = false"
    @submit="handlePaymentSubmit"
  />
  <AddProductsModal
    v-if="isAddProductsModalVisible"
    :credit="selectedCredit"
    @close="isAddProductsModalVisible = false"
    @submit="handleAddProductsSubmit"
  />
  <BalanceModal
    v-if="isBalanceModalVisible"
    :credit="selectedCredit"
    :remaining-balance="remainingBalance"
    @close="isBalanceModalVisible = false"
    @add-installments="handleAddInstallments"
  />
  <EditPaymentModal
    v-if="isEditPaymentModalVisible"
    :payment="selectedPayment"
    :payment-index="selectedPaymentIndex"
    @close="isEditPaymentModalVisible = false"
    @submit="handleEditPaymentSubmit"
  />

  <div class="manage-credits-container">
    <div class="view-header">
      <h2>Administración de Créditos</h2>
      <p>Selecciona un crédito para ver sus detalles.</p>
      <div class="toggle-section">
        <button
          @click="toggleCompletedCredits"
          :class="['toggle-btn', { active: !showCompletedCredits }]"
        >
          Créditos Activos ({{ credits.length }})
        </button>
        <button
          @click="toggleCompletedCredits"
          :class="['toggle-btn', { active: showCompletedCredits }]"
        >
          Créditos Completados ({{ completedCredits.length }})
        </button>
      </div>
    </div>

    <div class="search-bar-container">
      <input
        type="text"
        v-model="searchTerm"
        placeholder="Buscar por nombre o cédula del cliente..."
        class="search-input"
      />
    </div>

    <div v-if="isLoading">Cargando...</div>

    <!-- Créditos Activos -->
    <div v-if="!showCompletedCredits">
      <div v-if="filteredCredits.length === 0" class="no-items-card">
        <p>{{ searchTerm ? 'No se encontraron créditos activos.' : 'Aún no has creado ningún crédito activo.' }}</p>
      </div>
      <div v-else class="credits-list">
        <div
          v-for="credit in filteredCredits"
          :key="credit._id"
          class="credit-item"
          @click="openDetailsModal(credit)"
        >
          <div class="item-main-info">
            <span class="client-name">{{ credit.client.fullName }}</span>
            <span class="product-name">
              {{ credit.products[0].name }}
              <span v-if="credit.products.length > 1" class="more-products"
                >+{{ credit.products.length - 1 }} más</span
              >
            </span>
          </div>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">Deuda Restante</span>
              <span class="stat-value debt">{{ formatCurrency(credit.totalAmount) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Cuotas Pagadas</span>
              <span class="stat-value"
                >{{ credit.installments - credit.remainingInstallments }} /
                {{ credit.installments }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Créditos Completados -->
    <div v-else>
      <div v-if="filteredCompletedCredits.length === 0" class="no-items-card">
        <p>{{ searchTerm ? 'No se encontraron créditos completados.' : 'No hay créditos completados.' }}</p>
      </div>
      <div v-else class="credits-list">
        <div
          v-for="credit in filteredCompletedCredits"
          :key="credit._id"
          class="credit-item completed-credit"
          @click="openDetailsModal(credit)"
        >
          <div class="item-main-info">
            <span class="client-name">{{ credit.client.fullName }}</span>
            <span class="product-name">
              {{ credit.products[0].name }}
              <span v-if="credit.products.length > 1" class="more-products"
                >+{{ credit.products.length - 1 }} más</span
              >
            </span>
          </div>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">Monto Total</span>
              <span class="stat-value completed">{{ formatCurrency(credit.originalAmount) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Completado</span>
              <span class="stat-value completed-date">{{ formatDate(credit.completionDate) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<style scoped>
.manage-credits-container {
  max-width: 800px;
  margin: 0 auto;
  margin-top: 2rem;
}
.view-header {
  text-align: center;
  margin-bottom: 2rem;
}
.toggle-section {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
}
.toggle-btn {
  padding: 0.75rem 1.5rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
}
.toggle-btn.active {
  background: var(--primary-accent);
  color: var(--dark-bg);
  border-color: var(--primary-accent);
}
.toggle-btn:hover:not(.active) {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
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
.credits-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.credit-item {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}
.credit-item:hover {
  border-color: var(--primary-accent);
  transform: translateY(-5px);
}
.item-main-info {
  border-bottom: 1px solid var(--glass-border);
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}
.client-name {
  display: block;
  font-weight: 700;
  font-size: 1.2rem;
  color: var(--text-primary);
}
.product-name {
  font-size: 0.9rem;
  color: var(--text-secondary);
}
.more-products {
  font-size: 0.8rem;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  margin-left: 0.5rem;
  font-weight: normal;
  color: var(--text-secondary);
}
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.stat-item {
  display: flex;
  flex-direction: column;
}
.stat-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}
.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
}
.stat-value.debt {
  color: var(--primary-accent);
  font-size: 1.3rem;
}
.stat-value.completed {
  color: #10b981;
  font-size: 1.3rem;
}
.stat-value.completed-date {
  color: var(--text-secondary);
  font-size: 0.9rem;
}
.completed-credit {
  opacity: 0.8;
  border-left: 5px solid #10b981;
}
.completed-credit:hover {
  opacity: 1;
}
.no-items-card {
  text-align: center;
  font-size: 1.2rem;
  padding: 2rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
}
</style>
