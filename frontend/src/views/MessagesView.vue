<template>
  <div class="app-layout" :class="{ 'dark-theme': auth.isDarkMode }">
    
    <!-- SIDEBAR ДЛЯ ПК -->
    <aside class="desktop-sidebar d-none d-lg-flex">
      <!-- (Твой стандартный сайдбар, как в Истории) -->
    </aside>

    <div class="main-wrapper">
      
      <!-- ЦИФРОВОЙ ЧЕК (Модалка) -->
      <Transition name="fade">
          <div v-if="selectedReceipt" class="receipt-overlay" @click.self="selectedReceipt = null">
              <div class="receipt-paper animate__animated animate__slideInUp">
                  <div class="receipt-edge"></div>
                  <div class="p-4 text-center">
                      <h5 class="fw-bold mb-0">ADAM BANK</h5>
                      <small class="text-muted">Электронный чек</small>
                      <div class="receipt-divider my-3"></div>
                      <h2 class="fw-bold">{{ formatMoney(selectedReceipt.amount) }} ₸</h2>
                      <p class="text-muted small">{{ selectedReceipt.provider || 'Перевод' }}</p>
                      
                      <div class="text-start mt-4 small">
                          <div class="d-flex justify-content-between mb-1"><span>Дата:</span><b>{{ currentDateTime() }}</b></div>
                          <div class="d-flex justify-content-between"><span>Статус:</span><b class="text-success">Успешно</b></div>
                      </div>

                      <div class="d-flex gap-2 mt-4">
                          <button class="btn btn-light flex-fill rounded-pill" @click="shareReceipt">
                              <i class="bi bi-share"></i>
                          </button>
                          <button class="btn btn-primary flex-fill rounded-pill fw-bold" @click="selectedReceipt = null">Закрыть</button>
                      </div>
                  </div>
              </div>
          </div>
      </Transition>

      <div class="header d-flex align-items-center px-4 py-3 bg-header fixed-top d-lg-none">
        <button @click="$router.push('/')" class="btn btn-light-custom rounded-circle me-3"><i class="bi bi-arrow-left"></i></button>
        <h5 class="mb-0 fw-bold text-main">Уведомления</h5>
      </div>

      <div class="container content-area pb-5">
        <div class="d-flex justify-content-between align-items-end mb-4">
            <h2 class="fw-bold m-0 text-main d-none d-lg-block">Сообщения</h2>
            <button class="btn btn-link text-primary p-0 fw-bold small text-decoration-none" @click="clearAll">Очистить всё</button>
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
                        
                        <!-- Кнопка чека если есть данные -->
                        <button v-if="n.extra" @click="selectedReceipt = n.extra" class="btn btn-light-custom btn-sm rounded-pill px-3 fw-bold">
                            <i class="bi bi-file-earmark-text me-1"></i> Чек
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="text-center py-5">
            <i class="bi bi-chat-left-dots display-1 text-muted opacity-25"></i>
            <h5 class="mt-3 text-muted fw-bold">Сообщений нет</h5>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const selectedReceipt = ref(null);

const getIcon = (type) => {
    return { transaction: 'bi-cash-stack', security: 'bi-shield-lock', info: 'bi-info-circle' }[type] || 'bi-bell';
};

const clearAll = () => { if(confirm('Удалить все сообщения?')) auth.notifications = []; localStorage.removeItem('notifications'); };
const formatMoney = (v) => new Intl.NumberFormat('ru-RU').format(v);
const currentDateTime = () => new Date().toLocaleString('ru-RU');

const shareReceipt = () => {
    if (navigator.share) {
        navigator.share({ title: 'Чек Adam Bank', text: 'Квитанция об оплате', url: window.location.href });
    } else {
        alert('Ссылка на чек скопирована!');
    }
};
</script>

<style scoped>
.content-area { padding-top: 100px; max-width: 700px; }
.notify-card { border-radius: 25px; transition: 0.3s; border: 1px solid var(--border); }
.notify-card.unread { border-left: 4px solid #004e92; }

.notify-icon-circle { 
    width: 45px; height: 45px; border-radius: 12px; 
    display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
}
.notify-icon-circle.transaction { background: rgba(25, 135, 84, 0.1); color: #198754; }
.notify-icon-circle.security { background: rgba(220, 53, 69, 0.1); color: #dc3545; }
.notify-icon-circle.info { background: rgba(0, 78, 146, 0.1); color: #004e92; }

/* RECEIPT CSS из прошлых уроков */
.receipt-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(10px); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; }
.receipt-paper { background: white; width: 100%; max-width: 340px; border-radius: 0 0 25px 25px; position: relative; color: #000; }
.receipt-edge { height: 10px; background: white; width: 100%; position: absolute; top: -10px; clip-path: polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%); }
.paid-stamp { border: 3px solid #198754; color: #198754; padding: 4px 12px; border-radius: 8px; font-weight: 900; display: inline-block; transform: rotate(-10deg); }
</style>