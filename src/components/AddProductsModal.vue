<script setup>
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'

const props = defineProps({
  credit: Object,
})
const emit = defineEmits(['close', 'submit'])
const toast = useToast()

const newProducts = ref([{ name: '', price: null }])
const newTotalInstallments = ref(props.credit.installments)

const valueOfNewProducts = computed(() => {
  return newProducts.value.reduce((sum, p) => sum + (p.price || 0), 0)
})
const newTotalDebt = computed(() => {
  return props.credit.totalAmount + valueOfNewProducts.value
})

function addProductRow() {
  newProducts.value.push({ name: '', price: null })
}
function removeProductRow(index) {
  if (newProducts.value.length > 1) newProducts.value.splice(index, 1)
}

function handleSubmit() {
  const validProducts = newProducts.value.filter((p) => p.name && p.price > 0)
  if (validProducts.length === 0) {
    return toast.warning('Añade al menos un producto con nombre y valor válidos.')
  }
  if (newTotalInstallments.value < props.credit.installments) {
    return toast.warning('El nuevo número de cuotas no puede ser menor al actual.')
  }
  emit('submit', { newProducts: validProducts, newTotalInstallments: newTotalInstallments.value })
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
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Añadir Productos al Crédito</h2>
        <button @click="emit('close')" class="close-icon">&times;</button>
      </div>
      <div class="modal-body">
        <div class="summary-card">
          <div class="summary-row">
            <span>Deuda Actual:</span>
            <span>{{ formatCurrency(credit.totalAmount) }}</span>
          </div>
          <div class="summary-row">
            <span>+ Valor Nuevos Productos:</span>
            <span>{{ formatCurrency(valueOfNewProducts) }}</span>
          </div>
          <hr />
          <div class="summary-row total">
            <span>Nueva Deuda Total:</span>
            <span>{{ formatCurrency(newTotalDebt) }}</span>
          </div>
        </div>

        <fieldset class="form-card">
          <legend>Nuevos Productos</legend>
          <div v-for="(p, index) in newProducts" :key="index" class="product-row">
            <input type="text" v-model="p.name" placeholder="Nombre Producto" required />
            <input type="number" v-model.number="p.price" placeholder="Valor $" required />
            <button
              @click="removeProductRow(index)"
              class="remove-btn"
              :disabled="newProducts.length === 1"
            >
              &times;
            </button>
          </div>
          <button @click="addProductRow" class="add-btn">+ Añadir Producto</button>
        </fieldset>

        <fieldset class="form-card">
          <legend>Ajustar Cuotas</legend>
          <label>Nuevo Número Total de Cuotas</label>
          <input type="number" v-model.number="newTotalInstallments" :min="credit.installments" />
        </fieldset>
      </div>
      <div class="modal-actions">
        <button @click="handleSubmit" class="action-btn pay">Confirmar y Refinanciar</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
}
.modal-content {
  background: var(--dark-bg);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid var(--glass-border);
  width: 90%;
  max-width: 600px;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.close-icon {
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--text-primary);
  cursor: pointer;
}
.summary-card {
  background-color: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
  padding: 0.25rem 0;
}
.summary-row.total {
  font-weight: bold;
  font-size: 1.2rem;
  color: var(--primary-accent);
}
hr {
  border-color: var(--glass-border);
  margin: 0.5rem 0;
}
.form-card {
  border: none;
  padding: 0;
  margin-bottom: 1.5rem;
}
legend {
  font-weight: 700;
  color: var(--primary-accent);
  padding: 0;
  margin-bottom: 1rem;
  font-size: 1rem;
}
label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}
.product-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.5rem;
}
.product-row input {
  margin-bottom: 0;
}
.product-row input:first-child {
  flex-grow: 1;
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
  margin-top: 0.5rem;
}
.modal-actions {
  margin-top: 1.5rem;
}
.action-btn {
  width: 100%;
  padding: 0.8rem;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}
.action-btn.pay {
  background-color: var(--primary-accent);
  color: var(--dark-bg);
}
</style>
