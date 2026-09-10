<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('transaction_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('financial_transaction_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->string('method')->default('card'); // 'card', 'cash', 'wallet'
            $table->string('stripe_payment_id')->nullable();
            $table->timestamps(); // created_at handles the exact date/time
        });
    }

    public function down(): void {
        Schema::dropIfExists('transaction_payments');
    }
};
