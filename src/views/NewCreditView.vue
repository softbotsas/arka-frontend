<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { fetchClients, addClient, addCredit } from '../services/api.js'
import ReceiptModal from '../components/ReceiptModal.vue'

const router = useRouter()
const toast = useToast()
const clients = ref([])
const clientSelectionMode = ref('existing')
const newClient = ref({ fullName: '', cedula: '', phone: '', address: '' })
const newCredit = ref({
  client: '',
  products: [{ name: '', price: null }],
  installments: null,
  paymentFrequency: 'semanal',
  paymentDayOfWeek: 1,
  quincenaDay1: 15,
  quincenaDay2: 30,
})
const showReceipt = ref(false)
const receiptData = ref({})

const totalAmount = computed(() => {
  return newCredit.value.products.reduce((sum, product) => sum + (product.price || 0), 0)
})
const valorCuota = computed(() => {
  if (totalAmount.value > 0 && newCredit.value.installments > 0) {
    return totalAmount.value / newCredit.value.installments
  }
  return 0
})

onMounted(async () => {
  try {
    const response = await fetchClients()
    clients.value = response.data
  } catch (error) {
    console.error('Error al cargar clientes:', error)
    toast.error('No se pudieron cargar los clientes.')
  }
})

function addProduct() {
  newCredit.value.products.push({ name: '', price: null })
}
function removeProduct(index) {
  if (newCredit.value.products.length > 1) newCredit.value.products.splice(index, 1)
}

async function submitForm() {
  try {
    let clientData
    if (clientSelectionMode.value === 'new') {
      const response = await addClient(newClient.value)
      clientData = response.data
    } else {
      clientData = clients.value.find((c) => c._id === newCredit.value.client)
    }
    if (!clientData) {
      toast.warning('Debes seleccionar o crear un cliente.')
      return
    }
    const validProducts = newCredit.value.products.filter((p) => p.name && p.price > 0)
    if (validProducts.length === 0) {
      toast.warning('Debes añadir al menos un producto válido.')
      return
    }
    const creditPayload = {
      ...newCredit.value,
      products: validProducts,
      client: clientData._id,
      paymentDaysOfMonth: [newCredit.value.quincenaDay1, newCredit.value.quincenaDay2],
    }
    const response = await addCredit(creditPayload)
    const createdCredit = response.data
    receiptData.value = {
      creditData: createdCredit,
      clientData: clientData,
      valorCuota: createdCredit.totalAmount / createdCredit.installments,
    }
    showReceipt.value = true
  } catch (error) {
    toast.error('Error al crear el crédito.')
  }
}

