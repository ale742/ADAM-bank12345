<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ServiceResource\Pages;
use App\Models\Service;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ServiceResource extends Resource
{
    protected static ?string $model = Service::class;

    public static function getNavigationIcon(): ?string
    {
        return 'heroicon-o-squares-2x2'; // Иконка в меню админки
    }

    public static function getNavigationLabel(): string
    {
        return 'Сервисы (Платежи)';
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->required()
                    ->label('Название (например: Beeline)'),

                // Выпадающий список категорий
                Forms\Components\Select::make('category')
                    ->options([
                        'Мобильная связь' => 'Мобильная связь',
                        'Коммуналка' => 'Коммуналка',
                        'Интернет' => 'Интернет',
                        'Транспорт' => 'Транспорт',
                        'Образование' => 'Образование',
                        'Штрафы' => 'Штрафы',
                        'Прочее' => 'Прочее',
                    ])
                    ->required()
                    ->label('Категория'),

                // Поле для класса иконки
                Forms\Components\TextInput::make('icon')
                    ->placeholder('bi bi-phone')
                    ->helperText('Вставь класс иконки Bootstrap (например: bi bi-wifi)')
                    ->label('Иконка'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
               Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->label('Название'),

                Tables\Columns\TextColumn::make('category')
                    ->badge() // Красивый цветной бейджик
                    ->label('Категория'),

                Tables\Columns\TextColumn::make('icon')
                    ->fontFamily('mono') // Шрифт как код
                    ->label('Код иконки'),
            ])
            ->actions([            Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
             ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            // БЫЛО: 'index' => Pages\ListServices::route('/'),
            // СТАЛО:
            'index' => Pages\ManageServices::route('/'),
        ];
    }
}
