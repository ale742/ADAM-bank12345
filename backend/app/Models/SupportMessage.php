<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupportMessage extends Model
{
    use HasFactory;

    // Разрешаем массовое заполнение
    protected $fillable = [
        'user_id',
        'message',
        'answer',
        'is_answered'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }
}
