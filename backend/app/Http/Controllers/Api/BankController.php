<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaction;

class BankController extends Controller
{
    public function getUserInfo(Request $request) {
        return $request->user();
    }

    public function getTransactions(Request $request) {
        // Если таблица транзакций пустая, вернем пустой массив, чтобы не было ошибки
        return [];
    }

    public function makeTransfer(Request $request) {
        return response()->json(['message' => 'Transfer logic here']);
    }
}
