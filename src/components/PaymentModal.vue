<script setup>
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'

const props = defineProps({
  credit: Object,
})
const emit = defineEmits(['close', 'submit'])
const toast = useToast()
const paymentType = ref('exact')
const customAmount = ref(null)

const exactInstallmentValue = computed(() => {
  if (!props.credit || !props.credit.totalAmount || props.credit.remainingInstallments <= 0) {
    return 0
  }
  return Math.round(props.credit.totalAmount / props.credit.remainingInstallments)
})

const amountToPay = computed(() => {
  if (paymentType.value === 'exact') {
    return exactInstallmentValue.value
  }
  return customAmount.value
})

function submitPayment() {
  if (!amountToPay.value || amountToPay.value <= 0) {
    toast.warning('Por favor, ingresa un monto válido.')
    return
  }
  emit('submit', amountToPay.value)
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
        <h2>Registrar Abono</h2>
        <button @click="emit('close')" class="close-icon">&times;</button>
      </div>
      <div class="modal-body">
        <h4>{{ credit.client.fullName }}</h4>
        <p>Deuda Actual: {{ formatCurrency(credit.totalAmount) }}</p>

        <div class="payment-options">
          <label>
            <input type="radio" v-model="paymentType" value="exact" />
            Abonar cuota establecida ({{ formatCurrency(exactInstallmentValue) }})
          </label>
          <label>
            <input type="radio" v-model="paymentType" value="other" />
            Abonar otro valor
          </label>
        </div>

        <div class="form-group">
          <label>Monto a Abonar</label>
          <input
            type="number"
            :disabled="paymentType === 'exact'"
            :value="amountToPay"
            @input="customAmount = parseFloat($event.target.value)"
            placeholder="0"
            class="amount-input"
          />
          <p v-if="paymentType === 'exact'" class="info-text">
            El valor se calcula dividiendo la deuda actual entre las cuotas restantes.
          </p>
        </div>
      </div>
      <div class="modal-actions">
        <button @click="submitPayment" class="action-btn pay">Confirmar Abono</button>
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
  max-width: 500px;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--glass-border);
  padding-bottom: 1rem;
}
.close-icon {
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--text-primary);
  cursor: pointer;
}
.modal-body h4 {
  color: var(--primary-accent);
  margin-top: 1rem;
}
.payment-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1.5rem 0;
}
.payment-options label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}
.amount-input {
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: var(--text-primary);
}
.info-text {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
  text-align: center;
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
