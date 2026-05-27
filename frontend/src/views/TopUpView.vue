<template>
  <div class="page-wrapper">
    
    <!-- 1. УНИВЕРСАЛЬНЫЕ УВЕДОМЛЕНИЯ (УСПЕХ / ОШИБКА / КОПИРОВАНИЕ) -->
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

    <!-- 2. ВЫБОР НАВИГАТОРА (FIXED BOTTOM SHEET) -->
    <Transition name="slide-up">
      <div v-if="showMapChoice" class="map-choice-overlay" @click.self="showMapChoice = false">
          <div class="map-choice-sheet bg-white p-4 animate__animated animate__slideInUp">
              <div class="modal-handle mx-auto mb-4"></div>
              <h5 class="fw-bold mb-4 text-center">Выберите навигатор</h5>
              
              <div class="list-group rounded-4 border-0 mb-4">
                  <div class="list-group-item p-3 action-row d-flex align-items-center gap-3" @click="openInMap('2gis')">
                      <div class="map-app-icon bg-success bg-opacity-10 text-success"><i class="bi bi-geo-alt"></i></div>
                      <span class="fw-bold">2ГИС</span>
                      <i class="bi bi-chevron-right ms-auto text-muted"></i>
                  </div>
                  <div class="list-group-item p-3 action-row d-flex align-items-center gap-3" @click="openInMap('yandex')">
                      <div class="map-app-icon bg-danger bg-opacity-10 text-danger"><i class="bi bi-map"></i></div>
                      <span class="fw-bold">Яндекс Карты</span>
                      <i class="bi bi-chevron-right ms-auto text-muted"></i>
                  </div>
                  <div class="list-group-item p-3 action-row d-flex align-items-center gap-3 border-0" @click="openInMap('google')">
                      <div class="map-app-icon bg-primary bg-opacity-10 text-primary"><i class="bi bi-google"></i></div>
                      <span class="fw-bold">Google Maps</span>
                      <i class="bi bi-chevron-right ms-auto text-muted"></i>
                  </div>
              </div>
              <button class="btn btn-light w-100 rounded-pill py-3 fw-bold" @click="showMapChoice = false">Отмена</button>
          </div>
      </div>
    </Transition>

    <!-- 3. SMS ПОДТВЕРЖДЕНИЕ -->
    <Transition name="fade">
        <div v-if="showSMSModal" class="sms-secure-overlay">
            <div class="sms-card animate__animated animate__fadeInUp">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div class="bank-label"><i class="bi bi-shield-lock-fill me-2"></i>EXTERNAL SECURE</div>
                    <button class="btn-close" @click="showSMSModal = false"></button>
                </div>
                <p class="small text-muted mb-3">Подтвердите перевод на сумму <b>{{ formatMoney(topUpAmount) }} ₸</b></p>
                <div class="mb-4 text-center">
                    <label class="form-label very-small fw-bold d-block text-muted">КОД ИЗ СМС</label>
                    <input v-model="smsCode" type="text" maxlength="6" class="form-control text-center fs-3 fw-bold letter-spacing-10" placeholder="000000">
                    <small class="text-danger mt-2 d-block" style="font-size: 0.65rem;">Код будет неверным (Security check)</small>
                </div>
                <button class="btn btn-dark w-100 py-3 rounded-4 fw-bold" @click="verifyAndComplete">Подтвердить перевод</button>
            </div>
        </div>
    </Transition>

    <!-- Хедер -->
    <div class="header d-flex align-items-center px-4 py-3 bg-white shadow-sm fixed-top">
      <button @click="goBack" class="btn btn-light rounded-circle shadow-sm me-3 back-btn">
        <i class="bi bi-arrow-left text-dark"></i>
      </button>
      <h5 class="mb-0 fw-bold">{{ pageTitle }}</h5>
    </div>

    <!-- КОНТЕНТ -->
    <div class="container main-content pb-5">
      
      <!-- МЕНЮ ВЫБОРА -->
      <div v-if="mode === 'list'" class="animate__animated animate__fadeIn">
          <div class="list-group rounded-5 shadow-sm border-0 bg-white overflow-hidden">
              <div class="list-group-item p-4 action-row d-flex align-items-center gap-3" @click="mode = 'cash'">
                  <div class="icon-box-blue"><i class="bi bi-geo-alt"></i></div>
                  <div><h6 class="mb-0 fw-bold">Наличными</h6><small class="text-muted">Терминалы и банкоматы</small></div>
                  <i class="bi bi-chevron-right ms-auto text-muted"></i>
              </div>
              <div class="list-group-item p-4 action-row d-flex align-items-center gap-3" @click="mode = 'other_bank'">
                  <div class="icon-box-blue"><i class="bi bi-credit-card"></i></div>
                  <div><h6 class="mb-0 fw-bold">С карты другого банка</h6><small class="text-muted">Visa, Mastercard</small></div>
                  <i class="bi bi-chevron-right ms-auto text-muted"></i>
              </div>
              <div class="list-group-item p-4 action-row d-flex align-items-center gap-3" @click="mode = 'my_acc'">
                  <div class="icon-box-blue"><i class="bi bi-wallet2"></i></div>
                  <div><h6 class="mb-0 fw-bold">С моего счета</h6><small class="text-muted">Перевод с депозита</small></div>
                  <i class="bi bi-chevron-right ms-auto text-muted"></i>
              </div>
              <div class="list-group-item p-4 action-row d-flex align-items-center gap-3" @click="mode = 'req'">
                  <div class="icon-box-blue"><i class="bi bi-file-earmark-text"></i></div>
                  <div><h6 class="mb-0 fw-bold">По реквизитам</h6><small class="text-muted">Данные карты и счета</small></div>
                  <i class="bi bi-chevron-right ms-auto text-muted"></i>
              </div>
          </div>
      </div>

      <!-- СПИСОК АДРЕСОВ (НАЛИЧНЫЕ) -->
      <div v-if="mode === 'cash'" class="animate__animated animate__fadeIn">
          <h6 class="fw-bold text-muted mb-3 ps-2">Точки в Астане</h6>
          <div class="row g-3">
              <div class="col-12" v-for="atm in atmList" :key="atm.id">
                  <div class="bg-white p-4 rounded-5 shadow-sm border border-light">
                      <div class="d-flex justify-content-between align-items-start mb-3">
                          <div>
                              <div class="badge bg-primary bg-opacity-10 text-primary mb-2">ATM #{{ atm.id }}</div>
                              <h6 class="fw-bold mb-1">{{ atm.address }}</h6>
                              <p class="very-small text-muted mb-0"><i class="bi bi-clock me-1"></i> {{ atm.time }}</p>
                          </div>
                          <div class="text-end">
                              <small class="text-success fw-bold d-block">● Работает</small>
                              <small class="text-muted">{{ atm.dist }}</small>
                          </div>
                      </div>
                      <div class="d-flex gap-2 border-top pt-3 mt-2 align-items-center">
                          <div class="flex-grow-1 small text-muted d-flex align-items-center gap-2">
                              <i class="bi bi-check2-circle text-success"></i> Прием наличных
                          </div>
                          <button class="btn btn-primary btn-sm rounded-pill px-4 fw-bold shadow-sm" @click="requestRoute(atm)">
                              Маршрут
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <!-- С КАРТЫ ДРУГОГО БАНКА -->
      <div v-if="mode === 'other_bank'" class="animate__animated animate__fadeInRight">
          <div class="bg-white p-4 rounded-5 shadow-sm mb-4">
              <div class="mb-4">
                  <label class="form-label very-small fw-bold text-muted">НОМЕР КАРТЫ</label>
                  <input v-model="externalCard.number" @input="maskCardNumber" class="form-control rounded-4 py-3" placeholder="0000 0000 0000 0000" :class="{'is-invalid': cardError}">
                  <div class="invalid-feedback small">{{ cardError }}</div>
              </div>
              <div class="row g-3">
                  <div class="col-6">
                      <label class="form-label very-small fw-bold text-muted">СРОК</label>
                      <input v-model="externalCard.exp" @input="maskExp" maxlength="5" class="form-control rounded-4 py-3 text-center" placeholder="ММ/ГГ">
                  </div>
                  <div class="col-6">
                      <label class="form-label very-small fw-bold text-muted">СУММА (₸)</label>
                      <input v-model="topUpAmount" type="number" class="form-control rounded-4 py-3 text-center fw-bold" placeholder="0">
                  </div>
              </div>
          </div>
          <button class="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-lg" :disabled="!isFormValid" @click="showSMSModal = true">
              Перевести {{ formatMoney(topUpAmount) }} ₸
          </button>
      </div>

      <!-- С МОЕГО СЧЕТА (ДЕПОЗИТЫ) -->
      <div v-if="mode === 'my_acc'" class="animate__animated animate__fadeInRight">
          <h6 class="fw-bold text-muted mb-3 ps-2">Выберите депозит</h6>
          <div class="list-group rounded-5 shadow-sm bg-white mb-4 overflow-hidden border-0">
              <div v-for="dep in auth.user.deposits" :key="dep.id" 
                   class="list-group-item p-4 d-flex align-items-center gap-3 border-0 border-bottom"
                   :class="{'active-dep-bg': selectedDepId === dep.id}"
                   @click="selectedDepId = dep.id">
                  <div class="icon-circle-sm bg-primary bg-opacity-10 text-primary"><i class="bi bi-safe"></i></div>
                  <div class="flex-grow-1">
                      <div class="fw-bold small">{{ dep.title }}</div>
                      <small class="text-muted">{{ formatMoney(dep.amount) }} ₸</small>
                  </div>
                  <div class="form-check"><input class="form-check-input" type="radio" :checked="selectedDepId === dep.id"></div>
              </div>
          </div>
          <div class="bg-white p-4 rounded-5 shadow-sm mb-4" v-if="selectedDepId">
              <label class="form-label small fw-bold text-muted">СУММА ПЕРЕВОДА</label>
              <input v-model="topUpAmount" type="number" class="form-control border-0 fs-2 fw-bold p-0 shadow-none" placeholder="0">
          </div>
          <button class="btn btn-primary w-100 py-3 rounded-pill fw-bold" :disabled="!selectedDepId || !topUpAmount" @click="confirmInternal">
              Перевести на карту
          </button>
      </div>

      <!-- ПО РЕКВИЗИТАМ (КОПИРОВАНИЕ ПО ПОЛЯМ) -->
      <div v-if="mode === 'req'" class="animate__animated animate__fadeInRight">
          <div class="bg-white p-4 rounded-5 shadow-sm mb-4 border-0">
              <div class="mb-4">
                  <h6 class="fw-bold border-bottom pb-2 mb-3">Информация о карте</h6>
                  <div class="req-item clickable-req" @click="copyField(auth.user.card_number, 'Номер карты')">
                      <span>Номер карты</span>
                      <div class="d-flex align-items-center gap-2">
                        <b>{{ auth.user.card_number }}</b>
                        <i class="bi bi-copy text-muted small"></i>
                      </div>
                  </div>
                  <div class="req-item clickable-req" @click="copyField(auth.user.name, 'Владелец')">
                      <span>Имя владельца</span>
                      <b>{{ auth.user.name }}</b>
                      <i class="bi bi-copy"></i>
                  </div>
                  <div class="req-item clickable-req" @click="copyField(auth.user.card_exp, 'Срок')">
                      <span>Срок действия</span>
                      <b>{{ auth.user.card_exp }}</b>
                      <i class="bi bi-copy"></i>
                  </div>
                  <div class="req-item">
                    <span>CVV</span>
                    <div class="d-flex align-items-center gap-2">
                        <b>{{ showCVV ? auth.user.card_cvv : '***' }}</b>
                        <i class="bi text-primary cursor-pointer" :class="showCVV ? 'bi-eye-slash' : 'bi-eye'" @click.stop="showCVV = !showCVV"></i>
                    </div>
                  </div>
              </div>

              <div>
                  <h6 class="fw-bold border-bottom pb-2 mb-3">Банковские реквизиты</h6>
                  <div class="req-item clickable-req" @click="copyField('AO ADAM-BANK', 'Банк')">
                      <span>Банк получатель</span><b>АО ADAM-BANK</b>
                      <i class="bi bi-copy"></i>
                  </div>
                  <div class="req-item clickable-req" @click="copyField('ADAMKZKX', 'БИК')">
                      <span>БИК</span><b>ADAMKZKX</b>
                      <i class="bi bi-copy"></i>
                  </div>
                  <div class="req-item clickable-req" @click="copyField(auth.user.iban, 'IBAN')">
                      <span>IBAN</span><b class="text-break small">{{ auth.user.iban || 'KZ99ADAM3456789012' }}</b>
                      <i class="bi bi-copy"></i>
                  </div>
                  <div class="req-item clickable-req border-0" @click="copyField(auth.user.iin, 'ИИН')">
                      <span>ИИН</span><b>{{ auth.user.iin }}</b>
                      <i class="bi bi-copy"></i>
                  </div>
              </div>
          </div>
          <p class="text-center text-muted very-small">Нажмите на поле, чтобы скопировать его</p>
      </div>

    </div>

    <!-- FACE ID (СИНЯЯ РАМКА) -->
    <Transition name="fade">
      <div v-if="isVerifying" class="face-id-ios-overlay">
          <div class="face-id-scanner">
              <div class="scanner-corner top-left"></div><div class="scanner-corner top-right"></div>
              <div class="scanner-corner bottom-left"></div><div class="scanner-corner bottom-right"></div>
              <div class="face-icon-ios"><i class="bi bi-person-bounding-box"></i></div>
              <div class="scan-line-ios-blue"></div>
          </div>
          <h5 class="mt-4 text-white fw-bold">Face ID</h5>
          <p class="text-white-50 small">Безопасность Adam Bank</p>
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
const isVerifying = ref(false);
const showSMSModal = ref(false);
const showMapChoice = ref(false);
const showCVV = ref(false);
const smsCode = ref('');
const topUpAmount = ref(null);
const selectedDepId = ref(null);
const cardError = ref('');
const targetedATM = ref(null);

