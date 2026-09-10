<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransactionPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'financial_transaction_id',
        'user_id',
        'amount',
        'method',
        'stripe_payment_id',
    ];

    public function financialTransaction()
    {
        return $this->belongsTo(FinancialTransaction::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
