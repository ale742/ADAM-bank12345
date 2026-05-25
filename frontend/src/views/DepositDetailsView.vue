<template>
  <div class="page-wrapper">
    <!-- КАСТОМНЫЙ ДИАЛОГ -->
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

    <div class="header d-flex align-items-center px-4 py-3 bg-white shadow-sm fixed-top">
      <router-link to="/my-bank" class="btn btn-light rounded-circle shadow-sm me-3 back-btn"><i class="bi bi-arrow-left text-dark"></i></router-link>
      <div class="d-flex align-items-center gap-2" @click="openRename">
          <h5 class="mb-0 fw-bold">{{ currentDeposit.title }}</h5>
          <i class="bi bi-pencil-square text-primary small"></i>
      </div>
    </div>

    <div class="container pt-5 mt-5 pb-5">
        <!-- КАРТОЧКА ADAM BLUE -->
        <div class="deposit-hero-card p-4 rounded-5 text-white mb-4 shadow-lg position-relative overflow-hidden">
            <div class="card-bg-decor"></div>
            <div class="d-flex justify-content-between align-items-start mb-4 z-2 position-relative">
                <div>
                    <small class="opacity-75 text-uppercase fw-bold ls-1">Текущий баланс</small>
                    <div class="d-flex align-items-center gap-3 mt-1">
                        <h1 class="display-5 fw-bold mb-0">
                            {{ currentDeposit.isAmountHidden ? '•••••• ₸' : formatMoney(currentDeposit.amount) + ' ₸' }}
                        </h1>
                        <div class="eye-btn-dep" @click="requestToggleVisibility">
                            <i class="bi" :class="currentDeposit.isAmountHidden ? 'bi-eye-slash-fill' : 'bi-eye-fill'"></i>
                        </div>
                    </div>
                </div>
                <div class="rate-badge-blue">{{ currentDeposit.rate }}%</div>
            </div>
            <div class="z-2 position-relative small opacity-75">Тип: {{ currentDeposit.type === 'strict' ? 'Без снятия' : 'Со снятием' }}</div>
        </div>

        <!-- КНОПКИ ДЕЙСТВИЯ (ТЕПЕРЬ СИНИЕ) -->
        <div class="row g-3 mb-4">
            <div class="col-6" v-if="currentDeposit.canWithdraw">
                <button class="action-btn-filled w-100" @click="activeModal = 'transfer'">
                    <i class="bi bi-arrow-left-right mb-2"></i>
                    <span>Перевести</span>
                </button>
            </div>
            <div :class="currentDeposit.canWithdraw ? 'col-6' : 'col-12'">
                <button class="action-btn-filled w-100" @click="activeModal = 'replenish'">
                    <i class="bi bi-plus-circle mb-2"></i>
                    <span>Пополнить</span>
                </button>
            </div>
            <div class="col-6">
                <button class="action-btn-filled w-100" @click="requestLargeCash">
                    <i class="bi bi-cash-stack mb-2"></i>
                    <span>Снять > 4 млн</span>
                </button>
            </div>
            <div class="col-6">
                <button class="action-btn-filled w-100 danger-filled" @click="requestClose">
                    <i class="bi bi-x-circle mb-2"></i>
                    <span>Закрыть счет</span>
                </button>
            </div>
        </div>

        <!-- ИНФО (ЧТОБЫ НЕ БЫЛО ПУСТОТЫ) -->
        <h6 class="fw-bold text-muted mb-3 ps-2">Детали вклада</h6>
        <div class="bg-white rounded-5 p-4 shadow-sm">
            <div class="d-flex justify-content-between mb-3">
                <span class="text-muted">Дата открытия</span>
                <span class="fw-bold">14.05.2026</span>
            </div>
            <div class="d-flex justify-content-between">
                <span class="text-muted">ГЭСВ</span>
                <span class="fw-bold text-success">{{ currentDeposit.rate }}%</span>
            </div>
        </div>
    </div>

    <!-- ШТОРКИ (Пополнение/Переименование) -->
    <Transition name="slide-up">
        <div v-if="activeModal" class="modal-overlay" @click.self="activeModal = null">
            <div class="modal-content-custom bg-white p-4">
                <div class="modal-handle mx-auto mb-4"></div>
                
                <div v-if="activeModal === 'rename'">
                    <h5 class="fw-bold mb-4">Новое название</h5>
                    <input v-model="newTitle" class="form-control mb-4 rounded-4" placeholder="Напр: На отпуск">
                    <button class="btn btn-primary w-100 rounded-pill py-3 fw-bold" @click="confirmRename">Сохранить</button>
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
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();
const currentDeposit = computed(() => auth.user.deposits[0] || {});
const hasDeposit = computed(() => auth.user.deposits.length > 0);

