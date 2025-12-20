<template>
  <div class="page-wrapper">
    
    <!-- Хедер -->
    <div class="header d-flex align-items-center px-4 py-3 bg-white shadow-sm fixed-top">
      <router-link to="/" class="btn btn-light rounded-circle shadow-sm me-3 back-btn">
        <i class="bi bi-arrow-left text-dark"></i>
      </router-link>
      <h5 class="mb-0 fw-bold">Переводы</h5>
    </div>

    <!-- Основной контент -->
    <div class="container main-content pb-5">
      
      <!-- 1. ОТКУДА (Карта) -->
      <h6 class="text-muted small fw-bold mb-2 ps-2 animate__animated animate__fadeIn">ОТКУДА</h6>
      <div class="source-card p-3 mb-4 text-white shadow position-relative overflow-hidden animate__animated animate__fadeInDown">
        <div class="card-bg"></div>
        <div class="d-flex justify-content-between align-items-center position-relative z-1">
            <div class="d-flex align-items-center gap-3">
                <div class="card-icon bg-white bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center">
                    <i class="bi bi-wallet2"></i>
                </div>
                <div>
                    <div class="fw-bold">ADAM-BANK</div>
                    <small class="text-white-50">•••• 4582</small>
                </div>
            </div>
            <div class="text-end">
                <div class="fw-bold fs-5">{{ formatMoney(auth.user?.balance) }} ₸</div>
                <small class="text-white-50">Доступно</small>
            </div>
        </div>
      </div>

      <!-- 2. БЫСТРЫЕ ПЕРЕВОДЫ (История/Контакты) -->
      <h6 class="text-muted small fw-bold mb-2 ps-2 animate__animated animate__fadeIn delay-1">ПОСЛЕДНИЕ</h6>
      <div class="d-flex gap-3 overflow-auto pb-3 mb-2 px-1 no-scrollbar animate__animated animate__fadeIn delay-1">
          <!-- Кнопка "Новый" -->
          <div class="text-center">
              <div class="avatar-circle bg-white border border-primary text-primary shadow-sm mb-1">
                  <i class="bi bi-plus-lg fs-4"></i>
              </div>
              <small class="text-dark fw-bold" style="font-size: 0.7rem;">Новый</small>
          </div>
          
          <!-- Фейковые контакты для красоты -->
          <div class="text-center" @click="fillForm('77757268996')">
              <div class="avatar-circle bg-light shadow-sm mb-1">
                  <span class="fw-bold text-muted">A</span>
              </div>
              <small class="text-muted" style="font-size: 0.7rem;">Алексей</small>
          </div>
      </div>

      <!-- 3. ФОРМА ПЕРЕВОДА -->
      <div class="bg-white p-4 rounded-4 shadow-sm animate__animated animate__fadeInUp delay-2">
        <form @submit.prevent="sendMoney">
            
            <!-- Номер телефона -->
            <div class="mb-4">
              <label class="form-label text-muted small fw-bold">КОМУ (ТЕЛЕФОН)</label>
              <div class="input-group input-group-lg border-bottom">
                <span class="input-group-text bg-transparent border-0 ps-0"><i class="bi bi-telephone text-primary"></i></span>
                <input 
                    v-model="phone" 
                    @input="handlePhoneMask"
                    type="tel" 
                    class="form-control border-0 bg-transparent fw-bold" 
                    placeholder="+7 (000) 000-00-00" 
                    maxlength="18"
                    required
                >
                <span class="input-group-text bg-transparent border-0 pe-0">
                    <i class="bi bi-person-lines-fill text-muted"></i>
                </span>
              </div>
            </div>

            <!-- Сумма -->
            <div class="mb-4">
              <label class="form-label text-muted small fw-bold">СУММА</label>
              <div class="input-group input-group-lg border-bottom">
                <span class="input-group-text bg-transparent border-0 ps-0"><i class="bi bi-cash text-success"></i></span>
                <input 
                    v-model="amount" 
                    type="number" 
                    class="form-control border-0 bg-transparent fw-bold fs-2" 
                    placeholder="0" 
                    min="100" 
                    required
                >
                <span class="input-group-text bg-transparent border-0 pe-0 fw-bold">₸</span>
              </div>
              <!-- Подсказки сумм -->
              <div class="d-flex gap-2 mt-3">
                  <span class="badge bg-light text-dark border p-2 cursor-pointer" @click="amount = 1000">1 000</span>
                  <span class="badge bg-light text-dark border p-2 cursor-pointer" @click="amount = 2000">2 000</span>
                  <span class="badge bg-light text-dark border p-2 cursor-pointer" @click="amount = 5000">5 000</span>
              </div>
            </div>

            <!-- Сообщение об ошибке/успехе -->
            <div v-if="message" class="alert py-2 text-center small fw-bold mb-3" :class="success ? 'alert-success' : 'alert-danger'">
                {{ message }}
            </div>

            <button type="submit" class="btn btn-primary w-100 btn-lg rounded-pill py-3 fw-bold shadow-primary mt-2">
                Перевести
            </button>
        </form>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';

