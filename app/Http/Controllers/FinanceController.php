<?php

namespace App\Http\Controllers;

use App\Models\Player;
use App\Models\Setting;
use App\Models\FinancialTransaction;
use App\Models\TransactionPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FinanceController extends Controller
{
    /**
     * Página principal de Gestión Financiera.
     */
    public function index(Request $request)
    {
        $players = Player::where('status', 'active')
            ->with(['financialTransactions' => function($q) {
                $q->where('status', '!=', 'paid');
            }])
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'category', 'secondary_category']);

        $players->each(function($player) {
            $player->total_debt = $player->financialTransactions->sum(function($t) {
                return max(0, $t->amount - $t->paid_amount);
            });
            unset($player->financialTransactions); // No need to send all pending tx to frontend in the list
        });

        $selectedPlayer = null;
        $transactions = collect();

        if ($request->has('player_id') && $request->player_id) {
            $selectedPlayer = Player::with(['parents', 'financialTransactions' => function ($q) {
                $q->orderByDesc('due_date');
            }, 'financialTransactions.transactionPayments'])->find($request->player_id);

            if ($selectedPlayer) {
                // Auto-generate current year charges if the player has none
                $currentYear = date('Y');
                $hasCurrentYearCharges = $selectedPlayer->financialTransactions
                    ->filter(function ($tx) use ($currentYear) {
                        $dueYear = $tx->due_date ? date('Y', strtotime($tx->due_date)) : null;
                        return $dueYear === $currentYear;
                    })->count() > 0;

                if (!$hasCurrentYearCharges) {
                    $parentId = $selectedPlayer->parents->first()->id ?? Auth::id();
                    $costInscripcion = Setting::getVal('cost_inscripcion', 1250);
                    $costMaterial = Setting::getVal('cost_material', 1000);
                    $costTorneo = Setting::getVal('cost_torneo', 250);
                    $costUniformes = Setting::getVal('cost_uniformes', 2000);
                    $costMensualidad = Setting::getVal('cost_mensualidad', 500);

                    $concepts = [
                        ['concept' => 'Inscripción', 'amount' => $costInscripcion, 'due_date' => "$currentYear-01-15"],
                        ['concept' => 'Apoyo Material Deportivo', 'amount' => $costMaterial, 'due_date' => "$currentYear-02-01"],
                        ['concept' => 'Inscripción Torneo', 'amount' => $costTorneo, 'due_date' => "$currentYear-02-15"],
                        ['concept' => 'Uniformes', 'amount' => $costUniformes, 'due_date' => "$currentYear-01-15"],
                    ];

                    // Add 12 monthly charges
                    $meses = [
                        1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril',
                        5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto',
                        9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre'
                    ];
                    
                    for ($m = 1; $m <= 12; $m++) {
                        $concepts[] = [
                            'concept' => 'Mensualidad ' . $meses[$m],
                            'amount' => $costMensualidad,
                            'due_date' => "$currentYear-" . str_pad($m, 2, '0', STR_PAD_LEFT) . "-01",
                        ];
                    }

                    foreach ($concepts as $c) {
                        FinancialTransaction::create([
                            'player_id' => $selectedPlayer->id,
                            'user_id' => $parentId,
                            'concept' => $c['concept'],
                            'amount' => $c['amount'],
                            'paid_amount' => 0,
                            'due_date' => $c['due_date'],
                            'status' => 'pending',
                        ]);
                    }

                    // Reload transactions
                    $selectedPlayer->load(['financialTransactions' => function ($q) {
                        $q->orderByDesc('due_date');
                    }, 'financialTransactions.transactionPayments']);
                }

                $transactions = $selectedPlayer->financialTransactions;
            }
        }

        return Inertia::render('Admin/Finances/Index', [
            'settings' => Setting::all()->pluck('value', 'key'),
            'players' => $players,
            'selectedPlayer' => $selectedPlayer,
            'transactions' => $transactions,
            'selectedPlayerId' => $request->player_id,
        ]);
    }

    /**
     * Crear un nuevo cargo para un jugador.
     */
    public function storeCharge(Request $request)
    {
        $request->validate([
            'player_id' => 'required|exists:players,id',
            'concept' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'due_date' => 'required|date',
            'is_arbitration_penalty' => 'boolean',
        ]);

        $player = Player::findOrFail($request->player_id);

        FinancialTransaction::create([
            'player_id' => $player->id,
            'user_id' => $player->parents->first()->id ?? Auth::id(),
            'concept' => $request->concept,
            'amount' => $request->amount,
            'paid_amount' => 0,
            'due_date' => $request->due_date,
            'status' => 'pending',
            'is_arbitration_penalty' => $request->is_arbitration_penalty ?? false,
        ]);

        return back()->with('success', 'Cargo creado correctamente.');
    }

    /**
     * Crear múltiples cargos a la vez para un jugador (tabla dinámica / historial).
     */
    public function storeMany(Request $request)
    {
        $request->validate([
            'player_id' => 'required|exists:players,id',
            'charges' => 'required|array|min:1',
            'charges.*.concept' => 'required|string|max:255',
            'charges.*.amount' => 'required|numeric|min:0.01',
            'charges.*.due_date' => 'required|date',
            'charges.*.paid_amount' => 'nullable|numeric|min:0',
            'charges.*.status' => 'nullable|string|in:pending,partial,paid',
        ]);

        $player = Player::findOrFail($request->player_id);
        $parentId = $player->parents->first()->id ?? Auth::id();
        $count = 0;

        foreach ($request->charges as $charge) {
            $paidAmount = floatval($charge['paid_amount'] ?? 0);
            $amount = floatval($charge['amount']);
            
            $status = 'pending';
            if ($paidAmount >= $amount) {
                $status = 'paid';
                $paidAmount = $amount;
            } elseif ($paidAmount > 0) {
                $status = 'partial';
            }

            FinancialTransaction::create([
                'player_id' => $player->id,
                'user_id' => $parentId,
                'concept' => $charge['concept'],
                'amount' => $amount,
                'paid_amount' => $paidAmount,
                'due_date' => $charge['due_date'],
                'status' => $status,
                'is_arbitration_penalty' => str_contains(strtolower($charge['concept']), 'arbitraje'),
                'club_amount' => $paidAmount, // Todo lo pagado va al club por defecto
            ]);
            $count++;
        }

        return back()->with('success', "Se registraron {$count} cargos correctamente.");
    }

    /**
     * Actualizar un cargo existente.
     */
    public function updateCharge(Request $request, FinancialTransaction $transaction)
    {
        $request->validate([
            'concept' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'due_date' => 'required|date',
        ]);

        $transaction->update([
            'concept' => $request->concept,
            'amount' => $request->amount,
            'due_date' => $request->due_date,
        ]);

        // Recalculate status
        if ($transaction->paid_amount >= $transaction->amount) {
            $transaction->update(['status' => 'paid']);
        } elseif ($transaction->paid_amount > 0) {
            $transaction->update(['status' => 'partial']);
        } else {
            $transaction->update(['status' => 'pending']);
        }

        return back()->with('success', 'Cargo actualizado correctamente.');
    }

    /**
     * Eliminar un cargo.
     */
    public function destroyCharge(FinancialTransaction $transaction)
    {
        $transaction->transactionPayments()->delete();
        $transaction->delete();

        return back()->with('success', 'Cargo eliminado correctamente.');
    }

    /**
     * Registrar un pago manual (efectivo) para un cargo.
     */
    public function registerPayment(Request $request, FinancialTransaction $transaction)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'method' => 'required|string|in:cash,transfer,card',
            'notes' => 'nullable|string',
        ]);

        $remaining = $transaction->amount - $transaction->paid_amount;
        $amountToPay = min($request->amount, $remaining);

        if ($amountToPay <= 0) {
            return back()->with('error', 'Este cargo ya está pagado.');
        }

        TransactionPayment::create([
            'financial_transaction_id' => $transaction->id,
            'user_id' => Auth::id(),
            'amount' => $amountToPay,
            'method' => $request->method,
        ]);

        $transaction->paid_amount += $amountToPay;
        if ($transaction->paid_amount >= $transaction->amount) {
            $transaction->status = 'paid';
        } else {
            $transaction->status = 'partial';
        }

        // Update club amount
        if ($transaction->is_arbitration_penalty) {
            $transaction->club_amount = ($transaction->club_amount ?? 0) + ($amountToPay * 0.50);
            $transaction->developer_amount = ($transaction->developer_amount ?? 0) + ($amountToPay * 0.50);
        } else {
            $transaction->club_amount = ($transaction->club_amount ?? 0) + $amountToPay;
        }

        $transaction->save();

        return back()->with('success', "Pago de \${$amountToPay} registrado correctamente.");
    }

    /**
     * Cobro masivo: Genera un cargo a todos los jugadores activos de una categoría.
     */
    public function bulkCharge(Request $request)
    {
        $request->validate([
            'category' => 'required|string',
            'concept' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'due_date' => 'required|date',
            'is_arbitration_penalty' => 'boolean',
            'include_secondary' => 'boolean',
        ]);

        $query = Player::where('status', 'active')->where(function ($q) use ($request) {
            $q->where('category', $request->category);
            if ($request->include_secondary) {
                $q->orWhere('secondary_category', $request->category);
            }
        });

        $players = $query->get();
        $count = 0;

        $isArbitraje = $request->is_arbitration_penalty || str_contains(strtolower($request->concept), 'arbitraje');

        foreach ($players as $player) {
            // Si el jugador pertenece a esta categoría solo como refuerzo, 
            // no se le deben cobrar inscripciones/mensualidades de esta categoría, solo arbitrajes.
            if ($player->category !== $request->category && $player->secondary_category === $request->category) {
                if (!$isArbitraje) {
                    continue; // Saltar si no es arbitraje
                }
            }

            FinancialTransaction::create([
                'player_id' => $player->id,
                'user_id' => $player->parents->first()->id ?? Auth::id(),
                'concept' => $request->concept,
                'amount' => $request->amount,
                'paid_amount' => 0,
                'due_date' => $request->due_date,
                'status' => 'pending',
                'is_arbitration_penalty' => $request->is_arbitration_penalty ?? false,
            ]);
            $count++;
        }

        return back()->with('success', "Se generaron {$count} cargos de '{$request->concept}' para la categoría {$request->category}.");
    }
}
