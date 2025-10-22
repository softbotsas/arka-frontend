<script setup>
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'

const props = defineProps({
  credit: {
    type: Object,
    required: true
  },
  remainingBalance: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['close', 'add-installments'])

const toast = useToast()
const newInstallments = ref(1)
const isSubmitting = ref(false)

const formattedBalance = computed(() => {
  if (typeof props.remainingBalance !== 'number') return '$ 0'
  return props.remainingBalance.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  })
})

async function handleSubmit() {
  if (newInstallments.value < 1) {
    toast.error('Debe agregar al menos 1 cuota adicional')
    return
  }

  isSubmitting.value = true
  try {
    emit('add-installments', newInstallments.value)
  } catch (error) {
    toast.error('Error al procesar la solicitud')
  } finally {
    isSubmitting.value = false
  }
}

function closeModal() {
  emit('close')
}
</script>

<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Saldo Restante Pendiente</h3>
        <button @click="closeModal" class="close-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="balance-info">
          <p class="balance-text">
            El crédito ha alcanzado el límite de cuotas establecidas, pero aún tiene un saldo pendiente de:
          </p>
          <div class="balance-amount">{{ formattedBalance }}</div>
        </div>

        <div class="form-section">
          <label for="installments" class="form-label">
            ¿Cuántas cuotas adicionales deseas agregar?
          </label>
          <input
            id="installments"
            v-model.number="newInstallments"
            type="number"
            min="1"
            max="24"
            class="form-input"
            placeholder="Ej: 2"
          />
          <p class="help-text">
            Se agregarán {{ newInstallments }} cuota(s) adicional(es) al crédito
          </p>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="closeModal" class="btn-secondary">
          Cancelar
        </button>
        <button
          @click="handleSubmit"
          class="btn-primary"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Procesando...' : 'Agregar Cuotas' }}
        </button>
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
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--dark-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--glass-border);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
}

.balance-info {
  text-align: center;
  margin-bottom: 2rem;
}

.balance-text {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.balance-amount {
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-accent);
  background: rgba(0, 221, 153, 0.1);
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid var(--primary-accent);
}

.form-section {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  color: var(--text-primary);
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-accent);
}

.help-text {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--glass-border);
  justify-content: flex-end;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: none;
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: var(--primary-accent);
  border: none;
  border-radius: 8px;
  color: var(--dark-bg);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #00c085;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