const activeModal = ref(null);
const isVerifying = ref(false);
const opAmount = ref(null);
const newTitle = ref('');

const dialog = reactive({ visible: false, title: '', message: '', icon: '', type: '', action: null });

const formatMoney = (v) => new Intl.NumberFormat('ru-RU').format(v || 0);

const openRename = () => { newTitle.value = currentDeposit.value.title; activeModal.value = 'rename'; };
const confirmRename = () => { auth.renameDeposit(currentDeposit.value.id, newTitle.value); activeModal.value = null; };

const requestToggleVisibility = () => {
    Object.assign(dialog, {
        visible: true, title: 'Режим инкогнито', 
        message: currentDeposit.value.isAmountHidden ? 'Показать сумму депозита?' : 'Вы уверены, что хотите скрыть баланс депозита во всем приложении?',
        icon: 'bi-eye', type: 'info',
        action: () => { auth.toggleDepVisibility(currentDeposit.value.id); dialog.visible = false; }
    });
};

const confirmOperation = () => {
    isVerifying.value = true;
    setTimeout(() => {
        if(activeModal.value === 'replenish') auth.replenishDeposit(currentDeposit.value.id, opAmount.value);
        else auth.withdrawToCard(currentDeposit.value.id, opAmount.value);
        isVerifying.value = false; activeModal.value = null;
    }, 2000);
};

const requestLargeCash = () => { alert('Заявка на снятие отправлена'); };
const requestClose = () => { 
    Object.assign(dialog, {
        visible: true, title: 'Закрыть счет?', message: 'Все деньги вернутся на карту.', icon: 'bi-x-octagon', type: 'danger',
        action: () => { auth.closeDeposit(currentDeposit.value.id); dialog.visible = false; router.push('/my-bank'); }
    });
};
</script>

<style scoped>
.page-wrapper { min-height: 100vh; background-color: #f6f8fb; }

/* КНОПКИ СИННИЕ ЗАЛИТЫЕ */
.action-btn-filled {
    background: linear-gradient(135deg, #004e92 0%, #000428 100%);
    border: none; border-radius: 24px; padding: 25px 15px; color: white;
    display: flex; flex-direction: column; align-items: center; gap: 8px; transition: 0.2s;
}
.action-btn-filled:active { transform: scale(0.95); opacity: 0.9; }
.action-btn-filled i { font-size: 1.6rem; }
.danger-filled { background: linear-gradient(135deg, #dc3545 0%, #721c24 100%); }

.deposit-hero-card { background: linear-gradient(135deg, #004e92 0%, #000428 100%); min-height: 180px; border: none; }
.card-bg-decor { position: absolute; top: -50%; right: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%); transform: rotate(15deg); }
.rate-badge-blue { background: rgba(255,255,255,0.2); padding: 5px 15px; border-radius: 12px; font-weight: bold; backdrop-filter: blur(8px); }
.eye-btn-dep { cursor: pointer; font-size: 1.4rem; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: flex-end; }
.modal-content-custom { width: 100%; border-radius: 32px 32px 0 0; }
.modal-handle { width: 45px; height: 5px; background: #e9ecef; border-radius: 10px; }

.custom-confirm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(10px); z-index: 5000; display: flex; align-items: center; justify-content: center; padding: 25px; }
.confirm-modal { background: white; width: 100%; max-width: 320px; border-radius: 35px; padding: 30px; text-align: center; }
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
@keyframes scanIos { 0%, 100% { top: 15%; opacity: 0; } 50% { top: 85%; opacity: 1; } }

.slide-up-enter-active { transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); }
.slide-up-enter-from { transform: translateY(100%); }
</style>