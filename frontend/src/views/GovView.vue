<template>
  <div class="app-layout" :class="{ 'dark-theme': auth.isDarkMode }">
    
    <!-- 1. ЕДИНОЕ ОКНО СТАТУСА (ДЛЯ КРАСИВОЙ ОШИБКИ) -->
    <Transition name="scale">
      <div v-if="status.visible" class="status-overlay" @click="status.visible = false">
        <div class="status-card shadow-lg text-center p-5 error-border">
          <div class="status-icon-red mb-4">
            <i class="bi bi-exclamation-octagon"></i>
          </div>
          <h4 class="fw-bold mb-2 text-main">Ошибка доступа</h4>
          <p class="text-muted small">К сожалению, не удалось открыть данный раздел. Сервисы eGov временно недоступны. Попробуйте позже.</p>
          <button class="btn btn-primary rounded-pill px-5 mt-3 fw-bold shadow-sm" @click="status.visible = false">Понятно</button>
        </div>
      </div>
    </Transition>

    <!-- 2. ЭКРАН СИНХРОНИЗАЦИИ (KASPI + EGOV) -->
    <Transition name="fade">
      <div v-if="isLoading" class="sync-overlay">
          <div class="sync-content text-center">
              <div class="logos-handshake mb-4">
                  <div class="logo-adam shadow-lg">A</div>
                  <div class="sync-line"><span></span></div>
                  <div class="logo-egov shadow-sm">
                      <img src="https://idp.egov.kz/idp/resources/v2/images/logo_egov_blue.png" alt="eGov">
                  </div>
              </div>
              <h5 class="fw-bold text-main">Соединение с eGov.kz</h5>
              <p class="text-muted small">Загружаем ваши цифровые документы...</p>
          </div>
      </div>
    </Transition>

    <!-- Хедер -->
    <div class="header d-flex align-items-center px-4 py-3 bg-header fixed-top">
      <button @click="$router.push('/')" class="btn btn-light-custom rounded-circle me-3 shadow-sm back-btn">
        <i class="bi bi-arrow-left"></i>
      </button>
      <h5 class="mb-0 fw-bold header-title">Госуслуги</h5>
    </div>

    <!-- КОНТЕНТ -->
    <div class="container main-content pb-5" v-if="!isLoading">
      
      <!-- РАЗДЕЛ 1: ЦИФРОВОЙ ПАСПОРТ -->
      <h6 class="section-label">Цифровые документы</h6>
      <div class="docs-carousel d-flex gap-3 mb-4 no-scrollbar overflow-auto">
          
          <div class="doc-card id-card-bg shadow-sm" @click="triggerActionError">
              <div class="doc-inner">
                  <div class="d-flex justify-content-between">
                      <i class="bi bi-person-badge-fill fs-2"></i>
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Emblem_of_Kazakhstan.svg/1200px-Emblem_of_Kazakhstan.svg.png" class="kaz-emblem">
                  </div>
                  <div class="mt-auto">
                      <div class="fw-bold">Удостоверение</div>
                      <div class="fw-bold">личности</div>
                      <div class="very-small opacity-50 mt-1">REPUBLIC OF KAZAKHSTAN</div>
                  </div>
              </div>
          </div>

          <div class="doc-card driver-card-bg shadow-sm" @click="triggerActionError">
              <div class="doc-inner">
                  <div class="d-flex justify-content-between">
                      <i class="bi bi-car-front-fill fs-2"></i>
                      <span class="fw-bold small">DRIVER LICENSE</span>
                  </div>
                  <div class="mt-auto">
                      <div class="fw-bold">Водительское</div>
                      <div class="fw-bold">удостоверение</div>
                  </div>
              </div>
          </div>

          <div class="doc-card tech-card-bg shadow-sm" @click="triggerActionError">
              <div class="doc-inner">
                  <i class="bi bi-file-earmark-ruled-fill fs-2"></i>
                  <div class="mt-auto">
                      <div class="fw-bold">Техпаспорт</div>
                      <div class="fw-bold">автомобиля</div>
                  </div>
              </div>
          </div>
      </div>

      <!-- РАЗДЕЛ 2: СЕРВИСЫ -->
      <h6 class="section-label">Сервисы</h6>
      <div class="list-group rounded-4 shadow-sm border-0 bg-card overflow-hidden mb-4">
          <div v-for="s in services" :key="s.name" class="list-group-item p-4 border-0 border-bottom d-flex align-items-center gap-3 action-row" @click="triggerActionError">
              <div class="icon-circle-box" :class="s.bg"><i :class="s.icon"></i></div>
              <div class="flex-grow-1">
                  <div class="fw-bold text-main small">{{ s.name }}</div>
                  <div class="text-muted" style="font-size: 0.75rem;">{{ s.desc }}</div>
              </div>
              <i class="bi bi-chevron-right text-muted small"></i>
          </div>
      </div>

      <!-- РАЗДЕЛ 3: НАЛОГИ -->
      <h6 class="section-label">Налоги</h6>
      <div class="row g-3">
          <div class="col-6" @click="triggerActionError">
              <div class="bg-card p-4 rounded-4 shadow-sm text-center action-card border-0">
                  <div class="icon-circle-box bg-danger bg-opacity-10 text-danger mx-auto mb-2">
                    <i class="bi bi-cash-coin fs-4"></i>
                  </div>
                  <div class="fw-bold text-main small">Налог на транспорт</div>
              </div>
          </div>
          <div class="col-6" @click="triggerActionError">
              <div class="bg-card p-4 rounded-4 shadow-sm text-center action-card border-0">
                <div class="icon-circle-box bg-warning bg-opacity-10 text-warning mx-auto mb-2">
                    <i class="bi bi-house-door-fill fs-4"></i>
                </div>
                  <div class="fw-bold text-main small">Налог на жилье</div>
              </div>
          </div>
      </div>

    </div>

    <!-- FACE ID (ФИКСИРОВАННЫЙ ЦЕНТР) -->
    <Transition name="fade">
      <div v-if="isVerifying" class="face-id-fixed-overlay">
          <div class="face-id-visual">
              <div class="scanner-frame">
                  <div class="corner t-l"></div><div class="corner t-r"></div>
                  <div class="corner b-l"></div><div class="corner b-r"></div>
                  
                  <div class="face-icon-wrap">
                      <i class="bi bi-person-bounding-box"></i>
                  </div>
                  <div class="scan-laser-line"></div>
              </div>
              <h5 class="mt-4 text-white fw-bold">Face ID</h5>
              <p class="text-white-50 small">Подтвердите личность...</p>
          </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const isLoading = ref(true);
