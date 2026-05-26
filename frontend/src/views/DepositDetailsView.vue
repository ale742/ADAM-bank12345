<template>
  <div class="page-wrapper" v-if="dep">
    
    <!-- КАСТОМНЫЙ ДИАЛОГ (ДЛЯ ГЛАЗИКА И ЗАКРЫТИЯ) -->
    <Transition name="fade">
      <div v-if="dialog.visible" class="custom-confirm-overlay" @click.self="dialog.visible = false">
        <div class="confirm-modal animate__animated animate__zoomIn">
          <div class="confirm-icon-box" :class="dialog.type"><i :class="dialog.icon"></i></div>
          <h5 class="fw-bold mb-2">{{ dialog.title }}</h5>
          <p class="text-muted small mb-4">{{ dialog.message }}</p>
          <div class="d-flex gap-2 w-100">
            <button class="btn btn-light flex-fill rounded-pill py-2 fw-bold" @click="dialog.visible = false">Отмена</button>
            <button class="btn btn-primary flex-fill rounded-pill py-2 fw-bold shadow-sm" @click="dialog.action">Да, уверен</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- УВЕДОМЛЕНИЕ О ЗАКАЗЕ НАЛИЧНЫХ (> 4 МЛН) -->
    <Transition name="scale">
      <div v-if="showOrderNotice" class="status-overlay">
        <div class="status-card shadow-lg text-center p-5">
          <div class="order-icon-box mb-4 animate__animated animate__pulse animate__infinite">
            <i class="bi bi-truck text-white"></i>
          </div>
          <h3 class="fw-bold mb-2">Заявка принята</h3>
          <p class="text-muted small">Сумма заказана. Наличные будут в отделении через 24 часа. Мы пришлем SMS.</p>
          <button class="btn btn-primary rounded-pill px-5 mt-3 fw-bold" @click="showOrderNotice = false">Понятно</button>
        </div>
      </div>
    </Transition>

    <div class="header d-flex align-items-center px-4 py-3 bg-white shadow-sm fixed-top">
      <router-link to="/my-bank" class="btn btn-light rounded-circle shadow-sm me-3 back-btn"><i class="bi bi-arrow-left"></i></router-link>
      <div class="d-flex align-items-center gap-2" @click="activeModal = 'rename'">
          <h5 class="mb-0 fw-bold">{{ dep.title }}</h5>
          <i class="bi bi-pencil-square text-primary"></i>
      </div>
    </div>

    <div class="container pt-5 mt-5 pb-5">
        <div class="deposit-hero-card p-4 rounded-5 text-white mb-4 shadow-lg position-relative overflow-hidden">
            <div class="card-bg-decor"></div>
            <div class="d-flex justify-content-between align-items-start mb-4 z-2 position-relative">
                <div>
                    <small class="opacity-75 text-uppercase fw-bold ls-1">Баланс депозита</small>
                    <div class="d-flex align-items-center gap-3 mt-1">
                        <h1 class="display-5 fw-bold mb-0">{{ dep.isAmountHidden ? '•••••• ₸' : formatMoney(dep.amount) + ' ₸' }}</h1>
                        <div class="eye-btn-dep" @click="requestToggleVisibility"><i class="bi" :class="dep.isAmountHidden ? 'bi-eye-slash-fill' : 'bi-eye-fill'"></i></div>
                    </div>
                </div>
                <div class="rate-badge-blue">{{ dep.rate }}%</div>
            </div>
        </div>

        <!-- КНОПКИ ДЕЙСТВИЯ (СИННИЕ ЗАЛИТЫЕ) -->
        <div class="row g-3 mb-4">
            <div class="col-6" v-if="dep.canWithdraw">
                <button class="action-btn-filled w-100" @click="activeModal = 'transfer'">
                    <i class="bi bi-arrow-left-right mb-2"></i><span>Перевести</span>
                </button>
            </div>
            <div :class="dep.canWithdraw ? 'col-6' : 'col-12'">
                <button class="action-btn-filled w-100" @click="activeModal = 'replenish'">
                    <i class="bi bi-plus-circle mb-2"></i><span>Пополнить</span>
                </button>
            </div>
            <div class="col-6">
                <button class="action-btn-filled w-100" @click="activeModal = 'withdraw_large'">
                    <i class="bi bi-cash-stack mb-2"></i><span>Снять > 4 млн</span>
                </button>
            </div>
            <div class="col-6">
                <button class="action-btn-filled w-100 danger-filled" @click="requestClose">
                    <i class="bi bi-x-circle mb-2"></i><span>Закрыть</span>
                </button>
            </div>
        </div>
    </div>

    <!-- ШТОРКИ -->
    <Transition name="slide-up">
        <div v-if="activeModal" class="modal-overlay" @click.self="activeModal = null">
            <div class="modal-content-custom bg-white p-4">
                <div class="modal-handle mx-auto mb-4"></div>
                <div v-if="activeModal === 'rename'">
                    <h5 class="fw-bold mb-4">Переименовать</h5>
                    <input v-model="newTitle" class="form-control mb-4 rounded-4" :placeholder="dep.title">
                    <button class="btn btn-primary w-100 rounded-pill py-3 fw-bold" @click="confirmRename">Сохранить</button>
                </div>
                <div v-if="activeModal === 'withdraw_large'">
                    <h5 class="fw-bold mb-4">Снятие большой суммы</h5>
                    <input v-model="largeAmount" type="number" class="form-control mb-4 rounded-4" placeholder="Сумма более 4 000 000">
                    <button class="btn btn-primary w-100 rounded-pill py-3 fw-bold" @click="handleLargeWithdraw">Заказать наличные</button>
                </div>
                <div v-if="activeModal === 'replenish' || activeModal === 'transfer'">
                    <h5 class="fw-bold mb-4">{{ activeModal === 'replenish' ? 'Пополнить' : 'Снять' }}</h5>
                    <input v-model="opAmount" type="number" class="form-control mb-4 rounded-4" placeholder="Сумма (₸)">
                    <button class="btn btn-primary w-100 rounded-pill py-3 fw-bold" @click="confirmOperation">Подтвердить Face ID</button>
                </div>
            </div>
        </div>
    </Transition>

    <div v-if="isVerifying" class="face-id-ios-overlay">
        <div class="face-id-scanner">
            <div class="scanner-corner top-left"></div><div class="scanner-corner top-right"></div>
            <div class="face-icon-ios"><i class="bi bi-person-bounding-box"></i></div>
            <div class="scan-line-ios-blue"></div>
        </div>
        <h5 class="mt-4 text-white fw-bold">Face ID</h5>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRoute, useRouter } from 'vue-router';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const dep = computed(() => auth.user.deposits.find(d => d.id == route.params.id));
