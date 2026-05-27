<template>
  <div class="page-wrapper">
    <!-- УВЕДОМЛЕНИЕ (Твой стиль) -->
    <Transition name="scale">
      <div v-if="status.visible" class="status-overlay" @click="status.visible = false">
        <div class="status-card shadow-lg text-center p-5" :class="status.type">
          <div class="status-icon mb-4">
            <i :class="status.type === 'success' ? 'bi bi-check-lg' : 'bi bi-exclamation-triangle'"></i>
          </div>
          <h4 class="fw-bold mb-2">{{ status.title }}</h4>
          <p class="text-muted small">{{ status.msg }}</p>
          <button class="btn btn-primary rounded-pill px-5 mt-3" @click="status.visible = false">Понятно</button>
        </div>
      </div>
    </Transition>

    <div class="header d-flex align-items-center px-4 py-3 bg-white shadow-sm fixed-top">
      <router-link to="/my-bank" class="btn btn-light rounded-circle shadow-sm me-3 back-btn"><i class="bi bi-arrow-left"></i></router-link>
      <h5 class="mb-0 fw-bold">Выбор депозита</h5>
    </div>

    <div class="container pt-5 mt-5 pb-5">
      <div class="row g-3">
        <!-- ТРИ ВАРИАНТА -->
        <div class="col-12" v-for="opt in depositOptions" :key="opt.type" @click="selectedType = opt">
          <div class="deposit-option-card p-4 rounded-5 shadow-lg border-0 transition-all position-relative overflow-hidden text-white" 
               :class="selectedType?.type === opt.type ? 'active-opt' : 'bank-blue-bg'">
            
            <div class="card-decor-circle"></div>

            <div class="d-flex justify-content-between align-items-start mb-3 position-relative z-2">
              <div class="icon-box-dep-white"><i :class="opt.icon"></i></div>
              <div class="text-end">
                <div class="fw-bold fs-4">{{ opt.rate }}%</div>
                <small class="opacity-75">годовых</small>
              </div>
            </div>
            
            <h5 class="fw-bold mb-2 position-relative z-2">{{ opt.name }}</h5>
            <p class="small opacity-75 mb-0 position-relative z-2">{{ opt.desc }}</p>
          </div>
        </div>
      </div>

      <!-- ФОРМА ВВОДА -->
      <div v-if="selectedType" class="mt-4 animate__animated animate__fadeInUp">
          <div class="bg-white p-4 rounded-5 shadow-sm mb-4">
              <label class="form-label small fw-bold text-muted text-uppercase ls-1">Сумма открытия</label>
              <div class="d-flex align-items-baseline gap-2">
                  <input v-model="amount" type="number" class="form-control border-0 fs-1 fw-bold p-0 shadow-none" placeholder="0">
                  <span class="fs-2 fw-bold text-primary">₸</span>
              </div>
              <div class="d-flex justify-content-between mt-2">
                  <small class="text-muted">На карте: {{ formatMoney(auth.user.balance) }} ₸</small>
                  <small v-if="amount > auth.user.balance" class="text-danger fw-bold">Недостаточно средств</small>
              </div>
          </div>
          <button class="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-lg custom-btn-main" 
                  :disabled="!amount || amount > auth.user.balance" 
                  @click="startFaceID">
              Открыть за пару секунд
          </button>
      </div>
    </div>

    <!-- FACE ID (ИСПРАВЛЕНА ЦЕНТРОВКА) -->
    <Transition name="fade">
        <div v-if="isVerifying" class="face-id-ios-overlay">
            <div class="face-id-container-centered">
                <div class="face-id-scanner">
                    <div class="scanner-corner top-left"></div><div class="scanner-corner top-right"></div>
                    <div class="scanner-corner bottom-left"></div><div class="scanner-corner bottom-right"></div>
                    <div class="face-icon-ios"><i class="bi bi-person-bounding-box"></i></div>
                    <div class="scan-line-ios-blue"></div>
                </div>
                <h5 class="mt-4 text-white fw-bold">Face ID</h5>
                <p class="text-white-50 small">Подтверждение операции...</p>
            </div>
        </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

const selectedType = ref(null);
const amount = ref(1000);
const isVerifying = ref(false);
const status = reactive({ visible: false, type: 'success', title: '', msg: '' });

