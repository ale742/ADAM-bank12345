<template>
  <div class="page-wrapper">
    
    <!-- Хедер -->
    <div class="header d-flex align-items-center px-4 py-3 bg-white shadow-sm fixed-top">
      <button v-if="!activeCategory" @click="$router.push('/')" class="btn btn-light rounded-circle shadow-sm me-3 back-btn">
        <i class="bi bi-arrow-left"></i>
      </button>
      <button v-else @click="closeCategory" class="btn btn-light rounded-circle shadow-sm me-3 back-btn">
        <i class="bi bi-chevron-left"></i>
      </button>
      <h5 class="mb-0 fw-bold">{{ activeCategory ? activeCategory.name : 'Платежи' }}</h5>
    </div>

    <!-- ОСНОВНОЙ КОНТЕНТ -->
    <div class="container main-content pb-5">
      
      <!-- Поиск -->
      <div v-if="!activeCategory" class="search-wrapper mb-4 animate__animated animate__fadeIn">
        <div class="input-group input-group-lg shadow-sm rounded-4 overflow-hidden border-0">
          <span class="input-group-text bg-white border-0 ps-3"><i class="bi bi-search text-muted"></i></span>
          <input type="text" class="form-control border-0 ps-2" placeholder="Найти услугу или поставщика">
        </div>
      </div>

      <!-- СЕТКА КАТЕГОРИЙ (ГЛАВНАЯ) -->
      <div v-if="!activeCategory" class="row g-3 animate__animated animate__fadeIn">
          <div class="col-4" v-for="cat in mainCategories" :key="cat.id" @click="selectCategory(cat)">
              <div class="category-card shadow-sm">
                  <div class="icon-box mb-2" :class="cat.bgClass">
                      <i :class="cat.icon"></i>
                  </div>
                  <small class="fw-bold text-center lh-sm">{{ cat.name }}</small>
              </div>
          </div>
      </div>

      <!-- ДИНАМИЧЕСКИЙ ЭКРАН КАТЕГОРИИ -->
      <div v-else class="active-category-content animate__animated animate__fadeInRight">
          
          <!-- 1. МОБИЛЬНЫЙ -->
          <div v-if="activeCategory.id === 'mobile'" class="payment-form">
              <div class="bg-white p-4 rounded-5 shadow-sm mb-4">
                  <label class="form-label small fw-bold text-muted">НОМЕР ТЕЛЕФОНА</label>
                  <div class="input-group input-group-lg border-bottom mb-4">
                      <span class="input-group-text bg-transparent border-0 ps-0 text-primary fw-bold">KZ</span>
                      <input v-model="mobileForm.phone" @input="handlePhoneMask" type="tel" class="form-control border-0 bg-transparent fw-bold" placeholder="+7 (700) 000 00 00">
                  </div>

                  <label class="form-label small fw-bold text-muted">СУММА ПОПОЛНЕНИЯ</label>
                  <div class="input-group input-group-lg border-bottom">
                      <input v-model="mobileForm.amount" type="number" class="form-control border-0 bg-transparent fw-bold fs-2" placeholder="0">
                      <span class="input-group-text bg-transparent border-0 pe-0 fw-bold">₸</span>
                  </div>
              </div>
              <button class="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-lg" :disabled="!isMobileValid" @click="confirmPayment">
                  К оплате {{ mobileForm.amount || 0 }} ₸
              </button>
          </div>

          <!-- 2. КОММУНАЛКА И ТЕЛЕФОН -->
          <div v-if="activeCategory.id === 'utilities'" class="list-group rounded-5 shadow-sm border-0 bg-white">
              <div v-for="(providers, group) in utilityProviders" :key="group">
                  <div class="bg-light p-2 px-3 small fw-bold text-muted">{{ group }}</div>
                  <div v-for="item in providers" :key="item" class="list-group-item p-3 border-0 border-bottom d-flex justify-content-between align-items-center action-row" @click="openProvider(item)">
                      <span class="fw-bold small">{{ item }}</span>
                      <i class="bi bi-chevron-right text-muted"></i>
                  </div>
              </div>
          </div>

          <!-- 3. ТРАНСПОРТ -->
          <div v-if="activeCategory.id === 'transport'" class="transport-menu row g-3">
              <div class="col-12" @click="startQRScanner">
                  <div class="qr-pay-card p-4 rounded-5 text-white shadow-sm d-flex align-items-center justify-content-between">
                      <div><h5 class="fw-bold mb-1">Оплата по QR</h5><small class="opacity-75">Автобусы, троллейбусы</small></div>
                      <i class="bi bi-qr-code-scan display-4"></i>
                  </div>
              </div>
              <div class="col-6" v-for="t in transportSub" :key="t" @click="openProvider(t)">
                  <div class="bg-white p-3 rounded-4 shadow-sm text-center h-100 action-card">
                      <div class="small fw-bold">{{ t }}</div>
                  </div>
              </div>
          </div>

          <!-- 4. ШТРАФЫ И НАЛОГИ -->
          <div v-if="activeCategory.id === 'fines'" class="payment-form">
              <div class="bg-white p-4 rounded-5 shadow-sm mb-4">
                  <h6 class="fw-bold mb-3">Проверка по ИИН</h6>
                  <input v-model="iinInput" type="text" maxlength="12" class="form-control form-control-lg rounded-4 mb-3" placeholder="Введите ИИН">
                  <button class="btn btn-dark w-100 rounded-pill py-2 fw-bold" @click="checkFines">Проверить наличие</button>
              </div>
              <div class="list-group rounded-5 shadow-sm border-0 bg-white">
                  <div class="list-group-item p-3 fw-bold border-0 border-bottom" @click="openProvider('Налоги')">Оплата налогов</div>
                  <div class="list-group-item p-3 fw-bold border-0" @click="openProvider('Штрафы')">Оплата по номеру протокола</div>
              </div>
          </div>

          <!-- 5. ИНТЕРНЕТ И ТВ -->
          <div v-if="activeCategory.id === 'internet'" class="list-group rounded-5 shadow-sm border-0 bg-white">
                <div v-for="op in internetOps" :key="op" class="list-group-item p-3 border-0 border-bottom d-flex align-items-center gap-3 action-row" @click="openProvider(op)">
                    <div class="icon-circle-sm bg-light text-primary fw-bold">{{ op[0] }}</div>
                    <span class="fw-bold small">{{ op }}</span>
                </div>
          </div>

          <!-- 6. ИГРЫ -->
          <div v-if="activeCategory.id === 'games'" class="row g-3">
                <div class="col-6" v-for="game in gamesList" :key="game" @click="openProvider(game)">
                    <div class="bg-white p-4 rounded-5 shadow-sm text-center action-card">
                        <div class="fw-bold small">{{ game }}</div>
                    </div>
                </div>
          </div>

      </div>
    </div>

    <!-- ОВЕРЛЕЙ FACE ID ДЛЯ ОПЛАТЫ -->
    <div v-if="isVerifying" class="face-id-overlay">
        <div class="scanner-box">
            <div class="scanner-circle"><div class="scanner-line"></div></div>
            <h5 class="mt-4 text-white fw-bold">Подтверждение платежа</h5>
        </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const activeCategory = ref(null);
