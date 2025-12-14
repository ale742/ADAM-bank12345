<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BankController;

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

    // !!! ВОТ ЭТА СТРОКА САМАЯ ВАЖНАЯ СЕЙЧАС !!!
    Route::post('/transfer', [BankController::class, 'makeTransfer']);
});
