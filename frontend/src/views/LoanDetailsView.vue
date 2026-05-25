<template>
  <div class="page-wrapper">
    <div class="header d-flex align-items-center px-4 py-3 bg-white shadow-sm fixed-top">
      <router-link to="/my-bank" class="btn btn-light rounded-circle shadow-sm me-3 back-btn">
        <i class="bi bi-arrow-left text-dark"></i>
      </router-link>
      <h5 class="mb-0 fw-bold">Мой Кредит</h5>
    </div>

    <div class="container pt-5 mt-5 pb-5">
      
      <!-- ГЛАВНАЯ ИНФО-КАРТА -->
      <div class="loan-hero-card p-4 rounded-5 text-white mb-4 shadow-lg animate__animated animate__fadeInDown">
          <div class="mb-4">
              <small class="opacity-75 text-uppercase fw-bold ls-1">Остаток долга</small>
              <h1 class="display-5 fw-bold mt-1">{{ formatMoney(loanAmount) }} ₸</h1>
          </div>
          
          <div class="d-flex justify-content-between align-items-center bg-white bg-opacity-10 p-3 rounded-4">
              <div>
                  <small class="d-block opacity-75">Ежемесячный платеж</small>
                  <span class="fw-bold fs-5">{{ formatMoney(monthlyPayment) }} ₸</span>
              </div>
              <div class="text-end">
                  <small class="d-block opacity-75">Срок до</small>
                  <span class="fw-bold">15.06.2025</span>
              </div>
          </div>
      </div>

      <!-- КНОПКИ -->
      <div class="row g-3 mb-4">
          <div class="col-12">
              <button class="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-sm" @click="handleRepay('monthly')">
                  Оплатить платеж ({{ formatMoney(monthlyPayment) }} ₸)
              </button>
          </div>
          <div class="col-12">
              <button class="btn btn-outline-primary w-100 py-3 rounded-pill fw-bold" @click="handleRepay('full')">
                  Погасить полностью
              </button>
          </div>
      </div>

      <!-- ГРАФИК И ДЕТАЛИ -->
      <h6 class="fw-bold text-muted mb-3 ps-2">Детализация</h6>
      <div class="bg-white rounded-5 p-4 shadow-sm mb-4">
          <div class="d-flex justify-content-between mb-3">
              <span class="text-muted">Процентная ставка</span>
              <span class="fw-bold text-dark">22.0% годовых</span>
          </div>
          <div class="d-flex justify-content-between mb-3">
              <span class="text-muted">Оплачено месяцев</span>
              <span class="fw-bold text-dark">2 из 12</span>
          </div>
          <div class="progress rounded-pill" style="height: 8px;">
              <div class="progress-bar bg-primary" style="width: 16%"></div>
          </div>
      </div>

      <!-- ИСТОРИЯ ОПЛАТ -->
      <h6 class="fw-bold text-muted mb-3 ps-2">История платежей</h6>
      <div class="list-group rounded-5 shadow-sm border-0 overflow-hidden bg-white">
          <div v-for="n in 2" :key="n" class="list-group-item p-3 border-0 border-bottom d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center">
                  <div class="icon-circle-sm bg-light text-primary me-3"><i class="bi bi-calendar-check"></i></div>
                  <div><div class="fw-bold small">Ежемесячный платеж</div><small class="text-muted">Апрель 2026</small></div>
              </div>
              <span class="fw-bold small text-danger">-{{ formatMoney(monthlyPayment) }} ₸</span>
          </div>
      </div>

    </div>

    <!-- FACE ID ОВЕРЛЕЙ -->
    <div v-if="isVerifying" class="face-id-overlay">
        <div class="scanner-box">
            <div class="scanner-circle"><div class="scanner-line"></div></div>
            <h5 class="mt-4 text-white fw-bold">Подтверждение оплаты</h5>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();
const isVerifying = ref(false);

const loan = computed(() => auth.user?.credits?.[0] || { amount: 0, monthlyPayment: 0 });
const loanAmount = computed(() => loan.value.amount);
const monthlyPayment = computed(() => loan.value.monthlyPayment);

const formatMoney = (v) => new Intl.NumberFormat('ru-RU').format(v);

const handleRepay = async (type) => {
    const amountToPay = type === 'full' ? loanAmount.value : monthlyPayment.value;
    
    if (confirm(`Списать ${formatMoney(amountToPay)} ₸ для оплаты кредита?`)) {
        isVerifying.value = true;
        
        setTimeout(async () => {
            try {
                await auth.repayLoan(amountToPay, type === 'full');
                isVerifying.value = false;
                alert('Оплата прошла успешно!');
                if (type === 'full') router.push('/my-bank');
            } catch (e) {
                isVerifying.value = false;
                alert(e.message);
            }
        }, 2500);
    }
};
</script>

<style scoped>
.page-wrapper { min-height: 100vh; background-color: #f6f8fb; font-family: 'Inter', sans-serif; }
.header { z-index: 1000; }
.back-btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; }

.loan-hero-card {
    background: linear-gradient(135deg, #004e92, #000428);
    border: none;
}
.ls-1 { letter-spacing: 1px; }
.icon-circle-sm { width: 35px; height: 35px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }

.face-id-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 3000; display: flex; align-items: center; justify-content: center; text-align: center; }
.scanner-circle { width: 200px; height: 200px; border-radius: 50%; border: 3px solid #0d6efd; position: relative; overflow: hidden; }
.scanner-line { position: absolute; width: 100%; height: 2px; background: #0d6efd; box-shadow: 0 0 15px #0d6efd; top: 0; animation: scan 2s infinite ease-in-out; }
@keyframes scan { 0% { top: 0; } 50% { top: 100%; } 100% { top: 0; } }
</style>