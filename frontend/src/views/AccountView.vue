<template>
  <div class="account-wrapper">
    
    <!-- Хедер с кнопкой Назад -->
    <div class="header d-flex align-items-center px-4 py-3 bg-white shadow-sm fixed-top">
      <router-link to="/" class="btn btn-light rounded-circle shadow-sm me-3" style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
        <i class="bi bi-arrow-left text-dark"></i>
      </router-link>
      <h5 class="mb-0 fw-bold">ADAM Gold</h5>
    </div>

    <!-- Основной контент -->
    <div class="container pt-5 mt-4 pb-5">
      
      <!-- Большая карта -->
      <div class="bank-card p-4 mb-4 shadow text-white position-relative overflow-hidden animate__animated animate__fadeInDown">
        <div class="card-bg"></div>
        
        <div class="d-flex justify-content-between align-items-start position-relative z-1">
          <i class="bi bi-wifi fs-2 text-white-50"></i>
          <span class="badge bg-white bg-opacity-25 backdrop-blur">Active</span>
        </div>

        <div class="mt-4 position-relative z-1 text-center">
            <small class="text-white-50 text-uppercase fw-bold ls-1">Баланс</small>
            <h1 class="fw-bold my-1">{{ formatMoney(auth.user?.balance) }} ₸</h1>
            <p class="mb-0 text-white-50">Бонусы: 1 250 🅱</p>
        </div>

        <div class="d-flex justify-content-between align-items-end mt-4 position-relative z-1">
          <div class="d-flex align-items-center gap-2">
             <div class="card-chip"></div>
             <p class="mb-0 ls-2 font-monospace fs-5">•••• 4582</p>
          </div>
          <span class="fw-bold">{{ auth.user?.name }}</span>
        </div>
      </div>

      <!-- Кнопки действий -->
      <div class="actions-grid mb-4">
        <div class="action-item">
            <div class="btn btn-light rounded-4 p-3 shadow-sm mb-2 text-primary">
                <i class="bi bi-file-text fs-4"></i>
            </div>
            <small>Реквизиты</small>
        </div>
        <div class="action-item">
            <div class="btn btn-light rounded-4 p-3 shadow-sm mb-2 text-primary">
                <i class="bi bi-eye fs-4"></i>
            </div>
            <small>Показать CVV</small>
        </div>
        <div class="action-item">
            <div class="btn btn-light rounded-4 p-3 shadow-sm mb-2 text-primary">
                <i class="bi bi-gear fs-4"></i>
            </div>
            <small>Настройки</small>
        </div>
        <div class="action-item">
            <div class="btn btn-light rounded-4 p-3 shadow-sm mb-2 text-danger">
                <i class="bi bi-lock fs-4"></i>
            </div>
            <small>Блок</small>
        </div>
      </div>

      <!-- История операций -->
      <h5 class="fw-bold mb-3">История</h5>
      <div class="list-group list-group-flush rounded-4 bg-white shadow-sm">
        <div v-for="tr in auth.transactions" :key="tr.id" class="list-group-item py-3 d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
                <div class="rounded-circle bg-light p-2 me-3 text-center" style="width: 45px; height: 45px; display: flex; align-items: center; justify-content: center;">
                    {{ getIcon(tr.type) }}
                </div>
                <div>
                    <h6 class="mb-0 fw-bold" style="font-size: 0.95rem;">{{ tr.description }}</h6>
                    <small class="text-muted" style="font-size: 0.8rem;">{{ tr.date }}</small>
                </div>
            </div>
            <span :class="tr.type === 'transfer_in' ? 'text-success' : 'text-dark'" class="fw-bold">
                {{ tr.type === 'transfer_in' ? '+' : '-' }}{{ formatMoney(tr.amount) }} ₸
            </span>
        </div>
        
        <div v-if="auth.transactions.length === 0" class="text-center p-4 text-muted">
            История пуста
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();

const formatMoney = (value) => {
    if (!value) return 0;
    return new Intl.NumberFormat('ru-RU').format(value);
};

const getIcon = (type) => {
    if (type === 'shop') return '🛒';
    if (type === 'transfer') return '↗️';
    if (type === 'transfer_in') return '↙️';
    return '📄';
};
</script>

<style scoped>
.account-wrapper {
    min-height: 100vh;
    background-color: #f6f8fb;
    font-family: 'Inter', sans-serif;
}

.header {
    z-index: 1000;
}

.bank-card {
    border-radius: 25px;
    background: linear-gradient(135deg, #004e92 0%, #000428 100%);
    box-shadow: 0 15px 35px rgba(0, 78, 146, 0.3);
    min-height: 220px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.card-bg {
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
    transform: rotate(30deg);
}

.backdrop-blur {
    backdrop-filter: blur(5px);
    border-radius: 8px;
    padding: 5px 10px;
    font-size: 0.8rem;
    font-weight: 600;
}

.card-chip {
    width: 45px;
    height: 35px;
    background: linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%);
    border-radius: 6px;
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(0,0,0,0.1);
}
.card-chip::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 1px;
    background: rgba(0,0,0,0.2);
}

.ls-1 { letter-spacing: 1px; }
.ls-2 { letter-spacing: 2px; }

/* КНОПКИ ДЕЙСТВИЙ */
.actions-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    text-align: center;
}

.action-item small {
    font-weight: 600;
    color: #6c757d;
    font-size: 0.75rem;
}

.action-item .btn {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    background-color: white;
    border: none;
    transition: transform 0.2s;
}

.action-item .btn:active {
    transform: scale(0.95);
    background-color: #f8f9fa;
}
</style>