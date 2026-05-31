<template>
  <div class="app-layout" :class="{ 'dark-theme': auth.isDarkMode }">
    <div class="page-wrapper">
        <div class="header d-flex align-items-center px-4 py-3 bg-header fixed-top">
            <button @click="$router.back()" class="btn btn-light-custom rounded-circle me-3 back-btn">
                <i class="bi bi-arrow-left"></i>
            </button>
            <h5 class="mb-0 fw-bold text-main">Кредит онлайн</h5>
        </div>

        <div class="container content-area pt-5 mt-4">
            <!-- ЭТАП 1: КАЛЬКУЛЯТОР -->
            <div v-if="step === 'calc'" class="animate__animated animate__fadeIn">
                <div class="bg-card rounded-5 p-4 shadow-sm mb-4">
                    <label class="form-label small fw-bold text-muted ls-1">СУММА</label>
                    <h1 class="display-5 fw-bold text-main mb-3">{{ formatMoney(loanAmount) }} ₸</h1>
                    <input type="range" class="form-range mb-4" min="100000" max="5000000" step="50000" v-model="loanAmount">
                    
                    <label class="form-label small fw-bold text-muted ls-1">СРОК (МЕСЯЦЕВ)</label>
                    <div class="d-flex gap-2 mb-4 overflow-auto no-scrollbar pb-2">
                        <button v-for="m in [6, 12, 24, 36, 48, 60]" :key="m" 
                                class="btn flex-fill rounded-4 py-2 fw-bold transition-all"
                                :class="loanMonths == m ? 'btn-primary' : 'btn-light-custom'"
                                @click="loanMonths = m">
                            {{ m }}
                        </button>
                    </div>

                    <div class="p-4 rounded-4 bg-primary bg-opacity-10 border-blue-soft">
                        <div class="d-flex justify-content-between mb-2">
                            <span class="text-muted small">Ежемесячный платеж:</span>
                            <span class="fw-bold text-primary fs-5">{{ formatMoney(monthlyPayment) }} ₸</span>
                        </div>
                        <div class="d-flex justify-content-between">
                            <span class="text-muted small">Процентная ставка:</span>
                            <span class="fw-bold text-main">{{ currentRate }}%</span>
                        </div>
                    </div>
                </div>
                <button class="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-lg" @click="step = 'face'">
                    Далее
                </button>
            </div>

            <!-- ЭТАП 2: ADAM-BOT АНАЛИЗ -->
            <div v-if="step === 'bot'" class="animate__animated animate__fadeIn text-center py-5">
                <div class="bot-container mb-4">
                    <div class="bot-brain">
                        <div class="brain-wave"></div>
                        <i class="bi bi-robot display-1 text-primary"></i>
                    </div>
                </div>
                <h4 class="fw-bold text-main">{{ botStatus }}</h4>
                <p class="text-muted small px-4">{{ botSubText }}</p>
                
                <!-- Лоадер анализа -->
                <div v-if="botLoading" class="progress w-75 mx-auto mt-4" style="height: 6px;">
                    <div class="progress-bar progress-bar-striped progress-bar-animated bg-primary" :style="{width: botProgress + '%'}"></div>
                </div>
            </div>
        </div>

        <!-- FACE ID (ФИКС ЦЕНТРА) -->
        <Transition name="fade">
            <div v-if="step === 'face'" class="face-id-ios-overlay">
                <div class="face-id-wrapper">
                    <div class="face-id-scanner">
                        <div class="scanner-corner top-left"></div><div class="scanner-corner top-right"></div>
                        <div class="scanner-corner bottom-left"></div><div class="scanner-corner bottom-right"></div>
                        <div class="face-icon-ios"><i class="bi bi-person-bounding-box"></i></div>
                        <div class="scan-line-ios-blue"></div>
                    </div>
                    <h5 class="mt-4 text-white fw-bold">Подтвердите личность</h5>
                    <button class="btn btn-primary rounded-pill px-5 mt-4 fw-bold" @click="runBotAnalysis">Сканировать</button>
                </div>
            </div>
        </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

const step = ref('calc'); // calc, face, bot
const loanAmount = ref(500000);
const loanMonths = ref(12);

// Бот логика
const botStatus = ref('Adam-bot изучает данные...');
const botSubText = ref('Проверяем ИИН в базе кредитных историй и вашу платежеспособность.');
const botLoading = ref(true);
const botProgress = ref(0);

const currentRate = computed(() => {
    if (loanMonths.value <= 6) return 15;
    if (loanMonths.value <= 12) return 18;
    if (loanMonths.value <= 36) return 22;
    return 25;
});

const monthlyPayment = computed(() => {
    const total = Number(loanAmount.value) * (1 + (currentRate.value / 100));
    return Math.round(total / Number(loanMonths.value));
});

const runBotAnalysis = () => {
    step.value = 'bot';
    let interval = setInterval(() => {
        botProgress.value += 5;
        if (botProgress.value === 40) {
            botStatus.value = "Проверка пенсионных отчислений...";
        }
        if (botProgress.value === 70) {
            botStatus.value = "Почти готово, Adam-bot одобряет...";
        }
        if (botProgress.value >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                auth.applyLoan({ amount: loanAmount.value, months: loanMonths.value });
                router.push('/loan');
            }, 1000);
        }
    }, 150);
};

const formatMoney = (v) => new Intl.NumberFormat('ru-RU').format(v);
const formatMoneyNoCur = (v) => new Intl.NumberFormat('ru-RU').format(v);
</script>

<style scoped>
.border-blue-soft { border: 1px solid rgba(13, 110, 253, 0.2); }
.bot-brain { position: relative; width: 120px; height: 120px; margin: 0 auto; }
.brain-wave {
    position: absolute; inset: -20px;
    border: 2px solid #0d6efd; border-radius: 50%;
    animation: pulse-wave 2s infinite;
}
@keyframes pulse-wave { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(1.5); opacity: 0; } }

/* FACE ID FIXED */
.face-id-ios-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.95);
    display: flex; align-items: center; justify-content: center; z-index: 9999;
}
.face-id-wrapper { display: flex; flex-direction: column; align-items: center; }
.face-id-scanner { width: 200px; height: 200px; position: relative; display: flex; align-items: center; justify-content: center; }
.scanner-corner { position: absolute; width: 40px; height: 40px; border: 4px solid #0d6efd; border-radius: 15px; }
.top-left { top:0; left:0; border-right:0; border-bottom:0; }
.top-right { top:0; right:0; border-left:0; border-bottom:0; }
.bottom-left { bottom:0; left:0; border-right:0; border-top:0; }
.bottom-right { bottom:0; right:0; border-left:0; border-top:0; }
.face-icon-ios { font-size: 6rem; color: #0d6efd; }
.scan-line-ios-blue {
    position: absolute; width: 80%; height: 3px; background: #0d6efd;
    box-shadow: 0 0 20px #0d6efd; animation: scanMove 2s infinite ease-in-out;
}
@keyframes scanMove { 0%, 100% { top: 20%; } 50% { top: 80%; } }
</style>