const phone = ref('');
const amount = ref('');
const message = ref('');
const success = ref(false);
const auth = useAuthStore();

const formatMoney = (value) => {
    if (!value) return 0;
    return new Intl.NumberFormat('ru-RU').format(value);
};

// Функция быстрой вставки номера (для кружочков)
const fillForm = (num) => {
    // Имитация ввода
    const event = { target: { value: num } };
    handlePhoneMask(event);
};

const handlePhoneMask = (event) => {
    let input = event.target.value.replace(/\D/g, '');
    let formatted = '';

    if (!input) {
        phone.value = '';
        return;
    }

    if (['7', '8'].includes(input[0])) {
        if (input[0] === '9') input = '7' + input;
        let firstDigit = '7'; 
        input = firstDigit + input.substring(1);
    } else {
        input = '7' + input;
    }

    input = input.substring(0, 11);

    if (input.length > 0) formatted = '+' + input.substring(0, 1);
    if (input.length >= 2) formatted += ' (' + input.substring(1, 4);
    if (input.length >= 5) formatted += ') ' + input.substring(4, 7);
    if (input.length >= 8) formatted += '-' + input.substring(7, 9);
    if (input.length >= 10) formatted += '-' + input.substring(9, 11);

    phone.value = formatted;
};

const sendMoney = async () => {
    message.value = 'Обработка...';
    try {
        await auth.makeTransfer(amount.value, phone.value);
        
        success.value = true;
        message.value = '✅ Перевод успешно отправлен!';
        
        // Очистка
        amount.value = '';
        phone.value = '';
        
        setTimeout(() => { message.value = '' }, 3000);

    } catch (error) {
        success.value = false;
        message.value = '❌ ' + error.message;
    }
};
</script>

<style scoped>
.page-wrapper {
    min-height: 100vh;
    background-color: #f6f8fb;
    font-family: 'Inter', sans-serif;
}
.header { z-index: 1000; }
.back-btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; }

/* КАРТОЧКА ИСТОЧНИКА */
.source-card {
    background: linear-gradient(135deg, #004e92 0%, #000428 100%);
    border-radius: 20px;
}
.card-bg {
    position: absolute; top: -50%; right: -50%; width: 100%; height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
    transform: rotate(30deg);
}
.card-icon {
    width: 45px; height: 45px; font-size: 1.2rem; color: #fff;
}

/* БЫСТРЫЕ КОНТАКТЫ */
.avatar-circle {
    width: 55px; height: 55px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: transform 0.2s;
}
.avatar-circle:active { transform: scale(0.9); }

/* Убираем скроллбар */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

/* ИНПУТЫ */
.form-control:focus {
    box-shadow: none;
    border-color: #004e92 !important;
}
.cursor-pointer { cursor: pointer; transition: all 0.2s; }
.cursor-pointer:hover { background-color: #e9ecef !important; }

/* КНОПКА */
.shadow-primary {
    box-shadow: 0 8px 20px rgba(0, 78, 146, 0.3);
}
.btn-primary {
    background: linear-gradient(90deg, #004e92 0%, #0066cc 100%);
    border: none;
}
.btn-primary:active { transform: scale(0.98); }

/* Анимации задержки */
.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }

.main-content {
    padding-top: 90px;
}

</style>