const isVerifying = ref(false);

const status = reactive({
    visible: false,
    type: 'error',
    title: '',
    msg: ''
});

const services = [
    { name: 'Пенсионный фонд', desc: 'Ваши накопления в ЕНПФ', icon: 'bi-piggy-bank-fill', bg: 'bg-primary bg-opacity-10 text-primary' },
    { name: 'Социальные выплаты', desc: 'Пособия, пенсии, АСП', icon: 'bi-heart-pulse-fill', bg: 'bg-danger bg-opacity-10 text-danger' },
    { name: 'Транспорт и налоги', desc: 'Штрафы, налоги на авто', icon: 'bi-car-front-fill', bg: 'bg-info bg-opacity-10 text-info' },
    { name: 'Семья и дети', desc: 'Свидетельства, пособия', icon: 'bi-people-fill', bg: 'bg-warning bg-opacity-10 text-warning' },
];

onMounted(() => {
    setTimeout(() => { isLoading.value = false; }, 2000);
});

const triggerActionError = () => {
    isVerifying.value = true;
    setTimeout(() => {
        isVerifying.value = false;
        status.visible = true;
    }, 2500);
};
</script>

<style scoped>
.page-wrapper {
  --bg-main: #f6f8fb; --bg-card: #ffffff; --text-main: #000428; --header-bg: #ffffff; --btn-light: #f8f9fa; --border: #f1f3f5;
  min-height: 100vh; background-color: var(--bg-main); font-family: 'Inter', sans-serif;
}
.dark-theme {
  --bg-main: #0b0e14; --bg-card: #1a1f26; --text-main: #ffffff; --header-bg: #1a1f26; --btn-light: #2d3748; --border: #2d3748;
}

