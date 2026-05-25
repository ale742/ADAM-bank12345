<template>
  <div class="page-wrapper">
    
    <!-- КРУТОЕ КАСТОМНОЕ УВЕДОМЛЕНИЕ (Вместо системных алертов) -->
    <Transition name="fade">
      <div v-if="confirmDialog.visible" class="custom-confirm-overlay" @click.self="closeConfirm">
        <div class="confirm-modal animate__animated animate__zoomIn">
          <div class="confirm-icon-box" :class="confirmDialog.type">
            <i :class="confirmDialog.icon"></i>
          </div>
          <h5 class="fw-bold mb-2">{{ confirmDialog.title }}</h5>
          <p class="text-muted small mb-4">{{ confirmDialog.message }}</p>
          <div class="d-flex gap-2 w-100">
            <button v-if="confirmDialog.showCancel" class="btn btn-light flex-fill rounded-pill py-2 fw-bold" @click="closeConfirm">
                {{ confirmDialog.cancelText }}
            </button>
            <button class="btn btn-primary flex-fill rounded-pill py-2 fw-bold shadow-sm" @click="confirmDialog.action">
                {{ confirmDialog.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Хедер -->
    <div class="header d-flex align-items-center px-4 py-3 bg-white shadow-sm fixed-top">
      <router-link to="/" class="btn btn-light rounded-circle shadow-sm me-3 back-btn">
        <i class="bi bi-arrow-left text-dark"></i>
      </router-link>
      <h5 class="mb-0 fw-bold">Мой Банк</h5>
    </div>

    <!-- Контент -->
    <div class="container pt-5 mt-4 pb-5">
      
      <!-- 1. КАРТА -->
      <div class="card-container mb-4 animate__animated animate__fadeInDown">
        <div class="bank-card p-4 shadow-lg text-white position-relative overflow-hidden" 
             :class="{ 'card-frozen': auth.user?.isBlocked }">
            
            <div v-if="auth.user?.isBlocked" class="frost-layer"></div>
            
            <div v-if="auth.user?.isBlocked" class="frozen-overlay d-flex flex-column align-items-center justify-content-center">
                <div class="lock-wrapper animate__animated animate__bounceIn">
                    <div class="lock-icon-circle mb-2">
                        <i class="bi bi-snow2 fs-1 text-info animate-pulse"></i>
                    </div>
                </div>
                <h5 class="fw-bold m-0 ls-1 text-info">КАРТА ЗАМОРОЖЕНА</h5>
            </div>

            <div class="card-bg"></div>
            <div class="card-noise"></div>

            <div class="d-flex justify-content-between align-items-start position-relative z-1 mb-3">
                <span class="fw-bold fst-italic" style="letter-spacing: 1px;">ADAM BANK</span>
                <i class="bi bi-wifi fs-4 opacity-75"></i>
            </div>

            <div class="position-relative z-1 mb-4">
                <div class="card-chip"></div>
            </div>

            <div class="position-relative z-1 mb-4 d-flex align-items-center justify-content-between">
                <h4 class="font-monospace text-shadow mb-0 card-number">
                    {{ showCardNumber && !auth.user?.isBlocked ? (auth.user?.card_number || '8400 3435 3687 9207') : maskedCardNumber }}
                </h4>
                <div @click="!auth.user?.isBlocked && (showCardNumber = !showCardNumber)" 
                     class="eye-btn" 
                     :class="{'opacity-25': auth.user?.isBlocked}">
                    <i class="bi" :class="showCardNumber ? 'bi-eye-slash-fill' : 'bi-eye-fill'"></i>
                </div>
            </div>

            <div class="d-flex justify-content-between align-items-end position-relative z-1">
                <div class="z-2">
                    <small class="text-white-50 d-block" style="font-size: 0.6rem;">CARD HOLDER</small>
                    <span class="fw-bold text-uppercase" style="letter-spacing: 1px;">{{ auth.user?.name || 'АСЛАН' }}</span>
                </div>
                <!-- ДАТА С ОТСТУПОМ -->
                <div class="text-end date-area-fixed">
                    <small class="text-white-50 d-block" style="font-size: 0.6rem;">VALID THRU</small>
                    <span class="fw-bold font-monospace z-2 position-relative">{{ auth.user?.card_exp || '05/29' }}</span>
                </div>
            </div>

            <!-- ИСПРАВЛЕННЫЙ ЛОГО MASTERCARD -->
            <div class="card-logo-fixed">
                <div class="circle red"></div>
                <div class="circle orange"></div>
            </div>
        </div>
      </div>

      <!-- 2. БАЛАНС -->
      <div class="balance-card bg-white rounded-4 p-4 shadow-sm mb-4 text-center animate__animated animate__fadeInUp">
          <small class="text-muted text-uppercase fw-bold ls-1 mb-2 d-block">Доступный остаток</small>
          <h1 class="display-4 fw-bolder text-dark mb-3">
              {{ formatMoney(auth.user?.balance) }} <span class="currency-symbol">₸</span>
          </h1>
          <div class="d-flex justify-content-center gap-3">
              <button class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" :disabled="auth.user?.isBlocked"><i class="bi bi-plus-lg me-2"></i> Пополнить</button>
              <button class="btn btn-light text-dark rounded-pill px-4 fw-bold shadow-sm" :disabled="auth.user?.isBlocked" @click="showCVV = !showCVV">
                  <i class="bi me-2" :class="showCVV ? 'bi-eye-slash' : 'bi-eye'"></i>
                  {{ showCVV && !auth.user?.isBlocked ? (auth.user?.card_cvv || '968') : 'CVV' }}
              </button>
          </div>
      </div>

      <!-- 3. УПРАВЛЕНИЕ -->
      <h6 class="fw-bold text-muted mb-3 ps-2">Управление</h6>
      <div class="row g-2 mb-4">
          <div class="col-4" @click="activeModal = 'requisites'"><div class="p-3 bg-white rounded-4 shadow-sm text-center action-card h-100"><i class="bi bi-file-text fs-3 text-primary mb-2"></i><small class="fw-bold d-block">Реквизиты</small></div></div>
          <div class="col-4" @click="activeModal = 'limits'"><div class="p-3 bg-white rounded-4 shadow-sm text-center action-card h-100"><i class="bi bi-gear fs-3 text-primary mb-2"></i><small class="fw-bold d-block">Лимиты</small></div></div>
          <div class="col-4" @click="triggerConfirmBlock"><div class="p-3 bg-white rounded-4 shadow-sm text-center action-card h-100"><i class="bi fs-3 mb-2" :class="auth.user?.isBlocked ? 'bi-unlock-fill text-success' : 'bi-lock text-danger'"></i><small class="fw-bold d-block">{{ auth.user?.isBlocked ? 'Разблок.' : 'Блок' }}</small></div></div>
      </div>

      <!-- 4. ПРОДУКТЫ -->
      <h6 class="fw-bold text-muted mb-3 ps-2">Ваши продукты</h6>
      <div class="list-group rounded-4 shadow-sm border-0 mb-4 overflow-hidden bg-white">
        
        <div class="list-group-item p-3 border-0 action-row" @click="handleDepositClick">
            <div class="d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center">
                    <div class="icon-circle bg-success bg-opacity-10 text-success me-3"><i class="bi bi-piggy-bank-fill fs-5"></i></div>
                    <div>
                        <h6 class="mb-0 fw-bold">Депозиты</h6>
                        <small class="text-success fw-bold" v-if="hasDeposit">
    {{ auth.user.deposits[0].isAmountHidden ? '•••••• ₸' : formatMoney(auth.user.deposits[0].amount) + ' ₸' }}
</small>
                        <small class="text-muted" v-else>Ставка 15.5%</small>
                    </div>
                </div>
                <i class="bi bi-chevron-right text-muted"></i>
            </div>
        </div>

        <div class="list-group-item p-3 border-0 action-row" @click="handleCreditClick">
            <div class="d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center">
                    <div class="icon-circle bg-danger bg-opacity-10 text-danger me-3"><i class="bi bi-cash-coin fs-5"></i></div>
                    <div>
                        <h6 class="mb-0 fw-bold">Кредиты</h6>
                        <small class="text-danger fw-bold" v-if="hasCredit">Долг: {{ formatMoney(totalDebt) }} ₸</small>
                        <small class="text-muted" v-else>До 10 млн ₸</small>
                    </div>
                </div>
                <i class="bi bi-chevron-right text-muted"></i>
            </div>
        </div>

        <div class="list-group-item p-3 border-0 action-row" @click="handleInstallmentClick">
            <div class="d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center">
                    <div class="icon-circle bg-warning bg-opacity-10 text-warning me-3"><i class="bi bi-bag-check-fill fs-5"></i></div>
                    <div><h6 class="mb-0 fw-bold">Рассрочка</h6><small class="text-muted">Лимит 2 000 000 ₸</small></div>
                </div>
                <span class="text-primary fw-bold small">0-0-12</span>
            </div>
        </div>

      </div>
    </div>

    <!-- МОДАЛЬНЫЕ ОКНА (ШТОРКИ) -->
    <Transition name="slide-up">
        <div v-if="activeModal" class="modal-overlay" @click.self="activeModal = null">
            <div class="modal-content-custom bg-white p-4">
                <div class="modal-handle mx-auto mb-4"></div>
                
                <!-- РЕКВИЗИТЫ (ВЕРНУЛ ВСЁ) -->
                <div v-if="activeModal === 'requisites'">
                    <h5 class="fw-bold mb-4">Реквизиты счета</h5>
                    <div class="req-item border-bottom mb-3 pb-2"><small class="text-muted">Банк получатель</small><div class="fw-bold">AO ADAM-BANK</div></div>
                    <div class="req-item border-bottom mb-3 pb-2"><small class="text-muted">БИК</small><div class="fw-bold">ADAMKZKX</div></div>
                    <div class="req-item mb-3"><small class="text-muted">IBAN</small><div class="fw-bold text-break">KZ99ADAM9381687579</div></div>
                    <button class="btn btn-primary w-100 rounded-pill py-3 fw-bold mt-2" @click="activeModal = null">Понятно</button>
                </div>

                <!-- ЛИМИТЫ (ВЕРНУЛ ТУМБЛЕР И БЛОКИРОВКУ) -->
                <div v-if="activeModal === 'limits'">
                    <h5 class="fw-bold mb-4">Настройки лимитов</h5>
                    <div class="alert alert-warning py-2 small mb-4" v-if="auth.user.isBlocked">
                        <i class="bi bi-snow me-1"></i> Разблокируйте карту для изменения
                    </div>
                    <div class="mb-4" :class="{'opacity-50': auth.user.isBlocked}">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span class="fw-bold">Интернет-оплаты</span>
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" v-model="localLimits.internet" :disabled="auth.user.isBlocked">
                            </div>
                        </div>
                        <input type="range" class="form-range mb-2" min="0" max="1000000" v-model="localLimits.internet_limit" :disabled="auth.user.isBlocked">
                        <div class="text-end small fw-bold text-primary">{{ formatMoney(localLimits.internet_limit) }} ₸</div>
                    </div>
                    <button class="btn btn-primary w-100 rounded-pill py-3 fw-bold" @click="activeModal = null">Сохранить</button>
                </div>

                <div v-if="activeModal === 'credit'">
                    <h5 class="fw-bold mb-4">Денежный кредит</h5>
                    <input type="number" class="form-control mb-3 rounded-4" v-model="loanCalc.amount" placeholder="Сумма">
                    <button class="btn btn-primary w-100 rounded-pill py-3 fw-bold" @click="confirmWithFaceID('credit')">Подтвердить Face ID</button>
                </div>

                <div v-if="activeModal === 'deposit'">
                    <h5 class="fw-bold mb-4">Открыть депозит</h5>
                    <input type="number" class="form-control mb-3 rounded-4" v-model="depCalc.amount" placeholder="Сумма">
                    <button class="btn btn-primary w-100 rounded-pill py-3 fw-bold" @click="confirmWithFaceID('deposit')">Подтвердить Face ID</button>
                </div>

                <div v-if="activeModal === 'installment'">
                    <h5 class="fw-bold mb-4">Рассрочка 0-0-12</h5>
                    <div class="text-center mb-4"><div class="icon-circle bg-warning bg-opacity-10 text-warning mx-auto mb-3" style="width: 80px; height:80px;"><i class="bi bi-lightning-charge-fill fs-1"></i></div><h2 class="fw-bold">2 000 000 ₸</h2></div>
                    <button class="btn btn-warning w-100 rounded-pill py-3 fw-bold text-dark" @click="$router.push('/shop')">В магазин</button>
                </div>
            </div>
        </div>
    </Transition>

    <!-- ИСПРАВЛЕННЫЙ FACE ID (iOS STYLE, СИНИЙ) -->
    <Transition name="fade">
      <div v-if="isVerifying" class="face-id-ios-overlay">
          <div class="face-id-scanner">
              <div class="scanner-corner top-left"></div>
              <div class="scanner-corner top-right"></div>
              <div class="scanner-corner bottom-left"></div>
              <div class="scanner-corner bottom-right"></div>
              <div class="face-icon-ios"><i class="bi bi-person-bounding-box"></i></div>
              <div class="scan-line-ios-blue"></div>
          </div>
          <h5 class="mt-4 text-white fw-bold">Face ID</h5>
          <p class="text-white-50 small">Идет подтверждение...</p>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

const showCVV = ref(false);
const showCardNumber = ref(false);
const activeModal = ref(null);
const isVerifying = ref(false);

const localLimits = reactive({ internet: true, internet_limit: 275000 });
const loanCalc = reactive({ amount: 500000 });
const depCalc = reactive({ amount: 100000 });

const confirmDialog = reactive({ visible: false, title: '', message: '', icon: '', type: '', confirmText: 'Да', cancelText: 'Отмена', showCancel: true, action: null });

const openConfirm = (title, message, icon, type, confText, cancelText, showCancel, action) => {
    Object.assign(confirmDialog, { visible: true, title, message, icon, type, confirmText: confText || 'Да', cancelText: cancelText || 'Отмена', showCancel, action });
};
const closeConfirm = () => { confirmDialog.visible = false; };

const formatMoney = (v) => new Intl.NumberFormat('ru-RU').format(v || 0);

const hasDeposit = computed(() => auth.user?.deposits && auth.user.deposits.length > 0);
const hasCredit = computed(() => auth.user?.credits && auth.user.credits.length > 0);
const totalDebt = computed(() => auth.user.credits?.[0]?.amount || 0);

const maskedCardNumber = computed(() => {
    const num = auth.user?.card_number || '8400 3435 3687 9207';
    const parts = num.split(' ');
    return `${parts[0]} •••• •••• ${parts[3]}`;
});

const handleDepositClick = () => {
    if (auth.user.isBlocked) return openConfirm('Блокировка', 'Разблокируйте карту.', 'bi-snow', 'danger', 'Ок', false, closeConfirm);
    
    if (hasDeposit.value) {
        router.push('/deposits');
    } else {
        // КИДАЕМ НА НОВУЮ СТРАНИЦУ ВЫБОРА
        router.push('/open-deposit');
    }
};

const handleCreditClick = () => {
    if (auth.user.isBlocked) return openConfirm('Карта заблокирована', 'Действие недоступно.', 'bi-snow', 'danger', 'Ок', '', false, closeConfirm);
    hasCredit.value ? router.push('/loan') : activeModal.value = 'credit';
};

const handleInstallmentClick = () => {
    if (auth.user.isBlocked) return openConfirm('Карта заблокирована', 'Разблокируйте карту.', 'bi-snow', 'danger', 'Ок', '', false, closeConfirm);
    activeModal.value = 'installment';
};

const triggerConfirmBlock = () => {
    const isBlocking = !auth.user.isBlocked;
    openConfirm(
        isBlocking ? 'Заморозка' : 'Разморозка', 
        `Вы уверены, что хотите ${isBlocking ? 'заморозить' : 'разморозить'} карту?`, 
        isBlocking ? 'bi-snow' : 'bi-unlock', 
        isBlocking ? 'danger' : 'success', 
        'Да, уверен', 'Отмена', true,
        toggleBlock
    );
};

const toggleBlock = () => {
    closeConfirm();
    isVerifying.value = true;
    setTimeout(() => {
        auth.toggleBlockCard();
        isVerifying.value = false;
        if (auth.user.isBlocked) { showCardNumber.value = false; showCVV.value = false; }
    }, 2500);
};

const confirmWithFaceID = async (type) => {
    isVerifying.value = true;
    setTimeout(async () => {
        isVerifying.value = false;
        try {
            if (type === 'deposit') await auth.openDeposit(depCalc.amount);
            else if (type === 'credit') await auth.takeLoan(loanCalc.amount, 12);
            activeModal.value = null;
            openConfirm('Успешно', 'Операция выполнена!', 'bi-check-circle', 'success', 'Отлично', '', false, closeConfirm);
        } catch (e) { alert(e.message); }
    }, 2500);
};
</script>

<style scoped>
.page-wrapper { min-height: 100vh; background-color: #f6f8fb; font-family: 'Inter', sans-serif; }
.header { z-index: 1000; }
.back-btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; }

/* КАРТА */
.bank-card { border-radius: 24px; background: linear-gradient(135deg, #0f2027, #203a43, #2c5364); min-height: 220px; box-shadow: 0 15px 35px rgba(0,0,0,0.2); transition: all 0.5s ease; }
.card-noise { position: absolute; inset: 0; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E"); pointer-events: none; }
.card-bg { position: absolute; top: -50%; right: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%); transform: rotate(30deg); }
.card-chip { width: 45px; height: 35px; background: linear-gradient(135deg, #d4af37, #c5a028); border-radius: 6px; border: 1px solid rgba(0,0,0,0.1); }
.card-number { letter-spacing: 2px; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
.eye-btn { cursor: pointer; font-size: 1.3rem; opacity: 0.8; }

/* MASTERCARD LOGO С ОТСТУПОМ */
.card-logo-fixed { bottom: 20px; right: 20px; display: flex; position: absolute; z-index: 1; }
.circle { width: 34px; height: 34px; border-radius: 50%; opacity: 0.9; }
.circle.red { background-color: #eb001b; margin-right: -15px; z-index: 2; }
.circle.orange { background-color: #f79e1b; z-index: 1; }
.date-area-fixed { padding-right: 55px; }

/* ЗАМОРОЗКА */
.card-frozen { filter: grayscale(0.5) brightness(0.8); }
.frost-layer { position: absolute; inset: 0; background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(12px) saturate(1.2); z-index: 5; pointer-events: none; }
.frozen-overlay { position: absolute; inset: 0; background: radial-gradient(circle at center, rgba(0, 210, 255, 0.15) 0%, transparent 80%); z-index: 10; color: white; }
.lock-icon-circle { width: 70px; height: 70px; border-radius: 50%; border: 2px solid #0dcaf0; display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.1); box-shadow: 0 0 25px rgba(13, 202, 240, 0.4); }

/* ИНТЕРФЕЙС */
.icon-circle { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
.action-row { cursor: pointer; transition: 0.2s; border-bottom: 1px solid #f8f9fa !important; }
.action-row:active { background-color: #f1f3f5; }
.action-card { cursor: pointer; transition: 0.2s; }
.action-card:active { transform: scale(0.96); }

/* ШТОРКИ */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: flex-end; }
.modal-content-custom { width: 100%; border-radius: 32px 32px 0 0; max-height: 90vh; overflow-y: auto; }
.modal-handle { width: 45px; height: 5px; background: #e9ecef; border-radius: 10px; }

/* КАСТОМНОЕ УВЕДОМЛЕНИЕ */
.custom-confirm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(10px); z-index: 5000; display: flex; align-items: center; justify-content: center; padding: 20px; }
.confirm-modal { background: white; width: 100%; max-width: 320px; border-radius: 32px; padding: 30px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.2); }
.confirm-icon-box { width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; font-size: 1.5rem; }
.confirm-icon-box.danger { background: #fee2e2; color: #dc3545; }
.confirm-icon-box.success { background: #dcfce7; color: #198754; }

/* FACE ID iOS STYLE (СИНИЙ) */
.face-id-ios-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 6000; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.face-id-scanner { width: 160px; height: 160px; position: relative; display: flex; align-items: center; justify-content: center; }
.scanner-corner { position: absolute; width: 30px; height: 30px; border: 4px solid #0d6efd; border-radius: 10px; }
.top-left { top: 0; left: 0; border-right: 0; border-bottom: 0; }
.top-right { top: 0; right: 0; border-left: 0; border-bottom: 0; }
.bottom-left { bottom: 0; left: 0; border-right: 0; border-top: 0; }
.bottom-right { bottom: 0; right: 0; border-left: 0; border-top: 0; }
.face-icon-ios { font-size: 5rem; color: #0d6efd; opacity: 0.8; }
.scan-line-ios-blue { position: absolute; width: 100%; height: 2px; background: #0d6efd; box-shadow: 0 0 15px #0d6efd; animation: scanAnimIos 2s infinite ease-in-out; }

@keyframes scanAnimIos { 0% { top: 10%; opacity: 0; } 50% { top: 90%; opacity: 1; } 100% { top: 10%; opacity: 0; } }

.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1), opacity 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); opacity: 0; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>