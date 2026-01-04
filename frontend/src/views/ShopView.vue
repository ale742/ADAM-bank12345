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
    <div class="container main-content pb-5">
      
      <!-- Если товаров нет -->
      <div v-if="products.length === 0" class="text-center mt-5 pt-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="text-muted mt-2">Загружаем товары...</p>
      </div>

      <!-- СЕТКА ТОВАРОВ -->
      <div v-else class="row g-3">
          <div class="col-6" v-for="product in products" :key="product.id">
              <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden product-card">
                  <!-- Картинка -->
                  <div class="product-img-wrapper bg-light d-flex align-items-center justify-content-center">
                      <img v-if="product.image_url" :src="product.image_url" class="img-fluid" alt="product">
                      <i v-else class="bi bi-image text-muted fs-1"></i>
                  </div>
                  
                  <div class="card-body p-3 d-flex flex-column">
                      <h6 class="fw-bold mb-1 text-truncate">{{ product.name }}</h6>
                      
                      <!-- Цена и рассрочка -->
                      <div class="mt-auto">
                          <span class="badge bg-warning text-dark mb-2">0-0-12</span>
                          <h5 class="fw-bold text-primary mb-0">{{ formatMoney(product.price) }} ₸</h5>
                          <small class="text-muted" style="font-size: 0.7rem;">{{ formatMoney(product.price / 12) }} ₸ x 12 мес</small>
                      </div>
                      
                      <button class="btn btn-primary w-100 rounded-pill btn-sm mt-3 fw-bold">
                          В корзину
                      </button>
                  </div>
              </div>
          </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from '../axios'; // Наш настроенный axios

const products = ref([]);

// Загружаем товары при открытии страницы
onMounted(async () => {
    try {
        const response = await axios.get('/products');
        products.value = response.data;
    } catch (e) {
        console.error("Ошибка загрузки товаров", e);
    }
});

const formatMoney = (value) => {
    return new Intl.NumberFormat('ru-RU').format(value);
};
</script>

<style scoped>
.page-wrapper { min-height: 100vh; background-color: #f6f8fb; font-family: 'Inter', sans-serif; }
.header { z-index: 1000; }
.back-btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; }
.main-content { padding-top: 80px; }

.product-card { transition: transform 0.2s; }
.product-card:active { transform: scale(0.98); }

.product-img-wrapper {
    height: 150px;
    width: 100%;
    overflow: hidden;
}
.product-img-wrapper img {
    height: 100%;
    width: 100%;
    object-fit: cover; /* Чтобы картинка заполняла квадрат */
}
</style>