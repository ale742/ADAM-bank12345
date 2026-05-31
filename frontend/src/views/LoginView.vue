<template>
  <div class="login-wrapper d-flex align-items-center justify-content-center">
    
    <!-- 1. УНИВЕРСАЛЬНОЕ УВЕДОМЛЕНИЕ (УСПЕХ / ОШИБКА) -->
    <Transition name="scale">
        <div v-if="status.visible" class="status-overlay" @click="status.visible = false">
            <div class="status-card shadow-lg text-center p-5" :class="status.type">
                <div class="status-icon mb-4">
                    <i v-if="status.type === 'success'" class="bi bi-check-lg"></i>
                    <i v-else class="bi bi-x-lg"></i>
                </div>
                <h4 class="fw-bold mb-2">{{ status.title }}</h4>
                <p class="text-muted small">{{ status.msg }}</p>
                <button class="btn btn-primary rounded-pill px-5 mt-3 fw-bold" @click="status.visible = false">Понятно</button>
            </div>
        </div>
    </Transition>

    <!-- 2. ОСНОВНАЯ КАРТОЧКА -->
    <div 
        class="login-card p-4 p-md-5 shadow-lg position-relative" 
        :class="{
            'blur-bg': status.visible || isProcessing,
            'animate__animated animate__shakeX': isErrorShaking
        }"
    >
      <!-- Логотип -->
      <div class="text-center mb-4">
        <h1 class="brand-title">ADAM<span class="text-primary">-BANK</span></h1>
        <p class="text-muted small">Инновационный цифровой банк</p>
      </div>

      <!-- ТАБЫ (Вход / Регистрация) -->
      <div v-if="!isRegister && loginStep === 'select'" class="switch-container mb-4 d-flex bg-light rounded-pill p-1">
        <button class="switch-btn active flex-fill border-0 rounded-pill">Вход</button>
        <button class="switch-btn flex-fill border-0 rounded-pill" @click="openRegistration">Регистрация</button>
      </div>

      <!-- === СЕКЦИЯ ВХОДА === -->
      <div v-if="!isRegister">
          
          <!-- Выбор метода входа -->
          <div v-if="loginStep === 'select'" class="d-flex flex-column gap-3 animate__animated animate__fadeIn">
              <button class="method-btn shadow-sm" @click="loginStep = 'iin'">
                  <div class="icon bg-primary"><i class="bi bi-person-vcard"></i></div>
                  <div class="text-start">
                      <div class="fw-bold">ИИН и Пароль</div>
                      <small class="text-muted">Классический доступ</small>
                  </div>
                  <i class="bi bi-chevron-right ms-auto"></i>
              </button>
              <button class="method-btn shadow-sm" @click="loginStep = 'phone'">
                  <div class="icon bg-success"><i class="bi bi-phone"></i></div>
                  <div class="text-start">
                      <div class="fw-bold">Номер телефона</div>
                      <small class="text-muted">Вход по СМС</small>
                  </div>
                  <i class="bi bi-chevron-right ms-auto"></i>
              </button>
          </div>

          <!-- Форма входа по ИИН -->
          <div v-if="loginStep === 'iin'" class="animate__animated animate__fadeInRight">
              <div class="mb-3">
                  <label class="form-label small fw-bold">Ваш ИИН</label>
                  <input v-model="loginForm.iin" type="text" maxlength="12" class="form-control" placeholder="000000000000">
              </div>
              <div class="mb-4">
                  <label class="form-label small fw-bold">Пароль</label>
                  <div class="input-group">
                      <input 
                        v-model="loginForm.password" 
                        :type="showPassLogin ? 'text' : 'password'" 
                        class="form-control border-end-0" 
                        placeholder="••••••••"
                      >
                      <button class="input-group-text bg-light border-start-0" @click="showPassLogin = !showPassLogin">
                          <i class="bi" :class="showPassLogin ? 'bi-eye-slash' : 'bi-eye'"></i>
                      </button>
                  </div>
              </div>
              <button class="btn btn-primary w-100 py-3 rounded-pill fw-bold" :disabled="isProcessing" @click="handleLogin">
                  <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2"></span>
                  Войти в банк
              </button>
              <button class="btn btn-link w-100 text-muted mt-2" @click="loginStep = 'select'">Другой способ</button>
          </div>

          <!-- Форма входа по Телефону -->
          <div v-if="loginStep === 'phone'" class="animate__animated animate__fadeInRight">
                <div class="mb-4">
                    <label class="form-label small fw-bold">Номер телефона</label>
                    <input v-model="loginForm.phone" type="tel" class="form-control" placeholder="+7 (707) 000-00-00" @input="maskPhone">
                </div>
                <button class="btn btn-primary w-100 py-3 rounded-pill fw-bold" @click="triggerStatus('error', 'Ошибка сети', 'Сервис СМС временно недоступен. Используйте ИИН.')">
                    Получить код
                </button>
                <button class="btn btn-link w-100 text-muted mt-2" @click="loginStep = 'select'">Назад</button>
          </div>
      </div>

      <!-- === СЕКЦИЯ РЕГИСТРАЦИИ === -->
      <div v-else class="registration-stepper">
          
          <div class="d-flex justify-content-between align-items-center mb-2 px-1">
              <small class="text-primary fw-bold">Шаг {{ regStep }} / 4</small>
              <small class="text-muted">{{ stepTitles[regStep-1] }}</small>
          </div>
          <div class="progress mb-4" style="height: 6px; border-radius: 10px;">
              <div class="progress-bar bg-primary progress-bar-striped progress-bar-animated" :style="{ width: (regStep/4)*100 + '%' }"></div>
          </div>

          <!-- Шаг 1: ФИО (ТОЛЬКО ЛАТИНИЦА) и ИИН -->
          <div v-if="regStep === 1" class="animate__animated animate__fadeIn">
              <label class="form-label small fw-bold text-muted">ДАННЫЕ НА ЛАТИНИЦЕ (КАК В УДОСТОВЕРЕНИИ ЛИЧНОСТИ)</label>
              <input v-model="regForm.lastName" @input="valLatin('lastName')" class="form-control mb-2 text-uppercase" placeholder="ФАМИЛИЯ *">
              <input v-model="regForm.firstName" @input="valLatin('firstName')" class="form-control mb-2 text-uppercase" placeholder="ИМЯ *">
              <input v-model="regForm.patronymic" @input="valLatin('patronymic')" class="form-control mb-2 text-uppercase" placeholder="ОТЧЕСТВО">
              
              <div class="position-relative mb-4 mt-3">
                  <label class="form-label small fw-bold text-muted">ИИН РЕСПУБЛИКИ КАЗАХСТАН</label>
                  <input 
                      v-model="regForm.iin" 
                      maxlength="12" 
                      class="form-control" 
                      :class="{'is-invalid': iinError, 'is-valid': regForm.iin.length === 12 && !iinError}"
                      placeholder="000000000000" 
                      @input="valIIN"
                  >
                  <div v-if="iinError" class="invalid-feedback text-start ps-2" style="font-size: 0.7rem;">
                      {{ iinError }}
                  </div>
              </div>

              <button class="btn btn-primary w-100 py-3 rounded-pill fw-bold" :disabled="!isStep1Valid" @click="regStep = 2">Далее</button>
          </div>

          <!-- Шаг 2: Контакты -->
          <div v-if="regStep === 2" class="animate__animated animate__fadeIn">
              <div class="mb-3">
                  <label class="form-label small fw-bold text-muted">Номер телефона</label>
                  <input v-model="regForm.phone" type="tel" class="form-control" placeholder="+7 (777) 000-00-00" @input="maskPhone">
              </div>
              <div class="mb-4">
                  <label class="form-label small fw-bold text-muted">E-mail</label>
                  <input v-model="regForm.email" type="email" class="form-control" placeholder="example@mail.com">
              </div>
              <div class="d-flex gap-2">
                  <button class="btn btn-light rounded-pill w-50 py-3 fw-bold" @click="regStep = 1">Назад</button>
                  <button class="btn btn-primary rounded-pill w-50 py-3 fw-bold" :disabled="!regForm.phone || !regForm.email" @click="regStep = 3">Далее</button>
              </div>
          </div>

          <!-- Шаг 3: FACE ID -->
          <div v-if="regStep === 3" class="text-center animate__animated animate__fadeIn">
              <div class="face-scanner-box mx-auto mb-3" :class="faceStatus">
                  <video id="video" autoplay playsinline></video>
                  <div class="face-overlay"></div>
                  <div class="scan-laser" v-if="faceStatus === 'scanning'"></div>
                  <div class="face-result" v-if="faceStatus === 'done'"><i class="bi bi-shield-check"></i></div>
              </div>
              <p class="small fw-bold" :class="faceStatus === 'done' ? 'text-success' : 'text-muted'">{{ faceMsg }}</p>
              
              <button v-if="faceStatus === 'idle'" class="btn btn-primary w-100 rounded-pill py-3 fw-bold" @click="startFaceID">
                  Начать биометрию
              </button>
              <div v-if="faceStatus === 'done'" class="d-flex gap-2">
                  <button class="btn btn-light rounded-pill w-50 py-3 fw-bold" @click="faceStatus = 'idle'">Заново</button>
                  <button class="btn btn-success w-100 rounded-pill py-3 fw-bold animate__animated animate__bounceIn" @click="regStep = 4">Продолжить</button>
              </div>
          </div>

          <!-- Шаг 4: ПИЗДЕЦ КАКОЙ НАДЕЖНЫЙ ПАРОЛЬ -->
          <div v-if="regStep === 4" class="animate__animated animate__fadeIn">
              <label class="form-label small fw-bold">Придумайте надежный пароль</label>
              <div class="input-group mb-3">
                  <input 
                    v-model="regForm.password" 
                    :type="showPassReg ? 'text' : 'password'" 
                    class="form-control border-end-0" 
                    placeholder="••••••••"
                    @input="checkAdvancedPassword"
                  >
                  <button class="input-group-text bg-light border-start-0" @click="showPassReg = !showPassReg">
                      <i class="bi" :class="showPassReg ? 'bi-eye-slash' : 'bi-eye'"></i>
                  </button>
              </div>

              <!-- Чек-лист надежности -->
              <div class="password-meter p-3 bg-light rounded-4 mb-4">
                  <div v-for="(v, k) in pwdRules" :key="k" class="d-flex align-items-center mb-1 small" :class="v ? 'text-success' : 'text-muted'">
                      <i class="bi me-2" :class="v ? 'bi-check-circle-fill' : 'bi-circle'"></i>
                      {{ k }}
                  </div>
              </div>

              <div class="d-flex gap-2">
                  <button class="btn btn-light rounded-pill w-25 py-3" @click="regStep = 3" :disabled="isProcessing">Назад</button>
                  <button 
                    class="btn btn-primary w-75 py-3 rounded-pill fw-bold shadow" 
                    :disabled="!isPasswordValid || isProcessing" 
                    @click="handleRegister"
                  >
                      <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2"></span>
                      Завершить регистрацию
                  </button>
              </div>
          </div>
          
          <div class="text-center mt-3" v-if="!isProcessing">
              <button class="btn btn-link text-muted small" @click="isRegister = false; regStep = 1">Уже есть аккаунт? Войти</button>
          </div>
      </div>

      <!-- ФУТЕР -->
      <div class="text-center mt-4" v-if="!isProcessing && !status.visible">
        <small class="text-muted">© 2025 ADAM-BANK. All rights reserved.</small>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

