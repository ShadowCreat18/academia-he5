<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void {
        Schema::table('players', function (Blueprint $table) {
            $table->string('curp')->nullable()->after('last_name');
            $table->string('jersey_number')->nullable()->after('position');
            // Make parent_id nullable so parents can be assigned later
            $table->unsignedBigInteger('parent_id')->nullable()->change();
        });
    }

    public function down(): void {
        Schema::table('players', function (Blueprint $table) {
            $table->dropColumn(['curp', 'jersey_number']);
            $table->unsignedBigInteger('parent_id')->nullable(false)->change();
        });
    }
};
