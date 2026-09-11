<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Player extends Model
{
    use HasFactory;

    protected $fillable = [
        'parent_id', // keeping it for backwards compatibility if needed, but not primarily used
        'first_name',
        'last_name',
        'curp',
        'jersey_number',
        'birth_date',
        'position',
        'photo_path',
        'contact_info',
        'scholarship_type',
        'scholarship_value',
        'category',
        'secondary_category',
        'status',
        'charges_generated_year',
    ];

    /**
     * Los tutores (padres) asignados a este jugador.
     */
    public function parents(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'player_user');
    }

    /**
     * Las transacciones financieras (adeudos, pagos) específicos de este niño.
     */
    public function financialTransactions(): HasMany
    {
        return $this->hasMany(FinancialTransaction::class);
    }

    public function goals(): HasMany
    {
        return $this->hasMany(GameGoal::class);
    }
}
