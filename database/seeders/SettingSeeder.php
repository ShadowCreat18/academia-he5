<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'cost_inscripcion', 'name' => 'Inscripción', 'value' => '1250', 'type' => 'number'],
            ['key' => 'cost_material', 'name' => 'Apoyo Material Deportivo', 'value' => '1000', 'type' => 'number'],
            ['key' => 'cost_torneo', 'name' => 'Inscripción Torneo', 'value' => '250', 'type' => 'number'],
            ['key' => 'cost_mensualidad', 'name' => 'Mensualidad', 'value' => '500', 'type' => 'number'],
            ['key' => 'cost_uniformes', 'name' => 'Uniformes', 'value' => '2000', 'type' => 'number'],
            ['key' => 'cost_arbitraje', 'name' => 'Arbitrajes', 'value' => '50', 'type' => 'number'],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(['key' => $setting['key']], $setting);
        }
    }
}
