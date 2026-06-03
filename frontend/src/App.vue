<template>
  <!-- Главная обертка приложения -->
  <div id="app-root" :class="{ 'dark-theme': auth.isDarkMode }">
    
    <!-- 1. ГЛОБАЛЬНЫЙ ПУШ (УВЕДОМЛЕНИЕ) -->
    <Transition name="slide-down">
      <div v-if="lastNotify" class="global-toast shadow-lg" @click="goToMessages">
          <div class="d-flex align-items-center gap-3">
              <div class="toast-icon-circle"><i class="bi bi-bell-fill"></i></div>
              <div class="flex-grow-1">
                  <div class="fw-bold small">{{ lastNotify.title }}</div>
                  <div class="very-small opacity-75 text-truncate" style="max-width: 220px;">{{ lastNotify.msg }}</div>
              </div>
          </div>
      </div>
    </Transition>

    <!-- 2. ОСНОВНОЙ КОНТЕНТ (Router View должен быть один!) -->
    <router-view />

    <!-- 3. ЗИМНИЙ РЕЖИМ (СНЕГ) -->
    <div v-if="auth.isWinterMode" class="snow-container">
      <div v-for="n in 50" :key="n" class="snowflake" :style="getSnowStyle()">
        ❄
      </div>
    </div>

  </div>
</template>

<script setup>
import { watch, ref } from 'vue';
import { useAuthStore } from './stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();
const lastNotify = ref(null);

// Логика уведомлений: следим за массивом в сторе
watch(() => auth.notifications?.length, (newVal, oldVal) => {
    if (newVal > oldVal) {
        lastNotify.value = auth.notifications[0];
        // Скрываем пуш через 5 секунд
        setTimeout(() => { 
            lastNotify.value = null; 
        }, 5000);
    }
});

const goToMessages = () => {
    lastNotify.value = null;
    router.push('/messages');
};

// Логика снега: генерация случайного стиля для каждой снежинки
const getSnowStyle = () => {
    const randomLeft = Math.random() * 100; 
    const randomDuration = 3 + Math.random() * 7; 
    const randomDelay = Math.random() * 5; 
    const randomSize = 0.7 + Math.random() * 1.5; 

    return {
        left: `${randomLeft}%`,
        animationDuration: `${randomDuration}s`,
        animationDelay: `${randomDelay}s`,
        fontSize: `${randomSize}rem`
    };
};
</script>

<style>
/* ГЛОБАЛЬНЫЕ СТИЛИ */
body {
    margin: 0;
    padding: 0;
    background-color: #f6f8fb;
    overflow-x: hidden;
}

/* СТИЛЬ ПУША (TOAST) */
.global-toast {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 90%;
    max-width: 400px;
    background: #004e92;
    color: white;
    border-radius: 20px;
    padding: 12px 20px;
    z-index: 20000;
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.toast-icon-circle {
    width: 35px;
    height: 35px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.very-small { font-size: 0.75rem; }

/* АНИМАЦИЯ ПУША */
.slide-down-enter-active, 
.slide-down-leave-active { transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.slide-down-enter-from, 
.slide-down-leave-to { transform: translate(-50%, -100px); opacity: 0; }

/* СТИЛЬ СНЕГА */
.snow-container {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 15000;
    overflow: hidden;
}

.snowflake {
    position: absolute;
    top: -50px;
    color: #a4d8ff;
    opacity: 0.7;
    animation: fall linear infinite;
}

@keyframes fall {
    0% { transform: translateY(-50px) translateX(0) rotate(0deg); opacity: 0; }
    10% { opacity: 0.8; }
    100% { transform: translateY(110vh) translateX(30px) rotate(360deg); opacity: 0.2; }
}

/* ТЕМНАЯ ТЕМА ГЛОБАЛЬНО */
.dark-theme {
    background-color: #0b0e14 !important;
}
</style>