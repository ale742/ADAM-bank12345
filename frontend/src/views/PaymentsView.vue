<template>
  <div class="page-wrapper">
    
    <!-- 1. УНИВЕРСАЛЬНЫЙ ДИАЛОГ (ОШИБКИ) -->
    <Transition name="scale">
      <div v-if="status.visible" class="status-overlay" @click="status.visible = false">
        <div class="status-card shadow-lg text-center p-5" :class="status.type">
          <div class="status-icon mb-4">
            <i :class="status.type === 'success' ? 'bi bi-check-lg' : 'bi bi-exclamation-triangle'"></i>
          </div>
          <h4 class="fw-bold mb-2">{{ status.title }}</h4>
          <p class="text-muted small">{{ status.msg }}</p>
          <button class="btn btn-primary rounded-pill px-5 mt-3 fw-bold" @click="status.visible = false">Понятно</button>
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
                        <h2 class="fw-bold mb-0">ADAM<span class="text-primary">-BANK</span></h2>
                        <small class="text-muted text-uppercase ls-1">Электронный чек</small>
                    </div>
                    <div class="receipt-divider mb-4"></div>
                    <div class="receipt-info mb-4">
                        <div class="d-flex justify-content-between mb-2"><span class="text-muted small">Услуга:</span><span class="fw-bold small text-end">{{ selectedProvider }}</span></div>
                        <div v-if="payForm.target" class="d-flex justify-content-between mb-2"><span class="text-muted small">Данные:</span><span class="fw-bold small text-uppercase">{{ payForm.target }}</span></div>
                        <div class="d-flex justify-content-between mb-2"><span class="text-muted small">Дата:</span><span class="fw-bold small">{{ currentDateTime() }}</span></div>
                        <div class="d-flex justify-content-between"><span class="text-muted small">Транзакция:</span><span class="fw-bold small text-uppercase">#{{ Math.random().toString(36).substr(2, 9) }}</span></div>
                    </div>
                    <div class="text-center py-3 bg-light rounded-4 mb-4">
                        <small class="text-muted d-block text-uppercase fw-bold">Сумма платежа</small>
                        <h2 class="fw-bold m-0 text-dark">{{ formatMoney(payForm.amount) }} ₸</h2>
                    </div>
                    <div class="text-center position-relative mb-4">
                        <div class="paid-stamp animate__animated animate__bounceIn">ОПЛАЧЕНО</div>
                    </div>
                    <button class="btn btn-primary w-100 rounded-pill py-3 fw-bold" @click="closeReceipt">Готово</button>
                </div>
            </div>
        </div>
    </Transition>

    <!-- Хедер -->
    <div class="header d-flex align-items-center px-4 py-3 bg-white shadow-sm fixed-top">
      <button @click="handleBack" class="btn btn-light rounded-circle shadow-sm me-3 back-btn">
        <i class="bi bi-arrow-left text-dark"></i>
      </button>
      <h5 class="mb-0 fw-bold">{{ pageTitle }}</h5>
    </div>

    <!-- КОНТЕНТ -->
    <div class="container main-content pb-5">
      
      <!-- ЭКРАН 1: СПИСОК КАТЕГОРИЙ -->
      <div v-if="view === 'main'" class="animate__animated animate__fadeIn">
          <div class="row g-3">
              <div class="col-4" v-for="cat in categories" :key="cat.id" @click="selectCategory(cat)">
                  <div class="category-card shadow-sm">
                      <div class="icon-box" :class="cat.bg"><i :class="cat.icon"></i></div>
                      <small class="fw-bold text-center lh-sm mt-2">{{ cat.name }}</small>
                  </div>
              </div>
          </div>
      </div>

      <!-- ЭКРАН 2: ВЫБОР ПРОВАЙДЕРА -->
      <div v-if="view === 'providers'" class="animate__animated animate__fadeInRight">
          <div v-for="(list, group) in currentProviders" :key="group" class="mb-4">
              <h6 class="text-muted small fw-bold ps-2 mb-2 text-uppercase ls-1">{{ group }}</h6>
              <div class="list-group rounded-5 shadow-sm border-0 bg-white overflow-hidden">
                  <div v-for="item in list" :key="item" class="list-group-item p-4 action-row d-flex justify-content-between align-items-center" @click="openPaymentForm(item)">
                      <div class="d-flex align-items-center gap-3">
                          <div class="icon-circle-sm bg-light text-primary fw-bold">{{ item[0] }}</div>
                          <span class="fw-bold small">{{ item }}</span>
                      </div>
                      <i class="bi bi-chevron-right text-muted"></i>
                  </div>
              </div>
          </div>
      </div>

      <!-- ЭКРАН: ПЛАТНЫЕ ДОРОГИ -->
      <div v-if="view === 'toll_roads'" class="animate__animated animate__fadeInRight">
          <div class="list-group rounded-5 shadow-sm border-0 bg-white overflow-hidden">
              <div v-for="road in tollRoads" :key="road.name" class="list-group-item p-3 border-0 border-bottom action-row" @click="selectTollRoad(road)">
                  <div class="d-flex justify-content-between align-items-center">
                      <div style="max-width: 70%;">
                          <div class="fw-bold small">{{ road.name }}</div>
                          <small class="text-muted">{{ road.len }}</small>
                      </div>
                      <div class="text-end">
                          <div class="fw-bold text-primary small">{{ road.price }} ₸</div>
                          <small class="text-muted" style="font-size: 0.6rem;">Предоплата</small>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <!-- ЭКРАН 3: ФОРМА ОПЛАТЫ -->
      <div v-if="view === 'form'" class="animate__animated animate__fadeInUp">
          
          <div v-if="activeCategory.id === 'mobile'" class="operator-badge-zone mb-3 text-center">
              <Transition name="fade">
                  <div v-if="detectedOp" class="d-inline-flex align-items-center gap-2 px-4 py-2 rounded-pill shadow-sm" :class="detectedOp.class">
                      <i :class="detectedOp.icon"></i>
                      <span class="fw-bold small">{{ detectedOp.name }}</span>
                  </div>
                  <div v-else class="text-muted small opacity-50">Введите номер телефона</div>
              </Transition>
          </div>

          <div class="bg-white p-4 rounded-5 shadow-sm mb-4">
              <div class="mb-4 text-center">
                  <label class="form-label small fw-bold text-muted text-uppercase">{{ getTargetLabel }}</label>
                  
                  <input 
                    v-model="payForm.target" 
                    @input="handleTargetInput" 
                    type="text" 
                    class="form-control text-center border-0 bg-transparent fw-bold fs-3 p-0 mb-2 shadow-none text-uppercase" 
                    :placeholder="getTargetPlaceholder"
                  >
                  <div class="divider"></div>
                  <small class="text-muted" style="font-size: 0.7rem;">{{ getTargetHint }}</small>
              </div>

              <label class="form-label small fw-bold text-muted text-uppercase ls-1">СУММА К ОПЛАТЕ</label>
              <div class="input-group input-group-lg border-bottom">
                  <input v-model="payForm.amount" type="number" class="form-control border-0 bg-transparent fw-bold fs-2 p-0 shadow-none" placeholder="0">
                  <span class="input-group-text bg-transparent border-0 pe-0 fw-bold fs-3 text-primary">₸</span>
              </div>
          </div>

          <button class="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-lg mt-2" 
                  :disabled="!isFormValid || auth.user.isBlocked" 
                  @click="startPayment">
              Оплатить {{ formatMoney(payForm.amount) }} ₸
          </button>
      </div>

      <!-- ЭКРАН 4: QR СКАНЕР -->
      <div v-if="view === 'qr_scan'" class="animate__animated animate__zoomIn text-center">
          <div class="payment-target-card p-3 rounded-4 mb-4 text-white d-inline-block px-4">
              <div class="fw-bold">{{ selectedProvider }}</div>
          </div>
          <div class="qr-scanner-mock mx-auto mb-4 position-relative">
              <div class="scanner-frame"></div>
              <i class="bi bi-qr-code-scan display-1 text-primary opacity-25"></i>
              <div class="laser-line"></div>
          </div>
          <h4 class="fw-bold">Сканируйте QR</h4>
          <button class="btn btn-primary rounded-pill px-5 mt-4 fw-bold" @click="simulateQRSuccess">Имитировать скан</button>
      </div>

    </div>

    <!-- FACE ID -->
    <Transition name="fade">
      <div v-if="isVerifying" class="face-id-ios-overlay">
          <div class="face-id-scanner">
              <div class="scanner-corner top-left"></div><div class="scanner-corner top-right"></div>
              <div class="scanner-corner bottom-left"></div><div class="scanner-corner bottom-right"></div>
              <div class="face-icon-ios"><i class="bi bi-person-bounding-box"></i></div>
              <div class="scan-line-ios-blue"></div>
          </div>
          <h5 class="mt-4 text-white fw-bold">Face ID</h5>
          <p class="text-white-50 small">Подтверждение Adam Pay</p>
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

