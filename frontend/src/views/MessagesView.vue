<template>
  <div class="page-wrapper">
    
    <!-- Хедер -->
    <div class="header d-flex align-items-center px-4 py-3 bg-white shadow-sm fixed-top">
      <router-link to="/" class="btn btn-light rounded-circle shadow-sm me-3 back-btn">
        <i class="bi bi-arrow-left text-dark"></i>
      </router-link>
      <h5 class="mb-0 fw-bold">Сообщения</h5>
    </div>

    <!-- ТАБЫ -->
    <div class="tabs-header bg-white fixed-top shadow-sm d-flex justify-content-around" style="top: 70px; z-index: 900;">
        <div 
            class="tab-item py-3 position-relative" 
            :class="{ active: activeTab === 'notifications' }"
            @click="activeTab = 'notifications'"
        >
            Уведомления
            <span v-if="activeTab === 'notifications'" class="active-line"></span>
        </div>
        <div 
            class="tab-item py-3 position-relative" 
            :class="{ active: activeTab === 'support' }"
            @click="activeTab = 'support'"
        >
            Поддержка
            <span v-if="activeTab === 'support'" class="active-line"></span>
        </div>
    </div>

    <!-- КОНТЕНТ -->
    <div class="container main-content pb-5">
        
        <!-- 1. ВКЛАДКА УВЕДОМЛЕНИЯ -->
        <div v-if="activeTab === 'notifications'" class="animate__animated animate__fadeIn">
            <div class="text-muted small fw-bold mb-3 mt-2 ps-2">СЕГОДНЯ</div>
            <div class="list-group rounded-4 shadow-sm border-0 bg-white overflow-hidden mb-4">
                <div class="list-group-item p-3 border-0 d-flex align-items-start gap-3">
                    <div class="icon-circle bg-danger bg-opacity-10 text-danger flex-shrink-0"><i class="bi bi-bag-fill"></i></div>
                    <div>
                        <div class="d-flex justify-content-between"><h6 class="mb-1 fw-bold">Покупка</h6><small class="text-muted">14:30</small></div>
                        <p class="mb-0 text-muted small">Magnum Cash & Carry. Сумма: 2 500 ₸</p>
                    </div>
                </div>
                <div class="list-group-item p-3 border-0 d-flex align-items-start gap-3">
                    <div class="icon-circle bg-success bg-opacity-10 text-success flex-shrink-0"><i class="bi bi-gift-fill"></i></div>
                    <div>
                        <div class="d-flex justify-content-between"><h6 class="mb-1 fw-bold">Кэшбек начислен</h6><small class="text-muted">10:00</small></div>
                        <p class="mb-0 text-muted small">Вам начислено 150 бонусов.</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- 2. ВКЛАДКА ПОДДЕРЖКА (Чат с БД) -->
        <div v-if="activeTab === 'support'" class="chat-container animate__animated animate__fadeIn">
            
            <div class="chat-history d-flex flex-column gap-3 pb-5">
                
                <!-- Приветствие -->
                <div class="message bot align-self-start">
                    <div class="msg-bubble bg-white shadow-sm rounded-4 p-3">
                        <small class="text-primary fw-bold mb-1 d-block">ADAM Support</small>
                        Здравствуйте! 👋 Я виртуальный помощник. Чем могу помочь?
                    </div>
                </div>

                <!-- 🔥 ИСТОРИЯ ИЗ БАЗЫ ДАННЫХ -->
                <div v-for="msg in messages" :key="msg.id" class="d-flex flex-column gap-2">
                    
                    <!-- Сообщение КЛИЕНТА (Справа) -->
                    <div class="message align-self-end text-end" style="max-width: 85%;">
                        <div class="msg-bubble p-3 rounded-4 shadow-sm bg-primary text-white">
                            {{ msg.message }}
                        </div>
                        <small class="text-muted mt-1 d-block me-2" style="font-size: 0.7rem;">
                            {{ formatTime(msg.created_at) }}
                        </small>
                    </div>

                    <!-- Ответ АДМИНА (Слева) - если есть -->
                    <div v-if="msg.answer" class="message align-self-start text-start" style="max-width: 85%;">
                        <div class="msg-bubble p-3 rounded-4 shadow-sm bg-white text-dark">
                            <small class="text-primary fw-bold mb-1 d-block">Оператор</small>
                            {{ msg.answer }}
                        </div>
                        <small class="text-muted mt-1 d-block ms-2" style="font-size: 0.7rem;">
                            {{ formatTime(msg.updated_at) }}
                        </small>
                    </div>

                </div>

            </div>

            <!-- Поле ввода -->
            <div class="chat-input-area fixed-bottom bg-white p-3 shadow-lg border-top d-flex gap-2">
                <button class="btn btn-light rounded-circle text-muted"><i class="bi bi-paperclip"></i></button>
                <input 
                    v-model="newMessage" 
                    @keyup.enter="sendMessage"
                    type="text" 
                    class="form-control rounded-pill bg-light border-0" 
                    placeholder="Напишите сообщение..."
                >
                <button 
                    @click="sendMessage" 
                    class="btn btn-primary rounded-circle shadow-sm" 
                    :disabled="!newMessage.trim()"
                >
                    <i class="bi bi-send-fill"></i>
                </button>
            </div>

        </div>

    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue';
import axios from '../axios'; // Наш настроенный axios

const activeTab = ref('notifications');
const newMessage = ref('');
const messages = ref([]); // Список сообщений из базы

// Формат времени (14:30)
const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Загрузка чата с сервера
const loadMessages = async () => {
    try {
        const response = await axios.get('/support');
        messages.value = response.data;
        scrollToBottom();
    } catch (e) {
        console.error('Ошибка загрузки чата', e);
    }
};

// Отправка сообщения
const sendMessage = async () => {
    if (!newMessage.value.trim()) return;

    try {
        const response = await axios.post('/support', {
            message: newMessage.value
        });

        // Добавляем ответ сервера в список (чтобы сразу отобразилось)
        messages.value.push(response.data);
        
        newMessage.value = '';
        scrollToBottom();
    } catch (e) {
        alert('Не удалось отправить сообщение');
    }
};

const scrollToBottom = async () => {
    await nextTick();
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
};

// Следим за переключением вкладок
watch(activeTab, (val) => {
    if (val === 'support') {
        loadMessages();
    }
});
</script>

<style scoped>
.page-wrapper { min-height: 100vh; background-color: #f6f8fb; font-family: 'Inter', sans-serif; }
.header { z-index: 1000; }
.back-btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; }

/* ТАБЫ */
.tabs-header { border-radius: 0 0 20px 20px; }
.tab-item { width: 50%; text-align: center; font-weight: 600; color: #9aa0a6; cursor: pointer; transition: color 0.2s; }
.tab-item.active { color: #004e92; }
.active-line { position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 40px; height: 4px; background-color: #004e92; border-radius: 4px 4px 0 0; }

.main-content { padding-top: 140px; }
.icon-circle { width: 45px; height: 45px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }

/* ЧАТ */
.msg-bubble { min-width: 100px; position: relative; }
.chat-input-area { padding-bottom: max(1rem, env(safe-area-inset-bottom)); z-index: 1000; }
</style>