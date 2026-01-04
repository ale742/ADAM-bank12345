<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Создаем тестового юзера (чтобы Ларавел не ругался)
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone' => '87770000001', // <--- ДОБАВИЛИ ТЕЛЕФОН
            'balance' => 10000,
        ]);

        // Запускаем твой сидер Админа
        $this->call(AdminSeeder::class);
    }
}
