<!-- src/App.vue -->
<template>
  <div class="container-fluid p-0">
    <router-view class="mb-5 pb-5"/> 

    <!-- Нижнее меню (показываем только если залогинен) -->
    <nav v-if="$route.name !== 'login'" class="navbar fixed-bottom navbar-light bg-light border-top">
      <div class="container d-flex justify-content-around">
        <router-link to="/" class="nav-link text-center">
          <div>🏠</div>
          <small>Главная</small>
        </router-link>
        <router-link to="/qr" class="nav-link text-center">
          <div>🔳</div>
          <small>QR</small>
        </router-link>
        <router-link to="/messages" class="nav-link text-center">
          <div>💬</div>
          <small>Сообщения</small>
        </router-link>
        <router-link to="/services" class="nav-link text-center">
          <div>🧩</div>
          <small>Сервисы</small>
        </router-link>
      </div>
    </nav>
  </div>
</template>