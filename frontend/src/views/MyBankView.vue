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
      
      <!-- 1. КАРТА -->
      <div class="card-container mb-4 animate__animated animate__fadeInDown">
        <div class="bank-card p-4 shadow-lg text-white position-relative overflow-hidden" 
             :class="{ 'card-frozen': auth.user?.isBlocked }">
            
            <!-- Оверлей блокировки -->
            <div v-if="auth.user?.isBlocked" class="frozen-overlay d-flex flex-column align-items-center justify-content-center">
                <div class="lock-icon-circle mb-2">
                    <i class="bi bi-lock-fill fs-1"></i>
                </div>
                <h5 class="fw-bold m-0">ЗАБЛОКИРОВАНА</h5>
            </div>

            <div class="card-bg"></div>
            <div class="card-noise"></div>

            <div class="d-flex justify-content-between align-items-start position-relative z-1 mb-3">
                <span class="fw-bold fst-italic" style="letter-spacing: 1px;">ADAM BANK</span>
                <i class="bi bi-wifi fs-4 opacity-75"></i>
            </div>

            <div class="position-relative z-1 mb-4">
                <div class="card-chip">
                    <div class="chip-line"></div>
                    <div class="chip-line"></div>
                    <div class="chip-line"></div>
                </div>
            </div>

            <!-- 🔥 НОМЕР КАРТЫ (ИСПРАВЛЕНО) -->
            <div class="position-relative z-1 mb-4 d-flex align-items-center justify-content-between">
                <h4 class="font-monospace text-shadow mb-0 card-number">
                    {{ showCardNumber ? (auth.user?.card_number || '8400 1234 5678 9012') : maskedCardNumber }}
                </h4>
                <!-- Глазик работает только если карта не заблочена -->
                <div @click="!auth.user?.isBlocked && (showCardNumber = !showCardNumber)" class="eye-btn">
                    <i class="bi" :class="showCardNumber ? 'bi-eye-slash-fill' : 'bi-eye-fill'"></i>
                </div>
            </div>

            <div class="d-flex justify-content-between align-items-end position-relative z-1">
                <div>
                    <small class="text-white-50 d-block" style="font-size: 0.6rem;">CARD HOLDER</small>
                    <span class="fw-bold text-uppercase" style="letter-spacing: 1px;">{{ auth.user?.name || 'NAME SURNAME' }}</span>
                </div>
                <div class="text-end">
                    <small class="text-white-50 d-block" style="font-size: 0.6rem;">VALID THRU</small>
                    <span class="fw-bold font-monospace">{{ auth.user?.card_exp || '12/28' }}</span>
                </div>
            </div>

            <div class="card-logo position-absolute">
                <div class="circle red"></div>
                <div class="circle orange"></div>
            </div>
        </div>
      </div>

      <!-- 2. БАЛАНС -->
      <div class="balance-card bg-white rounded-4 p-4 shadow-sm mb-4 text-center position-relative overflow-hidden animate__animated animate__fadeInUp">
          <div class="position-relative z-1">
              <small class="text-muted text-uppercase fw-bold ls-1 mb-2 d-block">Доступный остаток</small>
              <h1 class="display-4 fw-bolder text-dark mb-3 money-text">
                  {{ formatMoney(auth.user?.balance) }} <span class="currency-symbol">₸</span>
              </h1>
              
              <div class="d-flex justify-content-center gap-3">
                  <button class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center">
                      <i class="bi bi-plus-lg me-2"></i> Пополнить
                  </button>
                  <!-- 🔥 КНОПКА CVV (ИСПРАВЛЕНО) -->
                  <button class="btn btn-light text-dark rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center" @click="showCVV = !showCVV">
                      <i class="bi me-2" :class="showCVV ? 'bi-eye-slash' : 'bi-eye'"></i>
                      <!-- Если нажато: показываем card_cvv. Если его нет — показываем 000. Если не нажато — текст CVV -->
                      {{ showCVV ? (auth.user?.card_cvv || '000') : 'CVV' }}
                  </button>
              </div>
          </div>
          <i class="bi bi-wallet2 position-absolute text-light" style="font-size: 8rem; top: -20px; right: -20px; opacity: 0.3;"></i>
      </div>

      <!-- 3. КНОПКИ УПРАВЛЕНИЯ -->
      <h6 class="fw-bold text-muted mb-3 ps-2">Управление</h6>
      <div class="row g-2 mb-4">
          <!-- Реквизиты -->
          <div class="col-4" @click="showRequisites = true">
              <div class="p-3 bg-white rounded-4 shadow-sm text-center action-card h-100 d-flex flex-column justify-content-center cursor-pointer">
                  <i class="bi bi-file-text fs-3 text-primary mb-2"></i>
                  <small class="fw-bold text-dark">Реквизиты</small>
              </div>
          </div>
          <!-- Лимиты -->
          <div class="col-4" @click="showLimits = true">
              <div class="p-3 bg-white rounded-4 shadow-sm text-center action-card h-100 d-flex flex-column justify-content-center cursor-pointer">
                  <i class="bi bi-gear fs-3 text-primary mb-2"></i>
                  <small class="fw-bold text-dark">Лимиты</small>
              </div>
          </div>
          <!-- БЛОК -->
          <div class="col-4">
              <div class="p-3 bg-white rounded-4 shadow-sm text-center action-card h-100 d-flex flex-column justify-content-center cursor-pointer" @click="toggleBlock">
                  <i class="bi fs-3 mb-2" :class="auth.user?.isBlocked ? 'bi-unlock-fill text-success' : 'bi-lock fs-3 text-danger'"></i>
                  <small class="fw-bold text-dark">{{ auth.user?.isBlocked ? 'Разблок.' : 'Блок' }}</small>
              </div>
          </div>
      </div>

      <!-- 4. ПРОДУКТЫ -->
      <h6 class="fw-bold text-muted mb-3 ps-2">Ваши продукты</h6>
      <div class="list-group rounded-4 shadow-sm border-0 mb-4 overflow-hidden bg-white">
        <div class="list-group-item p-3 border-0 d-flex align-items-center justify-content-between action-row">
            <div class="d-flex align-items-center">
                <div class="icon-circle bg-success bg-opacity-10 text-success me-3"><i class="bi bi-piggy-bank-fill fs-5"></i></div>
                <div><h6 class="mb-0 fw-bold">Депозиты</h6><small class="text-muted">Ставка 15.5%</small></div>
            </div>
            <span class="text-primary fw-bold small">Открыть</span>
        </div>
        <div class="list-group-item p-3 border-0 d-flex align-items-center justify-content-between action-row">
            <div class="d-flex align-items-center">
                <div class="icon-circle bg-danger bg-opacity-10 text-danger me-3"><i class="bi bi-cash-coin fs-5"></i></div>
                <div><h6 class="mb-0 fw-bold">Кредиты</h6><small class="text-muted">До 10 млн ₸</small></div>
            </div>
            <i class="bi bi-chevron-right text-muted"></i>
        </div>
      </div>

    </div>

    <!-- 🔥 МОДАЛКА РЕКВИЗИТОВ (БЕЗ ИИН) -->
    <Transition name="slide-fade">
        <div v-if="showRequisites" class="modal-overlay" @click.self="showRequisites = false">
            <div class="modal-content bg-white rounded-top-4 p-4">
                <div class="modal-handle mx-auto mb-4 bg-secondary bg-opacity-25 rounded-pill"></div>
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h5 class="fw-bold m-0">Реквизиты счета</h5>
                    <div class="btn btn-light rounded-circle btn-sm" @click="showRequisites = false"><i class="bi bi-x-lg"></i></div>
                </div>
                <div class="requisites-list">
                    <div class="mb-3 border-bottom pb-2"><small class="text-muted d-block mb-1">Банк получатель</small><div class="fw-bold fs-5">АО ADAM-BANK</div></div>
                    <div class="mb-3 border-bottom pb-2"><small class="text-muted d-block mb-1">БИК</small><div class="fw-bold fs-5">ADAMKZKX</div></div>
                    <div class="mb-3 border-bottom pb-2">
                        <small class="text-muted d-block mb-1">IBAN</small>
                        <div class="d-flex align-items-center justify-content-between">
                            <div class="fw-bold text-break me-2">{{ auth.user?.iban || 'KZ99ADAM...' }}</div>
                            <i class="bi bi-copy text-primary fs-4 cursor-pointer" @click="copyToClipboard(auth.user?.iban)"></i>
                        </div>
                    </div>
                    <!-- ИИН УБРАЛИ -->
                    <div class="mb-3"><small class="text-muted d-block mb-1">Клиент</small><div class="fw-bold fs-5">{{ auth.user?.name }}</div></div>
                </div>
                <button class="btn btn-primary w-100 rounded-pill py-3 fw-bold mt-2" @click="copyAll">Копировать реквизиты</button>
            </div>
        </div>
    </Transition>

    <!-- МОДАЛКА ЛИМИТОВ -->
    <Transition name="slide-fade">
        <div v-if="showLimits" class="modal-overlay" @click.self="showLimits = false">
            <div class="modal-content bg-white rounded-top-4 p-4">
                <div class="modal-handle mx-auto mb-4 bg-secondary bg-opacity-25 rounded-pill"></div>
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h5 class="fw-bold m-0">Настройки лимитов</h5>
                    <div class="btn btn-light rounded-circle btn-sm" @click="showLimits = false"><i class="bi bi-x-lg"></i></div>
                </div>

                <div class="limit-block mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div class="d-flex align-items-center gap-2">
                            <div class="icon-small bg-primary bg-opacity-10 text-primary rounded-circle"><i class="bi bi-globe"></i></div>
                            <span class="fw-bold">Интернет-покупки</span>
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" v-model="localLimits.internet" style="width: 3em; height: 1.5em;">
                        </div>
                    </div>
                    <div v-if="localLimits.internet" class="animate__animated animate__fadeIn">
                        <div class="d-flex justify-content-between mb-1"><small class="text-muted">Лимит в месяц</small><span class="fw-bold">{{ formatMoney(localLimits.internet_limit) }} ₸</span></div>
                        <input type="range" class="form-range custom-range" min="0" max="500000" step="5000" v-model="localLimits.internet_limit">
                    </div>
                </div>

                <div class="limit-block mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div class="d-flex align-items-center gap-2">
                            <div class="icon-small bg-success bg-opacity-10 text-success rounded-circle"><i class="bi bi-cash-stack"></i></div>
                            <span class="fw-bold">Снятие наличных</span>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between mb-1"><small class="text-muted">Лимит в месяц</small><span class="fw-bold">{{ formatMoney(localLimits.cash_limit) }} ₸</span></div>
                    <input type="range" class="form-range custom-range" min="0" max="1000000" step="10000" v-model="localLimits.cash_limit">
                </div>

                <div class="limit-block mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div class="d-flex align-items-center gap-2">
                            <div class="icon-small bg-warning bg-opacity-10 text-warning rounded-circle"><i class="bi bi-arrow-left-right"></i></div>
                            <span class="fw-bold">Переводы</span>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between mb-1"><small class="text-muted">Лимит в месяц</small><span class="fw-bold">{{ formatMoney(localLimits.transfer_limit) }} ₸</span></div>
                    <input type="range" class="form-range custom-range" min="0" max="2000000" step="10000" v-model="localLimits.transfer_limit">
                </div>

                <button class="btn btn-primary w-100 rounded-pill py-3 fw-bold mt-2" @click="saveLimits" :disabled="isSaving">
                    <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
                    {{ isSaving ? 'Сохранение...' : 'Сохранить изменения' }}
                </button>
            </div>
        </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const showCVV = ref(false);
