<template>
  <!-- Обертка на весь экран с синим фоном -->
  <div class="login-wrapper d-flex align-items-center justify-content-center">
    
    <div class="login-card p-4 p-md-5 shadow-lg">
      <!-- Логотип -->
      <div class="text-center mb-4">
        <h1 class="brand-title">ADAM<span class="text-primary">-BANK</span></h1>
        <p class="text-muted small">Твой надежный финансовый партнер</p>
      </div>

      <!-- Переключатель Вход / Регистрация -->
      <div class="switch-container mb-4 d-flex bg-light rounded-pill p-1">
        <a 
          href="#" 
          class="switch-btn flex-fill text-center rounded-pill text-decoration-none"
          :class="{ active: !isRegister }" 
          @click.prevent="isRegister = false"
        >
          Вход
        </a>
        <a 
          href="#" 
          class="switch-btn flex-fill text-center rounded-pill text-decoration-none"
          :class="{ active: isRegister }" 
          @click.prevent="isRegister = true"
        >
          Регистрация
        </a>
      </div>

      <!-- ФОРМА -->
      <form @submit.prevent="handleSubmit">
        
        <!-- Поля только для Регистрации -->
        <div v-if="isRegister" class="mb-3 animate__animated animate__fadeIn">
          <label class="form-label">Имя <span class="text-danger">*</span></label>
          <div class="input-group">
            <span class="input-group-text bg-white border-end-0"><i class="bi bi-person text-primary"></i></span>
            <input 
              v-model="form.name" 
              type="text" 
              class="form-control border-start-0 ps-0" 
              placeholder="Как вас зовут?"
              required
            >
          </div>
        </div>

        <div v-if="isRegister" class="mb-3 animate__animated animate__fadeIn">
          <label class="form-label">Телефон <span class="text-danger">*</span></label>
          <div class="input-group">
            <span class="input-group-text bg-white border-end-0"><i class="bi bi-phone text-primary"></i></span>
            <input 
              v-model="form.phone" 
              @input="handlePhoneMask"
              type="tel" 
              class="form-control border-start-0 ps-0" 
              placeholder="+7 (700) 000-00-00"
              maxlength="18"
              required
            >
          </div>
        </div>

        <!-- Общие поля -->
        <div class="mb-3">
          <label class="form-label">Email <span class="text-danger">*</span></label>
          <div class="input-group">
            <span class="input-group-text bg-white border-end-0"><i class="bi bi-envelope text-primary"></i></span>
            <input 
              v-model="form.email" 
              type="email" 
              class="form-control border-start-0 ps-0" 
              required 
              placeholder="name@mail.com"
            >
          </div>
        </div>

        <!-- БЛОК ПАРОЛЯ С ГЛАЗИКОМ -->
        <div class="mb-2">
          <label class="form-label">Пароль <span class="text-danger">*</span></label>
          <div class="input-group">
            <!-- Иконка замка слева -->
            <span class="input-group-text bg-white border-end-0"><i class="bi bi-lock text-primary"></i></span>
            
            <!-- Поле ввода (тип меняется динамически) -->
            <input 
              v-model="form.password" 
              @input="checkPasswordRules"
              :type="showPassword ? 'text' : 'password'" 
              class="form-control border-start-0 border-end-0 ps-0" 
              required 
              placeholder="••••••••"
            >
            
            <!-- Иконка глазика справа (Кнопка) -->
            <span 
                class="input-group-text bg-white border-start-0" 
                style="cursor: pointer;" 
                @click="showPassword = !showPassword"
            >
                <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
            </span>
          </div>
        </div>

        <!-- БЛОК ТРЕБОВАНИЙ К ПАРОЛЮ -->
        <div v-if="isRegister" class="mb-4 ps-2 password-rules">
            <small class="d-block mb-1 text-muted fw-bold">Пароль должен содержать:</small>
            
            <div :class="rules.length ? 'text-success' : 'text-muted'" class="rule-item">
                <i class="bi" :class="rules.length ? 'bi-check-circle-fill' : 'bi-circle'"></i> 
                Минимум 8 символов
            </div>
            
            <div :class="rules.number ? 'text-success' : 'text-muted'" class="rule-item">
                <i class="bi" :class="rules.number ? 'bi-check-circle-fill' : 'bi-circle'"></i> 
                Хотя бы одну цифру
            </div>

            <div :class="rules.upper ? 'text-success' : 'text-muted'" class="rule-item">
                <i class="bi" :class="rules.upper ? 'bi-check-circle-fill' : 'bi-circle'"></i> 
                Заглавную букву (A-Z)
            </div>

            <div :class="rules.complexity ? 'text-success' : 'text-muted'" class="rule-item">
                <i class="bi" :class="rules.complexity ? 'bi-check-circle-fill' : 'bi-circle'"></i> 
                Без простых повторов (111, aaa, 123)
            </div>
        </div>
        <div v-else class="mb-4"></div>

        <button type="submit" class="btn btn-primary w-100 btn-lg rounded-pill shadow-sm custom-btn">
          {{ isRegister ? 'Стать клиентом' : 'Войти в банк' }}
        </button>
      </form>

      <div class="text-center mt-4">
        <small class="text-muted">© 2025 ADAM-BANK. All rights reserved.</small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const isRegister = ref(false);
