<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;           // <--- ВАЖНО
use App\Models\Transaction;    // <--- ВАЖНО
use Illuminate\Support\Facades\DB; // <--- ВАЖНО

class BankController extends Controller
{
    // Получить данные юзера
    public function getUserInfo(Request $request) {
        return $request->user();
    }

    // Получить историю
    public function getTransactions(Request $request) {
        return Transaction::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->take(20) // Берем последние 20
            ->get();
    }

    // Перевод
    public function makeTransfer(Request $request) {
        // 1. Валидация
        $request->validate([
            'amount' => 'required|numeric|min:100',
            'phone' => 'required'
        ]);

        $sender = $request->user();
        $amount = $request->amount;
        $phone = $request->phone;

        // 2. Ищем получателя (точное совпадение строки телефона)
        $receiver = User::where('phone', $phone)->first();

        // Если не нашли
        if (!$receiver) {
            return response()->json(['message' => 'Клиент с таким номером не найден в базе'], 404);
        }

        // Если это я сам
        if ($sender->id === $receiver->id) {
            return response()->json(['message' => 'Нельзя переводить самому себе'], 400);
        }

        // Если денег нет
        if ($sender->balance < $amount) {
            return response()->json(['message' => 'Недостаточно средств'], 400);
        }

        // Если карта заблочена
        if ($sender->is_blocked) {
            return response()->json(['message' => 'Ваша карта заблокирована'], 403);
        }

        // 3. ТРАНЗАКЦИЯ (Всё или ничего)
        try {
            DB::transaction(function () use ($sender, $receiver, $amount) {
                // Снимаем
                $sender->balance -= $amount;
                $sender->save();

                // Начисляем
                $receiver->balance += $amount;
                $receiver->save();

                // История отправителя
                Transaction::create([
                    'user_id' => $sender->id,
                    'type' => 'transfer',
                    'amount' => $amount,
                    'description' => 'Перевод: ' . $receiver->name
                ]);

                // История получателя
                Transaction::create([
                    'user_id' => $receiver->id,
                    'type' => 'transfer_in',
                    'amount' => $amount,
                    'description' => 'Пополнение от: ' . $sender->name
                ]);
            });

            return response()->json([
                'message' => 'Перевод успешно выполнен',
                'balance' => $sender->balance
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Ошибка сервера при переводе'], 500);
        }
    }
    // Обновление лимитов
    public function updateLimits(Request $request) {
        $user = $request->user();

        // Обновляем поле limits (Laravel сам закодирует в JSON)
        $user->limits = $request->limits;
        $user->save();

        return response()->json(['message' => 'Лимиты обновлены', 'limits' => $user->limits]);
    }

    // Блокировка карты
    public function toggleBlockCard(Request $request) {
        $user = $request->user();

        // Меняем статус на фываыфвафыва
        $user->is_blocked = !$user->is_blocked;
        $user->save();

        return response()->json([
            'message' => $user->is_blocked ? 'Карта заблокирована' : 'Карта разблокирована',
            'is_blocked' => $user->is_blocked
        ]);
    }
}
