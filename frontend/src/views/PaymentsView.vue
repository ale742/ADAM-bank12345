<template>
  <div class="app-layout" :class="{ 'dark-theme': auth.isDarkMode }">
    
    <!-- 1. SIDEBAR ДЛЯ ПК (КАК В ИСТОРИИ) -->
    <aside class="desktop-sidebar d-none d-lg-flex">
      <div class="sidebar-header" @click="$router.push('/')">
        <div class="logo-circle-adam">A</div>
        <span class="brand-name-adam">ADAM BANK</span>
      </div>

      <nav class="sidebar-nav">
        <div class="sidebar-link" @click="$router.push('/')">
          <i class="bi bi-house-door"></i> <span>Главная</span>
        </div>
        <div class="sidebar-link" @click="$router.push('/my-bank')">
          <i class="bi bi-wallet2"></i> <span>Мой банк</span>
        </div>
        <div class="sidebar-link active">
          <i class="bi bi-credit-card"></i> <span>Платежи</span>
        </div>
        <div class="sidebar-link" @click="$router.push('/history')">
          <i class="bi bi-clock-history"></i> <span>История</span>
        </div>
        <div class="sidebar-link" @click="$router.push('/account')">
          <i class="bi bi-person-circle"></i> <span>Аккаунт</span>
        </div>
      </nav>

      <div class="mt-auto user-pill-desktop" v-if="auth.user">
          <div class="avatar-mini-circle" :style="auth.user.avatar ? `background-image: url(${auth.user.avatar})` : ''">
            <span v-if="!auth.user.avatar">{{ auth.user.name[0] }}</span>
          </div>
          <div class="ms-2 fw-bold small text-truncate text-main">{{ auth.user.name }}</div>
      </div>
    </aside>

    <div class="main-wrapper">
      
      <!-- 2. УНИВЕРСАЛЬНЫЙ ДИАЛОГ (ОШИБКИ) -->
      <Transition name="scale">
        <div v-if="status.visible" class="status-overlay" @click="status.visible = false">
          <div class="status-card shadow-lg text-center p-5" :class="status.type">
            <div class="status-icon mb-4">
              <i :class="status.type === 'success' ? 'bi bi-check-lg' : 'bi bi-exclamation-triangle'"></i>
            </div>
            <h4 class="fw-bold mb-2 text-main">{{ status.title }}</h4>
            <p class="text-muted small">{{ status.msg }}</p>
            <button class="btn btn-primary rounded-pill px-5 mt-3 fw-bold" @click="status.visible = false">Понятно</button>
          </div>
        </div>
      </Transition>

      <!-- 3. ЦИФРОВОЙ ЧЕК -->
      <Transition name="fade">
          <div v-if="showReceipt" class="receipt-overlay" @click.self="closeReceipt">
              <div class="receipt-paper animate__animated animate__slideInUp shadow-2xl">
                  <div class="receipt-edge"></div>
                  <div class="p-4">
                      <div class="text-center mb-4">
                          <h2 class="fw-bold mb-0 text-dark">ADAM<span class="text-primary">-BANK</span></h2>
                          <small class="text-muted text-uppercase ls-1">Электронный чек</small>
                      </div>
                      <div class="receipt-divider mb-4"></div>
                      <div class="receipt-info mb-4">
                          <div class="d-flex justify-content-between mb-2"><span class="text-muted small">Услуга:</span><span class="fw-bold small text-end text-dark">{{ selectedProvider }}</span></div>
                          <div v-if="payForm.target" class="d-flex justify-content-between mb-2"><span class="text-muted small">Данные:</span><span class="fw-bold small text-uppercase text-dark">{{ payForm.target }}</span></div>
                          <div class="d-flex justify-content-between mb-2"><span class="text-muted small">Дата:</span><span class="fw-bold small text-dark">{{ currentDateTime() }}</span></div>
                          <div class="d-flex justify-content-between"><span class="text-muted small">Транзакция:</span><span class="fw-bold small text-uppercase text-dark">#{{ Math.random().toString(36).substr(2, 9) }}</span></div>
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

      <!-- Хедер (Мобильный) -->
      <div class="header d-flex align-items-center px-4 py-3 bg-header shadow-sm fixed-top d-lg-none">
        <button @click="handleBack" class="btn btn-light-custom rounded-circle shadow-sm me-3 back-btn">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h5 class="mb-0 fw-bold text-main">{{ pageTitle }}</h5>
      </div>

      <!-- КОНТЕНТ -->
      <div class="container content-area pb-5">
        
        <!-- ЭКРАН 1: СПИСОК КАТЕГОРИЙ -->
        <div v-if="view === 'main'" class="animate__animated animate__fadeIn">
            <h2 class="fw-bold mb-4 d-none d-lg-block text-main">Платежи</h2>
            <div class="row g-3 row-cols-2 row-cols-lg-4">
                <div class="col" v-for="cat in categories" :key="cat.id" @click="selectCategory(cat)">
                    <div class="category-card shadow-sm">
                        <div class="icon-box" :class="cat.bg"><i :class="cat.icon"></i></div>
                        <small class="fw-bold text-center mt-2">{{ cat.name }}</small>
                    </div>
                </div>
            </div>
        </div>

        <!-- ЭКРАН 2: ВЫБОР ПРОВАЙДЕРА -->
        <div v-if="view === 'providers' && activeCategory" class="animate__animated animate__fadeInRight">
            <h5 class="fw-bold text-main mb-4">{{ activeCategory.name }}</h5>
            <div v-for="(list, group) in currentProviders" :key="group" class="mb-4">
                <h6 class="text-muted small fw-bold ps-2 mb-2 text-uppercase ls-1">{{ group }}</h6>
                <div class="list-group rounded-5 shadow-sm border-0 bg-card overflow-hidden">
                    <div v-for="item in list" :key="item" class="list-group-item p-4 action-row d-flex justify-content-between align-items-center bg-transparent border-0 border-bottom" @click="openPaymentForm(item)">
                        <div class="d-flex align-items-center gap-3">
                            <div class="icon-circle-sm bg-light text-primary fw-bold">{{ item[0] }}</div>
                            <span class="fw-bold small text-main">{{ item }}</span>
                        </div>
                        <i class="bi bi-chevron-right text-muted"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- ЭКРАН: ТРАССЫ (ДЛЯ ДОРОГ) -->
        <div v-if="view === 'toll_roads'" class="animate__animated animate__fadeInRight">
            <h5 class="fw-bold text-main mb-4">Платные дороги РК (2026)</h5>
            <div class="list-group rounded-5 shadow-sm border-0 bg-card overflow-hidden">
                <div v-for="road in tollRoads" :key="road.name" class="list-group-item p-3 border-0 border-bottom action-row bg-transparent" @click="selectTollRoad(road)">
                    <div class="d-flex justify-content-between align-items-center">
                        <div style="max-width: 70%;">
                            <div class="fw-bold small text-main">{{ road.name }}</div>
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
        <div v-if="view === 'form' && activeCategory" class="animate__animated animate__fadeInUp max-w-600 mx-auto">
            
            <!-- ВЫБОР СТРАНЫ (Только для дорог) -->
            <div v-if="selectedProvider.includes('KazToll') || selectedProvider.includes('Трасса')" class="country-selector mb-4 d-flex gap-2 no-scrollbar">
                <div v-for="c in roadCountries" :key="c.code" 
                     class="country-tab px-4 py-2 rounded-pill shadow-sm d-flex align-items-center gap-2"
                     :class="selectedCountry && selectedCountry.code === c.code ? 'active-country' : 'bg-card'"
                     @click="setCountry(c)">
                    <span class="fs-5">{{ c.flag }}</span>
                    <span class="small fw-bold text-main">{{ c.code }}</span>
                </div>
            </div>

            <!-- ОПРЕДЕЛЕНИЕ ОПЕРАТОРА -->
            <div v-if="activeCategory.id === 'mobile'" class="operator-badge-zone mb-3 text-center">
                <Transition name="fade">
                    <div v-if="detectedOp" class="d-inline-flex align-items-center gap-2 px-4 py-2 rounded-pill shadow-sm" :class="detectedOp.class">
                        <i :class="detectedOp.icon"></i>
                        <span class="fw-bold small">{{ detectedOp.name }}</span>
                    </div>
                    <div v-else class="text-muted small opacity-50">Определение оператора...</div>
                </Transition>
            </div>

            <div class="bg-card p-4 rounded-5 shadow-sm mb-4 border-1">
                <div class="mb-4 text-center">
                    <label class="form-label small fw-bold text-muted text-uppercase">{{ getTargetLabel }}</label>
                    
                    <input 
                      v-model="payForm.target" 
                      @input="handleTargetInput" 
                      type="text" 
                      class="form-control text-center border-0 bg-transparent fw-bold fs-3 p-0 mb-2 shadow-none text-uppercase text-main" 
                      :placeholder="getTargetPlaceholder"
                    >
                    <div class="divider"></div>
                    
                    <small class="text-muted" style="font-size: 0.7rem;">{{ getTargetHint }}</small>
                </div>

                <label class="form-label small fw-bold text-muted text-uppercase ls-1">СУММА К ОПЛАТЕ</label>
                <div class="input-group input-group-lg border-bottom border-light">
                    <input v-model="payForm.amount" type="number" class="form-control border-0 bg-transparent fw-bold fs-2 p-0 shadow-none text-main" placeholder="0">
                    <span class="input-group-text bg-transparent border-0 pe-0 fw-bold fs-3 text-primary">₸</span>
                </div>
                <div class="mt-3 d-flex justify-content-between align-items-center">
                  <small class="text-muted">Баланс: {{ formatMoney(auth.user?.balance) }} ₸</small>
                  <div v-if="Number(payForm.amount) > Number(auth.user?.balance)" class="badge bg-danger rounded-pill">Мало денег</div>
              </div>
            </div>

            <button class="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-lg mt-2 btn-pay" 
                    :disabled="!isFormValid || auth.user?.isBlocked" 
                    @click="startPayment">
                Оплатить {{ formatMoney(payForm.amount) }} ₸
            </button>
        </div>

        <!-- ЭКРАН 4: QR СКАНЕР -->
        <div v-if="view === 'qr_scan'" class="animate__animated animate__zoomIn text-center pt-5">
            <div class="payment-target-card p-3 rounded-4 mb-4 text-white d-inline-block px-4 shadow-sm">
                <div class="fw-bold">{{ selectedProvider }}</div>
            </div>
            <div class="qr-scanner-mock mx-auto mb-4 position-relative">
                <div class="scanner-frame"></div>
                <i class="bi bi-qr-code-scan display-1 text-primary opacity-25"></i>
                <div class="laser-line"></div>
            </div>
            <h4 class="fw-bold text-main">Сканируйте QR</h4>
            <p class="text-muted small">Наведите камеру на код {{ selectedProvider }}</p>
            <button class="btn btn-primary rounded-pill px-5 mt-4 fw-bold" @click="simulateQRSuccess">Имитировать скан</button>
        </div>

      </div>
    </div>

    <!-- FACE ID (ЦЕНТРИРОВАННЫЙ) -->
    <Transition name="fade">
      <div v-if="isVerifying" class="face-id-ios-overlay">
          <div class="face-id-container">
              <div class="face-id-scanner shadow-2xl">
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