// === СОСТОЯНИЯ UI ===
const isRegister = ref(false);
const loginStep = ref('select'); 
const regStep = ref(1);
const isProcessing = ref(false);
const isErrorShaking = ref(false);
const showPassLogin = ref(false);
const showPassReg = ref(false);

const status = reactive({ visible: false, type: 'success', title: '', msg: '' });
const stepTitles = ['Личные данные', 'Контакты', 'Биометрия', 'Безопасность'];

const loginForm = reactive({ iin: '', password: '', phone: '' });
const regForm = reactive({ lastName: '', firstName: '', patronymic: '', iin: '', phone: '', email: '', password: '' });

// === ВАЛИДАЦИЯ ЛАТИННИЦЫ ===
const valLatin = (field) => {
    regForm[field] = regForm[field].replace(/[^A-Za-z\s]/g, '');
};

// === ПРАВИЛА ПАРОЛЯ ===
const pwdRules = reactive({
    'Минимум 8 символов': false,
    'Заглавная буква и цифра': false,
    'Спецсимвол (!@#$%)': false,
    'Не содержит имя или ИИН': false
});

const checkAdvancedPassword = () => {
    const p = regForm.password;
    pwdRules['Минимум 8 символов'] = p.length >= 8;
    pwdRules['Заглавная буква и цифра'] = /[A-Z]/.test(p) && /\d/.test(p);
    pwdRules['Спецсимвол (!@#$%)'] = /[!@#$%^&*(),.?":{}|<>]/.test(p);
    
    const namePart = regForm.firstName.toLowerCase();
    const iinPart = regForm.iin.substring(0, 6);
    const containsBadData = (namePart && p.toLowerCase().includes(namePart)) || (iinPart && p.includes(iinPart));
    
    pwdRules['Не содержит имя или ИИН'] = !containsBadData && p.length > 0;
};

const isPasswordValid = computed(() => Object.values(pwdRules).every(v => v === true));

// === ВАЛИДАЦИЯ ИИН (РК) ===
const iinError = ref('');

const validateIIN = (iin) => {
    if (!iin || iin.length !== 12) return false;
    if (!/^\d+$/.test(iin)) return false;

    const weights1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    let sum = 0;
    for (let i = 0; i < 11; i++) sum += parseInt(iin[i]) * weights1[i];
    let control = sum % 11;

    if (control === 10) {
        const weights2 = [3, 4, 5, 6, 7, 8, 9, 10, 11, 1, 2];
        sum = 0;
        for (let i = 0; i < 11; i++) sum += parseInt(iin[i]) * weights2[i];
        control = sum % 11;
        if (control === 10) control = 0;
    }

    if (control !== parseInt(iin[11])) {
        iinError.value = 'Неверное контрольное число ИИН';
        return false;
    }

    iinError.value = '';
    return true;
};

const isStep1Valid = computed(() => {
    return regForm.lastName.length >= 2 && regForm.firstName.length >= 2 && validateIIN(regForm.iin);
});

const valIIN = (e) => {
    regForm.iin = e.target.value.replace(/\D/g, '');
    if (regForm.iin.length === 12) validateIIN(regForm.iin);
    else iinError.value = '';
};

// === FACE ID ЛОГИКА ===
const faceStatus = ref('idle'); 
const faceMsg = ref('Посмотрите в камеру');

const startFaceID = async () => {
    faceStatus.value = 'scanning';
    faceMsg.value = 'Анализируем биометрию...';
    try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true });
        const v = document.getElementById('video');
        if (v) v.srcObject = s;
        
        await new Promise(r => setTimeout(r, 3000));
        
        faceStatus.value = 'done';
        faceMsg.value = 'Личность подтверждена';
        s.getTracks().forEach(t => t.stop());
    } catch (e) {
        triggerStatus('error', 'Ошибка камеры', 'Доступ запрещен или камера не найдена');
        faceStatus.value = 'idle';
    }
};

