<template>
  <div class="page-wrapper">
    
    <!-- Хедер -->
    <div class="header d-flex align-items-center px-4 py-3 bg-white shadow-sm fixed-top">
      <router-link to="/" class="btn btn-light rounded-circle shadow-sm me-3 back-btn">
        <i class="bi bi-arrow-left text-dark"></i>
      </router-link>
      <h5 class="mb-0 fw-bold">ADAM Магазин</h5>
    </div>

    <!-- Контент -->
    <div class="container pt-5 mt-5 pb-5 text-center d-flex flex-column align-items-center justify-content-center" style="min-height: 80vh;">
      
      <div class="icon-circle bg-primary bg-opacity-10 text-primary mb-4 animate__animated animate__bounceIn">
        <i class="bi bi-bag-fill" style="font-size: 4rem;"></i>
      </div>

      <h3 class="fw-bold mb-2">Скоро открытие!</h3>
      <p class="text-muted" style="max-width: 300px;">
        Мы наполняем полки лучшими товарами. Совсем скоро здесь можно будет покупать в рассрочку.
      </p>

      <button class="btn btn-primary rounded-pill px-5 py-2 mt-3 shadow-sm" @click="$router.push('/')">
        На главную
      </button>

    </div>
  </div>
</template>

<style scoped>
.page-wrapper {
    min-height: 100vh;
    background-color: #f6f8fb;
    font-family: 'Inter', sans-serif;
}
.header { z-index: 1000; }
.back-btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; }

.icon-circle {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>