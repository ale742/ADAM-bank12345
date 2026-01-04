<template>
  <div class="home-wrapper">
    
    <!--ВЕРХНЯЯ ЧАСТЬ (Хедер)-->
    <header class="app-header bg-white shadow-sm fixed-top">
      <div class="container h-100 d-flex align-items-center justify-content-between py-3">
        
        <!-- Лого -->
        <div class="logo-placeholder d-flex align-items-center">
          <div class="logo-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold">
            A
          </div>
        </div>

        <!-- Поискывапдыватптоывщшатпщшыватщшгптывщаштьпщшдватьщ-->
        <div class="search-bar flex-grow-1 mx-3 md-mx-5">
          <div class="input-group">
            <span class="input-group-text bg-light border-0 rounded-start-pill ps-3">
              <i class="bi bi-search text-muted" style="font-size: 0.9rem;"></i>
            </span>
            <input type="text" class="form-control bg-light border-0 rounded-end-pill" style="font-size: 0.9rem;" placeholder="Поиск...">
          </div>
        </div>

        <!-- Иконка Сообщений -->
        <div class="message-btn bg-light rounded-circle d-flex align-items-center justify-content-center position-relative" @click="goTo('/messages')">
          <i class="bi bi-chat-text-fill text-primary fs-5"></i>
          <span class="notification-dot"></span>
        </div>

      </div>
    </header>

    <!-- 2. ОСНОВНОЙ КОНТЕНТ -->
    <div class="main-content container pb-5">
      
      <!-- СЕТКА СЕРВИСОВ -->
      <div class="services-grid">
        
        <!-- Мой Банк (На всю ширину) -->
        <div class="service-card bg-white shadow-sm my-bank-card" @click="goTo('/my-bank')">
          <div class="d-flex align-items-center gap-3">
              <div class="icon-box bg-dark text-white">
                <i class="bi bi-wallet2 fs-4"></i>
              </div>
              <div class="d-flex flex-column">
                  <span class="service-name mb-0">Мой Банк</span>
              </div>
          </div>
          <i class="bi bi-chevron-right text-muted fs-5"></i>
        </div>

        <!-- Магазин -->
        <div class="service-card bg-white shadow-sm" @click="goTo('/shop')">
          <div class="icon-box bg-light-blue text-primary">
            <i class="bi bi-bag-fill fs-4"></i>
          </div>
          <span class="service-name mt-3">Магазин</span>
        </div>

        <!-- Переводы -->
        <div class="service-card bg-primary text-white shadow-primary" @click="goTo('/transfer')">
          <div class="icon-box bg-white bg-opacity-25 text-white">
            <i class="bi bi-arrow-left-right fs-4"></i>
          </div>
          <span class="service-name mt-3">Переводы</span>
        </div>

        <!-- Платежи -->
        <div class="service-card bg-white shadow-sm" @click="goTo('/payments')">
          <div class="icon-box bg-light-green text-success">
            <i class="bi bi-credit-card-fill fs-4"></i>
          </div>
          <span class="service-name mt-3">Платежи</span>
        </div>

        <!-- Гос. услуги -->
        <div class="service-card bg-white shadow-sm" @click="goTo('/gov')">
          <div class="icon-box bg-light-orange text-warning">
            <i class="bi bi-bank2 fs-4"></i>
          </div>
          <span class="service-name mt-3">Гос. услуги</span>
        </div>

      </div>

      <!-- Баннер -->
      <div class="promo-banner mt-4 p-3 rounded-4 bg-dark text-white d-flex align-items-center justify-content-between shadow">
        <div>
            <h6 class="mb-1 fw-bold">Кэшбек 5%</h6>
            <small class="text-white-50">На все покупки в ADAM Shop</small>
        </div>
        <div class="btn btn-sm btn-light rounded-pill px-3 fw-bold">Подробнее</div>
      </div>

    </div>

    <!-- 3. НИЖНЕЕ МЕНЮ -->
    <nav class="bottom-nav fixed-bottom bg-white shadow-lg border-top d-flex justify-content-around py-2">
      
      <!-- Главная -->
      <div class="nav-item" :class="{ active: isActive('/') }" @click="goTo('/')">
        <div class="nav-icon-wrapper">
            <i class="bi bi-house-door-fill fs-4"></i>
        </div>
        <small>Главная</small>
      </div>
      
      <!-- QR (ТЕПЕРЬ ТАКОЙ ЖЕ КАК ВСЕ) -->
      <div class="nav-item" :class="{ active: isActive('/qr') }" @click="goTo('/qr')">
        <div class="nav-icon-wrapper">
            <i class="bi bi-qr-code fs-4"></i>
        </div>
        <small>QR</small>
      </div>

      <!-- Сервисы -->
      <div class="nav-item" :class="{ active: isActive('/services') }" @click="goTo('/services')">
        <div class="nav-icon-wrapper">
            <i class="bi bi-grid-fill fs-4"></i>
        </div>
        <small>Сервисы</small>
      </div>

      <!-- Настройки -->
      <div class="nav-item" :class="{ active: isActive('/settings') }" @click="goTo('/settings')">
        <div class="nav-icon-wrapper">
            <i class="bi bi-gear-fill fs-4"></i>
        </div>
        <small>Настройки</small>
      </div>

    </nav>

  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth';
