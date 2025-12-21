<template>
  <div class="page-wrapper">
    
    <!-- Хедер -->
    <div class="header d-flex align-items-center px-4 py-3 bg-white shadow-sm fixed-top">
      <router-link to="/" class="btn btn-light rounded-circle shadow-sm me-3 back-btn">
        <i class="bi bi-arrow-left text-dark"></i>
      </router-link>
      <h5 class="mb-0 fw-bold">Сообщения</h5>
    </div>

    <!-- ТАБЫ (Переключатель) -->
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
                <!-- Уведомление 1 -->
                <div class="list-group-item p-3 border-0 d-flex align-items-start gap-3">
                    <div class="icon-circle bg-danger bg-opacity-10 text-danger flex-shrink-0">
                        <i class="bi bi-bag-fill"></i>
                    </div>
                    <div>
                        <div class="d-flex justify-content-between">
                            <h6 class="mb-1 fw-bold">Покупка</h6>
                            <small class="text-muted">14:30</small>
                        </div>
                        <p class="mb-0 text-muted small">Magnum Cash & Carry. Сумма: 2 500 ₸</p>
                    </div>
                </div>

                <!-- Уведомление 2 -->
                <div class="list-group-item p-3 border-0 d-flex align-items-start gap-3">
                    <div class="icon-circle bg-success bg-opacity-10 text-success flex-shrink-0">
                        <i class="bi bi-gift-fill"></i>
                    </div>
                    <div>
                        <div class="d-flex justify-content-between">
                            <h6 class="mb-1 fw-bold">Кэшбек начислен</h6>
                            <small class="text-muted">10:00</small>
                        </div>
                        <p class="mb-0 text-muted small">Вам начислено 150 бонусов за покупки в категории "Супермаркеты".</p>
                    </div>
                </div>
            </div>

            <div class="text-muted small fw-bold mb-3 ps-2">ВЧЕРА</div>

            <div class="list-group rounded-4 shadow-sm border-0 bg-white overflow-hidden">
                <!-- Уведомление 3 -->
                <div class="list-group-item p-3 border-0 d-flex align-items-start gap-3">
                    <div class="icon-circle bg-primary bg-opacity-10 text-primary flex-shrink-0">
                        <i class="bi bi-info-circle-fill"></i>
                    </div>
                    <div>
                        <div class="d-flex justify-content-between">
                            <h6 class="mb-1 fw-bold">Вход в приложение</h6>
                            <small class="text-muted">Yesterday</small>
                        </div>
                        <p class="mb-0 text-muted small">Выполнен вход с устройства iPhone 14 Pro Max.</p>
                    </div>
                </div>
            </div>

        </div>

        <!-- 2. ВКЛАДКА ПОДДЕРЖКА (Чат) -->
        <div v-if="activeTab === 'support'" class="chat-container animate__animated animate__fadeIn">
            
            <div class="chat-history d-flex flex-column gap-3 pb-5">
                
                <!-- Сообщение бота -->
                <div class="message bot align-self-start">
                    <div class="msg-bubble bg-white shadow-sm rounded-4 p-3">
                        <small class="text-primary fw-bold mb-1 d-block">ADAM Support</small>
                        Здравствуйте! 👋 Я виртуальный помощник. Чем могу помочь?
                    </div>
                    <small class="text-muted ms-2 mt-1">10:00</small>
                </div>

                <!-- История переписки (динамическая) -->
                <div v-for="(msg, index) in messages" :key="index" 
                     class="message" 
                     :class="msg.isMe ? 'align-self-end text-end' : 'align-self-start'">
                    <div class="msg-bubble p-3 rounded-4 shadow-sm"
                         :class="msg.isMe ? 'bg-primary text-white' : 'bg-white text-dark'">
                        {{ msg.text }}
                    </div>
                    <small class="text-muted mt-1 d-block" :class="msg.isMe ? 'me-2' : 'ms-2'">
                        {{ msg.time }}
                    </small>
                </div>

                <!-- Индикатор набора (если бот пишет) -->
                <div v-if="isTyping" class="message bot align-self-start animate__animated animate__fadeIn">
                    <div class="msg-bubble bg-white shadow-sm rounded-4 p-3 text-muted fst-italic">
                        <span class="typing-dots"><span>.</span><span>.</span><span>.</span></span>
                    </div>
                </div>

            </div>

            <!-- Поле ввода (прибито к низу) -->
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
import { ref, nextTick } from 'vue';

const activeTab = ref('notifications');
const newMessage = ref('');
const messages = ref([]);
const isTyping = ref(false);

const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const sendMessage = () => {
    if (!newMessage.value.trim()) return;

    // 1. Добавляем сообщение юзера
    messages.value.push({
        text: newMessage.value,
        isMe: true,
        time: getCurrentTime()
    });

    const userText = newMessage.value;
    newMessage.value = ''; // Очистка поля

    // Прокрутка вниз
    scrollToBottom();

    // 2. Имитация ответа оператора
    isTyping.value = true;
    setTimeout(() => {
        isTyping.value = false;
        
        let botReply = "Спасибо за обращение! Оператор подключится в течение минуты.";
        if (userText.toLowerCase().includes('привет')) botReply = "Салам! Как ваши дела?";
        if (userText.toLowerCase().includes('баланс')) botReply = "Ваш баланс доступен на главной странице.";

        messages.value.push({
            text: botReply,
            isMe: false,
            time: getCurrentTime()
        });
        scrollToBottom();
    }, 1500); // Задержка 1.5 сек
};

const scrollToBottom = async () => {
    await nextTick();
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
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

/* ТАБЫ */
.tabs-header {
    border-radius: 0 0 20px 20px;
}
.tab-item {
    width: 50%;
    text-align: center;
    font-weight: 600;
    color: #9aa0a6;
    cursor: pointer;
    transition: color 0.2s;
}
.tab-item.active {
    color: #004e92;
}
.active-line {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 4px;
    background-color: #004e92;
    border-radius: 4px 4px 0 0;
}

/* КОНТЕНТ */
.main-content {
    padding-top: 140px; /* Отступ под два хедера (Top + Tabs) */
}

/* Иконки уведомлений */
.icon-circle {
    width: 45px; height: 45px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.2rem;
}

/* ЧАТ */
.msg-bubble {
    max-width: 80%;
    min-width: 100px;
    position: relative;
}
.chat-input-area {
    padding-bottom: max(1rem, env(safe-area-inset-bottom));
    z-index: 1000;
}

/* Анимация точек набора */
.typing-dots span {
    animation: typing 1.4s infinite ease-in-out both;
}
.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
}
</style>