<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'player_id',
        'season_id',
        'type',
        'concept',
        'amount',
        'paid_amount',
        'platform_fee',
        'club_amount',
        'developer_amount',
        'due_date',
        'status',
        'stripe_payment_id',
        'transfer_id',
        'is_arbitration_penalty',
    ];

    protected $casts = [
        'is_arbitration_penalty' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function player()
    {
        return $this->belongsTo(Player::class);
    }

    public function season()
    {
        return $this->belongsTo(Season::class);
    }

    public function transactionPayments()
    {
        return $this->hasMany(TransactionPayment::class);
    }
}
