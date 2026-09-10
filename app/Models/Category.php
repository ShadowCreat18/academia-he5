<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'min_birth_year',
        'max_birth_year',
    ];

    public function players()
    {
        return $this->belongsToMany(Player::class)
            ->withPivot('season_id', 'is_active')
            ->withTimestamps();
    }

    public function stats()
    {
        return $this->hasMany(PlayerStat::class);
    }
}