import { useRouter, useRoute } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const formatMoney = (value) => {
    if (!value) return 0;
    return new Intl.NumberFormat('ru-RU').format(value);
};

const goTo = (path) => {
    router.push(path);
};

const isActive = (path) => {
    return route.path === path;
};
</script>

<style scoped>
/* ОБЩИЙ ФОН */
.home-wrapper {
    min-height: 100vh;
    background-color: #f6f8fb;
    font-family: 'Inter', sans-serif;
}

/* ШАПКА */
.app-header {
    z-index: 1000;
    height: 70px;
}

.main-content {
    padding-top: 90px;
}

.logo-circle {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: linear-gradient(135deg, #004e92, #000428);
    font-size: 1.2rem;
}
.form-control:focus { box-shadow: none; }

.message-btn {
    width: 45px;
    height: 45px;
    cursor: pointer;
    transition: background-color 0.2s;
    flex-shrink: 0;
}
.message-btn:active {
    background-color: #e2e6ea !important;
    transform: scale(0.95);
}
.notification-dot {
    position: absolute; top: 10px; right: 12px;
    width: 8px; height: 8px;
    background-color: #dc3545; border-radius: 50%; border: 1px solid white;
}

/* СЕРВИСЫ */
.services-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
}

.service-card {
    border-radius: 20px;
    padding: 20px;
    display: flex; flex-direction: column; justify-content: center;
    height: 140px; cursor: pointer; transition: all 0.2s;
}
.service-card:active { transform: scale(0.95); }

.my-bank-card {
    grid-column: span 2; height: 100px;
    flex-direction: row; justify-content: space-between; align-items: center;
}

.icon-box {
    width: 50px; height: 50px; border-radius: 15px;
    display: flex; align-items: center; justify-content: center;
}
.service-name { font-weight: 700; font-size: 1rem; }

.bg-light-blue { background-color: #e3f2fd; }
.bg-light-green { background-color: #e8f5e9; }
.bg-light-orange { background-color: #fff3e0; }
.shadow-primary { box-shadow: 0 8px 20px rgba(0, 78, 146, 0.3) !important; }

/* НИЖНЕЕ МЕНЮ */
.bottom-nav {
    padding-bottom: env(safe-area-inset-bottom);
    border-radius: 20px 20px 0 0;
    z-index: 1000;
}

.nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #9aa0a6; /* Серый */
    cursor: pointer;
    width: 25%;
    position: relative;
    transition: color 0.3s ease;
}

.nav-icon-wrapper {
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* Активная вкладка */
.nav-item.active {
    color: #004e92; /* Синий */
}

.nav-item.active .nav-icon-wrapper {
    transform: translateY(-5px) scale(1.2);
}

/* Эффект нажатия */
.nav-item:active .nav-icon-wrapper {
    transform: scale(0.9);
}
</style>