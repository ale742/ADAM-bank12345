<template>
  <div class="page-wrapper">
    
    <!-- Хедер -->
    <div class="header d-flex align-items-center px-4 py-3 bg-white shadow-sm fixed-top">
      <h5 class="mb-0 fw-bold flex-grow-1 text-center pe-3">Настройки</h5>
    </div>

    <!-- Контент -->
    <div class="container pt-5 mt-4 pb-5">
      
      <!-- 1. ПРОФИЛЬ -->
      <div class="profile-card bg-white p-4 rounded-4 shadow-sm mb-4 text-center animate__animated animate__fadeInDown">
          <div class="avatar-circle bg-primary text-white mx-auto mb-3 fw-bold fs-2 shadow-primary">
              {{ auth.user?.name?.[0] || 'A' }}
          </div>
          <h4 class="fw-bold mb-1">{{ auth.user?.name }}</h4>
          <p class="text-muted mb-0">{{ formatPhone(auth.user?.phone) }}</p>
      </div>

      <!-- 2. МЕНЮ НАСТРОЕК -->
      <div class="list-group rounded-4 shadow-sm border-0 mb-4 overflow-hidden bg-white animate__animated animate__fadeInUp delay-1">
        

        <!-- Уведомления -->
        <div class="list-group-item p-3 border-0 d-flex align-items-center justify-content-between action-row">
            <div class="d-flex align-items-center gap-3">
                <div class="icon-box bg-warning bg-opacity-10 text-warning"><i class="bi bi-bell-fill fs-5"></i></div>
                <span class="fw-bold">Уведомления</span>
            </div>
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" checked style="transform: scale(1.2);">
            </div>
        </div>

        <!--  ЗИМНИЙ МОД -->
        <div class="list-group-item p-3 border-0 d-flex align-items-center justify-content-between action-row">
            <div class="d-flex align-items-center gap-3">
                <div class="icon-box bg-info bg-opacity-10 text-info">
                    <i class="bi bi-snow2 fs-5"></i>
                </div>
                <span class="fw-bold">Зимний мод</span>
            </div>
            <div class="form-check form-switch">
                <!-- Привязываем к стору -->
                <input 
                    class="form-check-input" 
                    type="checkbox" 
                    :checked="auth.isWinterMode" 
                    @change="auth.toggleWinterMode"
                    style="transform: scale(1.2); cursor: pointer;"
                >
            </div>
        </div>
        </div>

      <!-- 3. КНОПКА ВЫХОДА -->
      <button 
        class="btn btn-light text-danger w-100 rounded-pill py-3 fw-bold shadow-sm animate__animated animate__fadeInUp delay-2 logout-btn"
        @click="handleLogout"
      >
        <i class="bi bi-box-arrow-right me-2"></i> Выйти из аккаунта
      </button>

      <div class="text-center mt-4 mb-5 text-muted small">
          Версия приложения 1.0.0
      </div>

    </div>

    <!-- НИЖНЕЕ МЕНЮ (Копия с главной, чтобы навигация работала) -->
    <nav class="bottom-nav fixed-bottom bg-white shadow-lg border-top d-flex justify-content-around py-2">
      <div class="nav-item" @click="goTo('/')">
        <div class="nav-icon-wrapper"><i class="bi bi-house-door-fill fs-4"></i></div><small>Главная</small>
      </div>
      <div class="nav-item" @click="goTo('/qr')">
        <div class="nav-icon-wrapper"><i class="bi bi-qr-code fs-4"></i></div><small>QR</small>
      </div>
      <div class="nav-item" @click="goTo('/services')">
        <div class="nav-icon-wrapper"><i class="bi bi-grid-fill fs-4"></i></div><small>Сервисы</small>
      </div>
      <div class="nav-item active"> <!-- Активная вкладка -->
        <div class="nav-icon-wrapper"><i class="bi bi-gear-fill fs-4"></i></div><small>Настройки</small>
      </div>
    </nav>

  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

const formatPhone = (phone) => {
    if (!phone) return '';
    return phone.replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, '+$1 ($2) $3-$4-$5');
};

const goTo = (path) => {
    router.push(path);
};

// 🔥 ЛОГИКА ВЫХОДА
const handleLogout = () => {
    if (confirm('Вы уверены, что хотите выйти?')) {
        auth.logout(); // Очищаем стор и localStorage
        router.push('/login'); // Перекидываем на вход
    }
};
</script>

<style scoped>
.page-wrapper { min-height: 100vh; background-color: #f6f8fb; font-family: 'Inter', sans-serif; }
.header { z-index: 1000; }

.avatar-circle {
    width: 80px; height: 80px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #004e92, #000428);
}
.shadow-primary { box-shadow: 0 10px 20px rgba(0, 78, 146, 0.3); }

.icon-box {
    width: 40px; height: 40px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
}

.action-row { cursor: pointer; transition: background-color 0.2s; }
.action-row:active { background-color: #f8f9fa; }

.logout-btn { border: 1px solid #ffebe9; background-color: #fff; }
.logout-btn:active { background-color: #ffebe9; transform: scale(0.98); }

/* Футер (как на главной) */
.bottom-nav { padding-bottom: env(safe-area-inset-bottom); border-radius: 20px 20px 0 0; z-index: 1000; }
.nav-item { display: flex; flex-direction: column; align-items: center; color: #9aa0a6; cursor: pointer; width: 25%; transition: color 0.3s ease; }
.nav-item.active { color: #004e92; }
.nav-item:active { transform: scale(0.9); }

.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }
.form-check-input:checked { background-color: #004e92; border-color: #004e92; }
</style>