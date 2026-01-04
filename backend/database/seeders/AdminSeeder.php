<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
   public function run(): void
    {
        \App\Models\User::create([
            'name' => 'Admin',
            'email' => 'admin@admin.com',
            'phone' => '0000000000',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
            'balance' => 1000000,

            // Данные карты админа
            'card_number' => '8400 0000 0000 0000',
            'card_cvv' => '777',
            'card_exp' => '12/99',
            'iban' => 'KZ00ADAMADMIN000000',
            'is_blocked' => false,
            'limits' => ['internet' => true, 'internet_limit' => 999999, 'cash_limit' => 999999, 'transfer_limit' => 999999]
        ]);
    }
}