const view = ref('main'); 
const activeCategory = ref(null);
const selectedProvider = ref('');
const isVerifying = ref(false);
const showReceipt = ref(false);
const status = reactive({ visible: false, type: 'success', title: '', msg: '' });
const payForm = reactive({ target: '', amount: null });

const categories = [
    { id: 'mobile', name: 'Мобильный', icon: 'bi-phone', bg: 'bg-danger bg-opacity-10 text-danger' },
    { id: 'utilities', name: 'Коммуналка', icon: 'bi-house-door', bg: 'bg-warning bg-opacity-10 text-warning' },
    { id: 'transport', name: 'Транспорт', icon: 'bi-bus-front', bg: 'bg-success bg-opacity-10 text-success' },
    { id: 'gas', name: 'Заправки', icon: 'bi-fuel-pump', bg: 'bg-primary bg-opacity-10 text-primary' },
    { id: 'scooters', name: 'Самокаты', icon: 'bi-bicycle', bg: 'bg-info bg-opacity-10 text-info' },
    { id: 'fines', name: 'Штрафы/Налоги', icon: 'bi-exclamation-triangle', bg: 'bg-danger bg-opacity-10 text-danger' },
    { id: 'games', name: 'Игры', icon: 'bi-controller', bg: 'bg-dark bg-opacity-10 text-dark' },
];

