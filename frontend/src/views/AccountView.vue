<template>
  <div class="app-layout" :class="{ 'dark-theme': auth.isDarkMode }">
    
    <!-- SIDEBAR ДЛЯ ПК -->
    <aside class="desktop-sidebar d-none d-lg-flex">
      <div class="sidebar-header" @click="$router.push('/')" style="cursor: pointer;">
        <div class="logo-circle-adam">A</div>
        <span class="brand-name-adam">ADAM BANK</span>
      </div>
      <nav class="sidebar-nav">
        <div class="sidebar-link" @click="$router.push('/')">
            <i class="bi bi-house-door"></i> <span>Главная</span>
        </div>
        <div class="sidebar-link" @click="$router.push('/my-bank')">
            <i class="bi bi-wallet2"></i> <span>Мой банк</span>
        </div>
        <div class="sidebar-link" @click="$router.push('/payments')">
            <i class="bi bi-credit-card"></i> <span>Платежи</span>
        </div>
        <!-- ЗАМЕНИЛИ СЕРВИСЫ НА ИСТОРИЮ -->
        <div class="sidebar-link" @click="$router.push('/history')">
            <i class="bi bi-clock-history"></i> <span>История</span>
        </div>
        <div class="sidebar-link active">
            <i class="bi bi-person-circle"></i> <span>Аккаунт</span>
        </div>
      </nav>

      <!-- ЗАЩИТА ОТ БЕЛОГО ЭКРАНА (v-if) -->
      <div class="mt-auto user-pill-desktop" v-if="auth.user">
          <div class="avatar-mini-circle" :style="auth.user.avatar ? `background-image: url(${auth.user.avatar})` : ''">
            <span v-if="!auth.user.avatar">{{ auth.user.name ? auth.user.name[0] : 'A' }}</span>
          </div>
          <div class="ms-2 fw-bold small text-truncate">{{ auth.user.name }}</div>
      </div>
    </aside>

    <div class="main-wrapper">
      <!-- ХЕДЕР (Мобильный) -->
      <div class="header d-flex align-items-center px-4 py-3 bg-header fixed-top d-lg-none">
        <button @click="$router.push('/')" class="btn btn-light-custom rounded-circle me-3 back-btn shadow-sm">
            <i class="bi bi-arrow-left"></i>
        </button>
        <h5 class="mb-0 fw-bold header-title">Аккаунт</h5>
      </div>

      <!-- ОСНОВНОЙ КОНТЕНТ (v-if для защиты) -->
      <div class="container content-area pb-5" v-if="auth.user">
        <div class="row justify-content-center">
          <div class="col-12 col-lg-8">
            
            <!-- 1. ПРОФИЛЬ С СМЕНОЙ АВАТАРКИ -->
            <div class="bg-card rounded-5 p-5 shadow-sm text-center mb-4 position-relative animate__animated animate__fadeInDown">
                <div class="avatar-upload-container mx-auto mb-4">
                    <div class="avatar-main shadow-lg" :style="auth.user.avatar ? `background-image: url(${auth.user.avatar})` : ''">
                        <span v-if="!auth.user.avatar">{{ auth.user.name ? auth.user.name[0] : 'A' }}</span>
                    </div>
                    <label for="avatar-input" class="edit-badge shadow-sm">
                        <i class="bi bi-camera-fill"></i>
                        <input type="file" id="avatar-input" hidden accept="image/*" @change="handleAvatarChange">
                    </label>
                </div>
                
                <h3 class="fw-bold text-main mb-1">{{ auth.user.name }}</h3>
                <p class="text-muted small mb-0">ИИН: {{ auth.user.iin }}</p>
                <div class="badge bg-primary bg-opacity-10 text-primary mt-3 px-3 py-2 rounded-pill">Premium Client</div>
            </div>

            <!-- 2. НАСТРОЙКИ -->
            <h6 class="fw-bold text-muted mb-3 ps-2 text-uppercase ls-1" style="font-size: 0.7rem;">Настройки</h6>
            <div class="list-group rounded-5 shadow-sm border-0 bg-card overflow-hidden mb-4 animate__animated animate__fadeInUp">
                
                <div class="list-group-item p-4 border-0 border-bottom d-flex align-items-center justify-content-between bg-transparent">
                    <div class="d-flex align-items-center gap-3">
                        <div class="icon-circle-sm bg-dark text-white"><i class="bi bi-moon-stars"></i></div>
                        <span class="fw-bold text-main">Темная тема</span>
                    </div>
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" :checked="auth.isDarkMode" @change="auth.toggleDarkMode">
                    </div>
                </div>

                <div class="list-group-item p-4 border-0 border-bottom d-flex align-items-center justify-content-between bg-transparent">
                    <div class="d-flex align-items-center gap-3">
                        <div class="icon-circle-sm bg-info bg-opacity-10 text-info"><i class="bi bi-snow2"></i></div>
                        <span class="fw-bold text-main">Зимний режим</span>
                    </div>
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" :checked="auth.isWinterMode" @change="auth.toggleWinterMode">
                    </div>
                </div>

                <div class="list-group-item p-4 border-0 d-flex align-items-center justify-content-between bg-transparent">
                    <div class="d-flex align-items-center gap-3">
                        <div class="icon-circle-sm bg-warning bg-opacity-10 text-warning"><i class="bi bi-bell"></i></div>
                        <span class="fw-bold text-main">Уведомления</span>
                    </div>
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" checked disabled>
                    </div>
                </div>
            </div>

            <button class="btn btn-light-custom text-danger w-100 py-3 rounded-pill fw-bold shadow-sm" @click="auth.logout">
                <i class="bi bi-box-arrow-right me-2"></i> Выйти из системы
            </button>

          </div>
        </div>
      </div>

      <!-- МОБИЛЬНОЕ МЕНЮ (ИСПРАВЛЕН ВИД) -->
      <nav class="bottom-nav fixed-bottom bg-header shadow-lg border-top d-flex justify-content-around py-2 d-lg-none">
        <div class="nav-item" @click="$router.push('/')">
          <i class="bi bi-house-door"></i>
          <small>Главная</small>
        </div>
        <div class="nav-item" @click="$router.push('/qr')">
          <i class="bi bi-qr-code"></i>
          <small>QR</small>
        </div>
        <div class="nav-item" @click="$router.push('/history')">
          <i class="bi bi-clock-history"></i>
          <small>История</small>
        </div>
        <div class="nav-item active">
          <i class="bi bi-person-circle"></i>
          <small>Аккаунт</small>
        </div>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth';