const status = reactive({ visible: false, type: 'success', title: '', msg: '' });
const externalCard = reactive({ number: '', exp: '' });

const atmList = [
    { id: '041', address: 'бул. Нуржол, 14 (Байтерек)', time: 'Круглосуточно', dist: '0.4 км', lat: 51.1283, lng: 71.4305 },
    { id: '082', address: 'ТРЦ Керуен, 1 этаж', time: '10:00 - 22:00', dist: '1.2 км', lat: 51.1290, lng: 71.4410 },
    { id: '105', address: 'ул. Сыганак, 60/1 (Абу-Даби)', time: 'Круглосуточно', dist: '1.8 км', lat: 51.1210, lng: 71.4350 },
    { id: '012', address: 'ТРЦ Хан Шатыр, блок А', time: '10:00 - 23:00', dist: '2.5 км', lat: 51.1320, lng: 71.4030 },
];

const pageTitle = computed(() => {
    const titles = { list: 'Пополнить Adam-card', cash: 'Терминалы и ATM', other_bank: 'Перевод с карты', my_acc: 'С моего счета', req: 'Реквизиты' };
    return titles[mode.value];
});

const isFormValid = computed(() => {
    return externalCard.number.length === 19 && externalCard.exp.length === 5 && topUpAmount.value > 0 && !cardError.value;
});