.main-content { padding-top: 80px; }
.section-label { font-size: 0.7rem; font-weight: 800; color: #a0aec0; text-transform: uppercase; letter-spacing: 1px; padding-left: 10px; margin-bottom: 15px; }

/* SYNC LOGIC */
.sync-overlay { position: fixed; inset: 0; background: var(--bg-main); z-index: 5000; display: flex; align-items: center; justify-content: center; }
.logos-handshake { display: flex; align-items: center; gap: 20px; }
.logo-adam { width: 65px; height: 65px; background: #004e92; color: white; border-radius: 18px; font-weight: 900; font-size: 2rem; display: flex; align-items: center; justify-content: center; }
.logo-egov { width: 65px; height: 65px; background: white; border-radius: 18px; display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
.logo-egov img { width: 75%; }
.sync-line { width: 60px; height: 3px; background: var(--border); border-radius: 2px; position: relative; overflow: hidden; }
.sync-line span { position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: #004e92; animation: syncMove 1.5s infinite linear; }
@keyframes syncMove { to { left: 150%; } }

/* DOCS */
.docs-carousel { padding: 0 5px 15px 5px; }
.docs-carousel::-webkit-scrollbar { display: none; }
.doc-card {
    min-width: 170px; height: 210px; border-radius: 28px; 
    padding: 20px; cursor: pointer; transition: 0.2s;
    color: white; position: relative; overflow: hidden;
}
.doc-inner { height: 100%; display: flex; flex-direction: column; }
.kaz-emblem { width: 30px; filter: brightness(0) invert(1); opacity: 0.9; }

.id-card-bg { background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); }
.driver-card-bg { background: linear-gradient(135deg, #2c3e50 0%, #000000 100%); }
.tech-card-bg { background: linear-gradient(135deg, #5f2c82 0%, #49a09d 100%); }

/* SERVICES */
.bg-card { background-color: var(--bg-card) !important; }
.text-main { color: var(--text-main) !important; }
.icon-circle-box { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
.action-row { cursor: pointer; transition: 0.2s; background: transparent !important; }
.action-row:active { background: rgba(0,0,0,0.05) !important; }
.action-card { cursor: pointer; transition: 0.2s; }
.action-card:active { transform: scale(0.95); }

/* === FACE ID FIXED (iOS STYLE) === */
.face-id-fixed-overlay {
    position: fixed; 
    top: 0; left: 0; 
    width: 100vw; height: 100vh;
    background: rgba(0, 0, 0, 0.9); 
    z-index: 9999; 
    display: flex; 
    align-items: center; 
    justify-content: center;
}
.face-id-visual {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: -40px; /* Визуальная центровка (оптический центр) */
}
.scanner-frame {
    width: 180px; height: 180px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}
.corner {
    position: absolute; width: 30px; height: 30px;
    border: 4px solid #0d6efd;
}
.t-l { top: 0; left: 0; border-right: 0; border-bottom: 0; border-top-left-radius: 20px; }
.t-r { top: 0; right: 0; border-left: 0; border-bottom: 0; border-top-right-radius: 20px; }
.b-l { bottom: 0; left: 0; border-right: 0; border-top: 0; border-bottom-left-radius: 20px; }
.b-r { bottom: 0; right: 0; border-left: 0; border-top: 0; border-bottom-right-radius: 20px; }

.face-icon-wrap { font-size: 5rem; color: #0d6efd; opacity: 0.8; }

.scan-laser-line {
    position: absolute;
    width: 100%; height: 2px;
    background: #0d6efd;
    box-shadow: 0 0 15px #0d6efd;
    top: 20%;
    animation: laserScan 2s infinite ease-in-out;
}
@keyframes laserScan {
    0% { top: 20%; opacity: 0; }
    50% { top: 80%; opacity: 1; }
    100% { top: 20%; opacity: 0; }
}

/* STATUS OVERLAY */
.status-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); z-index: 8000; display: flex; align-items: center; justify-content: center; }
.status-card { background: var(--bg-card); border-radius: 40px; width: 85%; max-width: 380px; }
.status-icon-red { width: 85px; height: 85px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.8rem; margin: 0 auto; background: #dc3545; color: white; }
.error-border { border: 2px solid rgba(220, 53, 69, 0.2); }

.scale-enter-active, .scale-leave-active { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.scale-enter-from, .scale-leave-to { opacity: 0; transform: scale(0.5); }

.list-group-item .text-muted {
    color: #cbd5e0 !important; /* Почти белый, но мягкий серый */
}

.header-title{
    color: var(--text-main) !important;
}

.btn{
    background-color: var(--btn-light) !important;
    color: var(--text-main) !important;
}

.dark-theme .status-card p.text-muted {
    color: #cbd5e0 !important; /* Светло-серый, почти белый цвет */
    opacity: 1 !important;
}
</style>