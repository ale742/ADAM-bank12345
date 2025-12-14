<template>
  <div class="container mt-5 text-center">
    <h3>QR Оплата</h3>
    <p class="text-muted">Наведите камеру на QR код продавца</p>
    
    <div class="card mx-auto mt-4" style="max-width: 300px; height: 300px; background-color: #f8f9fa; border: 2px dashed #dc3545;">
      <div class="card-body d-flex align-items-center justify-content-center">
          <!-- Имитация камеры -->
          <h1 style="font-size: 5rem;">📷</h1>
      </div>
    </div>
    
    <button class="btn btn-danger mt-4 w-100">Сканировать</button>
  </div>
</template>

<script setup>
</script>