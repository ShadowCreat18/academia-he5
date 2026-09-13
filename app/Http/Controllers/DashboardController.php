<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Player;
use App\Models\FinancialTransaction;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()->role === 'admin') {
            $players = Player::with('parents')->get();
            $transactions = FinancialTransaction::with('player')->get();

            $topDebtors = $players->map(function($player) use ($transactions) {
                $playerTxs = $transactions->where('player_id', $player->id);
                $player->total_debt = $playerTxs->where('status', '!=', 'paid')->sum(function($tx) {
                    return max(0, $tx->amount - $tx->paid_amount);
                });
                return $player;
            })->filter(function($player) {
                return $player->total_debt > 0;
            })->sortByDesc('total_debt')->take(10)->values();

            $playersByCategory = $players->groupBy(function($player) {
                return $player->category ?: 'Sin Categoría';
            });

            $transactionsByCategory = $transactions->groupBy(function($tx) {
                return $tx->player && $tx->player->category ? $tx->player->category : 'Sin Categoría';
            });

            $allCategories = $playersByCategory->keys()->merge($transactionsByCategory->keys())->unique()->values();

            $categoriesStats = [];
            
            // Stats totales (Global)
            $categoriesStats['General'] = [
                'activePlayers' => $players->count(),
                'income' => $transactions->where('is_arbitration_penalty', false)->filter(function($tx) {
                    return !str_contains(strtolower($tx->concept), 'arbitraje');
                })->sum('paid_amount'), // Ingresos globales excluyendo arbitraje
                'overdue' => $transactions->where('status', '!=', 'paid')->sum(function($tx) {
                    return max(0, $tx->amount - $tx->paid_amount);
                }),
            ];

            // Stats por categoría
            foreach ($allCategories as $cat) {
                $catPlayers = $playersByCategory->get($cat) ?? collect();
                $catTxs = $transactionsByCategory->get($cat) ?? collect();

                $categoriesStats[$cat] = [
                    'activePlayers' => $catPlayers->count(),
                    'income' => $catTxs->where('is_arbitration_penalty', false)->filter(function($tx) {
                        return !str_contains(strtolower($tx->concept), 'arbitraje');
                    })->sum('paid_amount'),
                    'overdue' => $catTxs->where('status', '!=', 'paid')->sum(function($tx) {
                        return max(0, $tx->amount - $tx->paid_amount);
                    }),
                ];
            }

            // Calcular ingresos mensuales y distribución para las gráficas
            $payments = \App\Models\TransactionPayment::with('financialTransaction')
                ->whereNotNull('financial_transaction_id')
                ->get();
            
            // Excluir arbitrajes de los pagos
            $validPayments = $payments->filter(function($payment) {
                $tx = $payment->financialTransaction;
                if (!$tx) return false;
                if ($tx->is_arbitration_penalty) return false;
                if (str_contains(strtolower($tx->concept), 'arbitraje')) return false;
                return true;
            });

            // Agrupar por mes (año actual)
            $currentYear = Carbon::now()->year;
            $monthlyIncome = [
                'Ene' => 0, 'Feb' => 0, 'Mar' => 0, 'Abr' => 0, 'May' => 0, 'Jun' => 0,
                'Jul' => 0, 'Ago' => 0, 'Sep' => 0, 'Oct' => 0, 'Nov' => 0, 'Dic' => 0
            ];
            $monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

            foreach ($validPayments as $payment) {
                $date = Carbon::parse($payment->created_at);
                if ($date->year == $currentYear) {
                    $monthStr = $monthNames[$date->month - 1];
                    $monthlyIncome[$monthStr] += (float) $payment->amount;
                }
            }

            // Formatear para recharts
            $monthlyChartData = [];
            foreach ($monthlyIncome as $month => $total) {
                $monthlyChartData[] = ['name' => $month, 'total' => round($total, 2)];
            }

            // Agrupar por concepto (Gráfica circular)
            $distributionData = [];
            foreach ($validPayments as $payment) {
                $concept = $payment->financialTransaction->concept;
                // Agrupar por la primera palabra clave para limpiar la gráfica (ej. Mensualidad Octubre -> Mensualidad)
                $firstWord = explode(' ', trim($concept))[0]; 
                // Estandarizar un poco (Mensualidad, Inscripción, Uniforme, Torneo)
                $groupName = ucfirst(strtolower($firstWord));

                if (!isset($distributionData[$groupName])) {
                    $distributionData[$groupName] = 0;
                }
                $distributionData[$groupName] += (float) $payment->amount;
            }

            $pieChartData = [];
            foreach ($distributionData as $name => $value) {
                if ($value > 0) {
                    $pieChartData[] = ['name' => $name, 'value' => round($value, 2)];
                }
            }
            usort($pieChartData, function($a, $b) { return $b['value'] <=> $a['value']; });

            return Inertia::render('Admin/Dashboard', [
                'categoriesStats' => $categoriesStats,
                'topDebtors' => $topDebtors,
                'monthlyChartData' => $monthlyChartData,
                'pieChartData' => $pieChartData,
                'whatsappPhone' => \App\Models\Setting::getVal('whatsapp_sender_phone', '4921226800'),
            ]);
        }

        $user = $request->user();
        
        // Eager load players using the pivot table
        $players = Player::whereHas('parents', function ($query) use ($user) {
                $query->where('users.id', $user->id);
            })
            ->with(['financialTransactions' => function ($query) {
                $query->whereIn('status', ['pending', 'partial']);
            }])
            ->get();

        return Inertia::render('Parent/Dashboard', [
            'saldo_disponible' => $user->saldo_disponible ?? 0,
            'players' => $players
        ]);
    }
}
