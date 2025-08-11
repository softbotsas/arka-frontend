import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 1. Importa la librería y sus estilos
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

const app = createApp(App)

app.use(router)

// 2. Define las opciones de configuración para las notificaciones
const options = {
  position: 'top-right',
  timeout: 4000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false,
  transition: 'Vue-Toastification__bounce',
  maxToasts: 5,
  newestOnTop: true,
  // Para el tema oscuro, añadimos esto:
  toastClassName: 'dark-toast',
  bodyClassName: ['custom-body-class'],
}

// 3. Dile a la app que use el sistema de Toasts con tus opciones
app.use(Toast, options)

app.mount('#app')
