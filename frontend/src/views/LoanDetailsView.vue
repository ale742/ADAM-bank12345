<template>
  <div class="app-layout" :class="{ 'dark-theme': auth.isDarkMode }">
    
    <!-- 1. КУСТОМНОЕ УВЕДОМЛЕНИЕ (Вместо системных алертов) -->
    <Transition name="fade">
      <div v-if="confirmDialog.visible" class="custom-confirm-overlay" @click.self="closeConfirm">
        <div class="confirm-modal animate__animated animate__zoomIn">
          <div class="confirm-icon-box" :class="confirmDialog.type">
            <i :class="confirmDialog.icon"></i>
          </div>
          <h5 class="fw-bold mb-2">{{ confirmDialog.title }}</h5>
          <p class="text-muted small mb-4">{{ confirmDialog.message }}</p>
          <div class="d-flex gap-2 w-100">
            <button class="btn btn-light flex-fill rounded-pill py-2 fw-bold" @click="closeConfirm">Отмена</button>
            <button class="btn btn-primary flex-fill rounded-pill py-2 fw-bold shadow-sm" @click="confirmDialog.action">Да, уверен</button>
          </div>
        </div>
      </div>
    </Transition>

    <div class="page-wrapper" v-if="loan">
        <!-- Хедер -->
        <div class="header d-flex align-items-center px-4 py-3 bg-header fixed-top">
            <button @click="$router.push('/my-bank')" class="btn btn-light-custom rounded-circle me-3 back-btn">
                <i class="bi bi-arrow-left"></i>
            </button>
            <h5 class="mb-0 fw-bold text-main">Мой Кредит</h5>
        </div>

        <div class="container content-area pt-5 mt-4">
            
            <!-- СТАТУС КРЕДИТА -->
            <div class="bg-card rounded-5 p-4 shadow-sm mb-4 text-center">
                <small class="text-muted fw-bold text-uppercase ls-1 d-block mb-2">Остаток долга</small>
                <h1 class="display-5 fw-bold text-main mb-4">{{ formatMoney(loan.remainingDebt) }} ₸</h1>
                
                <div class="progress rounded-pill mb-3" style="height: 10px; background: rgba(0,0,0,0.05);">
                    <div class="progress-bar bg-primary" :style="{ width: progressWidth + '%' }"></div>
                </div>
                <div class="d-flex justify-content-between small text-muted">
                    <span>Выплачено: {{ loan.months - loan.monthsLeft }} мес.</span>
                    <span>Осталось: {{ loan.monthsLeft }} мес.</span>
                </div>
            </div>

            <!-- БЛОК БЛИЖАЙШЕГО ПЛАТЕЖА -->
            <div class="bg-card rounded-5 p-4 shadow-sm mb-4 border-highlight">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <small class="text-muted d-block">Ближайший платеж</small>
                        <h3 class="fw-bold text-main m-0">{{ formatMoney(loan.monthlyPayment) }} ₸</h3>
                    </div>
                    <div class="text-end">
                        <small class="text-muted d-block">Срок до</small>
                        <span class="fw-bold text-primary">15.06.2026</span>
                    </div>
                </div>
                <button class="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-sm" @click="requestRepay('monthly')">
                    Оплатить сейчас
                </button>
            </div>

            <!-- ПРЕМИАЛЬНОЕ ДОСРОЧНОЕ ПОГАШЕНИЕ (ВМЕСТО ОБЫЧНОЙ КНОПКИ) -->
            <h6 class="fw-bold text-muted mb-3 ps-2">Управление кредитом</h6>
            <div class="repay-full-card p-4 rounded-5 text-white mb-5 shadow-lg position-relative overflow-hidden" @click="requestRepay('full')">
                <div class="card-bg-decor"></div>
                <div class="d-flex justify-content-between align-items-center position-relative z-2">
                    <div>
                        <h5 class="fw-bold mb-1">Погасить полностью</h5>
                        <p class="very-small opacity-75 m-0">Экономия на вознаграждении до 15%</p>
                    </div>
                    <div class="text-end">
                        <div class="fw-bold fs-5">{{ formatMoney(loan.remainingDebt) }} ₸</div>
                        <i class="bi bi-chevron-right"></i>
                    </div>
                </div>
                <!-- Анимация блеска -->
                <div class="shimmer-effect"></div>
            </div>

            <!-- ИНФО О КРЕДИТЕ -->
            <div class="bg-card rounded-5 p-4 shadow-sm mb-4">
                <div class="d-flex justify-content-between mb-3 border-bottom pb-2 border-light">
                    <span class="text-muted small">Ставка</span>
                    <span class="fw-bold text-main">{{ loan.rate }}%</span>
                </div>
                <div class="d-flex justify-content-between">
                    <span class="text-muted small">Тип платежа</span>
                    <span class="fw-bold text-main">Аннуитетный</span>
                </div>
            </div>
        </div>

        <!-- FACE ID (ЦЕНТРИРОВАННЫЙ СИНИЙ) -->
        <Transition name="fade">
            <div v-if="isVerifying" class="face-id-ios-overlay">
                <div class="face-id-container">
                    <div class="face-id-scanner">
                        <div class="scanner-corner top-left"></div><div class="scanner-corner top-right"></div>
                        <div class="scanner-corner bottom-left"></div><div class="scanner-corner bottom-right"></div>
                        <div class="face-icon-ios"><i class="bi bi-person-bounding-box"></i></div>
                        <div class="scan-line-ios-blue"></div>
                    </div>
                    <h5 class="mt-4 text-white fw-bold">Подтверждение оплаты</h5>
                    <p class="text-white-50 small">Adam Security System</p>
                </div>
            </div>
        </Transition>
    </div>

    <!-- ЕСЛИ КРЕДИТА НЕТ (Защита от белого экрана) -->
    <div v-else class="container text-center pt-5 mt-5">
        <div class="p-5">
            <i class="bi bi-check-circle text-success display-1 mb-4"></i>
            <h3 class="fw-bold">Кредитов нет</h3>
            <p class="text-muted">Все ваши обязательства успешно исполнены.</p>
            <button class="btn btn-primary rounded-pill px-5 py-2" @click="$router.push('/my-bank')">В мой банк</button>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();
