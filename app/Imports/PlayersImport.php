<?php

namespace App\Imports;

use App\Models\User;
use App\Models\Player;
use App\Models\FinancialTransaction;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Carbon\Carbon;

class PlayersImport implements ToModel, WithHeadingRow
{
    /**
     * Define cómo se procesa cada fila del CSV/Excel.
     * Columnas esperadas:
     * - nombre_jugador
     * - fecha_nacimiento (Ej. 2012-05-15)
     * - nombre_padre
     * - usuario_padre
     * - telefono
     */
    public function model(array $row)
    {
        // Validar si el registro está vacío
        if (empty($row['nombre_jugador']) || empty($row['usuario_padre'])) {
            return null;
        }

        // 1. Crear o buscar al Padre
        $parent = User::firstOrCreate(
            ['username' => trim($row['usuario_padre'])],
            [
                'name' => trim($row['nombre_padre']),
                'email' => null, // Opcional, si luego se lo pides
                'password' => Hash::make('he5-1234'), // Default password
                'role' => 'parent',
                'saldo_disponible' => 0.00
            ]
        );

        // 2. Registrar al Jugador
        // Dividir el nombre completo en first_name y last_name de forma básica
        $nameParts = explode(' ', trim($row['nombre_jugador']));
        $firstName = array_shift($nameParts);
        $lastName = count($nameParts) > 0 ? implode(' ', $nameParts) : '';

        // Formatear fecha
        try {
            $birthDate = Carbon::parse($row['fecha_nacimiento'])->format('Y-m-d');
        } catch (\Exception $e) {
            $birthDate = now()->format('Y-m-d');
        }

        $player = Player::create([
            'parent_id'    => $parent->id,
            'first_name'   => $firstName,
            'last_name'    => $lastName,
            'birth_date'   => $birthDate,
            'contact_info' => $row['telefono'] ?? null,
            'scholarship_type' => 'regular'
        ]);

        // 3. Generar Cargos Obligatorios base (Inscripción y Mensualidad)
        $mandatoryCharges = [
            ['concept' => 'Inscripción Anual', 'amount' => 1250],
            ['concept' => 'Mensualidad (Alta Inicial)', 'amount' => 500],
        ];

        foreach ($mandatoryCharges as $charge) {
            FinancialTransaction::create([
                'user_id' => $parent->id,
                'player_id' => $player->id,
                'type' => 'charge',
                'concept' => $charge['concept'],
                'amount' => $charge['amount'],
                'paid_amount' => 0,
                'status' => 'pending',
                'due_date' => now()->addDays(5)->format('Y-m-d')
            ]);
        }

        return $player;
    }
}
