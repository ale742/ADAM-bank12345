<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Список полей, которые можно заполнять массово.
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'balance',
        'card_number',
        'card_cvv',
        'card_exp',
        'iban',
        'is_blocked',
        'limits', // JSON поле
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

     /**
     * Автоматическое преобразование типов.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_blocked' => 'boolean', // Ларавел сам будет делать true/false
            'limits' => 'array',       // JSON из базы превратится в массив PHP
        ];
    }
}