const formatMoney = (v) => new Intl.NumberFormat('ru-RU').format(v || 0);

// МАРШРУТЫ
const requestRoute = (atm) => { targetedATM.value = atm; showMapChoice.value = true; };
const openInMap = (app) => {
    const { lat, lng } = targetedATM.value;
    let url = app === '2gis' ? `dgis://2gis.ru/routeSearch/rsType/car/to/${lng},${lat}` : app === 'yandex' ? `yandexmaps://maps.yandex.ru/?rtext=~${lat},${lng}` : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
    showMapChoice.value = false;
};

// МАСКИ ВВОДА
const maskCardNumber = (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length >= 8) {
        if (/^(\d)\1+$/.test(v) || "1234567890123456".includes(v)) cardError.value = "Некорректный номер";
        else cardError.value = "";
    } else cardError.value = "";
    v = v.substring(0, 16);
    externalCard.number = v.replace(/(.{4})/g, '$1 ').trim();
};

const maskExp = (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length >= 2) {
        v = v.substring(0, 4);
        externalCard.exp = v.substring(0, 2) + '/' + v.substring(2);
    } else externalCard.exp = v;
};

const verifyAndComplete = () => {
    triggerStatus('error', 'Ошибка подтверждения', 'Введен неверный код из СМС. Проверьте код и попробуйте еще раз.');
    smsCode.value = '';
};