const view = ref('main'); 
const activeCategory = ref(null);
const selectedProvider = ref('');
const isVerifying = ref(false);
const showReceipt = ref(false);
const status = reactive({ visible: false, type: 'success', title: '', msg: '' });
const payForm = reactive({ target: '', amount: null });

// ДАННЫЕ СТРАН ДЛЯ ДОРОГ
const roadCountries = [
    { name: 'Казахстан', code: 'KZ', flag: '🇰🇿', placeholder: '12ABC123A', regex: /^\d{2}[A-Z]{2,3}\d{3}[A-Z]{1,3}$/ },
    { name: 'Другая страна', code: '🌍', flag: '🌍', placeholder: 'A000AAA', regex: /^[A-Z0-9]{3,12}$/ }
];
const selectedCountry = ref(roadCountries[0]);

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
    { name: 'Шымкент — Кызылорда', price: 1080, len: '454 км' },
    { name: 'Астана — Павлодар', price: 900, len: '375 км' },
];

const allProviders = {
    utilities: { 'Газ': ['Алматыгазсервис', 'Тауекел-Н-Алгабас'], 'Энергия': ['АЛСЕКО', 'Темиржолэнерго'], 'Вода': ['Астана Су'] },
    transport: { 'Платные дороги': ['KazToll (По госномеру)'], 'Город': ['Автобус (Код маршрута)', 'Троллейбус', 'Парковки'] },
    gas: { 'АЗС КЗ': ['Qazaq Oil', 'Sinooil', 'Helios', 'Газпромнефть'] },
    scooters: { 'Аренда': ['Jet', 'Whoosh', 'Eleven'] },
    games: { 'Платформы': ['Steam Казахстан', 'PlayStation Store', 'Genshin Impact'] },
    fines: { 'Гос. услуги': ['Штрафы ПДД (ИИН)', 'Налог на транспорт'] }
};

