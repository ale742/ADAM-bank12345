<template>
  <div class="qr-wrapper">
    
    <!-- Хедер (Прозрачный/Темный для режима камеры) -->
    <div class="header d-flex align-items-center justify-content-between px-4 py-3 fixed-top" 
         :class="activeTab === 'scan' ? 'text-white' : 'text-dark bg-white shadow-sm'">
      
      <router-link to="/" class="btn rounded-circle d-flex align-items-center justify-content-center back-btn"
                   :class="activeTab === 'scan' ? 'btn-dark bg-opacity-50 text-white' : 'btn-light text-dark'">
        <i class="bi bi-x-lg"></i>
      </router-link>
      
      <h5 class="mb-0 fw-bold">QR</h5>
      
      <!-- Пустой блок для баланса иконки -->
      <div style="width: 40px;"></div>
    </div>

    <!-- КОНТЕНТ -->
    <div class="content-container">

      <!-- ПЕРЕКЛЮЧАТЕЛЬ (Табы) -->
      <div class="tabs-container d-flex justify-content-center mb-4 fixed-top" style="top: 80px; z-index: 10;">
        <div class="bg-white rounded-pill p-1 shadow-sm d-flex" style="background: rgba(255,255,255,0.9) !important; backdrop-filter: blur(10px);">
          <div 
            class="tab-item rounded-pill px-4 py-2 fw-bold"
            :class="{ active: activeTab === 'scan' }"
            @click="activeTab = 'scan'"
          >
            Сканировать
          </div>
          <div 
            class="tab-item rounded-pill px-4 py-2 fw-bold"
            :class="{ active: activeTab === 'my_qr' }"
            @click="activeTab = 'my_qr'"
          >
            Мой QR
          </div>
        </div>
      </div>

      <!-- 1. РЕЖИМ СКАНЕРА -->
      <div v-if="activeTab === 'scan'" class="scanner-mode h-100 w-100 position-fixed top-0 start-0 bg-black">
        <!-- Имитация изображения с камеры (заблюренный фон) -->
        <div class="camera-preview"></div>
        
        <!-- Затемнение вокруг рамки -->
        <div class="overlay"></div>

        <!-- Рамка сканера -->
        <div class="scan-frame">
            <div class="corner top-left"></div>
            <div class="corner top-right"></div>
            <div class="corner bottom-left"></div>
            <div class="corner bottom-right"></div>
            
            <!-- Бегающая лазерная полоса -->
            <div class="laser-line"></div>
        </div>

        <!-- Текст подсказки -->
        <div class="scan-text text-white text-center position-absolute w-100">
            Наведите камеру на QR-код
        </div>

        <!-- Кнопки управления (Фонарик / Галерея) -->
        <div class="scan-controls d-flex justify-content-center gap-4 position-absolute w-100" style="bottom: 50px;">
            <div class="control-btn bg-white bg-opacity-25 rounded-circle text-white backdrop-blur">
                <i class="bi bi-flashlight"></i>
            </div>
            <div class="control-btn bg-white bg-opacity-25 rounded-circle text-white backdrop-blur">
                <i class="bi bi-image"></i>
            </div>
        </div>
      </div>

      <!-- 2. РЕЖИМ "МОЙ QR" -->
      <div v-else class="my-qr-mode container pt-5 mt-5 d-flex flex-column align-items-center animate__animated animate__fadeIn">
        
        <div class="qr-card bg-white p-4 rounded-4 shadow text-center mt-5 position-relative overflow-hidden">
            <!-- Декор сверху -->
            <div class="card-decor bg-primary"></div>

            <div class="avatar-box bg-light rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center border border-4 border-white shadow-sm">
                <span class="fs-2 fw-bold text-primary">{{ auth.user?.name?.[0] || 'A' }}</span>
            </div>

            <h4 class="fw-bold mb-1">{{ auth.user?.name }}</h4>
            <p class="text-muted mb-4">{{ formatPhone(auth.user?.phone) }}</p>

            <!-- Генерация QR кода (через API) -->
            <img 
                :src="`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${auth.user?.phone || 'ADAM-BANK'}&color=004e92`" 
                class="img-fluid mb-3" 
                alt="QR Code"
                style="width: 220px;"
            >

            <p class="small text-muted">Покажите этот QR, чтобы получить перевод</p>
            
            <div class="d-flex justify-content-center gap-2 mt-3">
                <button class="btn btn-light text-primary rounded-pill px-3 fw-bold btn-sm">
                    <i class="bi bi-share-fill me-1"></i> Поделиться
                </button>
                <button class="btn btn-light text-primary rounded-pill px-3 fw-bold btn-sm">
                    <i class="bi bi-download me-1"></i> Скачать
                </button>
            </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';