const tollRoads = [
    { name: 'Астана — Щучинск', price: 504, len: '211 км' },
    { name: 'Астана — Темиртау', price: 352, len: '134 км' },
    { name: 'Алматы — Конаев', price: 152, len: '42 км' },
    { name: 'Алматы — Хоргос', price: 597, len: '295 км' },
    { name: 'Астана — Павлодар', price: 900, len: '375 км' },
];

const allProviders = {
    utilities: {
        'Газ': ['Алматыгазсервис', 'Тауекел-Н-Алгабас', 'Строй Сервис Холдинг', 'АРЦ АлматыГаз'],
        'Энергия': ['АЛСЕКО', 'Темиржолэнерго', 'Энергосбыт'],
        'Вода': ['Астана Су'],
        'Прочее': ['ЖКХ/КСК', 'Вывоз Мусора', 'Лифты', 'Телефон']
    },
    transport: {
        'Платные дороги': ['KazToll (Оплата по госномеру)'],
        'Город': ['Автобус (Код маршрута)', 'Троллейбус', 'Парковки (5 цифр)']
    },
    gas: { 'АЗС Казахстана': ['Qazaq Oil', 'Sinooil', 'Helios', 'Газпромнефть', 'Compass'] },
    scooters: { 'Аренда': ['Jet', 'Whoosh', 'Eleven', 'Oz'] },
    games: { 'Платформы': ['Steam Казахстан', 'PlayStation Store', 'Xbox Store', 'Genshin Impact'] },
    fines: { 'Гос. услуги': ['Штрафы ПДД (ИИН)', 'Налог на транспорт', 'Налог на имущество'] }
};

