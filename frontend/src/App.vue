<template>
  <div class="app-container">
    
    <!-- Основной контент -->
    <router-view />

    <!-- СНЕГ (Показываем только если включен режим) -->
    <div v-if="auth.isWinterMode" class="snow-container">
      <div v-for="n in 50" :key="n" class="snowflake" :style="getSnowStyle()">
        ❄
      </div>
    </div>

  </div>
</template>

<script setup>
import { useAuthStore } from './stores/auth';
const auth = useAuthStore();

// Генерация случайного стиля для каждой снежинки
const getSnowStyle = () => {
    const randomLeft = Math.random() * 100; 
    const randomDuration = 3 + Math.random() * 5; 
    const randomDelay = Math.random() * 5; 
    const randomSize = 0.8 + Math.random() * 1.5; 

    return {
        left: `${randomLeft}%`,
        animationDuration: `${randomDuration}s`,
        animationDelay: `${randomDelay}s`,
        fontSize: `${randomSize}rem`
    };
};
</script>

<style>
body {
    background-color: #f6f8fb;
    margin: 0;
    overflow-x: hidden; 
}

.snow-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none; 
    z-index: 9999;
    overflow: hidden;
}

.snowflake {
    position: absolute;
    top: -50px;
    color: #a4d8ff; 
    opacity: 0.8;
    animation: fall linear infinite;
    text-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
}

@keyframes fall {
    0% {
        transform: translateY(-50px) translateX(0px) rotate(0deg);
        opacity: 0;
    }
    10% {
        opacity: 1;
    }
    100% {
        transform: translateY(110vh) translateX(20px) rotate(360deg);
        opacity: 0.3;
    }
}
</style>