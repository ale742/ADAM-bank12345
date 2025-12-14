<template>
  <div class="container mt-5">
    <h2 class="text-center text-danger mb-4">ADAM-BANK</h2>
    <div class="card p-4">
      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label>Email</label>
          <input v-model="email" type="email" class="form-control" required>
        </div>
        <div class="mb-3">
          <label>Пароль</label>
          <input v-model="password" type="password" class="form-control" required>
        </div>
        <button type="submit" class="btn btn-danger w-100">Войти</button>
      </form>
      <!-- Для упрощения регистрацию можно сделать здесь же или отдельной кнопкой -->
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const auth = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
    try {
        await auth.login({ email: email.value, password: password.value });
        router.push('/');
    } catch (e) {
        alert('Ошибка входа');
    }
};
</script>