const isVerifying = ref(false);

const mainCategories = [
    { id: 'mobile', name: 'Мобильный', icon: 'bi bi-phone', bgClass: 'bg-danger bg-opacity-10 text-danger' },
    { id: 'utilities', name: 'Коммуналка', icon: 'bi bi-house-door', bgClass: 'bg-warning bg-opacity-10 text-warning' },
    { id: 'transport', name: 'Транспорт', icon: 'bi bi-bus-front', bgClass: 'bg-success bg-opacity-10 text-success' },
    { id: 'internet', name: 'Интернет и ТВ', icon: 'bi bi-router', bgClass: 'bg-primary bg-opacity-10 text-primary' },
    { id: 'fines', name: 'Штрафы/Налоги', icon: 'bi bi-exclamation-triangle', bgClass: 'bg-info bg-opacity-10 text-info' },
    { id: 'games', name: 'Игры', icon: 'bi bi-controller', bgClass: 'bg-dark bg-opacity-10 text-dark' },
    { id: 'tickets', name: 'Билеты', icon: 'bi bi-ticket-perforated', bgClass: 'bg-secondary bg-opacity-10 text-secondary' },
];

const mobileForm = reactive({ phone: '', amount: '' });
const iinInput = ref('');

const isMobileValid = computed(() => mobileForm.phone.length === 18 && mobileForm.amount > 0);

// ПОСТАВЩИКИ
const utilityProviders = {
    'Электроэнергия': ['АЛСЕКО', 'Темиржолэнерго', 'Энергосбыт', 'ТАТЭК'],
    'Газ': ['Алматыгазсервис', 'Тауекел-Н-Алгабас', 'Строй Сервис Холдинг', 'АРЦ АлматыГаз'],
    'Вода': ['Астана Су'],
    'Прочее': ['Вывоз Мусора', 'Лифты', 'Домофон и Видео', 'Охранные агентства', 'Телефон']
};