// --- ФУНКЦИЯ ОЧИСТКИ ФОРМЫ ---
const resetForm = () => {
    payForm.target = '';
    payForm.amount = null;
};

// --- МАСКИ И ВАЛИДАЦИЯ ---
const handleTargetInput = (e) => {
    let val = e.target.value;
    const cid = activeCategory.value?.id;

    if (cid === 'mobile') {
        handlePhoneMask(e);
    } 
    else if (cid === 'utilities') {
        payForm.target = val.replace(/\D/g, '').substring(0, 10);
    }
    else if (selectedProvider.value.includes('Автобус') || selectedProvider.value.includes('Троллейбус') || selectedProvider.value.includes('Парковки')) {
        payForm.target = val.replace(/\D/g, '').substring(0, 5);
    }
    else if (cid === 'fines') {
        payForm.target = val.replace(/\D/g, '').substring(0, 12);
    }
    else if (selectedProvider.value.includes('KazToll')) {
        // УНИВЕРСАЛЬНЫЙ ГОСНОМЕР (С поддержкой KZ и других стран)
        let clean = val.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        
        // Если похоже на KZ стандарт (001ADM01) - форматируем с пробелами
        if (/^\d{3}[A-Z]{2,3}\d{2}$/.test(clean)) {
           payForm.target = clean.slice(0,3) + ' ' + clean.slice(3, clean.length - 2) + ' ' + clean.slice(-2);
        } 
        // Если другой формат - просто оставляем как есть в Капсе
        else {
           payForm.target = clean.substring(0, 12);
        }
    }
    else {
        payForm.target = val;
    }
};

const getTargetHint = computed(() => {
    const cid = activeCategory.value?.id;
    if (cid === 'utilities') return 'Введите 10 цифр из договора';
    if (cid === 'fines') return 'Введите 12 цифр ИИН';
    if (selectedProvider.value.includes('Автобус') || selectedProvider.value.includes('Парковки')) return 'Введите 5-значный код объекта';
    if (selectedProvider.value.includes('KazToll')) return 'Поддерживаются номера РК и СНГ';
    return '';
});

const isFormValid = computed(() => {
    const clean = payForm.target.replace(/\s/g, '');
    const cid = activeCategory.value?.id;
    
    if (cid === 'mobile') return clean.replace(/\D/g, '').length === 11 && payForm.amount > 0;
    if (cid === 'utilities') return clean.length === 10 && payForm.amount > 0;
    if (cid === 'fines') return clean.length === 12 && payForm.amount > 0;
    if (selectedProvider.value.includes('Автобус') || selectedProvider.value.includes('Парковки')) return clean.length === 5 && payForm.amount > 0;
    
    return payForm.target.length >= 3 && payForm.amount > 0 && payForm.amount <= auth.user.balance;
});

const detectedOp = computed(() => {
    if (activeCategory.value?.id !== 'mobile') return null;
    const clean = payForm.target.replace(/\D/g, '');
    if (clean.length < 4) return null;
    const prefix = clean.substring(1, 4); 
    const map = {
        '705': { name: 'Beeline', icon: 'bi-p-circle-fill', class: 'bg-warning text-dark' },
        '771': { name: 'Beeline', icon: 'bi-p-circle-fill', class: 'bg-warning text-dark' },
        '776': { name: 'Beeline', icon: 'bi-p-circle-fill', class: 'bg-warning text-dark' },
        '777': { name: 'Beeline', icon: 'bi-p-circle-fill', class: 'bg-warning text-dark' },
        '700': { name: 'Altel/Kcell', icon: 'bi-reception-4', class: 'bg-danger text-white' },
        '701': { name: 'Kcell/Activ', icon: 'bi-vinyl-fill', class: 'bg-purple text-white' },
        '702': { name: 'Kcell/Activ', icon: 'bi-vinyl-fill', class: 'bg-purple text-white' },
        '775': { name: 'Kcell', icon: 'bi-vinyl-fill', class: 'bg-purple text-white' },
        '778': { name: 'Activ', icon: 'bi-vinyl-fill', class: 'bg-purple text-white' },
        '707': { name: 'Tele2', icon: 'bi-t-square-fill', class: 'bg-dark text-white' },
        '747': { name: 'Tele2', icon: 'bi-t-square-fill', class: 'bg-dark text-white' },
        '708': { name: 'ALTEL', icon: 'bi-reception-4', class: 'bg-danger text-white' },
        '706': { name: 'izi', icon: 'bi-lightning-fill', class: 'bg-warning bg-opacity-50 text-dark' }
    };
    return map[prefix] || null;
});

