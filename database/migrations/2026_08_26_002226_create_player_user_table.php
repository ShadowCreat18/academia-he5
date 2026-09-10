<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void {
        Schema::create('player_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('player_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });
        
        // Migrate existing parent_ids
        DB::statement('INSERT INTO player_user (player_id, user_id, created_at, updated_at) SELECT id, parent_id, NOW(), NOW() FROM players WHERE parent_id IS NOT NULL');
    }

    public function down(): void {
        Schema::dropIfExists('player_user');
    }
};
