<template>
  <!-- Добавляем обертку app-layout для управления сеткой -->
  <div class="app-layout" :class="{ 'dark-theme': auth.isDarkMode }">
    

    
    <!-- 1. SIDEBAR ДЛЯ ПК (Виден только на больших экранах d-lg-flex) -->
    <aside class="desktop-sidebar d-none d-lg-flex">
      <div class="sidebar-header">
        <div class="logo-circle-adam">A</div>
        <span class="brand-name-adam">ADAM BANK</span>
      </div>

      <nav class="sidebar-nav">
        <div class="sidebar-link active">
          <i class="bi bi-house-door-fill"></i> <span>Главная</span>
        </div>
        <div class="sidebar-link" @click="goTo('/qr')">
          <i class="bi bi-qr-code"></i> <span>QR</span>
        </div>
        <div class="sidebar-link" @click="goTo('/history')">
          <i class="bi bi-clock-history"></i> <span>История</span>
        </div>
        <div class="sidebar-link" @click="goTo('/account')">
          <i class="bi bi-person-circle"></i> <span>Аккаунт</span>
        </div>
      </nav>

      <!-- Юзер внизу сайдбара -->
      <div class="mt-auto user-pill-desktop" v-if="auth.user">
          <div class="avatar-mini-circle" :style="auth.user.avatar ? `background-image: url(${auth.user.avatar})` : ''">
            <span v-if="!auth.user.avatar">{{ auth.user.name[0] }}</span>
          </div>
          <div class="ms-2 fw-bold small text-truncate text-main">{{ auth.user.name }}</div>
      </div>
    </aside>


    
    <!-- 2. ОСНОВНОЙ КОНТЕНТНЫЙ БЛОК -->
    <div class="main-wrapper">

      <!-- ВЕРХНЯЯ ПАНЕЛЬ ДЛЯ ПК (Видна только на d-lg-flex) -->
<header class="desktop-top-header d-none d-lg-flex align-items-center justify-content-between px-4 py-3">
    <!-- Можно оставить пустым или перенести сюда поиск, но главное — иконка справа -->
    <div class="ms-auto d-flex align-items-center gap-3">
        <div class="message-btn-pc shadow-sm" @click="goTo('/messages')">
            <i class="bi bi-chat-text-fill text-primary"></i>
            <span class="notification-dot"></span>
        </div>
    </div>
</header>
      
      <!-- Мобильный Хедер (Скрыт на ПК через d-lg-none) -->
      <header class="app-header bg-white shadow-sm fixed-top d-lg-none">
        <div class="container h-100 d-flex align-items-center justify-content-between py-3">
          <div class="logo-placeholder d-flex align-items-center" @click="$router.push('/')">
            <img src="../assets/adam-logo.png" alt="Adam Bank" class="brand-logo-img shadow-sm">
          </div>
          <div class="search-bar flex-grow-1 mx-3">
            <div class="input-group">
              <span class="input-group-text bg-light border-0 rounded-start-pill ps-3">
                <i class="bi bi-search text-muted" style="font-size: 0.9rem;"></i>
              </span>
              <input type="text" class="form-control bg-light border-0 rounded-end-pill" style="font-size: 0.9rem;" placeholder="Поиск...">
            </div>
          </div>
          <div class="message-btn bg-light rounded-circle d-flex align-items-center justify-content-center position-relative" @click="goTo('/messages')">
            <i class="bi bi-chat-text-fill text-primary fs-5"></i>
            <span class="notification-dot"></span>
          </div>
        </div>
      </header>

      <!-- КОНТЕНТНАЯ ОБЛАСТЬ -->
      <main class="main-content container pb-5">
        
        <!-- Заголовок страницы (только для ПК) -->
        <h2 class="fw-bold mb-4 d-none d-lg-block text-main">Главная</h2>

        <!-- СЕТКА СЕРВИСОВ -->
        <div class="services-grid">
          <div class="service-card bg-white shadow-sm my-bank-card" @click="goTo('/my-bank')">
            <div class="d-flex align-items-center gap-3">
                <div class="icon-box bg-dark text-white"><i class="bi bi-wallet2 fs-4"></i></div>
                <div class="d-flex flex-column">
                    <span class="service-name mb-0 text-main">Мой Банк</span>
                </div>
            </div>
            <div class="d-flex align-items-center gap-3">
                <i class="bi bi-chevron-right text-muted fs-5"></i>
            </div>
          </div>

          <div class="service-card bg-white shadow-sm" @click="goTo('/shop')">
            <div class="icon-box bg-light-blue text-primary"><i class="bi bi-bag-fill fs-4"></i></div>
            <span class="service-name mt-3 text-main">Магазин</span>
          </div>

          <div class="service-card bg-primary text-white shadow-primary" @click="goTo('/transfer')">
            <div class="icon-box bg-white bg-opacity-25 text-white"><i class="bi bi-arrow-left-right fs-4"></i></div>
            <span class="service-name mt-3">Переводы</span>
          </div>

          <div class="service-card bg-white shadow-sm" @click="goTo('/payments')">
            <div class="icon-box bg-light-green text-success"><i class="bi bi-credit-card-fill fs-4"></i></div>
            <span class="service-name mt-3 text-main">Платежи</span>
          </div>

          <div class="service-card bg-white shadow-sm" @click="goTo('/gov')">
            <div class="icon-box bg-light-orange text-warning"><i class="bi bi-bank2 fs-4"></i></div>
            <span class="service-name mt-3 text-main">Гос. услуги</span>
          </div>
        </div>

        <div class="promo-banner mt-4 p-4 rounded-5 bg-dark text-white d-flex align-items-center justify-content-between shadow position-relative overflow-hidden">
          <div class="z-2">
              <h5 class="mb-1 fw-bold text-warning">Кэшбек 5%</h5>
              <p class="mb-0 opacity-75 small">На все покупки в ADAM Shop</p>
          </div>
          <button class="btn btn-warning rounded-pill px-4 fw-bold shadow-sm z-2">Подробнее</button>
          <div class="banner-decor"></div>
        </div>
      </main>

      <!-- НИЖНЕЕ МЕНЮ (Только для мобилок d-lg-none) -->
      <nav class="bottom-nav fixed-bottom bg-white shadow-lg border-top d-flex justify-content-around py-2 d-lg-none">
        <div class="nav-item active" @click="goTo('/')">
            <i class="bi bi-house-door-fill"></i>
            <small>Главная</small>
        </div>
        <div class="nav-item" @click="goTo('/qr')">
            <i class="bi bi-qr-code"></i>
            <small>QR</small>
        </div>
        <div class="nav-item" @click="goTo('/history')">
            <i class="bi bi-clock-history"></i>
            <small>История</small>
        </div>
        <div class="nav-item" @click="goTo('/account')">
            <i class="bi bi-person-circle"></i>
            <small>Аккаунт</small>
        </div>
      </nav>

    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth';