// --- СИСТЕМНЫЕ ФУНКЦИИ ---
const selectCategory = (cat) => {
    resetForm(); // СБРОС ДАННЫХ ПРИ СМЕНЕ
    activeCategory.value = cat;
    if (cat.id === 'mobile') { selectedProvider.value = 'Мобильная связь'; view.value = 'form'; }
    else { view.value = 'providers'; }
};

const openPaymentForm = (provider) => {
    resetForm(); // СБРОС ДАННЫХ ПРИ СМЕНЕ ПРОВАЙДЕРА
    selectedProvider.value = provider;
    if (provider.includes('KazToll')) view.value = 'toll_roads';
    else if (['gas', 'scooters'].includes(activeCategory.value.id)) view.value = 'qr_scan';
    else view.value = 'form';
};

const selectTollRoad = (road) => {
    selectedProvider.value = `Трасса: ${road.name}`;
    payForm.amount = road.price;
    view.value = 'form';
};

const handlePhoneMask = (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v[0] !== '7') v = '7' + v;
    v = v.substring(0, 11);
    let f = '+7';
    if (v.length > 1) f += ' (' + v.substring(1, 4);
    if (v.length >= 5) f += ') ' + v.substring(4, 7);
    if (v.length >= 8) f += '-' + v.substring(7, 9);
    if (v.length >= 10) f += '-' + v.substring(9, 11);
    payForm.target = f;
};

const startPayment = () => {
    if (auth.user.isBlocked) return triggerStatus('error', 'Карта заморожена', 'Разблокируйте карту для оплаты.');
    isVerifying.value = true;
    setTimeout(async () => {
        try {
            await auth.processPayment(payForm.amount);
            isVerifying.value = false;
            showReceipt.value = true;
        } catch (e) {
            isVerifying.value = false;
            triggerStatus('error', 'Ошибка', e.message);
        }
    }, 2500);
};

const simulateQRSuccess = () => {
    payForm.target = 'SCAN_' + Math.floor(Math.random()*10000);
    payForm.amount = activeCategory.value.id === 'gas' ? 8000 : 450;
    view.value = 'form';
};

const handleBack = () => {
    if (view.value === 'form' && activeCategory.value?.id === 'mobile') view.value = 'main';
    else if (view.value === 'form' && selectedProvider.value.includes('Трасса:')) view.value = 'toll_roads';
    else if (view.value === 'toll_roads') view.value = 'providers';
    else if (view.value === 'form' || view.value === 'providers' || view.value === 'qr_scan') view.value = 'main';
    else router.push('/');
    resetForm(); // СБРОС ПРИ ВОЗВРАТЕ
};

const pageTitle = computed(() => view.value === 'main' ? 'Платежи' : activeCategory.value?.name);
const currentProviders = computed(() => allProviders[activeCategory.value?.id] || {});
const getTargetLabel = computed(() => {
    const cid = activeCategory.value?.id;
    if (cid === 'mobile') return 'Номер телефона';
    if (selectedProvider.value.includes('KazToll')) return 'Госномер автомобиля';
    if (cid === 'utilities') return 'Лицевой счет';
    if (cid === 'fines') return 'ИИН Плательщика';
    if (cid === 'games') return 'Логин игрока / ID';
    return 'Данные плательщика';
});
const getTargetPlaceholder = computed(() => {
    if (activeCategory.value?.id === 'mobile') return '+7 (7XX) XXX XX XX';
    if (selectedProvider.value.includes('KazToll')) return 'A 000 AAA или 001 ADM 01';
    return 'Введите данные';
});
const formatMoney = (v) => new Intl.NumberFormat('ru-RU').format(v || 0);
const currentDateTime = () => new Date().toLocaleString('ru-RU');
const triggerStatus = (type, title, msg) => { Object.assign(status, { visible: true, type, title, msg }); };
const closeReceipt = () => { showReceipt.value = false; view.value = 'main'; resetForm(); };
</script>

