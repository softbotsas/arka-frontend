<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { fetchCreditById, updateCredit } from '../services/api.js'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const creditToEdit = ref(null)
const isLoading = ref(true)

onMounted(async () => {
  const creditId = route.params.id
  try {
    const response = await fetchCreditById(creditId)
    creditToEdit.value = response.data
    if (creditToEdit.value.paymentFrequency === 'quincenal') {
      creditToEdit.value.quincenaDay1 = creditToEdit.value.paymentDaysOfMonth[0] || 15
      creditToEdit.value.quincenaDay2 = creditToEdit.value.paymentDaysOfMonth[1] || 30
    }
  } catch (error) {
    toast.error('No se pudo encontrar el crédito.')
    router.push('/credits/manage')
  } finally {
    isLoading.value = false
  }
})

async function submitUpdate() {
  if (!creditToEdit.value) return
  try {
    const payload = { ...creditToEdit.value }
    if (payload.paymentFrequency === 'quincenal') {
      payload.paymentDaysOfMonth = [payload.quincenaDay1, payload.quincenaDay2]
    }
    await updateCredit(payload._id, payload)
    toast.success('¡Crédito actualizado!')
    router.push('/credits/manage')
  } catch (error) {
    toast.error('Hubo un error al guardar los cambios.')
  }
}
</script>

<template>
  <div class="edit-credit-container">
    <div v-if="isLoading" class="loading-state">Cargando datos del crédito...</div>

    <div v-else-if="creditToEdit">
      <div class="view-header">
        <h2>Editando Crédito</h2>
        <p>
          Ajusta los detalles del crédito para <strong>{{ creditToEdit.client.fullName }}</strong
          >.
        </p>
      </div>
      <form @submit.prevent="submitUpdate">
        <fieldset class="card">
          <legend>Cliente</legend>
          <input
            type="text"
            :value="creditToEdit.client.fullName + ' - CC: ' + creditToEdit.client.cedula"
            disabled
          />
        </fieldset>

        <fieldset class="card">
          <legend>Detalles del crédito</legend>
          <!-- No permitimos editar los productos aquí para mantener la simplicidad -->
          <div class="form-group">
            <label>Productos</label>
            <input
              type="text"
              :value="creditToEdit.products.map((p) => p.name).join(', ')"
              disabled
            />
          </div>
          <div class="form-group">
            <label for="totalAmount">Monto Total Original</label>
            <input
              id="totalAmount"
              type="number"
              v-model.number="creditToEdit.originalAmount"
              required
            />
          </div>
          <div class="form-group">
            <label for="installments">Número de Cuotas</label>
            <input
              id="installments"
              type="number"
              v-model.number="creditToEdit.installments"
              required
            />
          </div>
        </fieldset>

        <fieldset class="card">
          <legend>Frecuencia de pago</legend>
          <select v-model="creditToEdit.paymentFrequency" required>
            <option value="semanal">Semanal</option>
            <option value="quincenal">Quincenal</option>
          </select>
          <div v-if="creditToEdit.paymentFrequency === 'semanal'" class="form-group">
            <label for="dayOfWeek">Día de cobro:</label>
            <select id="dayOfWeek" v-model.number="creditToEdit.paymentDayOfWeek">
              <option value="1">Lunes</option>
              <option value="2">Martes</option>
              <option value="3">Miércoles</option>
              <option value="4">Jueves</option>
              <option value="5">Viernes</option>
              <option value="6">Sábado</option>
              <option value="7">Domingo</option>
            </select>
          </div>
          <div v-if="creditToEdit.paymentFrequency === 'quincenal'" class="quincenal-group">
            <label>Días de cobro:</label>
            <input
              type="number"
              v-model.number="creditToEdit.quincenaDay1"
              min="1"
              max="31"
              required
            />
            <span>y</span>
            <input
              type="number"
              v-model.number="creditToEdit.quincenaDay2"
              min="1"
              max="31"
              required
            />
          </div>
        </fieldset>

        <button type="submit" class="submit-btn">Guardar Cambios</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.edit-credit-container {
  max-width: 900px;
  margin: 0 auto;
}
.loading-state {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: var(--text-secondary);
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
input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
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
</style>