function closeReceiptAndReset() {
  showReceipt.value = false
  router.push('/credits/manage')
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
  <ReceiptModal
    v-if="showReceipt"
    :creditData="receiptData.creditData"
    :clientData="receiptData.clientData"
    :valorCuota="receiptData.valorCuota"
    @close="closeReceiptAndReset"
  />

  <div class="new-credit-container">
    <div class="view-header">
      <h2>Registrar un Nuevo Crédito</h2>
    </div>
    <form @submit.prevent="submitForm">
      <fieldset class="card">
        <legend>Paso 1: Elige o crea un cliente</legend>
        <div class="client-toggle">
          <label
            ><input type="radio" v-model="clientSelectionMode" value="existing" /> Cliente
            Existente</label
          >
          <label
            ><input type="radio" v-model="clientSelectionMode" value="new" /> Cliente Nuevo</label
          >
        </div>
        <div v-if="clientSelectionMode === 'existing'" class="form-group">
          <select id="client" v-model="newCredit.client" required>
            <option disabled value="">-- Clientes Registrados --</option>
            <option v-for="client in clients" :key="client._id" :value="client._id">
              {{ client.fullName }} - CC: {{ client.cedula }}
            </option>
          </select>
        </div>
        <div v-if="clientSelectionMode === 'new'" class="new-client-form highlighted-section">
          <input type="text" v-model="newClient.fullName" placeholder="Nombre Completo" required />
          <input type="text" v-model="newClient.cedula" placeholder="Número de Cédula" required />
          <input type="text" v-model="newClient.phone" placeholder="Número de Teléfono" required />
          <input type="text" v-model="newClient.address" placeholder="Dirección" required />
        </div>
      </fieldset>

      <fieldset class="card">
        <legend>Paso 2: Productos del crédito</legend>
        <div v-for="(product, index) in newCredit.products" :key="index" class="product-row">
          <input type="text" v-model="product.name" placeholder="Nombre del Producto" required />
          <input type="number" v-model.number="product.price" placeholder="Valor $" required />
          <button
            type="button"
            @click="removeProduct(index)"
            class="remove-btn"
            :disabled="newCredit.products.length === 1"
          >
            ×
          </button>
        </div>
        <button type="button" @click="addProduct" class="add-btn">Añadir otro producto</button>
        <div class="summary-total">
          Monto Total del Crédito: <strong>{{ formatCurrency(totalAmount) }}</strong>
        </div>
      </fieldset>

      <fieldset class="card">
        <legend>Paso 3: Detalles de Pago</legend>
        <input
          type="number"
          v-model.number="newCredit.installments"
          placeholder="Número de Cuotas"
          required
        />
        <div v-if="valorCuota > 0" class="installment-value">
          Valor por cuota: <strong>{{ formatCurrency(valorCuota) }}</strong>
        </div>
      </fieldset>

      <fieldset class="card">
        <legend>Paso 4: Frecuencia de pago</legend>
        <select v-model="newCredit.paymentFrequency" required>
          <option value="semanal">Semanal</option>
          <option value="quincenal">Quincenal</option>
        </select>
        <div v-if="newCredit.paymentFrequency === 'semanal'" class="form-group">
          <label for="dayOfWeek">Día de cobro:</label>
          <select id="dayOfWeek" v-model.number="newCredit.paymentDayOfWeek">
            <option value="1">Lunes</option>
            <option value="2">Martes</option>
            <option value="3">Miércoles</option>
            <option value="4">Jueves</option>
            <option value="5">Viernes</option>
            <option value="6">Sábado</option>
            <option value="7">Domingo</option>
          </select>
        </div>
        <div v-if="newCredit.paymentFrequency === 'quincenal'" class="quincenal-group">
          <label>Días de cobro:</label>
          <input type="number" v-model.number="newCredit.quincenaDay1" min="1" max="31" required />
          <span>y</span>
          <input type="number" v-model.number="newCredit.quincenaDay2" min="1" max="31" required />
        </div>
      </fieldset>

      <button type="submit" class="submit-btn">Crear Crédito</button>
    </form>
  </div>
</template>

<style scoped>
.new-credit-container {
  margin-top: 2rem;
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
  margin-bottom: 1.5rem;
}
fieldset {
  border: none;
  padding: 0;
  margin: 0;
}
legend {
  font-weight: 700;
  color: var(--primary-accent);
  padding: 0 0.5rem;
  margin-left: 1rem;
  font-size: 1rem;
}
.client-toggle {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  justify-content: center;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}
input,
select {
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1rem;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 1rem;
}
input:last-child,
select:last-child {
  margin-bottom: 0;
}
.new-client-form {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
.submit-btn {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  background-color: var(--primary-accent);
  color: var(--dark-bg);
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: transform 0.2s ease;
}
.submit-btn:hover {
  transform: scale(1.02);
}
@media (min-width: 768px) {
  .new-client-form {
    grid-template-columns: 1fr 1fr;
  }
}
.highlighted-section {
  background-color: rgba(0, 221, 153, 0.05);
  border: 1px solid rgba(0, 221, 153, 0.2);
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}
.quincenal-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}
.quincenal-group label {
  margin-bottom: 0;
}
.quincenal-group input {
  margin-bottom: 0;
  text-align: center;
}
.installment-value {
  background-color: rgba(0, 221, 153, 0.1);
  color: var(--primary-accent);
  padding: 0.75rem;
  border-radius: 8px;
  text-align: center;
  margin-top: 1rem;
  font-size: 1.1rem;
}
.product-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}
.product-row input:first-child {
  flex-grow: 1;
}
.remove-btn,
.add-btn {
  padding: 0.5rem;
  height: 48px;
  min-width: 48px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.remove-btn {
  background-color: #ef4444;
  color: white;
  font-size: 1.5rem;
}
.remove-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.add-btn {
  width: 100%;
  background-color: rgba(0, 221, 153, 0.2);
  color: var(--primary-accent);
  font-weight: bold;
}
.summary-total {
  text-align: right;
  font-size: 1.2rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--glass-border);
}

/* --- 👇👇 ESTILOS NUEVOS PARA CORREGIR EL DROPDOWN 👇👇 --- */
select option {
  background-color: var(--dark-bg); /* Fondo oscuro para cada opción */
  color: var(--text-primary); /* Texto claro para buen contraste */
  padding: 8px; /* Espaciado interno opcional */
}

select option:disabled {
  color: var(--text-secondary);
  font-style: italic;
}
</style>