const isVerifying = ref(false);

// Кастомный диалог
const confirmDialog = reactive({ visible: false, title: '', message: '', icon: '', type: '', action: null });

const loan = computed(() => auth.user?.credits?.[0]);
const progressWidth = computed(() => loan.value ? ((loan.value.months - loan.value.monthsLeft) / loan.value.months) * 100 : 0);

const formatMoney = (v) => new Intl.NumberFormat('ru-RU').format(v || 0);

const closeConfirm = () => { confirmDialog.visible = false; };

const requestRepay = (type) => {
    const amount = type === 'full' ? loan.value.remainingDebt : loan.value.monthlyPayment;
    confirmDialog.title = type === 'full' ? 'Полное погашение' : 'Ежемесячный платеж';
    confirmDialog.message = `Списать ${formatMoney(amount)} ₸ для оплаты кредита?`;
    confirmDialog.icon = type === 'full' ? 'bi-shield-check' : 'bi-credit-card';
    confirmDialog.type = 'info';
    confirmDialog.action = () => handleRepay(type, amount);
    confirmDialog.visible = true;
};

const handleRepay = (type, amount) => {
    confirmDialog.visible = false;
    isVerifying.value = true;
    
    setTimeout(() => {
        try {
            auth.repayLoan(loan.value.id, amount, type === 'full');
            isVerifying.value = false;
            if (type === 'full') {
                router.push('/my-bank');
            }
        } catch (e) {
            isVerifying.value = false;
            alert(e.message);
        }
    }, 2500);
};
</script>

<style scoped>
.page-wrapper { min-height: 100vh; }
.ls-1 { letter-spacing: 1px; }

/* ПРЕМИАЛЬНАЯ КАРТОЧКА ПОГАШЕНИЯ */
.repay-full-card {
    background: linear-gradient(135deg, #000428 0%, #004e92 100%);
    cursor: pointer; transition: transform 0.3s;
    border: none;
}
.repay-full-card:active { transform: scale(0.97); }
.card-bg-decor {
    position: absolute; top: -50%; right: -50%; width: 200%; height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
    transform: rotate(15deg);
}

/* ЭФФЕКТ БЛЕСКА */
.shimmer-effect {
    position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
    animation: shimmer 3s infinite linear;
}
@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }

.border-highlight { border: 2px solid #0d6efd !important; }
.very-small { font-size: 0.7rem; }

/* FACE ID FIXED */
.face-id-ios-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.92);
    z-index: 6000; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;
}
.face-id-container { display: flex; flex-direction: column; align-items: center; }
.face-id-scanner { width: 180px; height: 180px; position: relative; display: flex; align-items: center; justify-content: center; }
.scanner-corner { position: absolute; width: 35px; height: 35px; border: 4px solid #0d6efd; border-radius: 12px; }
.top-left { top: 0; left: 0; border-right: 0; border-bottom: 0; }
.top-right { top: 0; right: 0; border-left: 0; border-bottom: 0; }
.bottom-left { bottom: 0; left: 0; border-right: 0; border-top: 0; }
.bottom-right { bottom: 0; right: 0; border-left: 0; border-top: 0; }
.face-icon-ios { font-size: 5.5rem; color: #0d6efd; opacity: 0.8; }
.scan-line-ios-blue { position: absolute; width: 100%; height: 2px; background: #0d6efd; box-shadow: 0 0 15px #0d6efd; animation: scanAnimIos 2s infinite ease-in-out; }
@keyframes scanAnimIos { 0% { top: 10%; opacity: 0; } 50% { top: 90%; opacity: 1; } 100% { top: 10%; opacity: 0; } }

/* CUSTOM CONFIRM */
.custom-confirm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(10px); z-index: 5000; display: flex; align-items: center; justify-content: center; padding: 20px; }
.confirm-modal { background: var(--bg-card); width: 100%; max-width: 340px; border-radius: 35px; padding: 35px; text-align: center; color: var(--text-main); }
.confirm-icon-box { width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; background: rgba(13, 110, 253, 0.1); color: #0d6efd; font-size: 1.5rem; }
</style>