const auth = useAuthStore();

const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            auth.updateAvatar(e.target.result);
        };
        reader.readAsDataURL(file);
    }
};
</script>

<style scoped>
.app-layout {
  --bg-main: #f6f8fb; --bg-card: #ffffff; --text-main: #000428; --header-bg: #ffffff; --btn-light: #f1f3f5; --border: #f1f3f5;
  display: flex; min-height: 100vh; background-color: var(--bg-main); font-family: 'Inter', sans-serif; transition: 0.3s;
}
.app-layout.dark-theme {
  --bg-main: #0b0e14; --bg-card: #1a1f26; --text-main: #ffffff; --header-bg: #1a1f26; --btn-light: #2d3748; --border: #2d3748;
}

.main-wrapper { flex-grow: 1; display: flex; flex-direction: column; position: relative; }
.content-area { padding-top: 80px; width: 100%; }

/* AVATAR */
.avatar-upload-container { width: 120px; height: 120px; position: relative; }
.avatar-main {
    width: 100%; height: 100%; border-radius: 40px; 
    background: #004e92; color: white;
    display: flex; align-items: center; justify-content: center;
    font-size: 3rem; font-weight: 800;
    background-size: cover; background-position: center;
    border: 4px solid var(--bg-card);
}
.edit-badge {
    position: absolute; bottom: -5px; right: -5px;
    width: 40px; height: 40px; background: #0d6efd; color: white;
    border-radius: 12px; display: flex; align-items: center; justify-content: center;
    cursor: pointer; border: 3px solid var(--bg-card);
}

/* UI ELEMENTS */
.bg-card { background-color: var(--bg-card) !important; }
.bg-header { background-color: var(--header-bg) !important; }
.text-main { color: var(--text-main) !important; }
.btn-light-custom { background-color: var(--btn-light); border: none; color: var(--text-main); }
.icon-circle-sm { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }

/* BOTTOM NAV FIX */
.bottom-nav { border-radius: 25px 25px 0 0; z-index: 1000; }
.nav-item { display: flex; flex-direction: column; align-items: center; color: #a0aec0; cursor: pointer; width: 25%; transition: 0.3s; }
.nav-item i { font-size: 1.4rem; margin-bottom: 2px; }
.nav-item.active { color: #004e92; }
.dark-theme .nav-item.active { color: #0d6efd; }

/* SIDEBAR */
.desktop-sidebar { width: 280px; background: var(--bg-card); border-right: 1px solid var(--border); padding: 35px 25px; flex-direction: column; position: sticky; top: 0; height: 100vh; }
.logo-circle-adam { width: 40px; height: 40px; border-radius: 12px; background: #004e92; color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; }
.brand-name-adam { font-weight: 800; font-size: 1.2rem; color: var(--text-main); margin-left: 10px; }
.sidebar-link { display: flex; align-items: center; gap: 15px; padding: 14px 18px; border-radius: 18px; cursor: pointer; color: #718096; font-weight: 600; transition: 0.3s; margin-bottom: 5px; }
.sidebar-link.active { background: #eef6ff; color: #004e92; }
.dark-theme .sidebar-link.active { background: rgba(0, 78, 146, 0.2); color: #0d6efd; }
.user-pill-desktop { display: flex; align-items: center; padding: 15px; background: var(--btn-light); border-radius: 20px; color: var(--text-main); }
.avatar-mini-circle { width: 32px; height: 32px; border-radius: 50%; background: #004e92; color: white; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; }

.ls-1 { letter-spacing: 1px; }
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>