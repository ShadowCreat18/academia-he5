<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Héctor Esparza',
            'username' => 'hector',
            'email' => 'hector@he5.com',
            'password' => bcrypt('password123'),
            'role' => 'admin',
            'saldo_disponible' => 0,
        ]);

        User::factory()->create([
            'name' => 'Josceline Esparza',
            'username' => 'josceline',
            'email' => 'josceline@he5.com',
            'password' => bcrypt('password123'),
            'role' => 'admin',
            'saldo_disponible' => 0,
        ]);

        User::factory()->create([
            'name' => 'Christian Esparza',
            'username' => 'christian',
            'email' => 'christian@he5.com',
            'password' => bcrypt('password123'),
            'role' => 'admin',
            'saldo_disponible' => 0,
        ]);
    }
}
