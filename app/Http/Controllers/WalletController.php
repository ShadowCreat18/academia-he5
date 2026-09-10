<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Charge;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class WalletController extends Controller
{
    /**
     * El padre abona dinero a su monedero (Simulación de Stripe).
     */
    public function topUp(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'stripe_token' => 'required|string', // Token de Stripe generado en el frontend
        ]);

        $user = auth()->user();
        $amount = $request->amount;

        DB::transaction(function () use ($user, $amount, $request) {
            // 1. Simular cobro en Stripe y obtener ID
            $stripePaymentId = 'ch_' . str_random(24);

            // 2. Registrar el pago en el historial
            Payment::create([
                'user_id' => $user->id,
                'amount' => $amount,
                'stripe_payment_id' => $stripePaymentId,
                'method' => 'card',
            ]);

            // 3. Abonar al Monedero (Financial Account)
            $financialAccount = $user->financialAccount;
            $financialAccount->balance += $amount;
            $financialAccount->save();
        });

        return back()->with('success', 'Se ha abonado $' . $amount . ' a tu monedero exitosamente.');
    }

    /**
     * El padre elige pagar un cargo específico usando su saldo a favor.
     */
    public function payCharge(Request $request, Charge $charge)
    {
        $user = auth()->user();

        // Verificar que el cargo pertenece al usuario y no está pagado
        if ($charge->user_id !== $user->id || $charge->status === 'paid') {
            return back()->with('error', 'Cargo no válido o ya pagado.');
        }

        $financialAccount = $user->financialAccount;

        // Verificar si tiene saldo suficiente
        if ($financialAccount->balance < $charge->amount) {
            return back()->with('error', 'Saldo insuficiente en tu monedero. Por favor, recarga tu saldo.');
        }

        DB::transaction(function () use ($financialAccount, $charge) {
            // 1. Descontar del monedero
            $financialAccount->balance -= $charge->amount;
            $financialAccount->save();

            // 2. Marcar cargo como pagado
            $charge->status = 'paid';
            $charge->save();
        });

        return back()->with('success', 'Cargo pagado exitosamente con tu saldo.');
    }
}
