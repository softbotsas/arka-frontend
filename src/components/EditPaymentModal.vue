<script setup>
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'

const props = defineProps({
  payment: {
    type: Object,
    required: true
  },
  paymentIndex: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['close', 'submit'])

const toast = useToast()
const newAmount = ref(props.payment.amount)
const isSubmitting = ref(false)

const formattedOriginalAmount = computed(() => {
  if (typeof props.payment.amount !== 'number') return '$ 0'
  return props.payment.amount.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  })
})

const formattedNewAmount = computed(() => {
  if (typeof newAmount.value !== 'number') return '$ 0'
  return newAmount.value.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  })
})

async function handleSubmit() {
  if (!newAmount.value || newAmount.value <= 0) {
    toast.error('Por favor, ingresa un monto válido')
    return
  }

  if (newAmount.value === props.payment.amount) {
    toast.warning('El monto no ha cambiado')
    return
  }

  isSubmitting.value = true
  try {
    emit('submit', newAmount.value)
  } catch (error) {
    toast.error('Error al actualizar el abono')
  } finally {
    isSubmitting.value = false
  }
}

function closeModal() {
  emit('close')
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }
  return new Date(dateString).toLocaleDateString('es-CO', options)
}
</script>

<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Editar Abono</h3>
        <button @click="closeModal" class="close-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="payment-info">
          <p class="payment-date">{{ formatDate(payment.date) }}</p>
          <div class="amount-comparison">
            <div class="original-amount">
              <label>Monto Original:</label>
              <span class="amount-value original">{{ formattedOriginalAmount }}</span>
            </div>
            <div class="new-amount">
              <label>Nuevo Monto:</label>
              <input
                v-model.number="newAmount"
                type="number"
                min="1"
                class="amount-input"
                placeholder="Ingresa el nuevo monto"
              />
              <span class="amount-preview">{{ formattedNewAmount }}</span>
            </div>
          </div>
        </div>

        <div class="warning-section">
          <div class="warning-icon">⚠️</div>
          <p class="warning-text">
            Al editar este abono, se recalculará automáticamente el saldo del crédito y las cuotas restantes.
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
          :disabled="isSubmitting || newAmount === payment.amount"
        >
          {{ isSubmitting ? 'Actualizando...' : 'Actualizar Abono' }}
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

.payment-info {
  margin-bottom: 1.5rem;
}

.payment-date {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1rem;
  text-align: center;
}

.amount-comparison {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.original-amount,
.new-amount {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.original-amount label,
.new-amount label {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.9rem;
}

.amount-value {
  font-size: 1.2rem;
  font-weight: bold;
  padding: 0.75rem;
  border-radius: 8px;
  text-align: center;
}

.amount-value.original {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.amount-input {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 1rem;
  text-align: center;
}

.amount-input:focus {
  outline: none;
  border-color: var(--primary-accent);
}

.amount-preview {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--primary-accent);
  text-align: center;
  padding: 0.5rem;
  background-color: rgba(0, 221, 153, 0.1);
  border-radius: 8px;
}

.warning-section {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background-color: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 8px;
}

.warning-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.warning-text {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.4;
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