// --- ЛОГИКА ---

const resetForm = () => {
    payForm.target = '';
    payForm.amount = null;
    selectedCountry.value = roadCountries[0];
};

const setCountry = (c) => {
    selectedCountry.value = c;
    payForm.target = '';
};

const handleTargetInput = (e) => {
    let val = e.target.value;
    if (!activeCategory.value) return;
    const cid = activeCategory.value.id;
    const provider = selectedProvider.value || '';

    if (cid === 'mobile') handlePhoneMask(e);
    else if (cid === 'utilities') payForm.target = val.replace(/\D/g, '').substring(0, 10);
    else if (provider.includes('Автобус') || provider.includes('Троллейбус') || provider.includes('Парковки')) payForm.target = val.replace(/\D/g, '').substring(0, 5);
    else if (cid === 'fines') payForm.target = val.replace(/\D/g, '').substring(0, 12);
    else if (selectedProvider.value.includes('KazToll') || selectedProvider.value.includes('Трасса')) {
        let clean = val.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        payForm.target = clean.substring(0, 12);
    } else {
        payForm.target = val;
    }
};

const getTargetHint = computed(() => {
    if (!activeCategory.value) return '';
    const provider = selectedProvider.value || '';
    if (activeCategory.value.id === 'utilities') return '10 цифр договора';
    if (activeCategory.value.id === 'fines') return '12 цифр ИИН';
    if (provider.includes('KazToll') || provider.includes('Трасса')) return `Пример: ${selectedCountry.value?.placeholder}`;
    if (provider.includes('Автобус') || provider.includes('Парковки')) return 'Код 5 цифр';
    return '';
});

