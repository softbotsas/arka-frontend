<template>
  <div class="splash-screen">
    <div class="splash-content">
      <h1 class="main-title">Sistema Arka.</h1>
      <p class="subtitle">Elaborado por SoftBot</p>
    </div>
  </div>
</template>

<style scoped>
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--dark-bg);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeOut 1s ease-out 2.5s forwards; /* La animación de salida dura 1s y empieza después de 2.5s */
}

.splash-content {
  text-align: center;
}

.main-title {
  font-size: 3rem;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0;
  animation: popIn 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.5s forwards;
  opacity: 0; /* Empieza invisible */
}

.subtitle {
  font-size: 1rem;
  font-weight: 400;
  color: var(--text-secondary);
  margin-top: 0.5rem;
  animation: fadeIn 1s ease-in 1.5s forwards;
  opacity: 0; /* Empieza invisible */
}

/* --- ANIMACIONES --- */

/* Animación para el título principal */
@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Animación para el subtítulo */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Animación para desaparecer la pantalla completa */
@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
    visibility: hidden; /* Oculta el elemento después de la animación */
  }
}

/* Responsivo para móviles */
@media (max-width: 600px) {
  .main-title {
    font-size: 2.5rem;
  }
  .subtitle {
    font-size: 0.9rem;
  }
}
</style>