import { useRouter, useRoute } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const formatMoney = (value) => {
    return new Intl.NumberFormat('ru-RU').format(value || 0);
};

const goTo = (path) => router.push(path);
const isActive = (path) => route.path === path;
</script>

<style scoped>
/* ГЛОБАЛЬНЫЙ LAYOUT */
.app-layout {
  --bg-main: #f6f8fb; --bg-card: #ffffff; --text-main: #000428; --header-bg: #ffffff; --btn-light: #f1f3f5; --border: #f1f3f5;
  display: flex; min-height: 100vh; background-color: var(--bg-main); font-family: 'Inter', sans-serif; transition: 0.3s;
}

.main-wrapper { flex-grow: 1; display: flex; flex-direction: column; position: relative; }

/* SIDEBAR ПК (ОДИН В ОДИН КАК В ИСТОРИИ) */
.desktop-sidebar { 
    width: 280px; background: var(--bg-card); border-right: 1px solid var(--border); 
    padding: 35px 25px; flex-direction: column; position: sticky; top: 0; height: 100vh; 
}
.logo-circle-adam { 
    width: 40px; height: 40px; border-radius: 12px; 
    background: #004e92; color: white; display: flex; 
    align-items: center; justify-content: center; font-weight: 800; 
}
.brand-name-adam { font-weight: 800; font-size: 1.2rem; color: var(--text-main); margin-left: 10px; }
.sidebar-link { 
    display: flex; align-items: center; gap: 15px; padding: 14px 18px; 
    border-radius: 18px; cursor: pointer; color: #718096; font-weight: 600; 
    transition: 0.3s; margin-bottom: 5px; 
}
.sidebar-link i { font-size: 1.2rem; }
.sidebar-link.active { background: #eef6ff; color: #004e92; }

.user-pill-desktop { display: flex; align-items: center; padding: 15px; background: var(--btn-light); border-radius: 20px; }
.avatar-mini-circle { 
    width: 32px; height: 32px; border-radius: 50%; background: #004e92; 
    color: white; display: flex; align-items: center; justify-content: center; 
    background-size: cover; background-position: center; 
}

/* КОНТЕНТ */
.main-content { padding-top: 90px; }
@media (min-width: 992px) {
    .main-content { padding-top: 50px; max-width: 1000px; }
}

.services-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.service-card { 
    border-radius: 25px; padding: 25px; display: flex; flex-direction: column; 
    justify-content: center; height: 140px; cursor: pointer; transition: 0.3s; border: none; 
}
.service-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.05) !important; }
.my-bank-card { grid-column: span 2; height: 100px; flex-direction: row; justify-content: space-between; align-items: center; }

/* ИКОНКИ И ЦВЕТА */
.icon-box { width: 50px; height: 50px; border-radius: 15px; display: flex; align-items: center; justify-content: center; }
.bg-light-blue { background-color: rgba(13, 110, 253, 0.1); }
.bg-light-green { background-color: rgba(25, 135, 84, 0.1); }
.bg-light-orange { background-color: rgba(255, 193, 7, 0.1); }
.shadow-primary { box-shadow: 0 8px 25px rgba(0, 78, 146, 0.25) !important; }

/* НИЖНЕЕ МЕНЮ */
.bottom-nav .nav-item i { font-size: 1.4rem !important; margin-bottom: 2px; }
.nav-item { display: flex; flex-direction: column; align-items: center; color: #a0aec0; cursor: pointer; width: 25%; }
.nav-item.active { color: #004e92; }

/* ДЕКОР */
.banner-decor { 
    position: absolute; right: -20px; top: -20px; width: 150px; height: 150px; 
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%); 
}
.brand-logo-img { width: 40px; height: 40px; border-radius: 10px; }
.no-scrollbar::-webkit-scrollbar { display: none; }

/* СТИЛЬ ИКОНКИ СООБЩЕНИЙ НА ПК */
.desktop-top-header {
    width: 100%;
    height: 80px;
    background: transparent; /* Оставляем прозрачным, чтобы не перегружать */
}

.message-btn-pc {
    width: 50px;
    height: 50px;
    background-color: var(--bg-card); /* Белая в светлой, темная в темной теме */
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
    font-size: 1.3rem;
    transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.message-btn-pc:hover {
    transform: scale(1.1);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
}

.message-btn-pc:active {
    transform: scale(0.95);
}

/* Красная точка уведомления */
.notification-dot {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 10px;
    height: 10px;
    background-color: #dc3545;
    border: 2px solid var(--bg-card);
    border-radius: 50%;
}
</style>