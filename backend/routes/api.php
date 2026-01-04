<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BankController;
use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\SupportController;


// Регистрация и вход
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Тест (можно оставить или убрать)
Route::get('/test', function () {
    return 'API работает!';
});

// === ЗАЩИЩЕННЫЕ МАРШРУТЫ (Только с токеном) ===
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [BankController::class, 'getUserInfo']);
    Route::get('/transactions', [BankController::class, 'getTransactions']);
    Route::post('/transfer', [BankController::class, 'makeTransfer']);

    // 🔥 НОВЫЕ РОУТЫ
    Route::post('/limits', [BankController::class, 'updateLimits']);
    Route::post('/block-card', [BankController::class, 'toggleBlockCard']);
    Route::get('/products', [ContentController::class, 'getProducts']);
    Route::get('/services', [ContentController::class, 'getServices']);
    Route::get('/support', [SupportController::class, 'index']);
    Route::post('/support', [SupportController::class, 'store']);




});