const showCardNumber = ref(false);
const showRequisites = ref(false);
const showLimits = ref(false);
const isSaving = ref(false); // Для кнопки лимитов

const localLimits = reactive({ internet: true, internet_limit: 0, cash_limit: 0, transfer_limit: 0 });

watch(showLimits, (val) => {
    if (val && auth.user?.limits) {
        localLimits.internet = auth.user.limits.internet;
        localLimits.internet_limit = auth.user.limits.internet_limit;
        localLimits.cash_limit = auth.user.limits.cash_limit;
        localLimits.transfer_limit = auth.user.limits.transfer_limit;
    }
});

const saveLimits = async () => {
    isSaving.value = true;
    try {
        await auth.updateLimits({ ...localLimits });
        showLimits.value = false;
        alert('✅ Лимиты успешно изменены!');
    } catch (e) {
        alert('Ошибка сохранения');
    } finally {
        isSaving.value = false;
    }
};

// Блокировка карты
const toggleBlock = async () => {
    const action = auth.user?.isBlocked ? 'Разблокировать' : 'Заблокировать';
    if(confirm(`Вы уверены, что хотите ${action} карту?`)) {
        await auth.toggleBlockCard();
    }
};

const formatMoney = (value) => {
    if (!value) return 0;
    return new Intl.NumberFormat('ru-RU').format(value);
};