<style scoped>
.page-wrapper { min-height: 100vh; background-color: #f6f8fb; font-family: 'Inter', sans-serif; }
.header { z-index: 1000; text-align: center; }
.back-btn { width: 40px; height: 40px; border: none; }
.main-content { padding-top: 80px; }

.category-card { background: white; border-radius: 24px; padding: 15px 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 110px; cursor: pointer; transition: 0.2s; }
.category-card:active { transform: scale(0.95); background-color: #f8f9fa; }
.icon-box { width: 45px; height: 45px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; }

.divider { height: 2px; background: #eee; width: 60%; margin: 10px auto; border-radius: 2px; }

/* RECEIPT */
.receipt-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(10px); z-index: 7000; display: flex; align-items: center; justify-content: center; padding: 20px; }
.receipt-paper { background: white; width: 100%; max-width: 350px; border-radius: 0 0 25px 25px; position: relative; }
.receipt-edge { height: 10px; background: white; width: 100%; position: absolute; top: -10px; clip-path: polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%); }
.paid-stamp { border: 4px solid #198754; color: #198754; padding: 5px 15px; border-radius: 10px; font-weight: 900; font-size: 1.5rem; transform: rotate(-10deg); display: inline-block; }

/* QR SCANNER */
.qr-scanner-mock { width: 280px; height: 280px; background: #000; border-radius: 40px; display: flex; align-items: center; justify-content: center; overflow: hidden; margin-top: 20px; }
.scanner-frame { position: absolute; inset: 40px; border: 2px solid rgba(255,255,255,0.3); border-radius: 20px; }
.laser-line { position: absolute; width: 100%; height: 2px; background: #0d6efd; box-shadow: 0 0 15px #0d6efd; top: 0; animation: scan 2s infinite linear; }
@keyframes scan { 0% { top: 0; } 100% { top: 100%; } }

.payment-target-card { background: linear-gradient(135deg, #004e92, #000428) !important; }

/* FACE ID */
.face-id-ios-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 6000; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.face-id-scanner { width: 160px; height: 160px; position: relative; display: flex; align-items: center; justify-content: center; }
.scanner-corner { position: absolute; width: 35px; height: 35px; border: 4px solid #0d6efd; border-radius: 12px; }
.top-left { top: 0; left: 0; border-right: 0; border-bottom: 0; }
.top-right { top: 0; right: 0; border-left: 0; border-bottom: 0; }
.bottom-left { bottom: 0; left: 0; border-right: 0; border-top: 0; }
.bottom-right { bottom: 0; right: 0; border-left: 0; border-top: 0; }
.face-icon-ios { font-size: 5.5rem; color: #0d6efd; opacity: 0.9; }
.scan-line-ios-blue { position: absolute; width: 90%; height: 3px; background: #0d6efd; box-shadow: 0 0 15px #0d6efd; animation: scanAnimIos 2.2s infinite ease-in-out; }
@keyframes scanAnim { 0% { top: 15%; opacity: 0; } 50% { top: 85%; opacity: 1; } 100% { top: 15%; opacity: 0; } }

.status-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); z-index: 8000; display: flex; align-items: center; justify-content: center; }
.status-card { background: white; border-radius: 40px; width: 85%; max-width: 380px; }
.status-icon { width: 85px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.8rem; margin: 0 auto; }
.status-card.success .status-icon { background: #198754; color: white; }
.status-card.error .status-icon { background: #dc3545; color: white; }
.action-row { cursor: pointer; transition: 0.2s; }
.action-row:active { background: #f1f3f5; }
.ls-1 { letter-spacing: 1px; }
.icon-circle-sm { width: 35px; height: 35px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
</style>