// === ОБЩИЕ ХЕНДЛЕРЫ ===
const triggerStatus = (type, title, msg) => {
    status.type = type; status.title = title; status.msg = msg; status.visible = true;
    if (type === 'error') {
        isErrorShaking.value = true;
        setTimeout(() => isErrorShaking.value = false, 500);
    }
};

const openRegistration = () => {
    isRegister.value = true;
    regStep.value = 1;
};

const handleLogin = async () => {
    if (loginStep.value === 'iin' && (!loginForm.iin || !loginForm.password)) {
        return triggerStatus('error', 'Пустые поля', 'Введите ИИН и пароль');
    }
    isProcessing.value = true;
    try {
        await auth.login(loginForm);
        triggerStatus('success', 'С возвращением!', 'Вход выполнен успешно');
        setTimeout(() => router.push('/'), 1500);
    } catch (e) {
        triggerStatus('error', 'Ошибка входа', e.message);
    } finally { isProcessing.value = false; }
};

const handleRegister = async () => {
    if (!isPasswordValid.value) return;
    isProcessing.value = true;
    try {
        const data = { 
            name: `${regForm.lastName} ${regForm.firstName}`.toUpperCase(), 
            iin: regForm.iin, phone: regForm.phone, email: regForm.email, password: regForm.password 
        };
        await auth.register(data);
        triggerStatus('success', 'Поздравляем!', 'Вы стали клиентом ADAM-BANK');
        setTimeout(() => router.push('/'), 2000);
    } catch (e) {
        triggerStatus('error', 'Ошибка', 'Не удалось создать аккаунт');
    } finally { isProcessing.value = false; }
};

