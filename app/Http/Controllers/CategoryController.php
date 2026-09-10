<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(Category::all());
    }

    public function processYearChange()
    {
        // Lógica para recálculo masivo y reasignación de categorías por año de nacimiento
    }
}