const maskedCardNumber = computed(() => {
    const num = auth.user?.card_number;
    if (!num) return '8400 •••• •••• ••••';
    const parts = num.split(' ');
    // Проверка, что parts не пустой и имеет длину
    if (parts && parts.length === 4) {
        return `${parts[0]} •••• •••• ${parts[3]}`; 
    }
    return '8400 •••• •••• ••••';
});

const copyToClipboard = (text) => {
    if(text) { navigator.clipboard.writeText(text); alert('Скопировано!'); }
};

const copyAll = () => {
    const text = `Банк: АО ADAM-BANK\nБИК: ADAMKZKX\nIBAN: ${auth.user?.iban}\nФИО: ${auth.user?.name}`;
    navigator.clipboard.writeText(text);
    alert('Все реквизиты скопированы!');
    showRequisites.value = false;
};
</script>

<style scoped>
.page-wrapper { min-height: 100vh; background-color: #f6f8fb; font-family: 'Inter', sans-serif; }
.header { z-index: 1000; }
.back-btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; }
.card-container { perspective: 1000px; }
.bank-card { border-radius: 20px; background: linear-gradient(135deg, #0f2027, #203a43, #2c5364); min-height: 220px; box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
.card-noise { position: absolute; top:0; left:0; width:100%; height:100%; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E"); pointer-events: none; }
.card-bg { position: absolute; top: -50%; right: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 60%); transform: rotate(30deg); }
.card-chip { width: 45px; height: 35px; background: linear-gradient(135deg, #d4af37 0%, #c5a028 100%); border-radius: 6px; position: relative; overflow: hidden; border: 1px solid rgba(0,0,0,0.2); }
.chip-line { position: absolute; border: 1px solid rgba(0,0,0,0.3); border-radius: 4px; }
.chip-line:nth-child(1) { width: 100%; height: 1px; top: 33%; }
.chip-line:nth-child(2) { width: 100%; height: 1px; top: 66%; }
.chip-line:nth-child(3) { width: 1px; height: 50%; top: 25%; left: 50%; }
.card-number { letter-spacing: 2px; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
.eye-btn { cursor: pointer; opacity: 0.7; transition: opacity 0.2s; font-size: 1.2rem; }
.eye-btn:hover { opacity: 1; }
.text-shadow { text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
.card-logo { bottom: 20px; right: 20px; display: flex; opacity: 0.9; }
.circle { width: 30px; height: 30px; border-radius: 50%; }
.circle.red { background-color: #eb001b; margin-right: -15px; z-index: 1; }
.circle.orange { background-color: #f79e1b; z-index: 0; }
.money-text { letter-spacing: -1px; }
.currency-symbol { color: #004e92; font-weight: normal; }
.icon-circle { width: 45px; height: 45px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.action-row { transition: background-color 0.2s; cursor: pointer; }
.action-row:active { background-color: #f8f9fa; }
.action-card { cursor: pointer; transition: transform 0.2s; }
.action-card:active { transform: scale(0.95); }
.ls-1 { letter-spacing: 1px; }

/* Стиль блокировки */
.card-frozen { filter: grayscale(100%); transition: all 0.3s ease; }
.frozen-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); z-index: 10; backdrop-filter: blur(2px); color: white; }
.lock-icon-circle { width: 60px; height: 60px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; }

/* Шторка */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: flex-end; justify-content: center; }
.modal-content { width: 100%; max-width: 500px; max-height: 85vh; overflow-y: auto; box-shadow: 0 -10px 40px rgba(0,0,0,0.3); position: relative; border-radius: 20px 20px 0 0; }
@media (min-width: 576px) { .modal-overlay { align-items: center; } .modal-content { border-radius: 20px; max-height: 90vh; } }
.modal-handle { width: 50px; height: 5px; background-color: #dee2e6; margin: 0 auto 20px auto; border-radius: 10px; }
.slide-fade-enter-active, .slide-fade-leave-active { transition: opacity 0.3s ease; }
.slide-fade-enter-from, .slide-fade-leave-to { opacity: 0; }
.slide-fade-enter-active .modal-content { transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); }
.slide-fade-leave-active .modal-content { transition: transform 0.2s ease-in; }
.slide-fade-enter-from .modal-content, .slide-fade-leave-to .modal-content { transform: translateY(100%); }
@media (min-width: 576px) { .slide-fade-enter-from .modal-content, .slide-fade-leave-to .modal-content { transform: scale(0.95); opacity: 0; } }
.cursor-pointer { cursor: pointer; }
.icon-small { width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; }
.custom-range::-webkit-slider-thumb { background: #004e92; }
.form-check-input:checked { background-color: #004e92; border-color: #004e92; }
</style>