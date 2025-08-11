<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import apiClient from '../services/apiClient' // Usamos apiClient directamente

const username = ref('')
const password = ref('')
const isLoading = ref(false)
const router = useRouter()
const toast = useToast()

async function handleLogin() {
  if (!username.value || !password.value) {
    return toast.warning('Por favor, ingresa usuario y contraseña.')
  }
  isLoading.value = true
  try {
    const response = await apiClient.post('/login', {
      username: username.value,
      password: password.value,
    })

    // Guardamos el token en localStorage. Esto es el "Recordar Sesión".
    localStorage.setItem('authToken', response.data.token)

    // Redirigimos a la página de inicio
    router.push('/')
  } catch (error) {
    toast.error('Credenciales incorrectas. Inténtalo de nuevo.')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <span class="logo">S/A</span>
      <h2>Iniciar Sesión</h2>
      <form @submit.prevent="handleLogin">
        <input type="text" v-model="username" placeholder="Usuario" required />
        <input type="password" v-model="password" placeholder="Contraseña" required />
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Ingresando...' : 'Ingresar' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
.login-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 2rem 2.5rem;
  text-align: center;
  width: 90%;
  max-width: 400px;
}
.logo {
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--primary-accent);
}
h2 {
  margin: 1rem 0 1.5rem 0;
}
input {
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1rem;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 1rem;
}
button {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  background-color: var(--primary-accent);
  color: var(--dark-bg);
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
}
button:disabled {
  opacity: 0.6;
}
</style>
