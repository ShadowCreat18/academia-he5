<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('financial_transactions', function (Blueprint $table) {
            $table->decimal('platform_fee', 10, 2)->default(0)->after('paid_amount');
            $table->decimal('club_amount', 10, 2)->default(0)->after('platform_fee');
            $table->decimal('developer_amount', 10, 2)->default(0)->after('club_amount');
        });
    }

    public function down(): void {
        Schema::table('financial_transactions', function (Blueprint $table) {
            $table->dropColumn(['platform_fee', 'club_amount', 'developer_amount']);
        });
    }
};
