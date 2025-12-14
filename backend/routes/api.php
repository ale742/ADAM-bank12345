<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BankController;
use Illuminate\Support\Facades\Route;

// Открытые роуты
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Защищенные роуты (нужен токен)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [BankController::class, 'getUserInfo']);
    Route::get('/transactions', [BankController::class, 'getTransactions']);
    Route::post('/transfer', [BankController::class, 'makeTransfer']);
});
