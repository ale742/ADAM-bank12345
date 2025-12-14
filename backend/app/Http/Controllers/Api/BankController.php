<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaction;

class BankController extends Controller
{
    // Получить данные юзера
    public function getUserInfo(Request $request) {
        return $request->user();
    }

    // Получить историю (последние 10 операций)
    public function getTransactions(Request $request) {
        return Transaction::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();
    }

    // Сделать ПЕРЕВОД
    public function makeTransfer(Request $request) {
        $request->validate([
            'amount' => 'required|numeric|min:100', // Минимум 100 тенге
            'phone' => 'required'
        ]);

        $user = $request->user();
        $amount = $request->amount;

        // 1. Проверяем, есть ли деньги
        if ($user->balance < $amount) {
            return response()->json(['message' => 'Недостаточно средств'], 400);
        }

        // 2. Снимаем деньги
        $user->balance -= $amount;
        $user->save();

        // 3. Записываем в историю
        Transaction::create([
            'user_id' => $user->id,
            'type' => 'transfer',
            'amount' => $amount,
            'description' => 'Перевод на ' . $request->phone
        ]);

        return response()->json(['message' => 'Перевод успешен', 'balance' => $user->balance]);
    }
}
