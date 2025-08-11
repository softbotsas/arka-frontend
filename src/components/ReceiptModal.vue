<script setup>
defineProps({
  creditData: Object,
  clientData: Object,
  valorCuota: Number,
})
const emit = defineEmits(['close'])

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
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('es-CO', options)
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <div class="receipt-header">
        <span class="logo">S/A</span>
        <h2>Arka ha generado un crédito</h2>
      </div>
      <div class="receipt-body">
        <h3>Detalles del Cliente</h3>
        <p><strong>Nombre:</strong> {{ clientData.fullName }}</p>
        <p><strong>Cédula:</strong> {{ clientData.cedula }}</p>
        <p><strong>Teléfono:</strong> {{ clientData.phone }}</p>

        <h3>Detalles del Crédito</h3>
        <ul class="product-list">
          <li v-for="(product, index) in creditData.products" :key="index">
            <span>{{ product.name }}</span>
            <span>{{ formatCurrency(product.price) }}</span>
          </li>
        </ul>
        <p class="total-line">
          <strong>Monto Total:</strong> {{ formatCurrency(creditData.totalAmount) }}
        </p>
        <p><strong>Número de Cuotas:</strong> {{ creditData.installments }}</p>
        <p class="highlight"><strong>Valor por Cuota:</strong> {{ formatCurrency(valorCuota) }}</p>

        <h3>Información de Pago</h3>
        <p>
          <strong>Frecuencia:</strong>
          {{ creditData.paymentFrequency === 'semanal' ? 'Semanal' : 'Quincenal' }}
        </p>
        <p><strong>Primer Pago:</strong> {{ formatDate(creditData.nextPaymentDate) }}</p>
      </div>
      <button @click="emit('close')" class="close-btn">Cerrar</button>
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
  z-index: 1000;
}
.modal-content {
  background: var(--dark-bg);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid var(--glass-border);
  width: 90%;
  max-width: 500px;
  animation: popIn 0.3s ease;
}
.receipt-header {
  text-align: center;
  border-bottom: 1px solid var(--glass-border);
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}
.logo {
  font-size: 2rem;
  font-weight: 900;
  color: var(--primary-accent);
}
h2 {
  margin: 0.5rem 0 0 0;
}
h3 {
  color: var(--primary-accent);
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}
p {
  margin: 0.25rem 0;
  color: var(--text-secondary);
}
p strong {
  color: var(--text-primary);
}
.highlight {
  background-color: rgba(0, 221, 153, 0.1);
  padding: 0.5rem;
  border-radius: 8px;
}
.close-btn {
  width: 100%;
  padding: 0.8rem;
  margin-top: 2rem;
  border: none;
  border-radius: 8px;
  background-color: var(--primary-accent);
  color: var(--dark-bg);
  font-weight: 700;
  cursor: pointer;
}
@keyframes popIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* ESTILOS PARA LA LISTA DE PRODUCTOS */
.product-list {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0;
}
.product-list li {
  display: flex;
  justify-content: space-between;
  padding: 0.4rem 0;
  border-bottom: 1px dashed var(--glass-border);
}
.product-list li:last-child {
  border-bottom: none;
}
.total-line {
  border-top: 1px solid var(--glass-border);
  padding-top: 0.5rem;
  margin-top: 0.5rem;
}
</style>
