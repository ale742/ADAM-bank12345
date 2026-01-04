<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Таблица Users
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone')->unique(); // Телефон
            $table->string('password');

            // 🔥 БАНКОВСКИЕ ДАННЫЕ
            $table->decimal('balance', 15, 2)->default(10000); // Баланс
            $table->string('card_number')->nullable(); // Номер карты
            $table->string('card_cvv')->nullable();    // CVV
            $table->string('card_exp')->nullable();    // Срок действия
            $table->string('iban')->nullable();        // IBAN

            // 🔥 СТАТУСЫ И НАСТРОЙКИ
            $table->boolean('is_blocked')->default(false); // Блокировка
            $table->json('limits')->nullable(); // Лимиты

            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        // 2. Таблица токенов сброса пароля
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        // 3. Таблица сессий
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
