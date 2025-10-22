<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  credit: Object,
})

const emit = defineEmits([
  'close',
  'open-payment-modal',
  'delete-credit',
  'edit-credit',
  'open-add-products-modal',
  'edit-payment',
  'delete-payment',
])

const activeTab = ref('details')

const nextInstallmentValue = computed(() => {
  if (!props.credit || !props.credit.totalAmount || props.credit.remainingInstallments <= 0)
    return 0
  return props.credit.totalAmount / props.credit.remainingInstallments
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
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content" v-if="credit">
      <div class="modal-header">
        <h2>{{ activeTab === 'details' ? 'Detalles del Crédito' : 'Historial de Abonos' }}</h2>
        <button @click="emit('close')" class="close-icon">×</button>
      </div>

      <div class="modal-tabs">
        <button @click="activeTab = 'details'" :class="{ active: activeTab === 'details' }">
          Detalles
        </button>
        <button @click="activeTab = 'history'" :class="{ active: activeTab === 'history' }">
          Historial
        </button>
      </div>

      <!-- CAMBIO AQUÍ: La clase .modal-body ahora envuelve las dos vistas y tendrá el scroll -->
      <div class="modal-body">
        <div v-if="activeTab === 'details'">
          <h3>{{ credit.client.fullName }}</h3>
          <p><strong>Cédula:</strong> {{ credit.client.cedula }}</p>
          <hr />
          <p><strong>Productos Adquiridos:</strong></p>
          <ul class="product-list-detail">
            <li v-for="(product, index) in credit.products" :key="index">
              <span>{{ product.name }}</span>
              <span class="product-price">{{ formatCurrency(product.price) }}</span>
            </li>
          </ul>
          <p class="total-line">
            <strong>Deuda Restante:</strong> {{ formatCurrency(credit.totalAmount) }}
          </p>
          <p>
            <strong>Cuotas:</strong> {{ credit.remainingInstallments }} de
            {{ credit.installments }} restantes
          </p>
          <p class="highlight">
            <strong>Valor Próxima Cuota:</strong> {{ formatCurrency(nextInstallmentValue) }}
          </p>
          <p><strong>Próximo Pago:</strong> {{ formatDate(credit.nextPaymentDate) }}</p>
          <p>
            <strong>Estado:</strong>
            <span :class="['status', credit.status]">{{ credit.status }}</span>
          </p>
        </div>

        <div v-if="activeTab === 'history'">
          <div
            v-if="!credit.paymentHistory || credit.paymentHistory.length === 0"
            class="no-history"
          >
            <p>No se han registrado abonos para este crédito todavía.</p>
          </div>
          <ul v-else class="history-list">
            <li v-for="(payment, index) in credit.paymentHistory" :key="index" class="history-item">
              <div class="payment-info">
                <span class="history-date">{{ formatDate(payment.date) }}</span>
                <span class="history-amount">{{ formatCurrency(payment.amount) }}</span>
              </div>
              <div class="payment-actions">
                <button
                  @click="emit('edit-payment', index, payment)"
                  class="action-btn edit-payment"
                  title="Editar abono"
                >
                  ✏️
                </button>
                <button
                  @click="emit('delete-payment', index)"
                  class="action-btn delete-payment"
                  title="Eliminar abono"
                >
                  🗑️
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div class="modal-actions">
        <button
          @click="emit('open-payment-modal')"
          class="action-btn pay"
          :disabled="credit.status === 'pagado'"
        >
          Registrar Abono
        </button>
        <button
          @click="emit('open-add-products-modal')"
          class="action-btn add"
          :disabled="credit.status === 'pagado'"
        >
          Añadir Productos
        </button>
        <button @click="emit('edit-credit', credit._id)" class="action-btn edit">Editar</button>
        <button @click="emit('delete-credit', credit._id)" class="action-btn delete">
          Eliminar
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* (Estilos anteriores) */
hr {
  border: none;
  border-top: 1px solid var(--glass-border);
  margin: 1rem 0;
}
p {
  margin: 0.5rem 0;
  color: var(--text-secondary);
}
p strong {
  color: var(--text-primary);
}
.highlight {
  background-color: rgba(0, 221, 153, 0.1);
  padding: 0.5rem;
  border-radius: 8px;
  margin-top: 1rem;
}
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
  z-index: 1000;
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
.status {
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
.product-list-detail {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 1rem 0;
}
.product-list-detail li {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  border-bottom: 1px solid var(--glass-border);
}
.product-list-detail li:last-child {
  border-bottom: none;
}
.product-price {
  font-weight: 500;
  color: var(--text-primary);
}
.total-line {
  border-top: 1px solid var(--glass-border);
  padding-top: 0.5rem;
  margin-top: 0.5rem;
}
.modal-tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid var(--glass-border);
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}
.modal-tabs button {
  background: none;
  border: none;
  color: var(--text-secondary);
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
}
.modal-tabs button.active {
  color: var(--primary-accent);
  border-bottom-color: var(--primary-accent);
}
.no-history {
  text-align: center;
  padding: 2rem 0;
  color: var(--text-secondary);
}
.history-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0.25rem;
  border-bottom: 1px solid var(--glass-border);
}
.history-item:last-child {
  border-bottom: none;
}
.payment-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex-grow: 1;
}
.history-date {
  font-size: 0.9rem;
  color: var(--text-secondary);
}
.history-amount {
  font-weight: 700;
  color: var(--text-primary);
}
.payment-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: 1rem;
}
.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s;
  opacity: 0.7;
}
.action-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}
.edit-payment:hover {
  background-color: rgba(59, 130, 246, 0.2);
}
.delete-payment:hover {
  background-color: rgba(239, 68, 68, 0.2);
}

/* --- CAMBIO AQUÍ: ESTILOS PARA EL SCROLL Y LOS BOTONES --- */

.modal-content {
  background: var(--dark-bg);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid var(--glass-border);
  width: 90%;
  max-width: 500px;
  /* Nuevos estilos para controlar la altura y el scroll */
  display: flex;
  flex-direction: column;
  max-height: 90vh; /* El modal nunca será más alto que el 90% de la pantalla */
}

.modal-body {
  overflow-y: auto; /* AÑADE SCROLL VERTICAL SI EL CONTENIDO SE DESBORDA */
  padding-right: 1rem; /* Espacio para que el scrollbar no se pegue al texto */
  margin-right: -1rem; /* Compensa el padding para mantener la alineación */
}

.modal-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-top: 1.5rem;
  /* El pie de página con los botones no tiene scroll */
  flex-shrink: 0;
}
.action-btn {
  width: 100%;
  padding: 0.8rem;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}
.action-btn.pay {
  background-color: var(--primary-accent);
  color: var(--dark-bg);
}
.action-btn.add {
  background-color: #f59e0b;
  color: white;
}
.action-btn.edit {
  background-color: #3b82f6;
  color: white;
}
.action-btn.delete {
  background-color: #ef4444;
  color: white;
}
.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
