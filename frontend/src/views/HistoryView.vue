<template>
  <div class="app-layout" :class="{ 'dark-theme': auth.isDarkMode }">
    
    <aside class="desktop-sidebar d-none d-lg-flex">
      <div class="sidebar-header" @click="$router.push('/')">
        <div class="logo-circle-adam">A</div>
        <span class="brand-name-adam">ADAM BANK</span>
      </div>
      <nav class="sidebar-nav">
        <div class="sidebar-link" @click="$router.push('/')"><i class="bi bi-house-door"></i> <span>Главная</span></div>
        <div class="sidebar-link" @click="$router.push('/my-bank')"><i class="bi bi-wallet2"></i> <span>Мой банк</span></div>
        <div class="sidebar-link" @click="$router.push('/payments')"><i class="bi bi-credit-card"></i> <span>Платежи</span></div>
        <div class="sidebar-link active"><i class="bi bi-clock-history"></i> <span>История</span></div>
        <div class="sidebar-link" @click="$router.push('/account')"><i class="bi bi-person-circle"></i> <span>Аккаунт</span></div>
      </nav>
    </aside>

    <div class="main-wrapper">
      <div class="header d-flex align-items-center px-4 py-3 bg-header fixed-top d-lg-none">
        <h5 class="mb-0 fw-bold header-title">История</h5>
      </div>

      <div class="container content-area pb-5">
        <h2 class="fw-bold mb-4 d-none d-lg-block text-main">История операций</h2>

        <!-- Фильтры -->
        <div class="d-flex gap-2 mb-4 overflow-auto no-scrollbar pb-2">
            <button class="filter-pill active">Все</button>
            <button class="filter-pill">Траты</button>
            <button class="filter-pill">Переводы</button>
            <button class="filter-pill">Пополнения</button>
        </div>

        <!-- Список транзакций -->
        <div v-if="auth.user.transactions?.length > 0" class="list-group rounded-5 shadow-sm border-0 bg-card overflow-hidden">
            <div v-for="tx in auth.user.transactions" :key="tx.id" class="list-group-item p-4 border-0 border-bottom d-flex align-items-center justify-content-between action-row bg-transparent">
                <div class="d-flex align-items-center gap-3">
                    <div class="icon-circle-sm bg-primary bg-opacity-10 text-primary">
                        <i class="bi bi-arrow-left-right"></i>
                    </div>
                    <div>
                        <div class="fw-bold text-main small">{{ tx.title }}</div>
                        <div class="text-muted" style="font-size: 0.7rem;">{{ tx.date }}</div>
                    </div>
                </div>
                <div class="text-end">
                    <div class="fw-bold" :class="tx.type === 'income' ? 'text-success' : 'text-main'">
                        {{ tx.type === 'income' ? '+' : '-' }}{{ tx.amount }} ₸
                    </div>
                </div>
            </div>
        </div>

        <!-- Пустое состояние (Конфетка) -->
        <div v-else class="empty-state text-center py-5 animate__animated animate__fadeIn">
            <div class="empty-icon-box mb-4 mx-auto">
                <i class="bi bi-search-heart"></i>
            </div>
            <h4 class="fw-bold text-main mb-2">Тут пока пусто</h4>
            <p class="text-muted small px-5">Как только вы совершите первую операцию, она сразу появится здесь.</p>
            <button class="btn btn-primary rounded-pill px-5 py-3 fw-bold mt-3 shadow-sm" @click="$router.push('/payments')">
                Сделать первый платеж
            </button>
        </div>
      </div>
    </div>

    <!-- МОБИЛЬНЫЙ НАВ -->
    <nav class="bottom-nav fixed-bottom bg-header shadow-lg border-top d-flex justify-content-around py-2 d-lg-none">
      <div class="nav-item" @click="$router.push('/')"><i class="bi bi-house-door"></i><small>Главная</small></div>
      <div class="nav-item" @click="$router.push('/qr')"><i class="bi bi-qr-code"></i><small>QR</small></div>
      <div class="nav-item active"><i class="bi bi-clock-history"></i><small>История</small></div>
      <div class="nav-item" @click="$router.push('/account')"><i class="bi bi-person-circle"></i><small>Аккаунт</small></div>
    </nav>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth';
const auth = useAuthStore();
</script>

<style scoped>
.page-wrapper { min-height: 100vh; }
.content-area { padding-top: 80px; max-width: 800px; }
.filter-pill { padding: 8px 20px; border-radius: 20px; border: none; background: var(--btn-light); color: var(--text-muted); font-weight: 700; font-size: 0.8rem; white-space: nowrap; transition: 0.3s; }
.filter-pill.active { background: #004e92; color: white; }

.empty-icon-box { width: 100px; height: 100px; border-radius: 50%; background: var(--btn-light); display: flex; align-items: center; justify-content: center; font-size: 3rem; color: #cbd5e0; }

.action-row { cursor: pointer; transition: 0.2s; border-color: var(--border) !important; }
.action-row:active { background: rgba(0,0,0,0.05); }

/* ПЕРЕМЕННЫЕ ТЕМЫ */
.app-layout {
  --bg-main: #f6f8fb; --bg-card: #ffffff; --text-main: #000428; --header-bg: #ffffff; --btn-light: #f1f3f5; --border: #f1f3f5;
  display: flex; min-height: 100vh; background-color: var(--bg-main); font-family: 'Inter', sans-serif; transition: 0.3s;
}
.app-layout.dark-theme {
  --bg-main: #0b0e14; --bg-card: #1a1f26; --text-main: #ffffff; --header-bg: #1a1f26; --btn-light: #2d3748; --border: #2d3748;
}
.main-wrapper { flex-grow: 1; display: flex; flex-direction: column; }
.header { z-index: 1000; text-align: center; }
.bg-header { background: var(--header-bg) !important; }
.text-main { color: var(--text-main) !important; }

/* NAV */
.bottom-nav { border-radius: 25px 25px 0 0; z-index: 1000; }
.nav-item { display: flex; flex-direction: column; align-items: center; color: #a0aec0; cursor: pointer; transition: 0.3s; width: 25%; }
.nav-item i { font-size: 1.4rem; }
.nav-item.active { color: #004e92; }

/* SIDEBAR ПК */
.desktop-sidebar { width: 280px; background: var(--bg-card); border-right: 1px solid var(--border); padding: 35px 25px; flex-direction: column; position: sticky; top: 0; height: 100vh; }
.logo-circle-adam { width: 40px; height: 40px; border-radius: 12px; background: #004e92; color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.2rem; }
.brand-name-adam { font-weight: 800; font-size: 1.2rem; color: var(--text-main); margin-left: 10px; }
.sidebar-link { display: flex; align-items: center; gap: 15px; padding: 14px 18px; border-radius: 18px; cursor: pointer; color: #718096; font-weight: 600; transition: 0.3s; margin-bottom: 5px; }
.sidebar-link.active { background: #eef6ff; color: #004e92; }
</style>