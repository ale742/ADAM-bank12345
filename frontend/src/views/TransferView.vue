<template>
  <div class="app-layout" :class="{ 'dark-theme': auth.isDarkMode }">
    
    <!-- SIDEBAR ПК -->
    <aside class="desktop-sidebar d-none d-lg-flex">
      <div class="sidebar-header" @click="$router.push('/')">
        <div class="logo-circle-adam">A</div>
        <span class="brand-name-adam">ADAM BANK</span>
      </div>
      <nav class="sidebar-nav">
        <div class="sidebar-link" @click="$router.push('/')"><i class="bi bi-house-door"></i> <span>Главная</span></div>
        <div class="sidebar-link" @click="$router.push('/my-bank')"><i class="bi bi-wallet2"></i> <span>Мой банк</span></div>
        <div class="sidebar-link" @click="$router.push('/payments')"><i class="bi bi-credit-card"></i> <span>Платежи</span></div>
        <div class="sidebar-link active"><i class="bi bi-arrow-left-right"></i> <span>Переводы</span></div>
        <div class="sidebar-link" @click="$router.push('/history')"><i class="bi bi-clock-history"></i> <span>История</span></div>
        <div class="sidebar-link" @click="$router.push('/account')"><i class="bi bi-person-circle"></i> <span>Аккаунт</span></div>
      </nav>
    </aside>

    <div class="main-wrapper">
      
      <!-- 1. УНИВЕРСАЛЬНЫЕ УВЕДОМЛЕНИЯ -->
      <Transition name="scale">
        <div v-if="status.visible" class="status-overlay" @click="status.visible = false">
          <div class="status-card shadow-2xl text-center p-5" :class="status.type">
            <div class="status-icon mb-4">
              <i :class="status.icon"></i>
            </div>
            <h4 class="fw-bold mb-2 text-main">{{ status.title }}</h4>
            <p class="text-muted small">{{ status.msg }}</p>
            <button class="btn btn-primary rounded-pill px-5 mt-3 fw-bold shadow-sm">Понятно</button>
          </div>
        </div>
      </Transition>

      <!-- 2. ЦИФРОВОЙ ЧЕК -->
      <Transition name="fade">
          <div v-if="showReceipt" class="receipt-overlay" @click.self="closeReceipt">
              <div class="receipt-paper animate__animated animate__slideInUp shadow-2xl">
                  <div class="receipt-edge"></div>
                  <div class="p-4">
                      <div class="text-center mb-4">
                          <div class="logo-circle-adam mx-auto mb-2" style="width: 45px; height: 45px; font-size: 1.2rem;">A</div>
                          <h5 class="fw-bold mb-0 text-dark">ADAM BANK</h5>
                          <small class="text-muted text-uppercase ls-1">Квитанция перевода</small>
                      </div>
                      <div class="receipt-divider mb-4"></div>
                      <div class="receipt-info mb-4 text-start">
                          <div class="d-flex justify-content-between mb-2"><span class="text-muted small">Тип:</span><span class="fw-bold small text-dark">{{ selectedModeName }}</span></div>
                          <div class="d-flex justify-content-between mb-2"><span class="text-muted small">Получатель:</span><span class="fw-bold small text-dark">{{ transferForm.target }}</span></div>
                          <div class="d-flex justify-content-between mb-2"><span class="text-muted small">Дата:</span><span class="fw-bold small">{{ currentDateTime() }}</span></div>
                      </div>
                      <div class="text-center py-4 bg-light rounded-4 mb-4">
                          <h2 class="fw-bold m-0 text-dark">{{ formatMoney(transferForm.amount) }} ₸</h2>
                      </div>
                      <div class="text-center mb-4"><div class="paid-stamp">SUCCESS</div></div>
                      <button class="btn btn-primary w-100 rounded-pill py-3 fw-bold" @click="closeReceipt">Готово</button>
                  </div>
              </div>
          </div>
      </Transition>

      <!-- 3. SMS ПОДТВЕРЖДЕНИЕ (ЦЕНТРИРОВАННОЕ ОКНО) -->
      <Transition name="scale">
          <div v-if="showSMS" class="sms-overlay-fixed">
              <div class="status-card shadow-2xl p-5 text-center bg-card">
                  <div class="status-icon mb-4" style="background: #000428;">
                      <i class="bi bi-shield-lock-fill text-white"></i>
                  </div>
                  <h4 class="fw-bold mb-2 text-main">3D Secure</h4>
                  <p class="text-muted small mb-4">Введите 6-значный код подтверждения для списания на карту <b>{{ transferForm.target.slice(-4) }}</b></p>
                  <input v-model="smsCode" type="text" maxlength="6" class="form-control text-center fs-2 fw-bold mb-4 shadow-none border-0 bg-light text-main" placeholder="000000">
                  <div class="d-flex gap-2">
                      <button class="btn btn-light-custom flex-fill rounded-pill fw-bold" @click="showSMS = false">Отмена</button>
                      <button class="btn btn-primary flex-fill rounded-pill fw-bold shadow-lg" @click="verifySMS">Подтвердить</button>
                  </div>
              </div>
          </div>
      </Transition>

      <!-- Хедер -->
      <div class="header d-flex align-items-center px-4 py-3 bg-header fixed-top d-lg-none">
        <button @click="handleBack" class="btn btn-light-custom rounded-circle shadow-sm me-3 back-btn"><i class="bi bi-arrow-left"></i></button>
        <h5 class="mb-0 fw-bold text-main">{{ pageTitle }}</h5>
      </div>

      <div class="container content-area pb-5">
        
        <!-- === ЭКРАН 1: СПИСОК ТИПОВ === -->
        <div v-if="mode === 'list'" class="animate__animated animate__fadeIn">
            <h2 class="fw-bold mb-4 d-none d-lg-block text-main">Переводы</h2>
            <div class="row g-3">
                <div class="col-6 col-lg-3" v-for="m in menuOptions" :key="m.id" @click="mode = m.id">
                    <div class="transfer-type-card h-100 shadow-sm border-0">
                        <div class="icon-blob mb-3" :class="m.color"><i :class="m.icon"></i></div>
                        <h6 class="fw-bold text-main mb-1">{{ m.title }}</h6>
                        <p class="very-small text-muted mb-0">{{ m.desc }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- === ЭКРАН 2: МЕЖДУ СВОИМИ === -->
        <div v-if="mode === 'internal'" class="animate__animated animate__fadeInRight max-w-600 mx-auto">
            <div class="transfer-flow-card p-4 rounded-5 shadow-lg mb-4 text-white">
                <div class="d-flex align-items-center justify-content-between position-relative">
                    <div class="flow-side text-center" :class="{ 'moved': isReverse }">
                        <div class="flow-icon-circle"><i class="bi bi-credit-card-2-front"></i></div>
                        <div class="fw-bold mt-2">Adam Card</div>
                    </div>
                    <div class="flow-arrow" :class="{ 'rotated': isReverse }" @click="isReverse = !isReverse">
    <i class="bi bi-arrow-right-circle-fill display-5"></i>
</div>
                    <div class="flow-side text-center" :class="{ 'moved': isReverse }">
                        <div class="flow-icon-circle secondary"><i class="bi bi-piggy-bank"></i></div>
                        <div class="fw-bold mt-2 text-truncate" style="max-width: 80px;">{{ selectedDep?.title || 'Депозит' }}</div>
                    </div>
                </div>
            </div>

            <h6 class="fw-bold text-muted mb-3 ps-2 ls-1" style="font-size: 0.7rem;">ВЫБЕРИТЕ ДЕПОЗИТ ДЛЯ ОПЕРАЦИИ</h6>
            <div class="d-flex gap-2 overflow-auto no-scrollbar mb-4">
                <div v-for="d in auth.user.deposits" :key="d.id" 
                     class="dep-select-card" :class="{active: selectedDep?.id === d.id}"
                     @click="selectedDep = d">
                    <div class="fw-bold small">{{ d.title }}</div>
                    <div class="very-small opacity-75">{{ formatMoney(d.amount) }} ₸</div>
                </div>
            </div>

            <div class="bg-card p-4 rounded-5 shadow-sm mb-4">
                <label class="very-small fw-bold text-muted mb-2 ls-1">СУММА ПЕРЕВОДА</label>
                <div class="d-flex align-items-baseline gap-2 border-bottom border-primary border-opacity-25 pb-2">
                    <input v-model="transferForm.amount" type="number" class="form-control amount-input" placeholder="0">
                    <span class="fs-2 fw-bold text-primary">₸</span>
                </div>
                <small class="text-muted mt-2 d-block">Доступно: {{ formatMoney(isReverse ? selectedDep?.amount : auth.user.balance) }} ₸</small>
            </div>
            <button class="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-lg" :disabled="!isInternalValid" @click="startFaceID">Выполнить перевод</button>
        </div>

        <!-- === ЭКРАН 3: КЛИЕНТУ ADAM === -->
        <div v-if="mode === 'adam'" class="animate__animated animate__fadeInRight max-w-600 mx-auto">
            <div class="bg-card p-4 rounded-5 shadow-sm mb-4">
                <div class="tab-switcher mb-4">
                    <button class="tab-btn" :class="{active: adamSub === 'phone'}" @click="switchAdamMode('phone')">По номеру</button>
                    <button class="tab-btn" :class="{active: adamSub === 'card'}" @click="switchAdamMode('card')">По карте</button>
                </div>

                <div class="mb-4">
                    <label class="very-small fw-bold text-muted ls-1">{{ adamSub === 'phone' ? 'ТЕЛЕФОН' : 'НОМЕР КАРТЫ' }}</label>
                    <input v-model="transferForm.target" 
                           @input="adamSub === 'phone' ? maskPhone($event) : maskCard($event)" 
                           class="form-control border-0 bg-transparent fs-4 fw-bold p-0 text-main" 
                           :placeholder="adamSub === 'phone' ? '+7 (7XX) XXX XX XX' : '0000 0000 0000 0000'">
                </div>

                <div class="mb-4">
                    <label class="very-small fw-bold text-muted ls-1">СООБЩЕНИЕ</label>
                    <input v-model="transferForm.message" class="form-control border-0 bg-light rounded-4 py-3 text-main" placeholder="За что перевод?">
                </div>

                <label class="very-small fw-bold text-muted ls-1">СУММА</label>
                <div class="input-group input-group-lg border-bottom border-light">
                    <input v-model="transferForm.amount" type="number" class="form-control border-0 bg-transparent fs-1 fw-bold p-0 text-main" placeholder="0">
                    <span class="input-group-text bg-transparent border-0 text-primary fw-bold fs-2">₸</span>
                </div>
            </div>
            <button class="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-lg" :disabled="!isAdamValid" @click="startFaceID">Отправить</button>
        </div>

        <!-- === ЭКРАН 4: ДРУГОЙ БАНК === -->
        <div v-if="mode === 'other'" class="animate__animated animate__fadeInRight max-w-600 mx-auto">
            <div class="bg-card p-4 rounded-5 shadow-sm mb-4 text-center">
                <div class="mb-4 text-start">
                    <label class="very-small fw-bold text-muted ls-1">НОМЕР КАРТЫ Visa / Mastercard</label>
                    <input v-model="transferForm.target" @input="maskCard" class="form-control text-center border-0 bg-light rounded-4 py-3 fs-4 fw-bold text-main" placeholder="0000 0000 0000 0000">
                </div>
                <div class="text-start">
                    <label class="very-small fw-bold text-muted ls-1">СУММА (МИН. 100 ₸)</label>
                    <input v-model="transferForm.amount" type="number" class="form-control text-center border-0 bg-transparent fs-1 fw-bold text-main" placeholder="0">
                </div>
            </div>
            <button class="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-lg" @click="showSMS = true" :disabled="!isOtherValid" >Продолжить</button>
        </div>

        <!-- === ЭКРАН 5: МЕЖДУНАРОДНЫЕ === -->
        <div v-if="mode === 'intl'" class="animate__animated animate__fadeInRight max-w-600 mx-auto">
            <h6 class="fw-bold text-muted mb-3 ps-2 ls-1">ВЫБЕРИТЕ СТРАНУ ПОЛУЧЕНИЯ</h6>
            <div class="row g-2 mb-4">
                <div class="col-6 col-lg-3" v-for="c in countries" :key="c.code" @click="selectedIntlCountry = c">
                    <div class="country-card-modern shadow-sm" :class="{ active: selectedIntlCountry.code === c.code }">
                        <span class="fs-2 mb-1 d-block">{{ c.flag }}</span>
                        <div class="fw-bold small text-main">{{ c.name }}</div>
                    </div>
                </div>
            </div>
            <div class="bg-card p-4 rounded-5 shadow-sm mb-4">
                <div class="mb-4">
                    <label class="very-small fw-bold text-muted ls-1">ПЕРЕВОД В {{ selectedIntlCountry.code.toUpperCase() }}</label>
                    <input v-model="transferForm.target" class="form-control border-0 bg-transparent fs-4 fw-bold p-0 text-main" :placeholder="selectedIntlCountry.placeholder">
                </div>
                <label class="very-small fw-bold text-muted ls-1">СУММА (МИН. 100 ₸)</label>
                <input v-model="transferForm.amount" type="number" class="form-control border-0 fs-1 fw-bold p-0 text-main bg-transparent" placeholder="0">
            </div>
            <button class="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-lg" :disabled="!transferForm.amount || transferForm.amount < 100 || !transferForm.target" @click="startFaceID">Перевести</button>
        </div>

      </div>
    </div>

    <!-- FACE ID -->
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
              <p class="text-white-50 small">Подтверждение Adam Pay</p>
          </div>
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

const mode = ref('list'); 
const adamSub = ref('phone');
const isReverse = ref(false);
const selectedDep = ref(auth.user.deposits?.[0] || null);
const isVerifying = ref(false);
const showReceipt = ref(false);
const showSMS = ref(false);
const smsCode = ref('');
const status = reactive({ visible: false, type: 'success', title: '', msg: '', icon: '' });
const transferForm = reactive({ target: '', amount: null, message: '' });

const menuOptions = [
    { id: 'internal', title: 'Свои счета', desc: 'Между картой и вкладом', icon: 'bi-arrow-left-right', color: 'bg-primary' },
    { id: 'adam', title: 'Клиент Adam', desc: 'По номеру или QR', icon: 'bi-person-check', color: 'bg-success' },
    { id: 'other', title: 'На карту', desc: 'В любые банки мира', icon: 'bi-credit-card', color: 'bg-info' },
    { id: 'intl', title: 'За рубеж', desc: 'СНГ и Турция', icon: 'bi-globe', color: 'bg-dark' }
];

const countries = [
    { name: 'Россия', code: 'RU', flag: '🇷🇺', placeholder: 'Карта или Телефон' },
    { name: 'Турция', code: 'TR', flag: '🇹🇷', placeholder: 'IBAN (TR...)' },
    { name: 'Узбекистан', code: 'UZ', flag: '🇺🇿', placeholder: 'Номер карты UzCard' },
    { name: 'Кыргызстан', code: 'KG', flag: '🇰🇬', placeholder: 'Номер телефона' }
];
const selectedIntlCountry = ref(countries[0]);

const pageTitle = computed(() => {
    if (mode.value === 'list') return 'Переводы';
    return menuOptions.find(o => o.id === mode.value)?.title || 'Перевод';
});

const selectedModeName = computed(() => {
    if (mode.value === 'internal') return 'Свои счета';
    if (mode.value === 'adam') return 'Клиент Adam';
    return 'Внешний перевод';
});

const isInternalValid = computed(() => selectedDep.value && transferForm.amount >= 100);
const isAdamValid = computed(() => transferForm.target.length >= 8 && transferForm.amount >= 100);
const isOtherValid = computed(() => transferForm.target.replace(/\s/g, '').length === 16 && transferForm.amount >= 100);

const switchAdamMode = (m) => { adamSub.value = m; resetForm(); };

const handleBack = () => {
    if (mode.value === 'list') router.push('/');
    else { mode.value = 'list'; resetForm(); }
};

const resetForm = () => { transferForm.target = ''; transferForm.amount = null; transferForm.message = ''; };

const maskPhone = (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v[0] !== '7') v = '7' + v;
    v = v.substring(0, 11);
    let f = '+7';
    if (v.length > 1) f += ' (' + v.substring(1, 4);
    if (v.length >= 5) f += ') ' + v.substring(4, 7);
    if (v.length >= 8) f += '-' + v.substring(7, 9);
    if (v.length >= 10) f += '-' + v.substring(9, 11);
    transferForm.target = f;
};

