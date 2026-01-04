<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SupportMessage; // <--- ВОТ ЭТО САМОЕ ВАЖНОЕ! БЕЗ НЕГО ОШИБКА.

class SupportController extends Controller
{
    // 1. Получить историю переписки
    public function index(Request $request) {
        return SupportMessage::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'asc')
            ->get();
    }

    // 2. Отправить сообщение
    public function store(Request $request) {
        $request->validate(['message' => 'required']);

        $msg = SupportMessage::create([
            'user_id' => $request->user()->id,
            'message' => $request->message,
            'is_answered' => false
        ]);

        return response()->json($msg);
    }
}