const transportSub = ['Такси', 'Парковки', 'Платные дороги', 'Заправки', 'Зарядные станции', 'Самокаты'];
const internetOps = ['Kazakhtelecom', 'Beeline Home', 'Kcell/Active', 'Tele2/Altel', 'Alma TV', 'TV Com'];
const gamesList = ['Steam', 'PlayStation', 'Xbox', 'Genshin Impact', 'Mobile Legends', 'PUBG Mobile'];

// ЛОГИКА
const selectCategory = (cat) => activeCategory.value = cat;
const closeCategory = () => activeCategory.value = null;

const handlePhoneMask = (e) => {
    let input = e.target.value.replace(/\D/g, '');
    if (!input) return mobileForm.phone = '';
    if (input[0] !== '7') input = '7' + input;
    input = input.substring(0, 11);
    let f = '+7';
    if (input.length > 1) f += ' (' + input.substring(1, 4);
    if (input.length >= 5) f += ') ' + input.substring(4, 7);
    if (input.length >= 8) f += '-' + input.substring(7, 9);
    if (input.length >= 10) f += '-' + input.substring(9, 11);
    mobileForm.phone = f;
};

const confirmPayment = () => {
    if (auth.user.isBlocked) return alert('Карта заморожена! Сначала разблокируйте её.');
    if (auth.user.balance < mobileForm.amount) return alert('Недостаточно средств');

    isVerifying.value = true;
    setTimeout(() => {
        auth.makeTransfer(mobileForm.amount, mobileForm.phone); // Используем существующую функцию перевода
        isVerifying.value = false;
        alert('🎉 Платеж успешно проведен!');
        closeCategory();
    }, 2500);
};

const checkFines = () => {
    if (iinInput.value.length < 12) return alert('Введите корректный ИИН');
    alert('По ИИН ' + iinInput.value + ' задолженностей не найдено');
};

const openProvider = (name) => alert('Открываю форму оплаты для: ' + name);

const startQRScanner = () => {
    if (auth.user.isBlocked) return alert('Карта заморожена!');
    alert('Запуск сканера QR-кода транспорта...');
};

const formatMoney = (v) => new Intl.NumberFormat('ru-RU').format(v);
</script>

<style scoped>
.page-wrapper { min-height: 100vh; background-color: #f6f8fb; font-family: 'Inter', sans-serif; }
.header { z-index: 1000; }
.back-btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: none; }

.main-content { padding-top: 90px; }

/* СЕТКА КАТЕГОРИЙ */
.category-card {
    background: white; border-radius: 24px; padding: 15px 10px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    height: 110px; cursor: pointer; transition: 0.2s;
}
.category-card:active { transform: scale(0.95); background-color: #f8f9fa; }

.icon-box {
    width: 45px; height: 45px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center; font-size: 1.4rem;
}

/* ФОРМА МОБИЛЬНОГО */
.form-control:focus { box-shadow: none; }
.otp-field { width: 50px; height: 60px; text-align: center; font-size: 1.5rem; font-weight: bold; border-radius: 12px; border: 2px solid #eee; }

/* ТРАНСПОРТ */
.qr-pay-card {
    background: linear-gradient(135deg, #004e92, #000428);
    cursor: pointer;
}
.action-card { cursor: pointer; transition: 0.2s; border: none; }
.action-card:active { transform: scale(0.95); }

/* ДИЗАЙН СПИСКОВ */
.action-row { cursor: pointer; transition: 0.2s; }
.action-row:active { background-color: #f1f3f5; }
.icon-circle-sm { width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }

/* FACE ID */
.face-id-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 3000; display: flex; align-items: center; justify-content: center; text-align: center; flex-direction: column; }
.scanner-circle { width: 220px; height: 220px; border-radius: 50%; border: 3px solid #0d6efd; position: relative; overflow: hidden; }
.scanner-line { position: absolute; width: 100%; height: 3px; background: #0d6efd; box-shadow: 0 0 20px #0d6efd; top: 0; animation: scanAnim 2.5s infinite ease-in-out; }
@keyframes scanAnim { 0%, 100% { top: 0; opacity: 0; } 20%, 80% { opacity: 1; } 100% { top: 100%; } }
</style>