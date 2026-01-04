<template>
  <div class="page-wrapper">
    
    <!-- Хедер -->
    <div class="header d-flex align-items-center px-4 py-3 bg-white shadow-sm fixed-top">
      <router-link to="/" class="btn btn-light rounded-circle shadow-sm me-3 back-btn">
        <i class="bi bi-arrow-left text-dark"></i>
      </router-link>
      <h5 class="mb-0 fw-bold">Платежи</h5>
    </div>

    <!-- Контент -->
    <div class="container main-content pb-5">
      
      <!-- Поиск -->
      <div class="search-wrapper mb-4 animate__animated animate__fadeInDown">
        <div class="input-group input-group-lg shadow-sm rounded-4 overflow-hidden">
          <span class="input-group-text bg-white border-0 ps-3"><i class="bi bi-search text-muted"></i></span>
          <input type="text" class="form-control border-0 ps-2" placeholder="Найти услугу..." style="font-size: 0.95rem;">
        </div>
      </div>

      <!-- Мои платежи -->
      <h6 class="text-muted small fw-bold mb-3 ps-1 animate__animated animate__fadeIn">МОИ ПЛАТЕЖИ</h6>
      <div class="d-flex gap-3 overflow-auto pb-3 mb-2 px-1 no-scrollbar animate__animated animate__fadeIn">
          <div class="text-center favorite-item">
              <div class="avatar-circle bg-white border border-dashed border-primary text-primary shadow-sm mb-2">
                  <i class="bi bi-plus-lg fs-4"></i>
              </div>
              <small class="text-dark fw-bold ellipsis">Добавить</small>
          </div>
          <div class="text-center favorite-item">
              <div class="avatar-circle bg-white shadow-sm mb-2 text-warning">
                  <i class="bi bi-house-door-fill fs-4"></i>
              </div>
              <small class="text-muted fw-bold ellipsis">Дом</small>
          </div>
          <div class="text-center favorite-item">
              <div class="avatar-circle bg-white shadow-sm mb-2 text-info">
                  <i class="bi bi-telephone-fill fs-4"></i>
              </div>
              <small class="text-muted fw-bold ellipsis">Мама</small>
          </div>
      </div>

      <!-- Категории -->
      <h6 class="text-muted small fw-bold mb-3 ps-1 animate__animated animate__fadeIn delay-1">КАТЕГОРИИ</h6>
      <div class="row g-3 mb-4 animate__animated animate__fadeInUp delay-1">
          <div class="col-4" v-for="(cat, index) in categories" :key="index">
              <div class="category-card bg-white shadow-sm text-center p-3 h-100 d-flex flex-column align-items-center justify-content-center">
                  <div class="icon-box mb-2" :class="cat.bgClass">
                      <i :class="cat.icon" class="fs-4"></i>
                  </div>
                  <small class="fw-bold text-dark lh-sm">{{ cat.name }}</small>
              </div>
          </div>
      </div>

      <!-- 🔥 ПОПУЛЯРНОЕ (ТЕПЕРЬ ДИНАМИЧЕСКИ ИЗ БАЗЫ) -->
      <h6 class="text-muted small fw-bold mb-3 ps-1 animate__animated animate__fadeIn delay-2">ПОПУЛЯРНОЕ</h6>
      <div class="list-group rounded-4 shadow-sm border-0 bg-white animate__animated animate__fadeInUp delay-2">
          
          <div v-for="service in services" :key="service.id" class="list-group-item p-3 border-0 d-flex align-items-center justify-content-between action-row">
              <div class="d-flex align-items-center gap-3">
                  <!-- Логотип сервиса -->
                  <div class="provider-logo rounded-circle bg-light d-flex align-items-center justify-content-center text-primary fw-bold border">
                      <!-- Если есть иконка - показываем, иначе первую букву -->
                      <i v-if="service.icon" :class="service.icon" class="fs-5"></i>
                      <span v-else>{{ service.name[0] }}</span>
                  </div>
                  <div>
                      <h6 class="mb-0 fw-bold">{{ service.name }}</h6>
                      <small class="text-muted">{{ service.category }}</small>
                  </div>
              </div>
              <i class="bi bi-chevron-right text-muted"></i>
          </div>

          <!-- Заглушка, если база пустая -->
          <div v-if="services.length === 0" class="p-4 text-center text-muted">
              Загрузка сервисов...
          </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from '../axios';

const categories = ref([
    { name: 'Мобильный', icon: 'bi bi-phone', bgClass: 'bg-danger bg-opacity-10 text-danger' },
    { name: 'Коммуналка', icon: 'bi bi-house', bgClass: 'bg-warning bg-opacity-10 text-warning' },
    { name: 'Интернет', icon: 'bi bi-router', bgClass: 'bg-primary bg-opacity-10 text-primary' },
    { name: 'Транспорт', icon: 'bi bi-bus-front', bgClass: 'bg-success bg-opacity-10 text-success' },
    { name: 'Образование', icon: 'bi bi-mortarboard', bgClass: 'bg-info bg-opacity-10 text-info' },
    { name: 'Штрафы', icon: 'bi bi-exclamation-triangle', bgClass: 'bg-danger bg-opacity-10 text-danger' },
]);

// 🔥 ЗАГРУЗКА ИЗ БАЗЫ ДАННЫХ
const services = ref([]);

onMounted(async () => {
    try {
        const response = await axios.get('/services');
        services.value = response.data;
    } catch (e) {
        console.error('Ошибка загрузки сервисов', e);
    }
});
</script>

<style scoped>
.page-wrapper { min-height: 100vh; background-color: #f6f8fb; font-family: 'Inter', sans-serif; }
.header { z-index: 1000; }
.back-btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; }
.main-content { padding-top: 90px; }
.form-control:focus { box-shadow: none; }
.avatar-circle { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s; }
.avatar-circle:active { transform: scale(0.9); }
.favorite-item { width: 70px; flex-shrink: 0; }
.ellipsis { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.75rem; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.category-card { border-radius: 20px; cursor: pointer; transition: transform 0.2s; border: none; }
.category-card:active { transform: scale(0.95); }
.icon-box { width: 45px; height: 45px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.provider-logo { width: 45px; height: 45px; }
.action-row { transition: background-color 0.2s; cursor: pointer; }
.action-row:active { background-color: #f8f9fa; }
.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }
</style>