const maskCard = (e) => {
    let v = e.target.value.replace(/\D/g, '').substring(0, 16);
    transferForm.target = v.replace(/(.{4})/g, '$1 ').trim();
};

const startFaceID = () => {
    if (auth.user.isBlocked) return triggerStatus('error', 'Блок', 'Разблокируйте карту.', 'bi-snow');
    isVerifying.value = true;
    setTimeout(() => {
        try {
            if (mode.value === 'internal') {
                if (isReverse.value) auth.withdrawToCard(selectedDep.value.id, transferForm.amount);
                else auth.replenishDeposit(selectedDep.value.id, transferForm.amount);
            } else {
                auth.executeTransfer({ title: selectedModeName.value, amount: transferForm.amount, target: transferForm.target });
            }
            isVerifying.value = false;
            showReceipt.value = true;
        } catch (e) {
            isVerifying.value = false;
            triggerStatus('error', 'Ошибка', e.message, 'bi-exclamation-circle');
        }
    }, 2500);
};

const verifySMS = () => {
    triggerStatus('error', 'Ошибка кода', 'Введен неверный код из СМС. Безопасность Adam Bank.', 'bi-x-circle');
    smsCode.value = '';
};

const triggerStatus = (type, title, msg, icon) => { Object.assign(status, { visible: true, type, title, msg, icon }); };
const closeReceipt = () => { showReceipt.value = false; mode.value = 'list'; resetForm(); };
const formatMoney = (v) => new Intl.NumberFormat('ru-RU').format(v || 0);
const currentDateTime = () => new Date().toLocaleString('ru-RU');
</script>

