import { createRouter, createWebHistory } from 'vue-router'

// Importar todas las vistas
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import CreditsView from '../views/CreditsView.vue'
import NewCreditView from '../views/NewCreditView.vue'
import ManageCreditsView from '../views/ManageCreditsView.vue'
import EditCreditView from '../views/EditCreditView.vue'
import ClientsListView from '../views/ClientsListView.vue'
import ClientDetailView from '../views/ClientDetailView.vue'
import AgendaView from '../views/AgendaView.vue'
import ReportsView from '../views/ReportsView.vue'

// Definición de todas las rutas de la aplicación
const routes = [
  {
    // Ruta pública para el inicio de sesión
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    // Ruta protegida para la página de inicio
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true }, // Indica que esta ruta necesita autenticación
  },
  {
    // Ruta protegida para la lista de clientes
    path: '/clients',
    name: 'clients-list',
    component: ClientsListView,
    meta: { requiresAuth: true },
  },
  {
    // Ruta protegida para los detalles de un cliente
    path: '/clients/:id',
    name: 'client-detail',
    component: ClientDetailView,
    meta: { requiresAuth: true },
  },
  {
    // Ruta protegida para la agenda
    path: '/agenda',
    name: 'agenda',
    component: AgendaView,
    meta: { requiresAuth: true },
  },
  {
    // Ruta protegida para los reportes
    path: '/reports',
    name: 'reports',
    component: ReportsView,
    meta: { requiresAuth: true },
  },
  {
    // Ruta padre para todo lo relacionado con créditos
    path: '/credits',
    component: CreditsView,
    meta: { requiresAuth: true }, // Protegemos la ruta padre
    children: [
      {
        path: 'new',
        name: 'new-credit',
        component: NewCreditView,
      },
      {
        path: 'manage',
        name: 'manage-credits',
        component: ManageCreditsView,
      },
      {
        path: 'edit/:id',
        name: 'edit-credit',
        component: EditCreditView,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// EL GUARDIÁN DE RUTAS - La pieza clave de la seguridad del frontend
router.beforeEach((to, from, next) => {
  const loggedIn = localStorage.getItem('authToken')

  // Comprueba si la ruta a la que se intenta acceder requiere autenticación
  if (to.meta.requiresAuth && !loggedIn) {
    // Si la ruta es protegida y no hay un token, redirige al usuario al login
    next({ name: 'login' })
  } else if (to.name === 'login' && loggedIn) {
    // Si el usuario ya está logueado e intenta acceder a la página de login,
    // lo redirigimos a la página de inicio.
    next({ name: 'home' })
  } else {
    // En cualquier otro caso (ruta pública, o ruta protegida con usuario logueado),
    // permitimos la navegación.
    next()
  }
})

export default router