const getTargetPlaceholder = computed(() => {
    if (!activeCategory.value) return 'Введите данные';
    const provider = selectedProvider.value || '';
    if (activeCategory.value.id === 'mobile') return '+7 (7XX) XXX XX XX';
    if (provider.includes('KazToll') || provider.includes('Трасса')) return selectedCountry.value?.placeholder || '';
    if (activeCategory.value.id === 'games') return 'Логин игрока';
    if (activeCategory.value.id === 'utilities') return '10 цифр счета';
    return 'Введите данные';
});

const getTargetLabel = computed(() => {
    if (!activeCategory.value) return 'Данные';
    const provider = selectedProvider.value || '';
    if (activeCategory.value.id === 'mobile') return 'Номер абонента';
    if (provider.includes('KazToll') || provider.includes('Трасса')) return 'Госномер автомобиля';
    if (activeCategory.value.id === 'utilities') return 'Лицевой счет';
    if (activeCategory.value.id === 'fines') return 'ИИН Плательщика';
    if (activeCategory.value.id === 'games') return 'Логин игрока / ID';
    return 'Данные плательщика';
});

const isFormValid = computed(() => {
    if (!activeCategory.value) return false;
    const clean = payForm.target ? payForm.target.replace(/\s/g, '') : '';
    const amt = Number(payForm.amount);
    const balance = Number(auth.user?.balance || 0);
    const cid = activeCategory.value.id;
    const provider = selectedProvider.value || '';

    if (cid === 'mobile') return clean.replace(/\D/g, '').length === 11 && amt > 0 && amt <= balance;
    if (cid === 'utilities') return clean.length === 10 && amt > 0 && amt <= balance;
    if (provider.includes('Автобус') || provider.includes('Парковки')) return clean.length === 5 && amt > 0 && amt <= balance;
    
    if (provider.includes('KazToll') || provider.includes('Трасса')) {
        const regex = selectedCountry.value?.regex || /^[A-Z0-9]{3,12}$/;
        return regex.test(clean) && amt > 0 && amt <= balance;
    }
    return clean.length >= 3 && amt > 0 && amt <= balance;
});

