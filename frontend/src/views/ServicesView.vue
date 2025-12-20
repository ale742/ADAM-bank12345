<template>
  <div class="page-wrapper">
    <div class="header d-flex align-items-center px-4 py-3 bg-white shadow-sm fixed-top">
      <router-link to="/" class="btn btn-light rounded-circle shadow-sm me-3 back-btn">
        <i class="bi bi-arrow-left text-dark"></i>
      </router-link>
      <h5 class="mb-0 fw-bold">Сервисы</h5>
    </div>

    <div class="container main-content pb-5">
      
      <!-- Баннер -->
      <div class="card border-0 shadow-sm rounded-4 mb-4 text-white position-relative overflow-hidden" style="background: linear-gradient(45deg, #FF512F, #DD2476);">
          <div class="card-body p-4 position-relative z-1">
              <h4 class="fw-bold">Кино и Концерты</h4>
              <p class="mb-3 opacity-75">Билеты без комиссии</p>
              <button class="btn btn-light rounded-pill fw-bold text-danger px-4">Купить</button>
          </div>
          <i class="bi bi-ticket-perforated position-absolute text-white opacity-25" style="font-size: 8rem; right: -20px; bottom: -20px;"></i>
      </div>

      <!-- Сетка Экосистемы -->
      <h6 class="text-muted small fw-bold mb-3 ps-1">ЭКОСИСТЕМА</h6>
      <div class="row g-3 mb-4">
          <div class="col-6" @click="$router.push('/shop')">
              <div class="p-3 bg-white rounded-4 shadow-sm h-100 d-flex flex-column align-items-start position-relative overflow-hidden cursor-pointer">
                  <div class="icon-circle bg-primary bg-opacity-10 text-primary mb-3">
                      <i class="bi bi-bag-fill fs-4"></i>
                  </div>
                  <h6 class="fw-bold mb-1">Магазин</h6>
                  <small class="text-muted">Рассрочка 0-0-12</small>
              </div>
          </div>
          <div class="col-6" @click="$router.push('/gov')">
              <div class="p-3 bg-white rounded-4 shadow-sm h-100 d-flex flex-column align-items-start position-relative overflow-hidden cursor-pointer">
                  <div class="icon-circle bg-warning bg-opacity-10 text-warning mb-3">
                      <i class="bi bi-bank2 fs-4"></i>
                  </div>
                  <h6 class="fw-bold mb-1">Госуслуги</h6>
                  <small class="text-muted">Справки, Налоги</small>
              </div>
          </div>
          <div class="col-6">
              <div class="p-3 bg-white rounded-4 shadow-sm h-100 d-flex flex-column align-items-start cursor-pointer">
                  <div class="icon-circle bg-success bg-opacity-10 text-success mb-3">
                      <i class="bi bi-airplane-fill fs-4"></i>
                  </div>
                  <h6 class="fw-bold mb-1">Travel</h6>
                  <small class="text-muted">Авиа и ЖД</small>
              </div>
          </div>
          <div class="col-6">
              <div class="p-3 bg-white rounded-4 shadow-sm h-100 d-flex flex-column align-items-start cursor-pointer">
                  <div class="icon-circle bg-info bg-opacity-10 text-info mb-3">
                      <i class="bi bi-shield-check fs-4"></i>
                  </div>
                  <h6 class="fw-bold mb-1">Страхование</h6>
                  <small class="text-muted">Авто, Жизнь</small>
              </div>
          </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.page-wrapper { min-height: 100vh; background-color: #f6f8fb; font-family: 'Inter', sans-serif; }
.header { z-index: 1000; }
.back-btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; }
.main-content { padding-top: 90px; }
.icon-circle { width: 50px; height: 50px; border-radius: 15px; display: flex; align-items: center; justify-content: center; }
.cursor-pointer { cursor: pointer; transition: transform 0.2s; }
.cursor-pointer:active { transform: scale(0.96); }
</style>