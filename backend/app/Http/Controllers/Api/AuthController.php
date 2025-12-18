<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    // Регистрация
public function register(Request $request) {
        $request->validate([
            'name' => 'required',
            'phone' => 'required|unique:users', // Проверка телефона
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6'
        ]);

        $user = User::create([
            'name' => $request->name,
            'phone' => $request->phone, // Сохраняем телефон
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'balance' => 10000.00
        ]);

        return response()->json([
            'token' => $user->createToken('API Token')->plainTextToken,
            'user' => $user
        ]);
    }

    // Вход
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

    // Выход
    public function logout(Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }
}
