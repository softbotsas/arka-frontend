import axios from 'axios'

// En producción usa el mismo dominio que sirve el frontend. Apache reenvía
// /api al backend Node, evitando depender del dominio anterior y de CORS.
const API_URL = import.meta.env.VITE_API_URL || '/api'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// INTERCEPTOR: Se ejecuta ANTES de cada petición
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      // Si hay un token, lo añadimos a la cabecera
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default apiClient
