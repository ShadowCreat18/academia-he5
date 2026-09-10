<?php

namespace App\Http\Controllers;

use App\Models\FinancialTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function index()
    {
        $transactions = Auth::user()->financialTransactions;
        return response()->json($transactions);
    }

    /**
     * Carrito de Pagos: Distribuir un pago único en múltiples deudas y/o monedero.
     */
    public function checkoutCart(Request $request)
    {
        $request->validate([
            'allocations' => 'nullable|array',
            'allocations.*.transaction_id' => 'required|exists:financial_transactions,id',
            'allocations.*.amount' => 'required|numeric|min:0.01',
            'wallet_top_up' => 'nullable|numeric|min:0',
            'payment_method' => 'required|string|in:card,wallet,cash',
            'stripe_payment_id' => 'nullable|string', // If paid via Stripe
        ]);

        $user = Auth::user();
        
        DB::transaction(function () use ($request, $user) {
            $method = $request->payment_method;
            $stripePaymentId = $request->stripe_payment_id;

            // 1. Process allocations
            if ($request->has('allocations') && is_array($request->allocations)) {
                foreach ($request->allocations as $alloc) {
                    $transaction = FinancialTransaction::findOrFail($alloc['transaction_id']);
                    $amountToPay = (float) $alloc['amount'];

                    // Check if it's overpaying
                    $remaining = $transaction->amount - $transaction->paid_amount;
                    if ($amountToPay > $remaining) {
                        $amountToPay = $remaining; // Avoid overpaying a specific debt
                    }

                    // Create Payment History Record
                    \App\Models\TransactionPayment::create([
                        'financial_transaction_id' => $transaction->id,
                        'user_id' => $user->id,
                        'amount' => $amountToPay,
                        'method' => $method,
                        'stripe_payment_id' => $stripePaymentId,
                    ]);

                    // Update Transaction Paid Amount
                    $transaction->paid_amount += $amountToPay;
                    if ($transaction->paid_amount >= $transaction->amount) {
                        $transaction->status = 'paid';
                    } else {
                        $transaction->status = 'partial';
                    }

                    // Calculate Splits
                    if ($transaction->is_arbitration_penalty) {
                        // 50/50 split on the PAID amount
                        $transaction->club_amount += ($amountToPay * 0.50);
                        $transaction->developer_amount += ($amountToPay * 0.50);
                    } else {
                        $transaction->club_amount += $amountToPay;
                    }
                    
                    // Note: platform_fee is charged separately to the user on checkout via Stripe, 
                    // it doesn't reduce the club's principal amount here unless configured.

                    $transaction->save();
                }
            }

            // 2. Process Wallet Top-up
            if ($request->has('wallet_top_up') && $request->wallet_top_up > 0) {
                $user->saldo_disponible += (float) $request->wallet_top_up;
                $user->save();
                // We could also log wallet top-ups in a separate ledger if needed
            }

            // If paid from wallet, subtract the total used
            if ($method === 'wallet') {
                $totalAllocated = collect($request->allocations)->sum('amount');
                if ($user->saldo_disponible < $totalAllocated) {
                    throw new \Exception('Saldo insuficiente en el monedero.');
                }
                $user->saldo_disponible -= $totalAllocated;
                $user->save();
            }
        });

        return response()->json(['message' => 'Pago procesado y distribuido exitosamente.']);
    }

    public function storeCharge(Request $request)
    {
        // Admin creates a new Debt
        $request->validate([
            'player_id' => 'required|exists:players,id',
            'concept' => 'required|string',
            'amount' => 'required|numeric|min:0.01',
            'due_date' => 'required|date',
            'is_arbitration_penalty' => 'boolean',
        ]);

        $player = \App\Models\Player::findOrFail($request->player_id);
        
        FinancialTransaction::create([
            'player_id' => $player->id,
            'user_id' => $player->parents->first()->id ?? Auth::id(),
            'concept' => $request->concept, // Ej: "Mensualidad Agosto 2026", "Arbitraje - 24 Agosto"
            'amount' => $request->amount,
            'paid_amount' => 0,
            'due_date' => $request->due_date,
            'status' => 'pending',
            'is_arbitration_penalty' => $request->is_arbitration_penalty ?? false,
        ]);

        return back()->with('success', 'Cargo creado correctamente.');
    }
}
