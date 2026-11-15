<script setup>
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'

const props = defineProps({
  credit: Object,
  saving: Boolean,
})
const emit = defineEmits(['close', 'submit'])
const toast = useToast()

// Copia editable de los productos; `removed` marca los que se van a eliminar
const items = ref(
  props.credit.products.map((p) => ({
    _id: p._id,
    name: p.name,
    price: p.price,
    originalName: p.name,
    originalPrice: p.price,
    removed: false,
  })),
)
const additionalInstallments = ref(1)

const activeItems = computed(() => items.value.filter((i) => !i.removed))
const removedItems = computed(() => items.value.filter((i) => i.removed))

const oldSum = props.credit.products.reduce((sum, p) => sum + p.price, 0)
const totalPaid = (props.credit.paymentHistory || []).reduce((sum, p) => sum + (p.amount || 0), 0)

const newSum = computed(() => activeItems.value.reduce((sum, i) => sum + (Number(i.price) || 0), 0))
// Misma fórmula que el backend: se aplica la diferencia al monto original
const newDebt = computed(() => props.credit.originalAmount + (newSum.value - oldSum) - totalPaid)
const willBePaid = computed(() => newDebt.value <= 0)
// Lo que el cliente ha abonado por encima del nuevo total
const overpaid = computed(() => (newDebt.value < 0 ? -newDebt.value : 0))
const needsInstallments = computed(
  () => !willBePaid.value && props.credit.remainingInstallments <= 0,
)
const installmentsLeft = computed(
  () =>
    props.credit.remainingInstallments +
    (needsInstallments.value ? Number(additionalInstallments.value) || 0 : 0),
)
const newInstallmentValue = computed(() =>
  willBePaid.value || installmentsLeft.value <= 0 ? 0 : newDebt.value / installmentsLeft.value,
)
const hasChanges = computed(() =>
  items.value.some(
    (i) => i.removed || i.name.trim() !== i.originalName || Number(i.price) !== i.originalPrice,
  ),
)

function isEdited(item) {
  return item.name.trim() !== item.originalName || Number(item.price) !== item.originalPrice
}

function removeItem(item) {
  if (activeItems.value.length <= 1) {
    return toast.warning('El crédito debe tener al menos un producto.')
  }
  item.removed = true
}
function restoreItem(item) {
  item.removed = false
}

function handleSubmit() {
  if (!hasChanges.value) return toast.info('No hay cambios para guardar.')

  const invalid = activeItems.value.find((i) => !i.name.trim() || !(Number(i.price) > 0))
  if (invalid) return toast.warning('Cada producto necesita nombre y un valor mayor a 0.')

  if (needsInstallments.value && !(Number(additionalInstallments.value) >= 1)) {
    return toast.warning('Indica cuántas cuotas agregar (mínimo 1).')
  }

  const lines = []
  if (removedItems.value.length) {
    lines.push(
      `Se eliminarán ${removedItems.value.length} producto(s):\n` +
        removedItems.value.map((i) => `• ${i.originalName}`).join('\n'),
    )
  }
  lines.push(
    willBePaid.value
      ? 'El crédito quedará PAGADO.'
      : `Nueva deuda: ${formatCurrency(newDebt.value)}`,
  )
  if (overpaid.value > 0) {
    lines.push(
      `⚠️ ATENCIÓN: el cliente ha pagado ${formatCurrency(overpaid.value)} más que el nuevo total.`,
    )
  }
  if (!window.confirm(`${lines.join('\n\n')}\n\n¿Guardar los cambios?`)) return

  emit('submit', {
    products: activeItems.value.map((i) => ({
      _id: i._id,
      name: i.name.trim(),
      price: Number(i.price),
    })),
    additionalInstallments: needsInstallments.value ? Number(additionalInstallments.value) : 0,
  })
}