const detectedOp = computed(() => {
    if (activeCategory.value?.id !== 'mobile' || !payForm.target) return null;
    const clean = payForm.target.replace(/\D/g, '');
    if (clean.length < 4) return null;
    const prefix = clean.substring(1, 4); 
    const map = {
        '705': { name: 'Beeline', icon: 'bi-p-circle-fill', class: 'bg-warning text-dark' },
        '771': { name: 'Beeline', icon: 'bi-p-circle-fill', class: 'bg-warning text-dark' },
        '776': { name: 'Beeline', icon: 'bi-p-circle-fill', class: 'bg-warning text-dark' },
        '777': { name: 'Beeline', icon: 'bi-p-circle-fill', class: 'bg-warning text-dark' },
        '701': { name: 'Kcell / Activ', icon: 'bi-vinyl-fill', class: 'bg-purple text-white' },
        '702': { name: 'Kcell / Activ', icon: 'bi-vinyl-fill', class: 'bg-purple text-white' },
        '775': { name: 'Kcell', icon: 'bi-vinyl-fill', class: 'bg-purple text-white' },
        '707': { name: 'Tele2', icon: 'bi-t-square-fill', class: 'bg-dark text-white' },
        '747': { name: 'Tele2', icon: 'bi-t-square-fill', class: 'bg-dark text-white' },
        '700': { name: 'ALTEL', icon: 'bi-reception-4', class: 'bg-danger text-white' },
        '708': { name: 'ALTEL', icon: 'bi-reception-4', class: 'bg-danger text-white' },
        '706': { name: 'izi mobile', icon: 'bi-lightning-fill', class: 'bg-warning bg-opacity-25 text-dark' }
    };
    return map[prefix] || null;
});

const selectCategory = (cat) => { resetForm(); activeCategory.value = cat; view.value = (cat.id === 'mobile') ? 'form' : 'providers'; if (cat.id === 'mobile') selectedProvider.value = 'Мобильная связь'; };
const openPaymentForm = (provider) => { resetForm(); selectedProvider.value = provider; if (provider.includes('KazToll')) view.value = 'toll_roads'; else if (['gas', 'scooters', 'QR'].some(x => provider.includes(x) || activeCategory.value.id === 'gas')) view.value = 'qr_scan'; else view.value = 'form'; };
const selectTollRoad = (road) => { selectedProvider.value = `Трасса: ${road.name}`; payForm.amount = road.price; view.value = 'form'; };
const handlePhoneMask = (e) => { let v = e.target.value.replace(/\D/g, ''); if (v[0] !== '7') v = '7' + v; v = v.substring(0, 11); let f = '+7'; if (v.length > 1) f += ' (' + v.substring(1, 4); if (v.length >= 5) f += ') ' + v.substring(4, 7); if (v.length >= 8) f += '-' + v.substring(7, 9); if (v.length >= 10) f += '-' + v.substring(9, 11); payForm.target = f; };

const startPayment = () => {
    if (auth.user?.isBlocked) return triggerStatus('error', 'Блок', 'Разблокируйте карту.');
    isVerifying.value = true;
    setTimeout(async () => {
        try {
            await auth.processPayment({
                amount: payForm.amount,
                title: selectedProvider.value,
                category: activeCategory.value.id,
                target: payForm.target
            });
            isVerifying.value = false;
            showReceipt.value = true;
        } catch (e) {
            isVerifying.value = false;
            triggerStatus('error', 'Ошибка', e.message);
        }
    }, 2000);
};

