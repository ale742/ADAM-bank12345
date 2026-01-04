<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Service;

class ContentController extends Controller
{
    // Получить товары для Магазина
    public function getProducts() {
        $products = Product::all()->map(function ($product) {
            // Добавляем полный адрес к картинке
            $product->image_url = $product->image ? asset('storage/' . $product->image) : null;
            return $product;
        });

        return response()->json($products);
    }

    // Получить сервисы для Платежей
    public function getServices() {
        return Service::all();
    }
}