function formatCurrency(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '$ 0'
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
        <h2>Editar Productos</h2>
        <button @click="emit('close')" class="close-icon" aria-label="Cerrar">&times;</button>
      </div>
      <p class="client-line">{{ credit.client.fullName }}</p>

      <div class="modal-body">
        <ul class="item-list">
          <li
            v-for="item in items"
            :key="item._id"
            :class="['item-card', { removed: item.removed, edited: !item.removed && isEdited(item) }]"
          >
            <template v-if="!item.removed">
              <div class="field name-field">
                <label :for="`name-${item._id}`">Producto</label>
                <input :id="`name-${item._id}`" type="text" v-model="item.name" />
              </div>
              <div class="field price-field">
                <label :for="`price-${item._id}`">Valor</label>
                <input
                  :id="`price-${item._id}`"
                  type="number"
                  inputmode="numeric"
                  min="1"
                  v-model.number="item.price"
                />
              </div>
              <button
                type="button"
                class="icon-btn delete"
                :disabled="activeItems.length <= 1"
                @click="removeItem(item)"
                :title="`Eliminar ${item.originalName}`"
                :aria-label="`Eliminar ${item.originalName}`"
              >
                🗑️
              </button>
            </template>
            <template v-else>
              <span class="removed-name">{{ item.originalName }}</span>
              <span class="removed-price">{{ formatCurrency(item.originalPrice) }}</span>
              <button type="button" class="restore-btn" @click="restoreItem(item)">
                Deshacer
              </button>
            </template>
          </li>
        </ul>

        <fieldset v-if="needsInstallments" class="installments-card">
          <legend>Cuotas</legend>
          <p>Al crédito no le quedan cuotas, pero tendrá saldo. ¿Cuántas cuotas agregar?</p>
          <input type="number" inputmode="numeric" min="1" v-model.number="additionalInstallments" />
        </fieldset>
      </div>

      <div class="summary-card">
        <div class="summary-row">
          <span>Deuda actual</span>
          <span>{{ formatCurrency(credit.totalAmount) }}</span>
        </div>
        <div class="summary-row total">
          <span>Nueva deuda</span>
          <span>{{ willBePaid ? formatCurrency(0) : formatCurrency(newDebt) }}</span>
        </div>
        <div v-if="willBePaid" class="paid-note">El crédito quedará pagado</div>
        <div v-if="overpaid > 0" class="overpaid-warning" role="alert">
          ⚠️ El cliente ha pagado <strong>{{ formatCurrency(overpaid) }}</strong> más que el
          nuevo total.
        </div>
        <div v-else class="summary-row muted">
          <span>Valor cuota ({{ installmentsLeft }} restantes)</span>
          <span>{{ formatCurrency(newInstallmentValue) }}</span>
        </div>
      </div>

      <div class="modal-actions">
        <button type="button" class="action-btn cancel" @click="emit('close')">Cancelar</button>
        <button
          type="button"
          class="action-btn save"
          :disabled="!hasChanges || saving"
          @click="handleSubmit"
        >
          {{ saving ? 'Guardando...' : 'Guardar cambios' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
}
.modal-content {
  background: var(--dark-bg);
  padding: 1.25rem;
  border-radius: 16px;
  border: 1px solid var(--glass-border);
  width: 94%;
  max-width: 600px;
  max-height: 92vh;
  max-height: 92dvh;
  display: flex;
  flex-direction: column;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}
.modal-header h2 {
  margin: 0;
  font-size: 1.3rem;
}
.close-icon {
  background: none;
  border: none;
  font-size: 2rem;
  line-height: 1;
  color: var(--text-primary);
  cursor: pointer;
  min-width: 44px;
  min-height: 44px;
}
.client-line {
  margin: 0 0 1rem;
  color: var(--text-secondary);
  flex-shrink: 0;
}
.modal-body {
  overflow-y: auto;
  flex: 1 1 auto;
  min-height: 0;
  padding-right: 0.25rem;
}
.item-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Celular: tarjeta con nombre arriba, valor + eliminar abajo */
.item-card {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    'name name'
    'price action';
  gap: 0.5rem;
  align-items: end;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-left: 4px solid transparent;
  border-radius: 12px;
  padding: 0.75rem;
}
.item-card.edited {
  border-left-color: #3b82f6;
}
.name-field {
  grid-area: name;
}
.price-field {
  grid-area: price;
}
.icon-btn {
  grid-area: action;
}
.field label {
  display: block;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}
input {
  width: 100%;
  padding: 0.7rem;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 1rem;
  box-sizing: border-box;
}
.icon-btn {
  min-width: 48px;
  height: 46px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
}
.icon-btn.delete {
  background-color: rgba(239, 68, 68, 0.2);
}
.icon-btn.delete:hover:not(:disabled) {
  background-color: rgba(239, 68, 68, 0.4);
}
.icon-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* Producto marcado para eliminar */
.item-card.removed {
  grid-template-columns: 1fr auto;
  grid-template-areas:
    'rname rbtn'
    'rprice rbtn';
  align-items: center;
  border-left-color: #ef4444;
  opacity: 0.75;
}
.removed-name {
  grid-area: rname;
  text-decoration: line-through;
  color: var(--text-secondary);
  word-break: break-word;
}
.removed-price {
  grid-area: rprice;
  text-decoration: line-through;
  font-size: 0.85rem;
  color: var(--text-secondary);
}
.restore-btn {
  grid-area: rbtn;
  background: none;
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
  border-radius: 8px;
  padding: 0 0.9rem;
  min-height: 44px;
  cursor: pointer;
}

.installments-card {
  border: 1px solid #f59e0b;
  border-radius: 12px;
  padding: 0.75rem;
  margin: 1rem 0 0;
}
.installments-card legend {
  color: #f59e0b;
  font-weight: 700;
  padding: 0 0.25rem;
}
.installments-card p {
  margin: 0 0 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.summary-card {
  flex-shrink: 0;
  background-color: rgba(0, 0, 0, 0.25);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.15rem 0;
}
.summary-row.total {
  font-weight: 700;
  font-size: 1.15rem;
  color: var(--primary-accent);
}
.summary-row.muted {
  font-size: 0.9rem;
  color: var(--text-secondary);
}
.paid-note {
  font-size: 0.9rem;
  color: #10b981;
  font-weight: 600;
}
.overpaid-warning {
  margin-top: 0.5rem;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid #f59e0b;
  color: #fbbf24;
  font-size: 0.9rem;
  line-height: 1.35;
}
.overpaid-warning strong {
  color: #fde68a;
}

.modal-actions {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-top: 1rem;
}
.action-btn {
  width: 100%;
  padding: 0.85rem;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
}
.action-btn.cancel {
  background: transparent;
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
}
.action-btn.save {
  background-color: var(--primary-accent);
  color: var(--dark-bg);
}
.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Tablet y escritorio: cada producto en una sola fila */
@media (min-width: 640px) {
  .modal-content {
    padding: 2rem;
  }
  .item-card {
    grid-template-columns: 1fr 160px auto;
    grid-template-areas: 'name price action';
  }
  .item-card.removed {
    grid-template-columns: 1fr auto auto;
    grid-template-areas: 'rname rprice rbtn';
    gap: 1rem;
  }
}
</style>
