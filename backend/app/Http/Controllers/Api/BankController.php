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
            'amount' => 'required|numeric|min:100',
            'phone' => 'required' // Номер получателя
        ]);

        $sender = $request->user(); // Я (отправитель)
        $amount = $request->amount;

        // 1. Ищем получателя по телефону
        $receiver = \App\Models\User::where('phone', $request->phone)->first();

        if (!$receiver) {
            return response()->json(['message' => 'Клиент с таким номером не найден'], 404);
        }

        // 2. Нельзя переводить самому себе
        if ($sender->id === $receiver->id) {
            return response()->json(['message' => 'Нельзя переводить самому себе'], 400);
        }

        // 3. Проверяем баланс
        if ($sender->balance < $amount) {
            return response()->json(['message' => 'Недостаточно средств'], 400);
        }

        // 4. МАГИЯ ПЕРЕВОДА 💸
        $sender->balance -= $amount;   // У меня убыло
        $receiver->balance += $amount; // Ему прибыло

        $sender->save();
        $receiver->save();

        // 5. Пишем в историю (Для меня)
        Transaction::create([
            'user_id' => $sender->id,
            'type' => 'transfer',
            'amount' => $amount,
            'description' => 'Перевод: ' . $receiver->name . ' (' . $request->phone . ')'
        ]);

        // 6. Пишем в историю (Для получателя, чтобы он тоже видел)
        Transaction::create([
            'user_id' => $receiver->id,
            'type' => 'transfer_in', // Тип "Входящий перевод"
            'amount' => $amount, // Можно сделать плюс, но в истории обычно просто сумма
            'description' => 'Пополнение от: ' . $sender->name
        ]);

        return response()->json(['message' => 'Перевод успешен', 'balance' => $sender->balance]);
    }
}
