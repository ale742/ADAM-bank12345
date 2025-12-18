<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Создаем Админа
        User::create([
            'name' => 'Admin',
            'email' => 'admin@admin.com',
            'phone' => '0000000000', // Специальный номер для админа
            'password' => Hash::make('password'),
            'balance' => 1000000, // Миллион на счету
        ]);
    }
}
