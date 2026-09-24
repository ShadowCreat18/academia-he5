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

            $validPaymentsArray = $validPayments->map(function($payment) {
                $tx = $payment->financialTransaction;
                $playerCat = $tx->player ? $tx->player->category : 'Sin Categoría';
                if (!$playerCat) $playerCat = 'Sin Categoría';
                
                return [
                    'id' => $payment->id,
                    'amount' => (float) $payment->amount,
                    'created_at' => $payment->created_at->format('Y-m-d H:i:s'),
                    'concept' => $tx->concept,
                    'player_category' => $playerCat,
                ];
            })->values()->toArray();

            return Inertia::render('Admin/Dashboard', [
                'categoriesStats' => $categoriesStats,
                'topDebtors' => $topDebtors,
                'validPayments' => $validPaymentsArray,
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