const simulateQRSuccess = () => { payForm.target = 'SCAN_' + Math.floor(Math.random()*1000); payForm.amount = activeCategory.value.id === 'gas' ? 5000 : 500; view.value = 'form'; };
const handleBack = () => { if (view.value === 'form' && activeCategory.value?.id === 'mobile') view.value = 'main'; else if (view.value === 'form' && selectedProvider.value.includes('Трасса:')) view.value = 'toll_roads'; else if (view.value === 'toll_roads') view.value = 'providers'; else if (view.value === 'form' || view.value === 'providers' || view.value === 'qr_scan') view.value = 'main'; else router.push('/'); resetForm(); };
const formatMoney = (v) => new Intl.NumberFormat('ru-RU').format(v || 0);
const currentDateTime = () => new Date().toLocaleString('ru-RU');
const triggerStatus = (type, title, msg) => { Object.assign(status, { visible: true, type, title, msg }); };
const closeReceipt = () => { showReceipt.value = false; view.value = 'main'; resetForm(); };
</script>

<style scoped>
/* ПЕРЕМЕННЫЕ И БАЗОВЫЙ LAYOUT */
.app-layout {
  --bg-main: #f6f8fb;
  --bg-card: #ffffff;
  --text-main: #000428;
  --header-bg: #ffffff;
  --btn-light: #f1f3f5;
  --border: #f1f3f5;
  --bg-input: #f1f3f5;
  
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-main);
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  transition: all 0.3s ease;
}

/* ТЕМНАЯ ТЕМА */
.app-layout.dark-theme {
  --bg-main: #0b0e14;
  --bg-card: #1a1f26;
  --text-main: #ffffff;
  --header-bg: #1a1f26;
  --btn-light: #2d3748;
  --border: #2d3748;
  --bg-input: #2d3748;
}

.main-wrapper { 
    flex-grow: 1; 
    display: flex; 
    flex-direction: column; 
    height: 100vh; 
    overflow-y: auto;
}

/* SIDEBAR ПК */
.desktop-sidebar { 
    width: 260px; 
    background: var(--bg-card); 
    border-right: 1px solid var(--border); 
    padding: 30px 20px; 
    flex-direction: column; 
    position: sticky; 
    top: 0; 
    height: 100vh;
    flex-shrink: 0;
}

.logo-circle-adam { 
    width: 42px; height: 42px; border-radius: 12px; 
    background: #004e92; color: white; 
    display: flex; align-items: center; justify-content: center; 
    font-weight: 800; font-size: 1.3rem;
}

.brand-name-adam { font-weight: 800; font-size: 1.2rem; color: var(--text-main); margin-left: 12px; }

.sidebar-link { 
    display: flex; align-items: center; gap: 12px; padding: 12px 15px; 
    border-radius: 15px; cursor: pointer; color: #718096; font-weight: 600; 
    transition: 0.2s ease; margin-bottom: 4px; 
}

