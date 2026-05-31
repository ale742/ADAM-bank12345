<template>
  <div class="app-layout" :class="{ 'dark-theme': auth.isDarkMode }">

    <!-- ЕДИНАЯ СИСТЕМА УВЕДОМЛЕНИЙ (КОНФЕТКА) -->
    <Transition name="scale">
      <div v-if="status.visible" class="status-overlay" @click.self="handleOverlayClick">
        <div class="status-card shadow-lg text-center p-5" :class="status.type">
          <div class="status-icon mb-4">
            <i :class="status.icon"></i>
          </div>
          <h4 class="fw-bold mb-2">{{ status.title }}</h4>
          <p class="text-muted small">{{ status.msg }}</p>
          
          <!-- КНОПКИ ДЛЯ ПОДТВЕРЖДЕНИЯ -->
          <div v-if="status.type === 'confirm'" class="d-flex gap-2 mt-4">
            <button class="btn btn-light flex-fill rounded-pill py-2 fw-bold" @click="status.visible = false">Отмена</button>
            <button class="btn btn-primary flex-fill rounded-pill py-2 fw-bold shadow-sm" @click="executeRepay">Да, уверен</button>
          </div>
          
          <!-- КНОПКА ДЛЯ УСПЕХА / ОШИБКИ -->
          <button v-else class="btn btn-primary rounded-pill px-5 mt-4 fw-bold" @click="status.visible = false">
            Понятно
          </button>
        </div>
      </div>
    </Transition>

    <div class="page-wrapper" v-if="loan">
        <div class="header d-flex align-items-center px-4 py-3 bg-header fixed-top">
            <button @click="$router.push('/my-bank')" class="btn btn-light-custom rounded-circle me-3 back-btn">
                <i class="bi bi-arrow-left"></i>
            </button>
            <h5 class="mb-0 fw-bold text-main">Мой Кредит</h5>
        </div>

        <div class="container content-area pt-5 mt-4">
            <!-- СТАТУС КРЕДИТА -->
            <div class="bg-card rounded-5 p-4 shadow-sm mb-4 text-center">
                <small class="text-muted fw-bold text-uppercase ls-1 d-block mb-2">Остаток кредита</small>
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
                </div>
                <button class="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-sm" @click="requestRepay('monthly')">
                    Оплатить сейчас
                </button>
            </div>

            <!-- ДОСРОЧНОЕ ПОГАШЕНИЕ -->
            <h6 class="fw-bold text-muted mb-3 ps-2">Управление кредитом</h6>
            <div class="repay-full-card p-4 rounded-5 text-white mb-5 shadow-lg position-relative overflow-hidden" @click="requestRepay('full')">
                <div class="card-bg-decor"></div>
                <div class="d-flex justify-content-between align-items-center position-relative z-2">
                    <div>
                        <h5 class="fw-bold mb-1">Погасить полностью</h5>
                        <p class="very-small opacity-75 m-0">Экономия на процентах до 15%</p>
                    </div>
                    <div class="text-end">
                        <div class="fw-bold fs-5">{{ formatMoney(loan.remainingDebt) }} ₸</div>
                        <i class="bi bi-chevron-right"></i>
                    </div>
                </div>
                <div class="shimmer-effect"></div>
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
                    <h5 class="mt-4 text-white fw-bold">Face ID</h5>
                    <p class="text-white-50 small">Подтверждение оплаты</p>
                </div>
            </div>
        </Transition>
    </div>

    <!-- ЕСЛИ КРЕДИТА НЕТ -->
    <div v-else class="container text-center pt-5 mt-5">
        <div class="p-5">
            <i class="bi bi-check-circle text-success display-1 mb-4"></i>
            <h3 class="fw-bold text-main">Кредитов нет</h3>
            <p class="text-muted">Все ваши обязательства выполнены!</p>
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

// Единое состояние уведомлений
const status = reactive({
    visible: false,
    type: 'success', // success, error, confirm
    title: '',
    msg: '',
    icon: '',
    pendingType: ''
});

const loan = computed(() => auth.user?.credits?.[0]);
const progressWidth = computed(() => loan.value ? ((loan.value.months - loan.value.monthsLeft) / loan.value.months) * 100 : 0);

const formatMoney = (v) => new Intl.NumberFormat('ru-RU').format(v || 0);

// 1. ШАГ: ЗАПРОС (Окно "Вы уверены?")
const requestRepay = (type) => {
    const amount = type === 'full' ? loan.value.remainingDebt : loan.value.monthlyPayment;
    status.type = 'confirm';
    status.title = type === 'full' ? 'Полное погашение' : 'Оплата платежа';
    status.msg = `Списать ${formatMoney(amount)} ₸ с вашей карты?`;
    status.icon = 'bi-question-circle text-primary';
    status.pendingType = type;
    status.visible = true;
};

// 2. ШАГ: ИСПОЛНЕНИЕ (Face ID + Store)
const executeRepay = () => {
    const type = status.pendingType;
    const amount = type === 'full' ? loan.value.remainingDebt : loan.value.monthlyPayment;
    
    status.visible = false;
    isVerifying.value = true;
    
    setTimeout(async () => {
        try {
            await auth.repayLoan(loan.value.id, amount, type === 'full');
            isVerifying.value = false;
            
            // УСПЕХ
            status.type = 'success';
            status.icon = 'bi-check-lg';
            status.title = 'Оплачено!';
            status.msg = 'Средства успешно списаны. Ваш лимит обновлен.';
            status.visible = true;

            if (type === 'full') {
                setTimeout(() => { if(status.visible) status.visible = false; router.push('/my-bank'); }, 2500);
            }
        } catch (e) {
            isVerifying.value = false;
            // ОШИБКА (Сюда прилетит "Недостаточно средств")
            status.type = 'error';
            status.icon = 'bi-exclamation-triangle';
            status.title = 'Ошибка';
            status.msg = e.message;
            status.visible = true;
        }
    }, 2500);
};

const handleOverlayClick = () => {
    if (status.type !== 'confirm') status.visible = false;
};
</script>

<style scoped>
.page-wrapper { min-height: 100vh; }
.ls-1 { letter-spacing: 1px; }

/* ПРЕМИУМ КАРТОЧКА */
.repay-full-card {
    background: linear-gradient(135deg, #000428 0%, #004e92 100%);
    cursor: pointer; transition: transform 0.3s; border: none;
}
.repay-full-card:active { transform: scale(0.97); }
.card-bg-decor {
    position: absolute; top: -50%; right: -50%; width: 200%; height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
    transform: rotate(15deg);
}

.shimmer-effect {
    position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
    animation: shimmer 3s infinite linear;
}
@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }

.border-highlight { border: 2px solid #0d6efd !important; }

/* FACE ID iOS STYLE */
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

/* STATUS OVERLAY (ТВОЯ КОНФЕТКА) */
.status-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(10px); z-index: 8000; display: flex; align-items: center; justify-content: center; }
.status-card { background: var(--bg-card); border-radius: 40px; width: 85%; max-width: 380px; color: var(--text-main); }
.status-icon { width: 85px; height: 85px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.8rem; margin: 0 auto; }
.status-card.success .status-icon { background: #198754; color: white; }
.status-card.error .status-icon { background: #dc3545; color: white; }
.status-card.confirm .status-icon { background: #0d6efd; color: white; }

.scale-enter-active, .scale-leave-active { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.scale-enter-from, .scale-leave-to { opacity: 0; transform: scale(0.5); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>