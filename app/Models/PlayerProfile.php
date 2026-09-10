<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlayerProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'player_id',
        'curp_document_path',
        'photo_path',
        'medical_notes',
    ];

    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class);
    }
}
