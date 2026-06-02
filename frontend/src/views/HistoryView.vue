<template>
  <div class="app-layout" :class="{ 'dark-theme': auth.isDarkMode }">
    
    <!-- SIDEBAR ДЛЯ ПК -->
    <aside class="desktop-sidebar d-none d-lg-flex">
      <div class="sidebar-header" @click="$router.push('/')">
        <div class="logo-circle-adam">A</div>
        <span class="brand-name-adam">ADAM BANK</span>
      </div>
      <nav class="sidebar-nav">
        <div class="sidebar-link" @click="$router.push('/')"><i class="bi bi-house-door"></i> <span>Главная</span></div>
        <div class="sidebar-link" @click="$router.push('/qr')"><i class="bi bi-qr-code"></i> <span>QR</span></div>
        <div class="sidebar-link active"><i class="bi bi-clock-history"></i> <span>История</span></div>
        <div class="sidebar-link" @click="$router.push('/account')"><i class="bi bi-person-circle"></i> <span>Аккаунт</span></div>
      </nav>
      <div class="mt-auto user-pill-desktop" v-if="auth.user">
          <div class="avatar-mini-circle" :style="auth.user.avatar ? `background-image: url(${auth.user.avatar})` : ''">
            <span v-if="!auth.user.avatar">{{ auth.user.name[0] }}</span>
          </div>
          <div class="ms-2 fw-bold small text-truncate text-main">{{ auth.user.name }}</div>
      </div>
    </aside>

    <div class="main-wrapper">
      <!-- Хедер мобильный -->
      <div class="header d-flex align-items-center px-4 py-3 bg-header fixed-top d-lg-none">
        <h5 class="mb-0 fw-bold text-main">История операций</h5>
      </div>

      <div class="container content-area pb-5" v-if="auth.user">
        <h2 class="fw-bold mb-4 d-none d-lg-block text-main">История</h2>

        <!-- ФИЛЬТРЫ -->
        <div class="filter-wrapper d-flex gap-2 mb-4 overflow-auto no-scrollbar pb-2">
            <button class="filter-pill" :class="{active: filter === 'all'}" @click="filter = 'all'">Все</button>
            <button class="filter-pill" :class="{active: filter === 'expense'}" @click="filter = 'expense'">Траты</button>
            <button class="filter-pill" :class="{active: filter === 'income'}" @click="filter = 'income'">Доходы</button>
        </div>

        <!-- СПИСОК ТРАНЗАКЦИЙ -->
        <div v-if="filteredTransactions.length > 0" class="transaction-container animate__animated animate__fadeIn">
            <div v-for="tx in filteredTransactions" :key="tx.id" 
                 class="tx-card shadow-sm mb-3 action-row"
                 @click="selectedTx = tx">
                
                <div class="d-flex align-items-center gap-3">
                    <!-- ИКОНКА -->
                    <div class="icon-circle-box" :class="getIconBg(tx.category)">
                        <i :class="getIcon(tx.category)"></i>
                    </div>
                    
                    <div class="flex-grow-1">
                        <div class="fw-bold text-main tx-title">{{ tx.title }}</div>
                        <div class="text-muted-custom">{{ tx.date }}</div>
                    </div>

                    <div class="text-end">
                        <div class="fw-bold tx-amount" :class="tx.type === 'income' ? 'text-success' : 'text-main'">
                            {{ tx.type === 'income' ? '+' : '-' }}{{ formatMoney(tx.amount) }} ₸
                        </div>
                        <div class="very-small text-muted-custom">Adam Card</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- КРАСИВОЕ ПУСТОЕ СОСТОЯНИЕ -->
        <div v-else class="empty-state text-center py-5">
            <div class="empty-icon-box mb-4 mx-auto">
                <i class="bi bi-clock-history"></i>
            </div>
            <h4 class="fw-bold text-main">Операций пока нет</h4>
        </div>
      </div>

      <!-- МОБИЛЬНЫЙ НАВБАР -->
      <nav class="bottom-nav fixed-bottom bg-header shadow-lg border-top d-flex justify-content-around py-2 d-lg-none">
        <div class="nav-item" @click="$router.push('/')"><i class="bi bi-house-door"></i><small>Главная</small></div>
        <div class="nav-item" @click="$router.push('/qr')"><i class="bi bi-qr-code"></i><small>QR</small></div>
        <div class="nav-item active"><i class="bi bi-clock-history"></i><small>История</small></div>
        <div class="nav-item" @click="$router.push('/account')"><i class="bi bi-person-circle"></i><small>Аккаунт</small></div>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const filter = ref('all');