const confirmInternal = () => {
    isVerifying.value = true;
    setTimeout(() => {
        try {
            auth.transferFromDepToCard(selectedDepId.value, topUpAmount.value);
            isVerifying.value = false;
            triggerStatus('success', 'Перевод выполнен', 'Средства зачислены на карту');
            setTimeout(() => router.push('/my-bank'), 2000);
        } catch (e) { isVerifying.value = false; triggerStatus('error', 'Ошибка', e.message); }
    }, 2500);
};

const copyField = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    triggerStatus('success', 'Скопировано', `${label} сохранен в буфер обмена`);
};

const triggerStatus = (type, title, msg) => { Object.assign(status, { visible: true, type, title, msg }); };
const goBack = () => mode.value === 'list' ? router.push('/my-bank') : mode.value = 'list';
</script>

<style scoped>
.page-wrapper { min-height: 100vh; background-color: #f6f8fb; }
.header { z-index: 1000; }
.back-btn { width: 40px; height: 40px; border: none; }
.main-content { padding-top: 80px; }

.icon-box-blue { width: 45px; height: 45px; border-radius: 14px; background: rgba(0, 78, 146, 0.1); color: #004e92; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }
.action-row { cursor: pointer; transition: 0.2s; border-color: #f8f9fa !important; }

/* MODAL OVERLAY (THE FIX) */
.map-choice-overlay { 
    position: fixed; inset: 0; background: rgba(0,0,0,0.4); 
    backdrop-filter: blur(8px); z-index: 5000; 
    display: flex; align-items: flex-end; /* ФИКС: Книзу экрана */
}
.map-choice-sheet { width: 100%; border-radius: 35px 35px 0 0; box-shadow: 0 -10px 40px rgba(0,0,0,0.15); }
.modal-handle { width: 45px; height: 5px; background: #e9ecef; border-radius: 10px; }
.map-app-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; }

/* REQUISITES */
.req-item { display: flex; justify-content: space-between; padding: 14px 10px; border-bottom: 1px solid #f8f9fa; font-size: 0.9rem; border-radius: 12px; }
.clickable-req { cursor: pointer; transition: 0.2s; }
.clickable-req:active { background: #f8f9fa; transform: scale(0.98); }

.sms-secure-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(10px); z-index: 5500; display: flex; align-items: flex-end; }
.sms-card { background: white; width: 100%; border-radius: 35px 35px 0 0; padding: 30px; }
.letter-spacing-10 { letter-spacing: 8px; }

.status-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); z-index: 9999; display: flex; align-items: center; justify-content: center; }
.status-card { background: white; border-radius: 40px; width: 85%; max-width: 380px; }
.status-icon { width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.8rem; margin: 0 auto; }
.status-card.success .status-icon { background: #198754; color: white; }
.status-card.error .status-icon { background: #dc3545; color: white; }

.face-id-ios-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 6000; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.face-id-scanner { width: 160px; height: 160px; position: relative; display: flex; align-items: center; justify-content: center; }
.scanner-corner { position: absolute; width: 35px; height: 35px; border: 4px solid #0d6efd; border-radius: 12px; }
.top-left { top: 0; left: 0; border-right: 0; border-bottom: 0; }
.top-right { top: 0; right: 0; border-left: 0; border-bottom: 0; }
.bottom-left { bottom: 0; left: 0; border-right: 0; border-top: 0; }
.bottom-right { bottom: 0; right: 0; border-left: 0; border-top: 0; }
.face-icon-ios { font-size: 5.5rem; color: #0d6efd; opacity: 0.9; }
.scan-line-ios-blue { position: absolute; width: 90%; height: 3px; background: #0d6efd; box-shadow: 0 0 15px #0d6efd; animation: scanAnim 2.2s infinite ease-in-out; }
@keyframes scanAnim { 0% { top: 15%; opacity: 0; } 50% { top: 85%; opacity: 1; } 100% { top: 15%; opacity: 0; } }

.very-small { font-size: 0.65rem; }
.active-dep-bg { background: #eef6ff !important; border-left: 4px solid #004e92 !important; }
</style>