const showPassword = ref(false); 
const auth = useAuthStore();
const router = useRouter();

const form = reactive({
    name: '',
    phone: '',
    email: '',
    password: ''
});

// Правила
const rules = reactive({
    length: false,
    number: false,
    upper: false,
    complexity: false
});

const checkPasswordRules = () => {
    const pwd = form.password;
    rules.length = pwd.length >= 8;
    rules.number = /\d/.test(pwd);
    rules.upper = /[A-Z]/.test(pwd);

    const hasRepeating = /(.)\1{2,}/.test(pwd);
    const badSequences = ['12345', 'qwerty', 'asdfgh', 'password', 'admin'];
    const isBadSequence = badSequences.some(seq => pwd.toLowerCase().includes(seq));

    rules.complexity = !hasRepeating && !isBadSequence && pwd.length > 0;
};

const isPasswordValid = computed(() => {
    return rules.length && rules.number && rules.upper && rules.complexity;
});

const handlePhoneMask = (event) => {
    let input = event.target.value.replace(/\D/g, '');
    let formatted = '';

    if (!input) {
        form.phone = '';
        return;
    }

    if (['7', '8'].includes(input[0])) {
        if (input[0] === '9') input = '7' + input;
        let firstDigit = '7'; 
        input = firstDigit + input.substring(1);
    } else {
        input = '7' + input;
    }

    input = input.substring(0, 11);

    if (input.length > 0) formatted = '+' + input.substring(0, 1);
    if (input.length >= 2) formatted += ' (' + input.substring(1, 4);
    if (input.length >= 5) formatted += ') ' + input.substring(4, 7);
    if (input.length >= 8) formatted += '-' + input.substring(7, 9);
    if (input.length >= 10) formatted += '-' + input.substring(9, 11);

    form.phone = formatted;
};

const handleSubmit = async () => {
    if (isRegister.value) {
        if (!form.name.trim()) return alert('Введите Имя!');
        if (form.phone.length < 18) return alert('Введите корректный номер телефона!');
        
        if (!isPasswordValid.value) {
            return alert('Пароль слишком простой! Следуйте всем правилам.');
        }
    }

    try {
        if (isRegister.value) {
            await auth.register(form);
            alert('✅ Регистрация успешна! Теперь войдите, используя свои данные.');
            isRegister.value = false;
            form.password = '';
            showPassword.value = false;
        } else {
            await auth.login(form);
            router.push('/');
        }
    } catch (e) {
        alert('❌ Ошибка: ' + e.message);
    }
};
</script>

<style scoped>
.login-wrapper {
    min-height: 100vh;
    background: linear-gradient(135deg, #004e92 0%, #000428 100%);
    padding: 20px;
}

.login-card {
    background: white;
    width: 100%;
    max-width: 450px;
    border-radius: 20px;
    border: none;
}

.brand-title {
    font-weight: 800;
    color: #000428;
    letter-spacing: 1px;
}

.switch-btn {
    padding: 10px;
    color: #6c757d;
    font-weight: 600;
    transition: all 0.3s ease;
}

.switch-btn.active {
    background-color: #0d6efd;
    color: white;
    box-shadow: 0 4px 6px rgba(13, 110, 253, 0.3);
}

.switch-btn:hover:not(.active) {
    background-color: #e9ecef;
    color: #495057;
}

.input-group-text {
    background-color: #f8f9fa;
    border: 1px solid #ced4da;
}

.input-group-text:first-child {
    border-radius: 10px 0 0 10px;
}

.input-group-text:last-child {
    border-radius: 0 10px 10px 0;
}

.form-control {
    border-radius: 0; 
    padding: 12px;
    font-size: 1rem;
}

.form-control:focus {
    box-shadow: none;
    border-color: #86b7fe;
    z-index: 1; 
}

.form-label {
    font-weight: 500;
    font-size: 0.9rem;
    color: #495057;
    margin-bottom: 5px;
}

.custom-btn {
    background: linear-gradient(90deg, #004e92 0%, #0066cc 100%);
    border: none;
    transition: transform 0.2s;
}

.custom-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 78, 146, 0.4);
}

.password-rules {
    font-size: 0.85rem;
}
.rule-item {
    margin-bottom: 3px;
    transition: color 0.3s ease;
}
.rule-item i {
    margin-right: 5px;
}
</style>