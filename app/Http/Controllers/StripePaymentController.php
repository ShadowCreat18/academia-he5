<?php

namespace App\Http\Controllers;

use App\Models\FinancialTransaction;
use App\Models\Player;
use App\Models\TransactionPayment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Stripe;
use Stripe\Webhook;

class StripePaymentController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Calcula el cobro bruto para que la academia reciba: Monto Original + $15 MXN de ganancia fija.
     * Toma en cuenta la comisión de Stripe (3.6% + $3 MXN).
     */
    private function calculateGrossAmount($originalAmount)
    {
        // 1. Queremos que la academia reciba el monto original + una ganancia fija ($15 MXN)
        $fixedProfit = 15;
        $desiredNet = $originalAmount + $fixedProfit;
        
        // 2. Stripe cobra 3.6% sobre el Total + $3 MXN.
        // Fórmula matemática: Total = (Neto Deseado + 3) / (1 - 0.036)
        $totalCharge = ($desiredNet + 3) / 0.964;
        
        return round($totalCharge, 2);
    }


    /**
     * Iniciar sesión de pago en Stripe Checkout.
     */
    public function createCheckoutSession(Request $request)
    {
        $request->validate([
            'type' => 'required|in:single_charge,player_total,wallet_topup,multiple_charges',
            'transaction_id' => 'nullable|exists:financial_transactions,id',
            'transaction_ids' => 'nullable|array',
            'transaction_ids.*' => 'exists:financial_transactions,id',
            'player_id' => 'nullable|exists:players,id',
            'amount' => 'nullable|numeric|min:1',
        ]);

        $user = Auth::user();
        $lineItems = [];
        $metadata = [
            'user_id' => $user->id,
            'type' => $request->type,
        ];

        if ($request->type === 'single_charge') {
            $transaction = FinancialTransaction::with('player')->findOrFail($request->transaction_id);
            $debt = max(0, $transaction->amount - $transaction->paid_amount);

            if ($debt <= 0) {
                return back()->with('info', 'Este concepto ya se encuentra liquidado.');
            }

            $lineItems[] = [
                'price_data' => [
                    'currency' => 'mxn',
                    'product_data' => [
                        'name' => $transaction->concept . ' - ' . ($transaction->player ? $transaction->player->first_name . ' ' . $transaction->player->last_name : 'HE-5'),
                        'description' => 'Pago de concepto para Academia HE-5 (Incluye comisiones)',
                    ],
                    'unit_amount' => (int) round($this->calculateGrossAmount($debt) * 100),
                ],
                'quantity' => 1,
            ];

            $metadata['transaction_id'] = $transaction->id;
            $metadata['amount'] = $debt;

        } elseif ($request->type === 'multiple_charges') {
            $transactions = FinancialTransaction::with('player')->whereIn('id', $request->transaction_ids)->get();
            $totalDebt = 0;
            $playerNames = [];
            
            foreach ($transactions as $transaction) {
                $debt = max(0, $transaction->amount - $transaction->paid_amount);
                $totalDebt += $debt;
                if ($transaction->player) {
                    $name = $transaction->player->first_name;
                    if (!in_array($name, $playerNames)) {
                        $playerNames[] = $name;
                    }
                }
            }

            if ($totalDebt <= 0) {
                return back()->with('info', 'Los conceptos seleccionados ya están liquidados.');
            }

            $lineItems[] = [
                'price_data' => [
                    'currency' => 'mxn',
                    'product_data' => [
                        'name' => 'Pago de Adeudos (' . count($transactions) . ' conceptos)',
                        'description' => 'Jugadores: ' . implode(', ', $playerNames) . ' (Incluye comisiones)',
                    ],
                    'unit_amount' => (int) round($this->calculateGrossAmount($totalDebt) * 100),
                ],
                'quantity' => 1,
            ];

            // Metadata limits values to 500 characters, so comma separated string is efficient
            $metadata['transaction_ids'] = implode(',', $request->transaction_ids);
            $metadata['amount'] = $totalDebt;

        } elseif ($request->type === 'player_total') {
            $player = Player::with(['financialTransactions' => function ($q) {
                $q->where('status', '!=', 'paid');
            }])->findOrFail($request->player_id);

            $pendingTransactions = $player->financialTransactions->filter(function ($tx) {
                return ($tx->amount - $tx->paid_amount) > 0;
            });

            $totalDebt = $pendingTransactions->sum(function ($tx) {
                return max(0, $tx->amount - $tx->paid_amount);
            });

            if ($totalDebt <= 0) {
                return back()->with('info', 'No hay adeudos pendientes para este jugador.');
            }

            $lineItems[] = [
                'price_data' => [
                    'currency' => 'mxn',
                    'product_data' => [
                        'name' => 'Liquidación Total - ' . $player->first_name . ' ' . $player->last_name,
                        'description' => 'Pago total de conceptos pendientes en Academia HE-5 (Incluye comisiones)',
                    ],
                    'unit_amount' => (int) round($this->calculateGrossAmount($totalDebt) * 100),
                ],
                'quantity' => 1,
            ];

            $metadata['player_id'] = $player->id;
            $metadata['amount'] = $totalDebt;

        } elseif ($request->type === 'wallet_topup') {
            $amount = (float) $request->amount;
            if ($amount <= 0) {
                return back()->with('error', 'El monto a recargar debe ser mayor a $0.');
            }

            $lineItems[] = [
                'price_data' => [
                    'currency' => 'mxn',
                    'product_data' => [
                        'name' => 'Recarga de Monedero Digital HE-5',
                        'description' => 'Saldo a favor para pagos en plataforma (Incluye comisiones)',
                    ],
                    'unit_amount' => (int) round($this->calculateGrossAmount($amount) * 100),
                ],
                'quantity' => 1,
            ];

            $metadata['amount'] = $amount;
        }

        try {
            $session = StripeSession::create([
                'payment_method_types' => ['card'],
                'line_items' => $lineItems,
                'mode' => 'payment',
                'customer_email' => $user->email,
                'client_reference_id' => (string) $user->id,
                'metadata' => $metadata,
                'success_url' => route('parent.stripe.success') . '?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => route('parent.finances'),
            ]);

            return response()->json(['url' => $session->url]);
        } catch (\Exception $e) {
            Log::error('Stripe Checkout Error: ' . $e->getMessage());
            return response()->json(['error' => 'No se pudo iniciar la pasarela de pago: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Retorno exitoso de Stripe Checkout.
     */
    public function handleSuccess(Request $request)
    {
        $sessionId = $request->query('session_id');

        if (!$sessionId) {
            return redirect()->route('parent.finances');
        }

        try {
            $session = StripeSession::retrieve($sessionId);

            if ($session->payment_status !== 'paid') {
                return redirect()->route('parent.finances')->with('error', 'El pago no fue completado.');
            }

            $paymentIntentId = $session->payment_intent ?? $session->id;

            // Evitar procesar el mismo pago dos veces
            $alreadyProcessed = TransactionPayment::where('stripe_payment_id', $paymentIntentId)->exists();
            if ($alreadyProcessed) {
                return redirect()->route('parent.finances')->with('success', '¡Tu pago ya fue registrado exitosamente!');
            }

            $metadata = $session->metadata;
            $type = $metadata->type ?? null;
            $userId = (int) ($metadata->user_id ?? Auth::id());
            $user = User::find($userId) ?? Auth::user();

            DB::transaction(function () use ($session, $paymentIntentId, $metadata, $type, $user) {
                if ($type === 'single_charge') {
                    $transactionId = (int) $metadata->transaction_id;
                    $transaction = FinancialTransaction::findOrFail($transactionId);
                    $amountPaid = (float) $metadata->amount;

                    TransactionPayment::create([
                        'financial_transaction_id' => $transaction->id,
                        'user_id' => $user->id,
                        'amount' => $amountPaid,
                        'method' => 'card',
                        'stripe_payment_id' => $paymentIntentId,
                    ]);

                    $transaction->paid_amount += $amountPaid;
                    if ($transaction->paid_amount >= $transaction->amount) {
                        $transaction->status = 'paid';
                    } else {
                        $transaction->status = 'partial';
                    }
                    $transaction->save();

                } elseif ($type === 'player_total') {
                    $playerId = (int) $metadata->player_id;
                    $player = Player::with('financialTransactions')->findOrFail($playerId);
                    $remainingFunds = (float) $metadata->amount;

                    $pendingTransactions = $player->financialTransactions
                        ->filter(fn($t) => ($t->amount - $t->paid_amount) > 0)
                        ->sortBy('due_date');

                    foreach ($pendingTransactions as $tx) {
                        if ($remainingFunds <= 0) break;

                        $debt = $tx->amount - $tx->paid_amount;
                        $toPay = min($debt, $remainingFunds);

                        TransactionPayment::create([
                            'financial_transaction_id' => $tx->id,
                            'user_id' => $user->id,
                            'amount' => $toPay,
                            'method' => 'card',
                            'stripe_payment_id' => $paymentIntentId,
                        ]);

                        $tx->paid_amount += $toPay;
                        if ($tx->paid_amount >= $tx->amount) {
                            $tx->status = 'paid';
                        } else {
                            $tx->status = 'partial';
                        }
                        $tx->save();

                        $remainingFunds -= $toPay;
                    }

                } elseif ($type === 'multiple_charges') {
                    $transactionIds = explode(',', $metadata->transaction_ids);
                    $remainingFunds = (float) $metadata->amount;

                    // Fetch the requested transactions in due_date order just to be safe
                    $transactions = FinancialTransaction::whereIn('id', $transactionIds)
                        ->orderBy('due_date')
                        ->get();

                    foreach ($transactions as $tx) {
                        if ($remainingFunds <= 0) break;

                        $debt = $tx->amount - $tx->paid_amount;
                        if ($debt <= 0) continue;

                        $toPay = min($debt, $remainingFunds);

                        TransactionPayment::create([
                            'financial_transaction_id' => $tx->id,
                            'user_id' => $user->id,
                            'amount' => $toPay,
                            'method' => 'card',
                            'stripe_payment_id' => $paymentIntentId,
                        ]);

                        $tx->paid_amount += $toPay;
                        if ($tx->paid_amount >= $tx->amount) {
                            $tx->status = 'paid';
                        } else {
                            $tx->status = 'partial';
                        }
                        $tx->save();

                        $remainingFunds -= $toPay;
                    }

                } elseif ($type === 'wallet_topup') {
                    $amount = (float) $metadata->amount;

                    TransactionPayment::create([
                        'financial_transaction_id' => null,
                        'user_id' => $user->id,
                        'amount' => $amount,
                        'method' => 'card',
                        'stripe_payment_id' => $paymentIntentId,
                    ]);

                    $user->saldo_disponible += $amount;
                    $user->save();
                }
            });

            return redirect()->route('parent.finances')->with('success', '¡Pago procesado con éxito! Tu estado de cuenta ha sido actualizado.');

        } catch (\Exception $e) {
            Log::error('Error verificando Stripe Session: ' . $e->getMessage());
            return redirect()->route('parent.finances')->with('error', 'Ocurrió un error al verificar el pago con Stripe.');
        }
    }

    /**
     * Pagar concepto usando el Monedero Digital (Saldo a favor).
     */
    public function payWithWallet(Request $request)
    {
        $request->validate([
            'transaction_id' => 'required|exists:financial_transactions,id',
            'amount' => 'nullable|numeric|min:1',
        ]);

        $user = Auth::user();
        $transaction = FinancialTransaction::findOrFail($request->transaction_id);
        $debt = max(0, $transaction->amount - $transaction->paid_amount);

        if ($debt <= 0) {
            return back()->with('info', 'Este concepto ya se encuentra liquidado.');
        }

        $amountToPay = $request->amount ? (float) $request->amount : $debt;
        
        if ($amountToPay > $debt) {
            return back()->with('error', 'El monto no puede ser mayor a la deuda.');
        }

        if (($user->saldo_disponible ?? 0) < $amountToPay) {
            return back()->with('error', 'Saldo insuficiente en tu monedero digital para este monto.');
        }

        DB::transaction(function () use ($user, $transaction, $amountToPay) {
            $user->saldo_disponible -= $amountToPay;
            $user->save();

            TransactionPayment::create([
                'financial_transaction_id' => $transaction->id,
                'user_id' => $user->id,
                'amount' => $amountToPay,
                'method' => 'wallet',
            ]);

            $transaction->paid_amount += $amountToPay;
            if ($transaction->paid_amount >= $transaction->amount) {
                $transaction->status = 'paid';
            }
            $transaction->save();
        });

        return back()->with('success', '¡Abono de $'.$amountToPay.' realizado con éxito con tu monedero!');
    }

    /**
     * Webhook de Stripe — Verificación robusta contra-Hostinger.
     *
     * PROBLEMA: Hostinger usa LiteSpeed/proxy que puede modificar el body raw
     * del request, rompiendo la verificación de firma HMAC de Stripe.
     * SOLUCIÓN: Respondemos 200 OK inmediatamente (para que Stripe nunca marque
     * el evento como fallido), luego recuperamos y procesamos el evento de forma
     * segura usando Event::retrieve() — verificando directamente con la API de Stripe.
     *
     * Ruta: POST /stripe/webhook (excluida de CSRF en bootstrap/app.php)
     */
    public function handleWebhook(Request $request)
    {
        $payloadArray = json_decode($request->getContent(), true);
        $eventId = $payloadArray['id'] ?? null;

        // 1. Respuesta inmediata 200 a Stripe para evitar reintentos por timeout.
        //    Procesamos de forma síncrona pero Stripe ya no esperará la respuesta.
        if (!$eventId) {
            Log::warning('Stripe Webhook: payload sin ID recibido.');
            return response()->json(['status' => 'invalid_payload'], 200);
        }

        Log::info("Stripe Webhook recibido: evento {$eventId}");

        try {
            // Verificación segura: consultamos el evento directamente a Stripe.
            // Esto evita el problema de firma rota por el proxy de Hostinger.
            \Stripe\Stripe::setApiKey(config('services.stripe.secret'));
            $event = \Stripe\Event::retrieve($eventId);
        } catch (\Exception $e) {
            Log::error("Stripe Webhook: no se pudo verificar evento {$eventId} — " . $e->getMessage());
            // Retornamos 200 igualmente: si Stripe reintenta, lo manejamos de forma idempotente.
            return response()->json(['status' => 'verification_failed'], 200);
        }

        // 2. Solo procesamos pagos completados de Checkout.
        if ($event->type !== 'checkout.session.completed') {
            return response()->json(['status' => 'event_ignored'], 200);
        }

        $session = $event->data->object;

        // 3. Raza de condición: Stripe puede disparar el webhook ANTES de finalizar
        //    el pago en sus servidores. Si no está 'paid', ignoramos (Stripe reintentará).
        if ($session->payment_status !== 'paid') {
            Log::info("Stripe Webhook: sesión {$session->id} aún no pagada — ignorando.");
            return response()->json(['status' => 'payment_pending'], 200);
        }

        $paymentIntentId = $session->payment_intent ?? $session->id;

        // 4. Idempotencia: si ya fue procesado por el webhook o por handleSuccess, salimos.
        if (TransactionPayment::where('stripe_payment_id', $paymentIntentId)->exists()) {
            Log::info("Stripe Webhook: pago {$paymentIntentId} ya procesado — skipping.");
            return response()->json(['status' => 'already_processed'], 200);
        }

        $metadata = $session->metadata;
        $type = $metadata->type ?? null;
        $userId = (int) ($metadata->user_id ?? 0);
        $user = User::find($userId);

        if (!$user) {
            Log::error("Stripe Webhook: usuario {$userId} no encontrado para sesión {$session->id}");
            return response()->json(['status' => 'user_not_found'], 200);
        }

        try {
            DB::transaction(function () use ($paymentIntentId, $metadata, $type, $user) {
                if ($type === 'single_charge') {
                    $transaction = FinancialTransaction::findOrFail((int) $metadata->transaction_id);
                    $amountPaid = (float) $metadata->amount;
                    TransactionPayment::create([
                        'financial_transaction_id' => $transaction->id,
                        'user_id' => $user->id,
                        'amount' => $amountPaid,
                        'method' => 'card',
                        'stripe_payment_id' => $paymentIntentId,
                    ]);
                    $transaction->paid_amount += $amountPaid;
                    $transaction->status = $transaction->paid_amount >= $transaction->amount ? 'paid' : 'partial';
                    $transaction->save();

                } elseif ($type === 'multiple_charges') {
                    $transactionIds = explode(',', $metadata->transaction_ids);
                    $remainingFunds = (float) $metadata->amount;
                    $transactions = FinancialTransaction::whereIn('id', $transactionIds)->orderBy('due_date')->get();
                    foreach ($transactions as $tx) {
                        if ($remainingFunds <= 0) break;
                        $debt = $tx->amount - $tx->paid_amount;
                        if ($debt <= 0) continue;
                        $toPay = min($debt, $remainingFunds);
                        TransactionPayment::create([
                            'financial_transaction_id' => $tx->id,
                            'user_id' => $user->id,
                            'amount' => $toPay,
                            'method' => 'card',
                            'stripe_payment_id' => $paymentIntentId,
                        ]);
                        $tx->paid_amount += $toPay;
                        $tx->status = $tx->paid_amount >= $tx->amount ? 'paid' : 'partial';
                        $tx->save();
                        $remainingFunds -= $toPay;
                    }

                } elseif ($type === 'player_total') {
                    $player = Player::with('financialTransactions')->findOrFail((int) $metadata->player_id);
                    $remainingFunds = (float) $metadata->amount;
                    $pendingTransactions = $player->financialTransactions
                        ->filter(fn($t) => ($t->amount - $t->paid_amount) > 0)
                        ->sortBy('due_date');
                    foreach ($pendingTransactions as $tx) {
                        if ($remainingFunds <= 0) break;
                        $debt = $tx->amount - $tx->paid_amount;
                        $toPay = min($debt, $remainingFunds);
                        TransactionPayment::create([
                            'financial_transaction_id' => $tx->id,
                            'user_id' => $user->id,
                            'amount' => $toPay,
                            'method' => 'card',
                            'stripe_payment_id' => $paymentIntentId,
                        ]);
                        $tx->paid_amount += $toPay;
                        $tx->status = $tx->paid_amount >= $tx->amount ? 'paid' : 'partial';
                        $tx->save();
                        $remainingFunds -= $toPay;
                    }

                } elseif ($type === 'wallet_topup') {
                    $amount = (float) $metadata->amount;
                    TransactionPayment::create([
                        'financial_transaction_id' => null,
                        'user_id' => $user->id,
                        'amount' => $amount,
                        'method' => 'card',
                        'stripe_payment_id' => $paymentIntentId,
                    ]);
                    $user->saldo_disponible += $amount;
                    $user->save();
                }
            });

            Log::info("Stripe Webhook procesado exitosamente: tipo={$type}, usuario={$user->id}, pago={$paymentIntentId}");

        } catch (\Exception $e) {
            Log::error("Stripe Webhook: error procesando pago {$paymentIntentId} — " . $e->getMessage());
        }

        // Siempre retornamos 200 — la idempotencia garantiza que no haya doble procesamiento.
        return response()->json(['status' => 'success'], 200);
    }
}
