<template>
  <div class="container mt-5">
    <h2 class="text-center text-danger mb-4">ADAM-BANK</h2>
    
    <div class="card p-4 shadow">
      <!-- Переключатель -->
      <ul class="nav nav-pills nav-fill mb-3">
        <li class="nav-item">
          <a class="nav-link" :class="{ active: !isRegister }" @click.prevent="isRegister = false" href="#">Вход</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" :class="{ active: isRegister }" @click.prevent="isRegister = true" href="#">Регистрация</a>
        </li>
      </ul>

      <form @submit.prevent="handleSubmit">
        <!-- Имя нужно только при регистрации -->
        <div v-if="isRegister" class="mb-3">
          <label>Имя</label>
          <input v-model="form.name" type="text" class="form-control" placeholder="Как вас зовут?">
        </div>


        <!-- НОВОЕ ПОЛЕ: ТЕЛЕФОН -->
        <div v-if="isRegister" class="mb-3">
          <label>Телефон</label>
          <input v-model="form.phone" type="tel" class="form-control" placeholder="8777..." required>
        </div>

        <div class="mb-3">
          <label>Email</label>
          <input v-model="form.email" type="email" class="form-control" required placeholder="email@example.com">
        </div>

        <div class="mb-3">
          <label>Пароль</label>
          <input v-model="form.password" type="password" class="form-control" required placeholder="******">
        </div>

        <button type="submit" class="btn btn-danger w-100">
          {{ isRegister ? 'Зарегистрироваться' : 'Войти' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const isRegister = ref(false); // Сначала показываем вход
const auth = useAuthStore();
const router = useRouter();

const form = reactive({
    name: '',
    phone: '', // <--- ДОБАВЬ ЭТО
    email: '',
    password: ''
});

const handleSubmit = async () => {
    try {
        if (isRegister.value) {
            // Если режим регистрации
            await auth.register(form);
        } else {
            // Если режим входа
            await auth.login({ email: form.email, password: form.password });
        }
        // Если все ок - идем на главную
        router.push('/');
    } catch (e) {
        console.error(e);
        alert('Ошибка! Проверьте данные или соединение с сервером.');
    }
};
</script>

<style scoped>
.nav-pills .nav-link.active {
    background-color: #dc3545; /* Красный цвет банка */
}
.nav-link {
    color: #dc3545;
    cursor: pointer;
}
</style>