<style scoped>
.app-layout {
  --bg-main: #f6f8fb; --bg-card: #ffffff; --text-main: #000428; --header-bg: #ffffff; --btn-light: #f1f3f5; --border: #f1f3f5;
  display: flex; min-height: 100vh; background-color: var(--bg-main); font-family: 'Inter', sans-serif; transition: 0.3s;
}
.app-layout.dark-theme {
  --bg-main: #0b0e14; --bg-card: #1a1f26; --text-main: #ffffff; --header-bg: #1a1f26; --btn-light: #2d3748; --border: #2d3748;
}
.main-wrapper { flex-grow: 1; display: flex; flex-direction: column; }
.content-area { padding-top: 100px; max-width: 900px; margin: 0 auto; width: 100%; padding-left: 20px; padding-right: 20px; }

/* HOVER ANIMATIONS */
.transfer-type-card, .country-card-modern, .dep-select-card {
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.transfer-type-card:hover, .country-card-modern:hover, .dep-select-card:hover {
    transform: scale(1.03);
}

.transfer-type-card { background: var(--bg-card); border-radius: 30px; padding: 25px 20px; text-align: center; cursor: pointer; border: 1px solid var(--border); }
.icon-blob { width: 60px; height: 60px; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; color: white; margin: 0 auto; }
.icon-blob.bg-primary { background: linear-gradient(135deg, #004e92, #000428); }
.icon-blob.bg-success { background: linear-gradient(135deg, #11998e, #38ef7d); }
.icon-blob.bg-info { background: linear-gradient(135deg, #00c6ff, #0072ff); }
.icon-blob.bg-dark { background: linear-gradient(135deg, #232526, #414345); }

/* CUSTOM DEPOSIT SELECT */
.dep-select-card {
    min-width: 140px; padding: 15px; border-radius: 20px; background: var(--bg-card); 
    border: 2px solid transparent; cursor: pointer; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.03);
}
.dep-select-card.active { border-color: #0d6efd; background: #eef6ff !important; }
.dark-theme .dep-select-card.active { background: rgba(13, 110, 253, 0.1) !important; }

/* TRANSFER FLOW */
.transfer-flow-card { background: linear-gradient(135deg, #004e92 0%, #000428 100%); border: none; }
.flow-icon-circle { width: 65px; height: 65px; border-radius: 50%; background: rgba(255,255,255,0.15); border: 2px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 1.8rem; }
.flow-arrow {
    /* Время анимации и плавность */
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); 
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.flow-arrow.rotated {
    transform: rotate(180deg);
}

/* MODALS */
.sms-modal-overlay { 
    position: fixed; 
    inset: 0; 
    background: rgba(0,0,0,0.5); 
    backdrop-filter: blur(8px); 
    z-index: 9000 !important; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    padding: 20px; 
}

.status-overlay { 
    position: fixed; 
    inset: 0; 
    background: rgba(0,0,0,0.4); 
    backdrop-filter: blur(10px); 
    z-index: 10000 !important; 
    display: flex; 
    align-items: center;
    justify-content: center; 
    padding: 20px; 
}

.sms-overlay-fixed {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(8px);
    z-index: 9000 !important; /* Девять тысяч */
    display: flex;
    align-items: center;
    justify-content: center;
}


.status-card, .sms-card { background: var(--bg-card); border-radius: 40px; width: 85%; max-width: 380px; color: var(--text-main); }
.status-icon { width: 85px; height: 85px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.8rem; margin: 0 auto; background: #198754; color: white; }
.status-card.error .status-icon { background: #dc3545; }

.country-card-modern { background: var(--bg-card); border-radius: 20px; padding: 15px; text-align: center; border: 2px solid transparent; cursor: pointer; }
.country-card-modern.active { border-color: #0d6efd; background: #eef6ff !important; }

.amount-input { font-size: 3.5rem; font-weight: 800; border: none; background: transparent; color: var(--text-main); padding: 0; width: 100%; }
.tab-switcher { display: flex; background: var(--btn-light); border-radius: 50px; padding: 5px; }
.tab-btn { flex: 1; border: none; background: transparent; padding: 10px; border-radius: 50px; font-weight: 700; color: var(--text-muted); transition: 0.3s; }
.tab-btn.active { background: var(--bg-card); color: #004e92; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }

.desktop-sidebar { width: 280px; background: var(--bg-card); border-right: 1px solid var(--border); padding: 35px 25px; flex-direction: column; position: sticky; top: 0; height: 100vh; }
.logo-circle-adam { width: 40px; height: 40px; border-radius: 12px; background: #004e92; color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; }
.sidebar-link { display: flex; align-items: center; gap: 15px; padding: 14px 18px; border-radius: 18px; cursor: pointer; color: #718096; font-weight: 600; transition: 0.3s; }
.sidebar-link.active { background: #eef6ff; color: #004e92; }

/* FACE ID iOS STYLE */
.face-id-ios-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 6000; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.face-id-scanner { width: 180px; height: 180px; position: relative; display: flex; align-items: center; justify-content: center; }
.scanner-corner { position: absolute; width: 35px; height: 35px; border: 4px solid #0d6efd; border-radius: 12px; }
.top-left { top: 0; left: 0; border-right: 0; border-bottom: 0; }
.top-right { top: 0; right: 0; border-left: 0; border-bottom: 0; }
.bottom-left { bottom: 0; left: 0; border-right: 0; border-top: 0; }
.bottom-right { bottom: 0; right: 0; border-left: 0; border-top: 0; }
.face-icon-ios { font-size: 5.5rem; color: #0d6efd; opacity: 0.8; }
.scan-line-ios-blue { position: absolute; width: 100%; height: 2px; background: #0d6efd; box-shadow: 0 0 15px #0d6efd; animation: scanAnimIos 2s infinite ease-in-out; }
@keyframes scanAnimIos { 0% { top: 10%; opacity: 0; } 50% { top: 90%; opacity: 1; } 100% { top: 10%; opacity: 0; } }

.receipt-paper { background: white; border-radius: 0 0 30px 30px; position: relative; }
.receipt-edge { height: 12px; background: white; width: 100%; position: absolute; top: -12px; clip-path: polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%); }
.receipt-overlay {
    position: fixed; 
    top: 0; 
    left: 0; 
    right: 0; 
    bottom: 0;
    width: 100vw; 
    height: 100vh;
    background: rgba(0, 0, 0, 0.6); /* Темный фон */
    backdrop-filter: blur(10px);    /* Красивое размытие фона */
    z-index: 9500;                 /* Самый высокий приоритет */
    display: flex; 
    align-items: center;            /* Центр по вертикали */
    justify-content: center;        /* Центр по горизонтали */
    padding: 20px;
}

.no-scrollbar::-webkit-scrollbar { display: none; }
</style>