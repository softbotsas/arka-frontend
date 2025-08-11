<template>
  <div class="credits-hub-container">
    <div class="view-header">
      <h1>Módulo de Créditos</h1>
      <p>Selecciona una operación para continuar</p>
    </div>
    <div class="options-grid">
      <RouterLink to="/credits/new" class="card main-card">
        <div class="card-content">
          <h3>Ingresar Nuevo Crédito</h3>
          <p>Registra una nueva venta a crédito para un cliente existente o nuevo.</p>
        </div>
        <div class="card-footer">
          <span>Comenzar &rarr;</span>
        </div>
      </RouterLink>

      <RouterLink to="/credits/manage" class="card main-card">
        <div class="card-content">
          <h3>Administrar Créditos</h3>
          <p>
            Consulta el historial, registra abonos, modifica y gestiona todos los créditos activos.
          </p>
        </div>
        <div class="card-footer">
          <span>Ver todos &rarr;</span>
        </div>
      </RouterLink>
    </div>

    <RouterView />
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<style scoped>
.credits-hub-container {
  max-width: 1200px;
  margin: 0 auto;
}
.view-header {
  text-align: center;
  margin-bottom: 2rem;
}
.view-header h1 {
  font-size: 2.5rem;
  font-weight: 900;
}
.view-header p {
  color: var(--text-secondary);
}
.options-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  text-decoration: none;
  color: var(--text-primary);
  transition:
    transform 0.3s ease,
    border 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.card:hover {
  transform: translateY(-5px);
  border-color: var(--primary-accent);
}
.card h3 {
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
}
.card p {
  color: var(--text-secondary);
  flex-grow: 1;
}
.card-footer {
  margin-top: 1rem;
  font-weight: 700;
  color: var(--primary-accent);
}
@media (min-width: 768px) {
  .options-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
