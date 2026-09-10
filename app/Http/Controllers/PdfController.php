<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\FinancialTransaction;
use App\Models\Player;
use Barryvdh\DomPDF\Facade\Pdf;

class PdfController extends Controller
{
    /**
     * Download the receipt for a specific transaction.
     */
    public function downloadReceipt($id)
    {
        $transaction = FinancialTransaction::with(['player', 'user'])->findOrFail($id);

        // Optional: Ensure the user is either the parent of the transaction or an admin
        // if (auth()->id() !== $transaction->user_id && auth()->user()->role !== 'admin') {
        //    abort(403, 'Unauthorized access.');
        // }

        $pdf = Pdf::loadView('pdf.receipt', compact('transaction'));

        return $pdf->download('Recibo_HE5_' . str_pad($transaction->id, 6, '0', STR_PAD_LEFT) . '.pdf');
    }

    /**
     * Download an account statement for a player.
     */
    public function downloadStatement($playerId)
    {
        $player = Player::with(['financialTransactions' => function($q) {
            $q->orderBy('due_date', 'asc');
        }])->findOrFail($playerId);

        // Group transactions by year
        $transactionsByYear = [];
        $totalCharged = 0;
        $totalPaid = 0;

        foreach ($player->financialTransactions as $tx) {
            $year = $tx->due_date ? date('Y', strtotime($tx->due_date)) : 'Sin Fecha';
            if (!isset($transactionsByYear[$year])) {
                $transactionsByYear[$year] = [];
            }
            $transactionsByYear[$year][] = $tx;
            
            $totalCharged += $tx->amount;
            $totalPaid += $tx->paid_amount;
        }

        // Sort years descending so newest is first
        krsort($transactionsByYear);

        $pdf = Pdf::loadView('pdf.statement', compact('player', 'transactionsByYear', 'totalCharged', 'totalPaid'));
        
        $fileName = 'Estado_de_Cuenta_' . str_replace(' ', '_', $player->first_name . '_' . $player->last_name) . '.pdf';
        return $pdf->download($fileName);
    }

    /**
     * Download a blank letterhead.
     */
    public function downloadLetterhead()
    {
        // Typically only admins might need to generate blank letterheads, 
        // but we'll leave it accessible or protected by route middleware.
        $pdf = Pdf::loadView('pdf.letterhead');
        return $pdf->download('Hoja_Membretada_HE5.pdf');
    }
}