const formatMoney = (v) => new Intl.NumberFormat('ru-RU').format(v || 0);

const filteredTransactions = computed(() => {
    if (!auth.user?.transactions) return [];
    if (filter.value === 'all') return auth.user.transactions;
    return auth.user.transactions.filter(t => t.type === filter.value);
});

const getIcon = (cat) => {
    const map = { mobile: 'bi-phone', deposit: 'bi-piggy-bank', loan: 'bi-cash-coin', topup: 'bi-plus-circle', transfer: 'bi-arrow-left-right', payment: 'bi-credit-card' };
    return map[cat] || 'bi-layers';
};

const getIconBg = (cat) => {
    const map = { mobile: 'bg-danger', deposit: 'bg-success', loan: 'bg-info', topup: 'bg-primary', transfer: 'bg-warning', payment: 'bg-dark' };
    return (map[cat] || 'bg-secondary') + ' bg-opacity-10 text-' + (map[cat]?.replace('bg-', '') || 'secondary');
};
</script>

<style scoped>
/* ТЕМА И ОБЩИЙ LAYOUT */
.app-layout {
  --bg-main: #f6f8fb; --bg-card: #ffffff; --text-main: #000428; --header-bg: #ffffff; --btn-light: #f1f3f5; --border: #f1f3f5; --text-muted: #718096;
  display: flex; min-height: 100vh; background-color: var(--bg-main); font-family: 'Inter', sans-serif; transition: 0.3s;
}

.app-layout.dark-theme {
  --bg-main: #0b0e14; 
  --bg-card: #1a1f26; 
  --text-main: #ffffff; 
  --header-bg: #1a1f26; 
  --btn-light: #2d3748; 
  --border: #2d3748;
  --text-muted: #a0aec0;
}

.main-wrapper { flex-grow: 1; display: flex; flex-direction: column; height: 100vh; overflow-y: auto; }
.content-area { padding-top: 100px; max-width: 750px; margin: 0 auto; width: 100%; }

/* ТЕКСТ */
.text-main { color: var(--text-main) !important; }
.text-muted-custom { color: var(--text-muted) !important; font-size: 0.75rem; }

/* КАРТОЧКИ ТРАНЗАКЦИЙ */
.tx-card {
    background-color: var(--bg-card) !important;
    border-radius: 22px;
    padding: 18px 20px;
    margin-bottom: 12px;
    transition: 0.2s ease;
    border: 1px solid var(--border);
}
.tx-card:active { transform: scale(0.98); background-color: var(--btn-light) !important; }

/* ИКОНКИ */
.icon-circle-box {
    width: 46px; height: 48px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.3rem;
}

/* ФИЛЬТРЫ */
.filter-pill {
    padding: 10px 24px; border-radius: 25px; border: none;
    background: var(--bg-card); color: var(--text-main);
    font-weight: 700; font-size: 0.85rem; transition: 0.3s;
}
.filter-pill.active { background: #004e92; color: white; box-shadow: 0 8px 20px rgba(0, 78, 146, 0.3); }

/* SIDEBAR ПК */
.desktop-sidebar { width: 280px; background: var(--bg-card); border-right: 1px solid var(--border); padding: 35px 25px; flex-direction: column; position: sticky; top: 0; height: 100vh; }
.logo-circle-adam { width: 40px; height: 40px; border-radius: 12px; background: #004e92; color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.2rem; }
.brand-name-adam { font-weight: 800; font-size: 1.2rem; color: var(--text-main); margin-left: 10px; }
.sidebar-link { display: flex; align-items: center; gap: 15px; padding: 14px 18px; border-radius: 18px; cursor: pointer; color: #718096; font-weight: 600; transition: 0.3s; }
.sidebar-link.active { background: #eef6ff; color: #004e92; }
.dark-theme .sidebar-link.active { background: rgba(0, 78, 146, 0.2); color: #0d6efd; }

/* BOTTOM NAV */
.bottom-nav { border-radius: 25px 25px 0 0; z-index: 1000; background-color: var(--header-bg) !important; border-top: 1px solid var(--border); }
.nav-item { display: flex; flex-direction: column; align-items: center; color: #a0aec0; cursor: pointer; width: 25%; }
.nav-item i { font-size: 1.4rem !important; }
.nav-item.active { color: #004e92; }
.dark-theme .nav-item.active { color: #0d6efd; }

.bg-header { background-color: var(--header-bg) !important; }
.user-pill-desktop { display: flex; align-items: center; padding: 15px; background: var(--btn-light); border-radius: 20px; }
.avatar-mini-circle { width: 32px; height: 32px; border-radius: 50%; background: #004e92; color: white; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; font-weight: bold; }
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>