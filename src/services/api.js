import apiClient from './apiClient.js'

// --- FUNCIONES DE CLIENTES ---
export const fetchClients = () => apiClient.get('/clients')
export const fetchClientById = (id) => apiClient.get(`/clients/${id}`)
export const addClient = (clientData) => apiClient.post('/clients', clientData)
export const updateClient = (id, clientData) => apiClient.put(`/clients/${id}`, clientData)
export const fetchCreditsByClientId = (clientId) => apiClient.get(`/clients/${clientId}/credits`)

// --- FUNCIONES DE CRÉDITOS ---
export const fetchCredits = () => apiClient.get('/credits')
export const fetchCreditById = (id) => apiClient.get(`/credits/${id}`)
export const addCredit = (creditData) => apiClient.post('/credits', creditData)
export const updateCredit = (id, creditData) => apiClient.put(`/credits/${id}`, creditData)
export const deleteCredit = (id) => apiClient.delete(`/credits/${id}`)
export const registerPayment = (id, amountPaid) =>
  apiClient.post(`/credits/${id}/payments`, { amount: amountPaid })

// Función para agregar cuotas adicionales cuando se agota el límite
export const addInstallmentsToCredit = (id, additionalInstallments) =>
  apiClient.post(`/credits/${id}/add-installments`, {
    additionalInstallments: additionalInstallments
  })

// Funciones para editar y eliminar abonos del historial
export const editPayment = (creditId, paymentIndex, newAmount) =>
  apiClient.put(`/credits/${creditId}/payments/${paymentIndex}`, {
    amount: newAmount
  })

export const deletePayment = (creditId, paymentIndex) =>
  apiClient.delete(`/credits/${creditId}/payments/${paymentIndex}`)

// --- FUNCIONES DE AGENDA Y REPORTES (AHORA REALES) ---
export const fetchAgendaData = () => apiClient.get('/agenda')
export const fetchReportSummary = () => apiClient.get('/reports/summary')
export const fetchAllCompletedSales = (startDate, endDate) => {
  return apiClient.get('/reports/completed-sales', { params: { startDate, endDate } })
}
// Añade esta función en la sección de CRÉDITOS
export const addProductsToCredit = (id, data) => apiClient.post(`/credits/${id}/add-products`, data)
