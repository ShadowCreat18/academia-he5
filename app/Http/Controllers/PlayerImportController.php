<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\PlayersImport;

class PlayerImportController extends Controller
{
    /**
     * Sube y procesa el archivo de Excel.
     */
    public function import(Request $request)
    {
        $request->validate([
            'excel_file' => 'required|mimes:xlsx,xls,csv',
        ]);

        try {
            // Importar usando la clase PlayersImport que lee el Excel
            Excel::import(new PlayersImport, $request->file('excel_file'));

            return back()->with('success', '¡Jugadores, Tutores y Cargos importados correctamente!');
        } catch (\Exception $e) {
            return back()->with('error', 'Hubo un error al procesar el archivo: ' . $e->getMessage());
        }
    }
}