const activeModal = ref(null);
const isVerifying = ref(false);
const opAmount = ref(null);
const newTitle = ref('');
const largeAmount = ref(null);
const showOrderNotice = ref(false);
const isHidden = ref(false);

const dialog = reactive({ visible: false, title: '', message: '', icon: '', type: '', action: null });

const formatMoney = (v) => new Intl.NumberFormat('ru-RU').format(v || 0);

const confirmRename = () => { auth.renameDeposit(dep.value.id, newTitle.value); activeModal.value = null; };

const requestToggleVisibility = () => {
    Object.assign(dialog, {
        visible: true, title: 'Скрыть баланс?', 
        message: 'Сумма не будет видна на этом экране и в меню «Мой Банк».',
        icon: 'bi-eye-slash', type: 'info',
        action: () => { auth.toggleDepVisibility(dep.value.id); dialog.visible = false; }
    });
};

const handleLargeWithdraw = () => {
    if (largeAmount.value < 4000000) return alert('Сумма должна быть более 4 млн');
    activeModal.value = null; showOrderNotice.value = true;
};

const confirmOperation = () => {
    isVerifying.value = true;
    setTimeout(() => {
        if(activeModal.value === 'replenish') auth.replenishDeposit(dep.value.id, opAmount.value);
        else auth.withdrawToCard(dep.value.id, opAmount.value);
        isVerifying.value = false; activeModal.value = null;
    }, 2000);
};

const requestClose = () => { 
    Object.assign(dialog, {
        visible: true, title: 'Закрыть счет?', message: 'Деньги вернутся на карту.', icon: 'bi-x-octagon', type: 'danger',
        action: () => { auth.closeDeposit(dep.value.id); dialog.visible = false; router.push('/my-bank'); }
    });
};
</script>

<style scoped>
.page-wrapper { min-height: 100vh; background-color: #f6f8fb; }
.action-btn-filled {
    background: linear-gradient(135deg, #004e92 0%, #000428 100%);
    border: none; border-radius: 24px; padding: 25px 15px; color: white;
    display: flex; flex-direction: column; align-items: center; gap: 8px; transition: 0.2s;
}
.action-btn-filled:active { transform: scale(0.95); }
.danger-filled { background: linear-gradient(135deg, #dc3545 0%, #721c24 100%); }
.deposit-hero-card { background: linear-gradient(135deg, #004e92 0%, #000428 100%); min-height: 180px; border: none; }
.order-icon-box { width: 90px; height: 90px; background: #004e92; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 3rem; margin: 0 auto; }
.status-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(10px); z-index: 9999; display: flex; align-items: center; justify-content: center; }
.status-card { background: white; border-radius: 40px; width: 85%; max-width: 400px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: flex-end; }
.modal-content-custom { width: 100%; border-radius: 32px 32px 0 0; }
.custom-confirm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(10px); z-index: 5000; display: flex; align-items: center; justify-content: center; padding: 25px; }
.confirm-modal { background: white; width: 320px; border-radius: 35px; padding: 30px; text-align: center; }
.confirm-icon-box { width: 65px; height: 65px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; font-size: 1.6rem; }
.confirm-icon-box.danger { background: #fee2e2; color: #dc3545; }
.confirm-icon-box.info { background: #e0f2fe; color: #0d6efd; }
.face-id-ios-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 6000; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.face-id-scanner { width: 160px; height: 160px; position: relative; display: flex; align-items: center; justify-content: center; }
.scanner-corner { position: absolute; width: 35px; height: 35px; border: 4px solid #0d6efd; border-radius: 12px; }
.top-left { top: 0; left: 0; border-right: 0; border-bottom: 0; }
.top-right { top: 0; right: 0; border-left: 0; border-bottom: 0; }
.face-icon-ios { font-size: 5rem; color: #0d6efd; }
.scan-line-ios-blue { position: absolute; width: 100%; height: 2px; background: #0d6efd; box-shadow: 0 0 15px #0d6efd; animation: scanIos 2.2s infinite ease-in-out; }
@keyframes scanIos { 0% { top: 15%; opacity: 0; } 50% { top: 85%; opacity: 1; } }
.slide-up-enter-active { transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); }
.slide-up-enter-from { transform: translateY(100%); }
</style>