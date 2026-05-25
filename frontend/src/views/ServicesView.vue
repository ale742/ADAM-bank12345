<template>
  <div class="page-wrapper">
    
    <!-- Хедер -->
    <div class="header d-flex align-items-center px-4 py-3 bg-white shadow-sm fixed-top">
      <h5 class="mb-0 fw-bold">Сервисы</h5>
    </div>

    <!-- КОНТЕНТ -->
    <div class="container main-content pb-5">
      
      <!-- 1. РЕКЛАМНЫЙ БАННЕР (АКЦИЯ) -->
      <div class="promo-slider mb-4 animate__animated animate__fadeIn">
          <div class="promo-card shadow-sm position-relative overflow-hidden">
              <div class="promo-content position-relative z-1 p-4 text-white">
                  <span class="badge bg-white bg-opacity-25 mb-2">Партнерская акция</span>
                  <h4 class="fw-bold mb-1">Путешествуй с ADAM</h4>
                  <p class="small opacity-75 mb-3">Кэшбек 10% на покупку авиабилетов через наше приложение</p>
                  <button class="btn btn-light btn-sm rounded-pill px-4 fw-bold text-primary">Подробнее</button>
              </div>
              <!-- Декор баннера -->
              <i class="bi bi-airplane-fill position-absolute promo-icon-bg"></i>
          </div>
      </div>

      <!-- 2. СЕТКА ОСНОВНЫХ СЕРВИСОВ -->
      <h6 class="text-muted small fw-bold mb-3 ps-1">БАНКОВСКИЕ УСЛУГИ</h6>
      <div class="services-grid row g-3 mb-4">
          
          <!-- Мой Банк -->
          <div class="col-6" @click="$router.push('/my-bank')">
              <div class="service-tile shadow-sm">
                  <div class="icon-circle bg-primary bg-opacity-10 text-primary mb-2">
                      <i class="bi bi-wallet2"></i>
                  </div>
                  <div class="fw-bold small">Мой банк</div>
                  <div class="text-muted" style="font-size: 0.65rem;">Карты, счета</div>
              </div>
          </div>

          <!-- Переводы -->
          <div class="col-6" @click="$router.push('/transfer')">
              <div class="service-tile shadow-sm">
                  <div class="icon-circle bg-info bg-opacity-10 text-info mb-2">
                      <i class="bi bi-arrow-left-right"></i>
                  </div>
                  <div class="fw-bold small">Переводы</div>
                  <div class="text-muted" style="font-size: 0.65rem;">По номеру, в банки</div>
              </div>
          </div>

          <!-- Платежи -->
          <div class="col-6" @click="$router.push('/payments')">
              <div class="service-tile shadow-sm">
                  <div class="icon-circle bg-success bg-opacity-10 text-success mb-2">
                      <i class="bi bi-credit-card-2-front"></i>
                  </div>
                  <div class="fw-bold small">Платежи</div>
                  <div class="text-muted" style="font-size: 0.65rem;">Услуги, штрафы</div>
              </div>
          </div>

          <!-- Госуслуги -->
          <div class="col-6" @click="$router.push('/gov')">
              <div class="service-tile shadow-sm">
                  <div class="icon-circle bg-warning bg-opacity-10 text-warning mb-2">
                      <i class="bi bi-bank2"></i>
                  </div>
                  <div class="fw-bold small">Госуслуги</div>
                  <div class="text-muted" style="font-size: 0.65rem;">Цифровой Egov</div>
              </div>
          </div>

      </div>

      <!-- 3. ЭКОСИСТЕМА И МАГАЗИН -->
      <h6 class="text-muted small fw-bold mb-3 ps-1">ЭКОСИСТЕМА</h6>
      <div class="row g-3">
          <!-- Магазин -->
          <div class="col-12" @click="$router.push('/shop')">
              <div class="shop-banner-card p-3 rounded-5 shadow-sm d-flex align-items-center justify-content-between">
                  <div class="d-flex align-items-center gap-3">
                      <div class="icon-circle bg-dark text-white shadow-sm">
                          <i class="bi bi-bag-check-fill"></i>
                      </div>
                      <div>
                          <h6 class="mb-0 fw-bold">ADAM Shop</h6>
                          <small class="text-muted">Рассрочка 0-0-12 на всё</small>
                      </div>
                  </div>
                  <i class="bi bi-chevron-right text-muted pe-2"></i>
              </div>
          </div>

          <!-- Еще одна реклама (например, страхование) -->
          <div class="col-6">
              <div class="mini-promo bg-white p-3 rounded-5 shadow-sm h-100">
                  <i class="bi bi-shield-check text-primary fs-3 mb-2 d-block"></i>
                  <div class="fw-bold small">Страхование</div>
                  <div class="text-muted" style="font-size: 0.6rem;">Авто и жизнь</div>
              </div>
          </div>

          <!-- Билеты -->
          <div class="col-6">
              <div class="mini-promo bg-white p-3 rounded-5 shadow-sm h-100">
                  <i class="bi bi-ticket-perforated text-danger fs-3 mb-2 d-block"></i>
                  <div class="fw-bold small">Билеты</div>
                  <div class="text-muted" style="font-size: 0.6rem;">Авиа, ЖД, Кино</div>
              </div>
          </div>
      </div>

    </div>

    <!-- НИЖНЕЕ МЕНЮ (Копия с главной для навигации) -->
    <nav class="bottom-nav fixed-bottom bg-white shadow-lg border-top d-flex justify-content-around py-2">
      <div class="nav-item" @click="$router.push('/')">
        <div class="nav-icon-wrapper"><i class="bi bi-house-door-fill fs-4"></i></div><small>Главная</small>
      </div>
      <div class="nav-item" @click="$router.push('/qr')">
        <div class="nav-icon-wrapper"><i class="bi bi-qr-code fs-4"></i></div><small>QR</small>
      </div>
      <div class="nav-item active"> <!-- Активная вкладка -->
        <div class="nav-icon-wrapper"><i class="bi bi-grid-fill fs-4"></i></div><small>Сервисы</small>
      </div>
      <div class="nav-item" @click="$router.push('/settings')">
        <div class="nav-icon-wrapper"><i class="bi bi-gear-fill fs-4"></i></div><small>Настройки</small>
      </div>
    </nav>

  </div>
