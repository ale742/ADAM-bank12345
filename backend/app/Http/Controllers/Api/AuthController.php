<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    // Генерация банковских данных (Приватная функция)
    private function generateCardDetails() {
        // 1. Номер карты (8400 + рандом)
        $cardNumber = '8400 ' . rand(1000, 9999) . ' ' . rand(1000, 9999) . ' ' . rand(1000, 9999);

        // 2. CVV
        $cvv = rand(100, 999);

        // 3. Срок (Сегодня + 3 года)
        $expDate = date('m/y', strtotime('+3 years'));

        // 4. IBAN
        $ibanSuffix = rand(1000000000, 9999999999); // 10 цифр
        $iban = "KZ99ADAM" . $ibanSuffix;

        // 5. Дефолтные лимиты
        $limits = [
            'internet' => true,
            'internet_limit' => 50000,
            'cash_limit' => 100000,
            'transfer_limit' => 150000
        ];

        return compact('cardNumber', 'cvv', 'expDate', 'iban', 'limits');
    }

    public function register(Request $request) {
        $request->validate([
            'name' => 'required',
            'phone' => 'required|unique:users',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6'
        ]);

        // Генерируем данные на сервере
        $cardData = $this->generateCardDetails();

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'balance' => 10000.00, // Бонус

            // Записываем сгенерированные данные
            'card_number' => $cardData['cardNumber'],
            'card_cvv' => $cardData['cvv'],
            'card_exp' => $cardData['expDate'],
            'iban' => $cardData['iban'],
            'limits' => $cardData['limits'], // Laravel сам переведет массив в JSON
            'is_blocked' => false
        ]);

        return response()->json([
            'token' => $user->createToken('API Token')->plainTextToken,
            'user' => $user
        ]);
    }

    public function login(Request $request) {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Неверный логин или пароль'], 401);
        }

        $user = User::where('email', $request['email'])->firstOrFail();
        return response()->json([
            'token' => $user->createToken('API Token')->plainTextToken,
            'user' => $user
        ]);
    }

    public function logout(Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }
}
