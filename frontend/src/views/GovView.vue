<template>
  <div class="page-wrapper">
    
    <!-- Хедер -->
    <div class="header d-flex align-items-center px-4 py-3 bg-white shadow-sm fixed-top">
      <router-link to="/" class="btn btn-light rounded-circle shadow-sm me-3 back-btn">
        <i class="bi bi-arrow-left text-dark"></i>
      </router-link>
      <h5 class="mb-0 fw-bold">Гос. услуги</h5>
    </div>

    <!-- 1. ЭКРАН ЗАГРУЗКИ (КОЛЛАБОРАЦИЯ) -->
    <div v-if="isLoading" class="loading-overlay d-flex flex-column align-items-center justify-content-center px-4 text-center">
        <div class="sync-animation mb-4">
            <div class="logo-box adam-logo shadow-lg">
    <!-- Вместо тега img с ошибкой, используем просто текст, пока нет файла -->
    <span>A</span> 
</div>
            <div class="sync-dots">
                <span></span><span></span><span></span>
            </div>
            <div class="logo-box egov-logo shadow-lg">
                <img src="https://egov.kz/cms/ru/themes/egov/img/logo.png" alt="eGov">
            </div>
        </div>
        <h5 class="fw-bold mb-2">Синхронизация с eGov.kz</h5>
        <p class="text-muted small">Устанавливаем безопасное соединение для доступа к вашим документам...</p>
        <div class="progress w-75 mt-3" style="height: 6px; border-radius: 10px;">
            <div class="progress-bar progress-bar-striped progress-bar-animated" :style="{width: loadingProgress + '%'}"></div>
        </div>
    </div>

    <!-- 2. ОСНОВНОЙ КОНТЕНТ (ПОСЛЕ ЗАГРУЗКИ) -->
    <div v-else class="container main-content pb-5 animate__animated animate__fadeIn">
      
      <!-- Блок Цифровых документов -->
      <h6 class="text-muted small fw-bold mb-3 ps-1">ЦИФРОВЫЕ ДОКУМЕНТЫ</h6>
      <div class="d-flex gap-3 overflow-auto pb-3 mb-4 no-scrollbar">
          
          <!-- Удостоверение -->
          <div class="doc-card id-card shadow-sm p-3 text-white position-relative overflow-hidden" @click="openDoc('ID')">
              <div class="card-glow"></div>
              <div class="d-flex justify-content-between mb-4">
                  <i class="bi bi-person-badge fs-3"></i>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Emblem_of_Kazakhstan.svg/1200px-Emblem_of_Kazakhstan.svg.png" style="width: 25px; opacity: 0.8;">
              </div>
              <div class="fw-bold small">Удостоверение</div>
              <div class="fw-bold small">личности</div>
              <div class="mt-2" style="font-size: 0.6rem; opacity: 0.7;">РЕСПУБЛИКА КАЗАХСТАН</div>
          </div>

          <!-- Права -->
          <div class="doc-card driver-card shadow-sm p-3 text-white position-relative overflow-hidden" @click="openDoc('Driver')">
              <div class="card-glow"></div>
              <div class="d-flex justify-content-between mb-4">
                  <i class="bi bi-car-front-fill fs-3"></i>
                  <span class="fw-bold small">Driving License</span>
              </div>
              <div class="fw-bold small">Водительское</div>
              <div class="fw-bold small">удостоверение</div>
          </div>

          <!-- Техпаспорт -->
          <div class="doc-card tech-card shadow-sm p-3 text-white position-relative overflow-hidden">
              <i class="bi bi-file-earmark-text fs-3 mb-4 d-block"></i>
              <div class="fw-bold small">Техпаспорт</div>
              <div class="fw-bold small">автомобиля</div>
          </div>

      </div>

      <!-- Сетка Гос. сервисов -->
      <h6 class="text-muted small fw-bold mb-3 ps-1">ПОПУЛЯРНЫЕ УСЛУГИ</h6>
      <div class="list-group rounded-5 shadow-sm border-0 bg-white overflow-hidden mb-4">
          <div v-for="s in govServices" :key="s.name" class="list-group-item p-3 border-0 border-bottom d-flex align-items-center gap-3 action-row">
              <div class="icon-circle-sm" :class="s.bg"><i :class="s.icon"></i></div>
              <div class="flex-grow-1">
                  <div class="fw-bold small">{{ s.name }}</div>
                  <div class="text-muted" style="font-size: 0.7rem;">{{ s.desc }}</div>
              </div>
              <i class="bi bi-chevron-right text-muted"></i>
          </div>
      </div>

      <!-- Налоги -->
      <h6 class="text-muted small fw-bold mb-3 ps-1">НАЛОГИ И ШТРАФЫ</h6>
      <div class="row g-3">
          <div class="col-6">
              <div class="bg-white p-3 rounded-4 shadow-sm h-100 d-flex flex-column align-items-center text-center">
                  <i class="bi bi-cash-stack text-danger fs-3 mb-2"></i>
                  <div class="fw-bold small">Налог на транспорт</div>
              </div>
          </div>
          <div class="col-6">
              <div class="bg-white p-3 rounded-4 shadow-sm h-100 d-flex flex-column align-items-center text-center">
                  <i class="bi bi-house-door text-warning fs-3 mb-2"></i>
                  <div class="fw-bold small">Налог на имущество</div>
              </div>
          </div>
      </div>

    </div>

    <!-- МОДАЛКА ПРОСМОТРА УДОСТОВЕРЕНИЯ -->
    <Transition name="fade">
        <div v-if="activeDoc" class="doc-modal" @click.self="activeDoc = null">
            <div class="id-full-preview p-4 animate__animated animate__zoomIn">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Emblem_of_Kazakhstan.svg/1200px-Emblem_of_Kazakhstan.svg.png" style="width: 40px;">
                    <div class="text-end text-white">
                        <div class="fw-bold small">УДОСТОВЕРЕНИЕ ЛИЧНОСТИ</div>
                        <div class="small opacity-75">IDENTITY CARD</div>
                    </div>
                </div>
                <div class="d-flex gap-3 mt-4">
                    <div class="user-photo">
                        <i class="bi bi-person-fill display-1 text-white-50"></i>
                    </div>
                    <div class="user-info text-white">
                        <small class="opacity-75">Фамилия / Surname</small>
                        <div class="fw-bold mb-2">{{ auth.user.name.split(' ')[0] }}</div>
                        <small class="opacity-75">Имя / Given names</small>
                        <div class="fw-bold mb-2">{{ auth.user.name.split(' ')[1] }}</div>
                        <small class="opacity-75">ИИН / National ID</small>
                        <div class="fw-bold">{{ auth.user.iin }}</div>
                    </div>
                </div>
                <div class="qr-code-doc mt-4 text-center p-2 bg-white rounded-3 mx-auto" style="width: 120px;">
                    <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=VALID_DOC_${auth.user.iin}`">
                </div>
                <button class="btn btn-light w-100 rounded-pill mt-4 fw-bold" @click="activeDoc = null">Закрыть</button>
            </div>
        </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const isLoading = ref(true);
const loadingProgress = ref(0);
const activeDoc = ref(null);

const govServices = [
    { name: 'Пенсионный фонд', desc: 'Проверка накоплений ЕНПФ', icon: 'bi bi-piggy-bank', bg: 'bg-primary bg-opacity-10 text-primary' },
    { name: 'Социальные выплаты', desc: 'Пособия и помощь', icon: 'bi bi-heart-pulse', bg: 'bg-danger bg-opacity-10 text-danger' },
    { name: 'Недвижимость', desc: 'Справки об объектах', icon: 'bi bi-house', bg: 'bg-success bg-opacity-10 text-success' },
    { name: 'Семья', desc: 'Брак, рождение детей', icon: 'bi bi-people', bg: 'bg-info bg-opacity-10 text-info' },
];

onMounted(() => {
    // Имитация загрузки-синхронизации
    const interval = setInterval(() => {
        if (loadingProgress.value < 100) {
            loadingProgress.value += 5;
        } else {
            clearInterval(interval);
            setTimeout(() => {
                isLoading.value = false;
            }, 500);
        }
    }, 100);
});

const openDoc = (type) => activeDoc.value = type;
const formatMoney = (v) => new Intl.NumberFormat('ru-RU').format(v);
</script>

<style scoped>
.page-wrapper { min-height: 100vh; background-color: #f6f8fb; font-family: 'Inter', sans-serif; }
.header { z-index: 1000; }
.main-content { padding-top: 90px; }

/* АНИМАЦИЯ СИНХРОНИЗАЦИИ */
.loading-overlay { height: 100vh; background: #fff; }
.sync-animation { display: flex; align-items: center; gap: 20px; }
.logo-box { width: 80px; height: 80px; border-radius: 20px; display: flex; align-items: center; justify-content: center; background: white; overflow: hidden; }
.adam-logo { background: linear-gradient(135deg, #004e92, #000428); color: white; font-size: 2rem; font-weight: 800; }
.egov-logo img { width: 80%; }
.sync-dots span { display: inline-block; width: 8px; height: 8px; margin: 0 4px; background: #004e92; border-radius: 50%; animation: blink 1s infinite; }
.sync-dots span:nth-child(2) { animation-delay: 0.2s; }
.sync-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }

/* КАРТОЧКИ ДОКУМЕНТОВ */
.doc-card { min-width: 160px; height: 200px; border-radius: 28px; cursor: pointer; transition: 0.3s; }
.id-card { background: linear-gradient(135deg, #2c3e50, #000428); }
.driver-card { background: linear-gradient(135deg, #1e3c72, #2a5298); }
.tech-card { background: linear-gradient(135deg, #5d4157, #a8caba); }
.card-glow { position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%); }
.doc-card:active { transform: scale(0.95); }

/* МОДАЛКА УДОСТОВЕРЕНИЯ */
.doc-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px; }
.id-full-preview { width: 100%; max-width: 400px; background: linear-gradient(135deg, #1e3c72, #2a5298); border-radius: 30px; border: 1px solid rgba(255,255,255,0.2); }
.user-photo { width: 100px; height: 130px; background: rgba(255,255,255,0.1); border-radius: 15px; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid rgba(255,255,255,0.3); }

.icon-circle-sm { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.action-row { cursor: pointer; transition: 0.2s; }
.action-row:active { background: #f8f9fa; }
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>