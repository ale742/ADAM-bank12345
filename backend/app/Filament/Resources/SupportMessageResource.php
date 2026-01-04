<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SupportMessageResource\Pages;
use App\Filament\Resources\SupportMessageResource\RelationManagers;
use App\Models\SupportMessage;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class SupportMessageResource extends Resource
{
    protected static ?string $model = SupportMessage::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Textarea::make('message')->disabled()->label('Вопрос клиента'),
            Forms\Components\Textarea::make('answer')->required()->label('Ваш ответ'),
            Forms\Components\Toggle::make('is_answered')->label('Отмечено как решенное'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            Tables\Columns\TextColumn::make('user.name')->label('Клиент'),
            Tables\Columns\TextColumn::make('message')->limit(30)->label('Вопрос'),
            Tables\Columns\IconColumn::make('is_answered')->boolean()->label('Отвечено'),
        ]);
    }
    public static function getPages(): array
    {
        return [
            'index' => Pages\ManageSupportMessages::route('/'),
        ];
    }
}