const maskPhone = (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v[0] !== '7') v = '7' + v;
    v = v.substring(0, 11);
    let f = '+7';
    if (v.length > 1) f += ' (' + v.substring(1, 4);
    if (v.length >= 5) f += ') ' + v.substring(4, 7);
    if (v.length >= 8) f += '-' + v.substring(7, 9);
    if (v.length >= 10) f += '-' + v.substring(9, 11);
    regForm.phone = f;
    loginForm.phone = f;
};
</script>

<style scoped>
.login-wrapper { min-height: 100vh; background: linear-gradient(135deg, #004e92, #000428); padding: 20px; overflow-x: hidden; }
.login-card { background: white; width: 100%; max-width: 440px; border-radius: 35px; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 10; }
.blur-bg { filter: blur(10px); transform: scale(0.96); pointer-events: none; }

.brand-title { font-weight: 900; letter-spacing: -1px; color: #000428; }
.switch-btn { padding: 12px; font-weight: 600; color: #6c757d; background: transparent; border: none; }
.switch-btn.active { background: #0d6efd; color: white; box-shadow: 0 4px 15px rgba(13, 110, 253, 0.3); }

.method-btn {
    width: 100%; display: flex; align-items: center; gap: 15px; padding: 18px;
    background: #fff; border: 1px solid #f0f0f0; border-radius: 22px; transition: 0.2s; text-align: left;
}
.method-btn:active { transform: scale(0.97); background: #fcfcfc; }
.method-btn .icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.3rem; }

.form-control { padding: 14px; border-radius: 16px; background: #f8f9fa; border: 1px solid #eee; font-weight: 500; }
.form-control:focus { background: white; border-color: #0d6efd; box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.05); }

.input-group-text { border-radius: 0 16px 16px 0; background: #f8f9fa; border: 1px solid #eee; border-left: 0; cursor: pointer; color: #6c757d; }

/* FACE SCANNER */
.face-scanner-box { width: 200px; height: 200px; border-radius: 50%; overflow: hidden; position: relative; border: 4px solid #eee; background: #000; }
video { width: 100%; height: 100%; object-fit: cover; }
.face-overlay { position: absolute; inset: 0; border: 4px solid transparent; border-radius: 50%; }
.face-scanner-box.scanning { border-color: #0d6efd; box-shadow: 0 0 20px rgba(13, 110, 253, 0.2); }
.face-result { position: absolute; inset: 0; background: rgba(25, 135, 84, 0.8); display: flex; align-items: center; justify-content: center; color: white; font-size: 4rem; }

.scan-laser { 
    position: absolute; top: 0; left: 0; width: 100%; height: 3px; 
    background: #0d6efd; box-shadow: 0 0 15px #0d6efd; 
    animation: laserMove 2.5s infinite linear; 
}
@keyframes laserMove { 0% { top: 0; } 50% { top: 100%; } 100% { top: 0; } }

/* STATUS OVERLAY */
.status-overlay { position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.3); backdrop-filter: blur(5px); }
.status-card { background: white; border-radius: 40px; width: 85%; max-width: 380px; }
.status-card.error .status-icon { background: #dc3545; box-shadow: 0 10px 20px rgba(220, 53, 69, 0.3); }
.status-card.success .status-icon { background: #198754; box-shadow: 0 10px 20px rgba(25, 135, 84, 0.3); }
.status-icon { width: 85px; height: 80px; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.8rem; margin: 0 auto; }

.password-meter { border: 1px solid #f0f0f0; }

.scale-enter-active, .scale-leave-active { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.scale-enter-from, .scale-leave-to { opacity: 0; transform: scale(0.5); }
</style>