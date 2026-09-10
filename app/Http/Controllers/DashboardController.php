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
                'income' => $transactions->sum('paid_amount'), // Podría limitarse al mes actual
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
                    'income' => $catTxs->sum('paid_amount'),
                    'overdue' => $catTxs->where('status', '!=', 'paid')->sum(function($tx) {
                        return max(0, $tx->amount - $tx->paid_amount);
                    }),
                ];
            }

            return Inertia::render('Admin/Dashboard', [
                'categoriesStats' => $categoriesStats,
                'topDebtors' => $topDebtors,
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