.sidebar-link i { font-size: 1.2rem; }
.sidebar-link.active { background: rgba(0, 78, 146, 0.1); color: #004e92; }
.dark-theme .sidebar-link.active { background: rgba(13, 110, 253, 0.15); color: #0d6efd; }
.sidebar-link:hover:not(.active) { background: var(--btn-light); }

/* КОНТЕНТНАЯ ОБЛАСТЬ */
.content-area { 
    padding: 100px 20px 30px;
    margin: 0 auto;
    width: 100%;
}

@media (min-width: 992px) {
    .content-area { 
        max-width: 1100px; 
        padding-top: 40px;
    }
}

/* КАРТОЧКИ КАТЕГОРИЙ */
.category-card { 
    background-color: var(--bg-card) !important; 
    border-radius: 30px; padding: 25px; 
    display: flex; flex-direction: column; 
    align-items: center; justify-content: center; 
    height: 150px; cursor: pointer; 
    transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
    border: 1px solid var(--border) !important;
}

.category-card:hover { transform: translateY(-8px); box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important; }
.category-card small { color: var(--text-main) !important; font-weight: 700; font-size: 0.85rem; }

.icon-box { 
    width: 52px; height: 52px; border-radius: 16px; 
    display: flex; align-items: center; justify-content: center; 
    font-size: 1.5rem; 
}

/* ТЕКСТ */
.text-main, h2, h5, h6, span, small, label {
    color: var(--text-main) !important;
}
.text-muted { color: var(--text-muted) !important; }
.divider { height: 2px; background: var(--border); width: 60%; margin: 15px auto; }

/* MODALS (Z-INDEX 10000) */
.receipt-overlay, .status-overlay { 
    position: fixed; inset: 0; background: rgba(0,0,0,0.5); 
    backdrop-filter: blur(12px); z-index: 10000; 
    display: flex; align-items: center; justify-content: center; padding: 20px; 
}

.receipt-paper, .status-card { 
    background-color: var(--bg-card); 
    border-radius: 35px; width: 100%; max-width: 380px; 
    color: var(--text-main); border: 1px solid var(--border);
}

/* ЧЕК - ВСЕГДА СВЕТЛЫЙ ДЛЯ РЕАЛИЗМА */
.receipt-paper { background: #ffffff !important; color: #000 !important; }
.receipt-paper h2, .receipt-paper h5, .receipt-paper span, .receipt-paper b { color: #000 !important; }
.receipt-edge { height: 12px; background: #ffffff; width: 100%; position: absolute; top: -12px; clip-path: polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%); }
.paid-stamp { border: 4px solid #198754; color: #198754; padding: 5px 15px; border-radius: 12px; font-weight: 900; font-size: 1.5rem; transform: rotate(-10deg); display: inline-block; opacity: 0.8; }

/* FACE ID */
.face-id-ios-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 9000; display: flex; align-items: center; justify-content: center; text-align: center; }
.face-id-scanner { width: 180px; height: 180px; position: relative; display: flex; align-items: center; justify-content: center; }
.scanner-corner { position: absolute; width: 35px; height: 35px; border: 4px solid #0d6efd; border-radius: 12px; }
.face-icon-ios { font-size: 6rem; color: #0d6efd; opacity: 0.8; }
.scan-line-ios-blue { position: absolute; width: 100%; height: 2px; background: #0d6efd; box-shadow: 0 0 15px #0d6efd; animation: scanAnimIos 2s infinite ease-in-out; }
@keyframes scanAnimIos { 0% { top: 10%; opacity: 0; } 50% { top: 90%; opacity: 1; } 100% { top: 10%; opacity: 0; } }

/* ИНПУТЫ */
input.form-control {
    background-color: var(--bg-input) !important;
    color: var(--text-main) !important;
    border: 1px solid var(--border) !important;
    border-radius: 16px;
    padding: 15px;
}

/* MISC */
.bg-header { background-color: var(--header-bg) !important; border-bottom: 1px solid var(--border); }
.btn-light-custom { background-color: var(--btn-light); border: none; color: var(--text-main); }
.bottom-nav { border-radius: 20px 20px 0 0; background-color: var(--header-bg) !important; border-top: 1px solid var(--border); }
.nav-item { color: #a0aec0; cursor: pointer; transition: 0.2s; }
.nav-item.active { color: #004e92; }

.user-pill-desktop { display: flex; align-items: center; padding: 18px; background: var(--btn-light); border-radius: 22px; }
.avatar-mini-circle { width: 34px; height: 34px; border-radius: 50%; background: #004e92; color: white; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; font-weight: bold; }
.country-tab { cursor: pointer; border: 2px solid transparent; transition: 0.3s; }
.active-country { border-color: #0d6efd; background: rgba(13, 110, 253, 0.1) !important; }

.no-scrollbar::-webkit-scrollbar { display: none; }
.max-w-600 { max-width: 600px; }
.very-small { font-size: 0.7rem; }
.ls-1 { letter-spacing: 1px; }
</style>