</template>

<style scoped>
.page-wrapper { min-height: 100vh; background-color: #f6f8fb; font-family: 'Inter', sans-serif; }
.header { z-index: 1000; text-align: center; }
.main-content { padding-top: 80px; padding-bottom: 100px; }

/* РЕКЛАМНЫЙ БАННЕР */
.promo-card {
    background: linear-gradient(135deg, #004e92 0%, #000428 100%);
    border-radius: 30px;
    min-height: 160px;
}
.promo-icon-bg {
    font-size: 8rem;
    color: rgba(255, 255, 255, 0.1);
    right: -20px;
    bottom: -20px;
    transform: rotate(-15deg);
}

/* ПЛИТКИ СЕРВИСОВ */
.service-tile {
    background: white;
    border-radius: 28px;
    padding: 20px 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    height: 130px;
    transition: transform 0.2s, background-color 0.2s;
    cursor: pointer;
    border: 1px solid #f0f0f0;
}
.service-tile:active {
    transform: scale(0.95);
    background-color: #f8f9fa;
}

.icon-circle {
    width: 50px;
    height: 50px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
}

/* БАННЕР МАГАЗИНА */
.shop-banner-card {
    background: white;
    cursor: pointer;
    transition: 0.2s;
    border: 1px solid #f0f0f0;
}
.shop-banner-card:active {
    transform: scale(0.98);
}

.mini-promo {
    border: 1px solid #f0f0f0;
    cursor: pointer;
}
.mini-promo:active { transform: scale(0.95); }

/* НИЖНЕЕ МЕНЮ */
.bottom-nav { padding-bottom: env(safe-area-inset-bottom); border-radius: 24px 24px 0 0; z-index: 1000; }
.nav-item { display: flex; flex-direction: column; align-items: center; color: #9aa0a6; cursor: pointer; width: 25%; transition: color 0.3s ease; }
.nav-item.active { color: #004e92; }
.nav-item:active { transform: scale(0.9); }
</style>