const activeTab = ref('scan'); // По умолчанию сканер
const auth = useAuthStore();

const formatPhone = (phone) => {
    if (!phone) return '+7 (000) 000 00 00';
    // Простая маска для отображения
    return phone.replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, '+$1 ($2) $3-$4-$5');
};
</script>

<style scoped>
.qr-wrapper {
    min-height: 100vh;
    background-color: #f6f8fb;
    font-family: 'Inter', sans-serif;
}

.header { z-index: 1000; transition: all 0.3s; }
.back-btn { width: 40px; height: 40px; }

/* ТАБЫ */
.tab-item {
    cursor: pointer;
    color: #6c757d;
    transition: all 0.3s;
    font-size: 0.9rem;
}
.tab-item.active {
    background-color: #004e92;
    color: white;
    box-shadow: 0 4px 10px rgba(0, 78, 146, 0.3);
}

/* === РЕЖИМ СКАНЕРА === */
.camera-preview {
    width: 100%; height: 100%;
    /* Фейковое изображение камеры (градиент) */
    background: linear-gradient(45deg, #1a1a1a, #2c3e50); 
    position: absolute;
}

/* Рамка сканера */
.scan-frame {
    width: 280px; height: 280px;
    position: absolute;
    top: 45%; left: 50%;
    transform: translate(-50%, -50%);
    z-index: 5;
}

/* Уголки рамки */
.corner {
    position: absolute; width: 40px; height: 40px;
    border: 4px solid #fff; border-radius: 4px;
}
.top-left { top: 0; left: 0; border-right: none; border-bottom: none; }
.top-right { top: 0; right: 0; border-left: none; border-bottom: none; }
.bottom-left { bottom: 0; left: 0; border-right: none; border-top: none; }
.bottom-right { bottom: 0; right: 0; border-left: none; border-top: none; }

/* Анимация лазера */
.laser-line {
    width: 100%; height: 2px;
    background: #00d2ff;
    box-shadow: 0 0 10px #00d2ff;
    position: absolute; top: 0;
    animation: scan 2s infinite ease-in-out;
}

@keyframes scan {
    0% { top: 10px; opacity: 0; }
    50% { top: 270px; opacity: 1; }
    100% { top: 10px; opacity: 0; }
}

.scan-text { top: 65%; font-size: 0.9rem; opacity: 0.8; z-index: 5; }

.control-btn {
    width: 50px; height: 50px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.2rem; cursor: pointer;
    border: 1px solid rgba(255,255,255,0.2);
}
.control-btn:active { transform: scale(0.95); background-color: rgba(255,255,255,0.4) !important; }
.backdrop-blur { backdrop-filter: blur(5px); }

/* === РЕЖИМ МОЙ QR === */
.qr-card {
    width: 100%; max-width: 320px;
}
.card-decor {
    position: absolute; top: 0; left: 0; width: 100%; height: 80px;
    background: linear-gradient(135deg, #004e92, #000428);
}
.avatar-box {
    width: 80px; height: 80px; margin-top: 30px; position: relative; z-index: 2;
}
</style>