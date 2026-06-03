<template>
  <div class="app-layout" :class="{ 'dark-theme': auth.isDarkMode }">
    
    <!-- SIDEBAR ДЛЯ ПК (Как в Истории и Аккаунте) -->
    <aside class="desktop-sidebar d-none d-lg-flex">
      <div class="sidebar-header" @click="$router.push('/')">
        <div class="logo-circle-adam">A</div>
        <span class="brand-name-adam">ADAM BANK</span>
      </div>
      <nav class="sidebar-nav">
        <div class="sidebar-link" @click="$router.push('/')"><i class="bi bi-house-door"></i> <span>Главная</span></div>
        <div class="sidebar-link" @click="$router.push('/my-bank')"><i class="bi bi-wallet2"></i> <span>Мой банк</span></div>
        <div class="sidebar-link" @click="$router.push('/payments')"><i class="bi bi-credit-card"></i> <span>Платежи</span></div>
        <div class="sidebar-link" @click="$router.push('/history')"><i class="bi bi-clock-history"></i> <span>История</span></div>
        <div class="sidebar-link active"><i class="bi bi-chat-dots-fill"></i> <span>Сообщения</span></div>
        <div class="sidebar-link" @click="$router.push('/account')"><i class="bi bi-person-circle"></i> <span>Аккаунт</span></div>
      </nav>
      <div class="mt-auto user-pill-desktop" v-if="auth.user">
          <div class="avatar-mini-circle" :style="auth.user.avatar ? `background-image: url(${auth.user.avatar})` : ''">
            <span v-if="!auth.user.avatar">{{ auth.user.name[0] }}</span>
          </div>
          <div class="ms-2 fw-bold small text-truncate text-main">{{ auth.user.name }}</div>
      </div>
    </aside>

    <div class="main-wrapper">
      
      <!-- ЦИФРОВОЙ ЧЕК (Твой стиль) -->
      <Transition name="fade">
          <div v-if="selectedReceipt" class="receipt-overlay" @click.self="selectedReceipt = null">
              <div class="receipt-paper animate__animated animate__slideInUp">
                  <div class="receipt-edge"></div>
                  <div class="p-4 text-center">
                      <div class="logo-circle-adam mx-auto mb-2" style="width: 45px; height: 45px; font-size: 1.2rem;">A</div>
                      <h5 class="fw-bold mb-0 text-dark">ADAM BANK</h5>
                      <small class="text-muted">Электронный чек</small>
                      <div class="receipt-divider my-3"></div>
                      <h2 class="fw-bold text-dark">{{ formatMoney(selectedReceipt.amount) }} ₸</h2>
                      <p class="text-muted small">{{ selectedReceipt.provider || 'Перевод' }}</p>
                      
                      <div class="text-start mt-4 small text-dark">
                          <div class="d-flex justify-content-between mb-1"><span>Дата:</span><b>{{ currentDateTime() }}</b></div>
                          <div class="d-flex justify-content-between"><span>Статус:</span><b class="text-success">Успешно</b></div>
                      </div>

                      <div class="text-center mb-4 mt-3">
                          <div class="paid-stamp">ОПЛАЧЕНО</div>
                      </div>

                      <div class="d-flex gap-2">
                          <button class="btn btn-light flex-fill rounded-pill" @click="shareReceipt">
                              <i class="bi bi-share"></i>
                          </button>
                          <button class="btn btn-primary flex-fill rounded-pill fw-bold" @click="selectedReceipt = null">Закрыть</button>
                      </div>
                  </div>
              </div>
          </div>
      </Transition>

      <!-- ХЕДЕР С ТАБАМИ -->
      <div class="header-fixed bg-header shadow-sm fixed-top">
          <div class="d-flex align-items-center px-4 py-3">
            <button @click="$router.push('/')" class="btn btn-light-custom rounded-circle me-3 d-lg-none"><i class="bi bi-arrow-left"></i></button>
            <h5 class="mb-0 fw-bold text-main">Сообщения</h5>
          </div>
          <div class="tabs-container d-flex px-3 pb-1">
              <div class="tab-item" :class="{active: activeTab === 'notify'}" @click="activeTab = 'notify'">Уведомления</div>
              <div class="tab-item" :class="{active: activeTab === 'ai'}" @click="activeTab = 'ai'">Adam AI <span class="online-dot"></span></div>
          </div>
      </div>

      <div class="container content-area pb-5">
        
        <!-- ВКЛАДКА 1: УВЕДОМЛЕНИЯ -->
        <div v-if="activeTab === 'notify'" class="animate__animated animate__fadeIn">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h6 class="fw-bold text-muted m-0 ls-1">БАНКОВСКИЕ СООБЩЕНИЯ</h6>
                <button class="btn btn-link text-primary p-0 fw-bold small text-decoration-none" @click="clearAll">Очистить</button>
            </div>

            <div v-if="auth.notifications.length > 0" class="notifications-list">
                <div v-for="n in auth.notifications" :key="n.id" 
                    class="notify-card p-4 mb-3 shadow-sm bg-card"
                    :class="{ 'unread': !n.isRead }">
                    
                    <div class="d-flex gap-3">
                        <div class="notify-icon-circle" :class="n.type">
                            <i class="bi" :class="getIcon(n.type)"></i>
                        </div>
                        <div class="flex-grow-1">
                            <div class="d-flex justify-content-between">
                                <h6 class="fw-bold text-main mb-1">{{ n.title }}</h6>
                                <small class="text-muted">{{ n.date.split(',')[1] }}</small>
                            </div>
                            <p class="small text-muted mb-2">{{ n.msg }}</p>
                            <button v-if="n.extra" @click="selectedReceipt = n.extra" class="btn btn-light-custom btn-sm rounded-pill px-3 fw-bold">
                                <i class="bi bi-file-earmark-text me-1"></i> Чек
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="text-center py-5 opacity-25">
                <i class="bi bi-mailbox display-1"></i>
                <h6 class="mt-3">Уведомлений нет</h6>
            </div>
        </div>

        <!-- ВКЛАДКА 2: ЧАТ С ИИ (ADAM AI) -->
        <div v-if="activeTab === 'ai'" class="chat-wrapper animate__animated animate__fadeIn">
            <div class="chat-messages no-scrollbar" ref="chatBox">
                <div v-for="msg in auth.chatMessages" :key="msg.id" 
                     class="message-row d-flex mb-4" 
                     :class="msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'">
                    
                    <div class="message-bubble shadow-sm" :class="msg.role">
                        <div v-if="msg.role === 'bot'" class="bot-header">ADAM AI</div>
                        <div class="text">{{ msg.text }}</div>
                        <small class="msg-date">{{ msg.date }}</small>
                    </div>
                </div>

                <!-- ИНДИКАТОР ПЕЧАТИ (Когда ИИ думает) -->
                <div v-if="auth.isTyping" class="message-row d-flex justify-content-start mb-4">
                    <div class="message-bubble bot typing-indicator">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            </div>

            <!-- ПОЛЕ ВВОДА -->
            <div class="chat-input-area bg-card shadow-lg p-3">
                <div class="d-flex gap-2">
                    <input v-model="newMessage" @keyup.enter="handleSend" 
                           type="text" class="form-control rounded-pill border-0 bg-light-custom px-4" 
                           placeholder="Напишите Adam AI...">
                    <button class="btn btn-primary rounded-circle" @click="handleSend" :disabled="!newMessage.trim()">
                        <i class="bi bi-send-fill"></i>
                    </button>
                </div>
            </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const activeTab = ref('notify');
