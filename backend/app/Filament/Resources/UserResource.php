<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class UserResource extends Resource
{
    protected static ?string $model = User::class;
    protected static ?string $navigationIcon = 'heroicon-o-users';
    protected static ?string $navigationLabel = 'Пользователи';

   public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Личные данные')->schema([
                    Forms\Components\TextInput::make('name')->required()->label('ФИО'),
                    Forms\Components\TextInput::make('email')->email()->required(),
                    Forms\Components\TextInput::make('phone')->tel()->required()->label('Телефон'),
                    Forms\Components\TextInput::make('password')->password()->revealable()->dehydrated(fn ($state) => filled($state))->required(fn (string $context): bool => $context === 'create'),
                ])->columns(2),

                Forms\Components\Section::make('Банковские данные')->schema([
                    Forms\Components\TextInput::make('balance')
                        ->numeric()
                        ->prefix('₸')
                        ->label('Баланс'),

                    Forms\Components\TextInput::make('card_number')->label('Номер карты'),
                    Forms\Components\TextInput::make('card_cvv')->label('CVV')->numeric(),
                    Forms\Components\TextInput::make('card_exp')->label('Срок действия'),
                    Forms\Components\TextInput::make('iban')->label('IBAN'),

                    // Переключатель Блокировки
                    Forms\Components\Toggle::make('is_blocked')
                        ->label('Заблокировать карту')
                        ->onColor('danger')
                        ->offColor('success'),
                ])->columns(2),

                // Лимиты (JSON редактор в виде полей)
                Forms\Components\Section::make('Лимиты')->schema([
                    Forms\Components\TextInput::make('limits.internet_limit')->numeric()->label('Лимит Интернет'),
                    Forms\Components\TextInput::make('limits.cash_limit')->numeric()->label('Лимит Нал'),
                    Forms\Components\TextInput::make('limits.transfer_limit')->numeric()->label('Лимит Переводы'),
                    Forms\Components\Toggle::make('limits.internet')->label('Разрешить интернет-покупки'),
                ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable(),
                Tables\Columns\TextColumn::make('name')->searchable()->label('Клиент'),
                Tables\Columns\TextColumn::make('phone')->searchable(),
                Tables\Columns\TextColumn::make('balance')->money('KZT')->sortable()->label('Баланс'),
                Tables\Columns\TextColumn::make('card_number')->label('Карта'),

                // Статус блокировки (Иконка)
                Tables\Columns\IconColumn::make('is_blocked')
                    ->boolean()
                    ->trueIcon('heroicon-o-lock-closed')
                    ->falseIcon('heroicon-o-check-circle')
                    ->trueColor('danger')
                    ->falseColor('success')
                    ->label('Блок'),

                Tables\Columns\TextColumn::make('created_at')->dateTime()->label('Регистрация'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            // ИСПРАВЛЕНО: ManageUsers вместо ListUsers
            'index' => Pages\ManageUsers::route('/'),
        ];
    }
}