const depositOptions = [
    { type: 'flexible', name: 'Накопительный 18%', rate: 18, desc: 'Снимайте и пополняйте когда угодно без потери процентов. Минимальный остаток 1000 ₸. Нужно пополнить в течение 3 дней.', icon: 'bi-unlock-fill' },
    { type: 'strict', name: 'Накопительный 22%', rate: 22, desc: 'Без снятия до конца срока. Максимальная выгода для накоплений.Минимальный остаток 1000 ₸. Нужно пополнить в течение 3 дней.', icon: 'bi-shield-lock-fill' },
    { type: 'family', name: 'Семейный 20%', rate: 20, desc: 'Общий счет с доступом для ваших близких.Минимальный остаток 1000 ₸. Нужно пополнить в течение 3 дней.', icon: 'bi-people-fill' }
];

const formatMoney = (v) => new Intl.NumberFormat('ru-RU').format(v);

const triggerStatus = (type, title, msg) => {
    Object.assign(status, { visible: true, type, title, msg });
};

// ФУНКЦИЯ С ИСПРАВЛЕННЫМ РОУТИНГОМ ПО ID
const startFaceID = () => {
    isVerifying.value = true;
    setTimeout(() => {
        try {
            // Создаем уникальный ID прямо сейчас
            const newDepId = Date.now();

            auth.openDeposit({
                id: newDepId, // Передаем ID в стор
                amount: amount.value,
                type: selectedType.value.type,
                rate: selectedType.value.rate,
                title: selectedType.value.name
            });

            isVerifying.value = false;
            triggerStatus('success', 'Успешно!', 'Ваш депозит открыт.');

            // ПЕРЕХОД ПО КОНКРЕТНОМУ ID (Чтобы не было белого экрана)
            setTimeout(() => {
                router.push(`/deposits/${newDepId}`);
            }, 2000);

        } catch (e) {
            isVerifying.value = false;
            triggerStatus('error', 'Ошибка', e.message);
        }
    }, 3000);
};
</script>

<style scoped>
.page-wrapper { min-height: 100vh; background: #f6f8fb; }
.header { z-index: 1000; text-align: center; }
.back-btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: none; }

.bank-blue-bg { background: linear-gradient(135deg, #004e92 0%, #000428 100%); }
.deposit-option-card { border: 2px solid transparent; cursor: pointer; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.active-opt { background: linear-gradient(135deg, #005bb5 0%, #00124d 100%); box-shadow: 0 15px 30px rgba(0, 78, 146, 0.4) !important; transform: scale(1.03); border: 2px solid #0d6efd !important; }
.card-decor-circle { position: absolute; top: -20%; right: -10%; width: 150px; height: 150px; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%); z-index: 1; }
.icon-box-dep-white { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.15); font-size: 1.4rem; }
.ls-1 { letter-spacing: 1px; }

.face-id-ios-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 9999; display: flex; align-items: center; justify-content: center; }
.face-id-container-centered { display: flex; flex-direction: column; align-items: center; justify-content: center; }
.face-id-scanner { width: 180px; height: 180px; position: relative; display: flex; align-items: center; justify-content: center; }
.scanner-corner { position: absolute; width: 35px; height: 35px; border: 4px solid #0d6efd; border-radius: 15px; }
.top-left { top: 0; left: 0; border-right: 0; border-bottom: 0; }
.top-right { top: 0; right: 0; border-left: 0; border-bottom: 0; }
.bottom-left { bottom: 0; left: 0; border-right: 0; border-top: 0; }
.bottom-right { bottom: 0; right: 0; border-left: 0; border-top: 0; }
.face-icon-ios { font-size: 5.5rem; color: #0d6efd; opacity: 0.9; }
.scan-line-ios-blue { position: absolute; width: 90%; height: 2px; background: #0d6efd; box-shadow: 0 0 20px #0d6efd; animation: scanIos 2.5s infinite ease-in-out; }
@keyframes scanIos { 0% { top: 15%; opacity: 0; } 50% { top: 85%; opacity: 1; } 100% { top: 15%; opacity: 0; } }

.status-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); z-index: 5000; display: flex; align-items: center; justify-content: center; }
.status-card { background: white; border-radius: 40px; width: 85%; max-width: 380px; border: none; }
.status-icon { width: 85px; height: 85px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.8rem; margin: 0 auto; }
.status-card.success .status-icon { background: #198754; color: white; }
.status-card.error .status-icon { background: #dc3545; color: white; }

.custom-btn-main { transition: all 0.3s; }
.custom-btn-main:active { transform: scale(0.96); }
.scale-enter-active, .scale-leave-active { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.scale-enter-from, .scale-leave-to { opacity: 0; transform: scale(0.5); }
</style>