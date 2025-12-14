<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;  // <--- ПРОВЕРЬ ЭТУ СТРОКУ!
use App\Http\Controllers\Api\BankController;
// Регистрация и вход
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/test', function () {
    return 'Брат, API работает!';
});
// Защищенные маршруты
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [BankController::class, 'getUserInfo']);
    Route::get('/transactions', [BankController::class, 'getTransactions']);
    Route::post('/transfer', [BankController::class, 'makeTransfer']);
});
