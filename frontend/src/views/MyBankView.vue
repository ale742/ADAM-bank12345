<template>
  <div class="page-wrapper">
    
    <!-- Хедер -->
    <div class="header d-flex align-items-center px-4 py-3 bg-white shadow-sm fixed-top">
      <router-link to="/" class="btn btn-light rounded-circle shadow-sm me-3 back-btn">
        <i class="bi bi-arrow-left text-dark"></i>
      </router-link>
      <h5 class="mb-0 fw-bold">Мой Банк</h5>
    </div>

    <!-- Контент -->
    <div class="container pt-5 mt-4 pb-5">
      
      <!-- 1. КАРТОЧКА (Счет) -->
      <div class="bank-card p-4 mb-4 shadow text-white position-relative overflow-hidden animate__animated animate__fadeInDown">
        <div class="card-bg"></div>
        <div class="d-flex justify-content-between align-items-start position-relative z-1">
          <small class="text-white-50 text-uppercase fw-bold ls-1">ADAM-BANK</small>
          <i class="bi bi-wifi fs-3 text-white-50"></i>
        </div>
        <div class="mt-3 position-relative z-1">
            <h1 class="fw-bold my-0">{{ formatMoney(auth.user?.balance) }} ₸</h1>
        </div>
        <div class="d-flex justify-content-between align-items-end mt-4 position-relative z-1">
          <div class="d-flex align-items-center gap-2">
             <div class="card-chip"></div>
             <p class="mb-0 ls-2 font-monospace">•••• 4582</p>
          </div>
          <span class="fw-bold">{{ auth.user?.name }}</span>
        </div>
      </div>

      <!-- 2. ПРОДУКТЫ (Список) -->
      <h6 class="fw-bold text-muted mb-3 ps-2">Ваши продукты</h6>
      
      <div class="list-group rounded-4 shadow-sm border-0 mb-4 overflow-hidden">
        
        <!-- Депозиты -->
        <div class="list-group-item p-3 border-0 d-flex align-items-center justify-content-between action-row">
            <div class="d-flex align-items-center">
                <div class="icon-circle bg-success bg-opacity-10 text-success me-3">
                    <i class="bi bi-piggy-bank-fill fs-5"></i>
                </div>
                <div>
                    <h6 class="mb-0 fw-bold">Депозиты</h6>
                    <small class="text-muted">Ставка 15.5%</small>
                </div>
            </div>
            <div class="text-end">
                <span class="fw-bold d-block">0 ₸</span>
                <small class="text-primary fw-bold" style="font-size: 0.75rem;">Открыть</small>
            </div>
        </div>

        <!-- Кредиты -->
        <div class="list-group-item p-3 border-0 d-flex align-items-center justify-content-between action-row">
            <div class="d-flex align-items-center">
                <div class="icon-circle bg-danger bg-opacity-10 text-danger me-3">
                    <i class="bi bi-cash-coin fs-5"></i>
                </div>
                <div>
                    <h6 class="mb-0 fw-bold">Кредиты</h6>
                    <small class="text-muted">До 10 млн ₸</small>
                </div>
            </div>
            <i class="bi bi-chevron-right text-muted"></i>
        </div>

        <!-- Рассрочка -->
        <div class="list-group-item p-3 border-0 d-flex align-items-center justify-content-between action-row">
            <div class="d-flex align-items-center">
                <div class="icon-circle bg-warning bg-opacity-10 text-warning me-3">
                    <i class="bi bi-bag-check-fill fs-5"></i>
                </div>
                <div>
                    <h6 class="mb-0 fw-bold">ADAM Рассрочка</h6>
                    <small class="text-muted">0-0-12 / 0-0-24</small>
                </div>
            </div>
            <span class="badge bg-danger rounded-pill">0 ₸</span>
        </div>

      </div>

      <!-- Действия с картой -->
      <h6 class="fw-bold text-muted mb-3 ps-2">Настройки карты</h6>
      <div class="row g-2">
          <div class="col-6">
              <div class="p-3 bg-white rounded-4 shadow-sm text-center action-card">
                  <i class="bi bi-gear fs-4 text-primary mb-2 d-block"></i>
                  <small class="fw-bold">Настройки</small>
              </div>
          </div>
          <div class="col-6">
              <div class="p-3 bg-white rounded-4 shadow-sm text-center action-card">
                  <i class="bi bi-file-text fs-4 text-primary mb-2 d-block"></i>
                  <small class="fw-bold">Реквизиты</small>
              </div>
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
</script>

<style scoped>
.page-wrapper {
    min-height: 100vh;
    background-color: #f6f8fb;
    font-family: 'Inter', sans-serif;
}
.header { z-index: 1000; }
.back-btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; }

/* КАРТА */
.bank-card {
    border-radius: 25px;
    background: linear-gradient(135deg, #004e92 0%, #000428 100%);
    box-shadow: 0 10px 30px rgba(0, 78, 146, 0.3);
}
.card-bg {
    position: absolute; top: -50%; right: -50%; width: 100%; height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
    transform: rotate(30deg);
}
.card-chip {
    width: 40px; height: 30px; background: linear-gradient(135deg, #e0e0e0, #bdbdbd);
    border-radius: 6px; position: relative; border: 1px solid rgba(0,0,0,0.1);
}
.ls-1 { letter-spacing: 1px; }
.ls-2 { letter-spacing: 2px; }

/* СПИСОК */
.icon-circle {
    width: 45px; height: 45px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
}
.action-row {
    transition: background-color 0.2s;
    cursor: pointer;
}
.action-row:active { background-color: #f8f9fa; }

/* КНОПКИ */
.action-card {
    cursor: pointer; transition: transform 0.2s;
}
.action-card:active { transform: scale(0.95); }
</style>