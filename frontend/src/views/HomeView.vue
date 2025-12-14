<template>
  <div class="container mt-3">
    <!-- Шапка -->
    <div class="d-flex justify-content-between align-items-center mb-4">
       <h4>Мой Банк</h4>
       <button @click="logout" class="btn btn-sm btn-outline-secondary">Выход</button>
    </div>

    <!-- Карточка -->
    <div class="card bg-danger text-white mb-4 shadow">
      <div class="card-body">
        <h5 class="card-title">ADAM Gold</h5>
        <h2>{{ user?.balance }} ₸</h2>
        <p class="card-text">**** 1234</p>
      </div>
    </div>

    <!-- Быстрые действия -->
    <div class="row text-center mb-4">
       <div class="col-4">
         <div class="btn btn-light rounded-circle p-3">🛒</div>
         <p><small>Магазин</small></p>
       </div>
       <div class="col-4">
         <div class="btn btn-light rounded-circle p-3">💸</div>
         <p><small>Переводы</small></p>
       </div>
       <div class="col-4">
         <div class="btn btn-light rounded-circle p-3">🏛</div>
         <p><small>Госуслуги</small></p>
       </div>
    </div>

    <!-- История -->
    <h5>История операций</h5>
    <ul class="list-group">
      <li v-for="tr in transactions" :key="tr.id" class="list-group-item d-flex justify-content-between">
        <span>{{ tr.description }}</span>
        <span class="text-danger">-{{ tr.amount }} ₸</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import axios from '../axios';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();
const transactions = ref([]);
const user = computed(() => auth.user);

onMounted(async () => {
    await auth.fetchUser();
    const res = await axios.get('/transactions');
    transactions.value = res.data;
});

const logout = async () => {
    await auth.logout();
    router.push('/login');
}
</script>