const newMessage = ref('');
const selectedReceipt = ref(null);
const chatBox = ref(null);

const getIcon = (type) => {
    return { transaction: 'bi-cash-stack', security: 'bi-shield-lock-fill', info: 'bi-info-circle-fill' }[type] || 'bi-bell-fill';
};

const handleSend = () => {
    if (!newMessage.value.trim()) return;
    console.log("Отправка сообщения:", newMessage.value); // Добавь это для теста в консоли
    auth.sendToAI(newMessage.value);
    newMessage.value = '';
};

const scrollToBottom = async () => {
    await nextTick();
    if (chatBox.value) {
        chatBox.value.scrollTop = chatBox.value.scrollHeight;
    }
};

const clearAll = () => { if(confirm('Удалить все уведомления?')) auth.notifications = []; };
const formatMoney = (v) => new Intl.NumberFormat('ru-RU').format(v || 0);
const currentDateTime = () => new Date().toLocaleString('ru-RU');
const shareReceipt = () => alert('Ссылка на чек скопирована!');

// Автопрокрутка при новых сообщениях
watch(() => auth.chatMessages?.length, scrollToBottom);
// Прокрутка при открытии чата
watch(activeTab, (val) => { if(val === 'ai') scrollToBottom(); });

onMounted(scrollToBottom);
</script>

<style scoped>
/* ТЕМА И LAYOUT */
.app-layout {
  --bg-main: #f6f8fb; --bg-card: #ffffff; --text-main: #000428; --header-bg: #ffffff; --btn-light: #f1f3f5; --border: #f1f3f5;
  display: flex; min-height: 100vh; background-color: var(--bg-main); font-family: 'Inter', sans-serif; transition: 0.3s;
}
.app-layout.dark-theme {
  --bg-main: #0b0e14; --bg-card: #1a1f26; --text-main: #ffffff; --header-bg: #1a1f26; --btn-light: #2d3748; --border: #2d3748;
}

.main-wrapper { flex-grow: 1; display: flex; flex-direction: column; position: relative; }
.content-area { padding-top: 150px; max-width: 800px; margin: 0 auto; width: 100%; padding-left: 20px; padding-right: 20px; }

/* TABS */
.header-fixed { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; transition: left 0.3s; }
@media (min-width: 992px) { .header-fixed { left: 280px; } }

