<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaction;

class BankController extends Controller
{
    // Получить инфо о юзере и баланс
    public function getUserInfo(Request $request) {
        return $request->user();
    }

    // История операций
    public function getTransactions(Request $request) {
        return Transaction::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    // Сделать перевод (упрощенно)
    public function makeTransfer(Request $request) {
        $user = $request->user();
        $amount = $request->amount;

        if ($user->balance < $amount) {
            return response()->json(['message' => 'Недостаточно средств'], 400);
        }

        // Снимаем деньги
        $user->balance -= $amount;
        $user->save();

        // Пишем в историю
        Transaction::create([
            'user_id' => $user->id,
            'type' => 'transfer',
            'amount' => $amount,
            'description' => $request->description ?? 'Перевод'
        ]);

        return response()->json(['message' => 'Успешно', 'balance' => $user->balance]);
    }
}
