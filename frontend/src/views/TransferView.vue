<template>
  <div class="container mt-3">
    <div class="d-flex align-items-center mb-4">
        <!-- Кнопка назад -->
        <router-link to="/" class="btn btn-light me-3">⬅</router-link>
        <h3>Переводы</h3>
    </div>

    <div class="card shadow p-4">
      <form @submit.prevent="sendMoney">
        <div class="mb-3">
          <label>Номер телефона</label>
          <input v-model="phone" type="tel" class="form-control" placeholder="+7 (777) 000-00-00" required>
        </div>

        <div class="mb-3">
          <label>Сумма (₸)</label>
          <input v-model="amount" type="number" class="form-control" placeholder="0" min="100" required>
        </div>

        <div v-if="message" :class="{'text-success': success, 'text-danger': !success}" class="mb-3">
            {{ message }}
        </div>

        <button type="submit" class="btn btn-danger w-100 py-2">
            Перевести
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from '../axios';
import { useAuthStore } from '../stores/auth';

const phone = ref('');
const amount = ref('');
const message = ref('');
const success = ref(false);
const auth = useAuthStore();

const sendMoney = async () => {
    message.value = 'Обработка...';
    try {
        // Отправляем запрос на бэкенд
        const res = await axios.post('/transfer', {
            phone: phone.value,
            amount: amount.value
        });
        
        success.value = true;
        message.value = '✅ Успешно! Перевод отправлен.';
        
        // Обновляем баланс в приложении
        auth.user.balance = res.data.balance;
        
        // Очищаем форму
        amount.value = '';
        phone.value = '';

    } catch (error) {
        success.value = false;
        // Если ошибка пришла с сервера (например, "Недостаточно средств")
        if (error.response && error.response.data.message) {
            message.value = '❌ ' + error.response.data.message;
        } else {
            message.value = '❌ Ошибка соединения';
        }
    }
};
</script>