.tabs-container { gap: 20px; }
.tab-item { 
    padding: 10px 5px; cursor: pointer; color: var(--text-muted); 
    font-weight: 700; border-bottom: 3px solid transparent; transition: 0.3s;
    font-size: 0.9rem; position: relative;
}
.tab-item.active { color: #004e92; border-bottom-color: #004e92; }
.online-dot { width: 7px; height: 7px; background: #38ef7d; border-radius: 50%; display: inline-block; margin-left: 5px; box-shadow: 0 0 5px #38ef7d; }

/* NOTIFICATIONS */
.notify-card { border-radius: 25px; border: 1px solid var(--border) !important; transition: 0.3s; }
.notify-card.unread { border-left: 4px solid #004e92; }
.notify-icon-circle { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }
.notify-icon-circle.transaction { background: rgba(25, 135, 84, 0.1); color: #198754; }
.notify-icon-circle.security { background: rgba(220, 53, 69, 0.1); color: #dc3545; }
.notify-icon-circle.info { background: rgba(0, 78, 146, 0.1); color: #004e92; }

/* CHAT MESSAGES */
/* Зажимаем чат по центру на ПК */
.chat-wrapper {
    max-width: 700px; /* Оптимальная ширина для чтения текста */
    margin: 0 auto;   /* Центрируем */
    height: calc(100vh - 220px);
    display: flex;
    flex-direction: column;
}
.chat-messages { flex-grow: 1; overflow-y: auto; padding: 10px 5px; }

.message-bubble { max-width: 85%; padding: 14px 18px; border-radius: 22px; font-size: 0.95rem; line-height: 1.5; }
.message-bubble.user { background: #004e92; color: white; border-bottom-right-radius: 4px; }
.message-bubble.bot { background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border); border-bottom-left-radius: 4px; }
/* Уменьшаем гигантские отступы между сообщениями */
.message-row {
    margin-bottom: 10px !important; /* Было 4, сделаем плотнее */
}

.bot-header { font-size: 0.65rem; font-weight: 800; color: #0d6efd; margin-bottom: 4px; text-transform: uppercase; }
.msg-date { font-size: 0.6rem; opacity: 0.5; display: block; margin-top: 6px; text-align: right; }

/* TYPING INDICATOR */
.typing-indicator { display: flex; gap: 4px; padding: 15px 25px !important; }
.typing-indicator span { width: 6px; height: 6px; background: #0d6efd; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out; }
.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
@keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }

/* CHAT INPUT */
.chat-input-area {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%); /* Центрируем */
    width: 100%;
    max-width: 700px; /* Такая же ширина как у чата */
    z-index: 1001;
    padding: 15px 20px;
}
/* Если есть сайдбар на ПК, смещаем чат чуть правее центра */
@media (min-width: 992px) {
    .chat-wrapper, .chat-input-area {
        margin-left: 140px; /* Половина ширины сайдбара для идеального баланса */
    }
}

/* SIDEBAR ПК */
.desktop-sidebar { width: 280px; background: var(--bg-card); border-right: 1px solid var(--border); padding: 35px 25px; flex-direction: column; position: sticky; top: 0; height: 100vh; }
.logo-circle-adam { width: 40px; height: 40px; border-radius: 12px; background: #004e92; color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.2rem; }
.brand-name-adam { font-weight: 800; font-size: 1.2rem; color: var(--text-main); margin-left: 10px; }
.sidebar-link { display: flex; align-items: center; gap: 15px; padding: 14px 18px; border-radius: 18px; cursor: pointer; color: #718096; font-weight: 600; transition: 0.3s; margin-bottom: 5px; }
.sidebar-link.active { background: #eef6ff; color: #004e92; }
.dark-theme .sidebar-link.active { background: rgba(0, 78, 146, 0.2); color: #0d6efd; }
.user-pill-desktop { display: flex; align-items: center; padding: 15px; background: var(--btn-light); border-radius: 20px; color: var(--text-main); }
.avatar-mini-circle { width: 32px; height: 32px; border-radius: 50%; background: #004e92; color: white; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; font-weight: bold; }

/* RECEIPT MODAL */
.receipt-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(10px); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; }
.receipt-paper { background: #fff; width: 100%; max-width: 340px; border-radius: 0 0 25px 25px; position: relative; }
.receipt-divider { border-top: 2px dashed #eee; }
.paid-stamp { border: 3px solid #198754; color: #198754; padding: 4px 12px; border-radius: 8px; font-weight: 900; display: inline-block; transform: rotate(-10deg); opacity: 0.8; }
.receipt-edge { height: 10px; background: #fff; width: 100%; position: absolute; top: -10px; clip-path: polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%); }

.bg-header { background-color: var(--header-bg) !important; }
.bg-card { background-color: var(--bg-card) !important; }
.text-main { color: var(--text-main) !important; }
.btn-light-custom { background-color: var(--btn-light); border: none; color: var(--text-main); }
.ls-1 { letter-spacing: 1px; }
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>