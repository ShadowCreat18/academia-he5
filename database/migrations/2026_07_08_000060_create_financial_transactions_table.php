<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('financial_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // The parent
            $table->foreignId('player_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('season_id')->nullable()->constrained()->onDelete('set null');
            
            $table->enum('type', ['charge', 'top_up', 'payment']);
            $table->string('concept');
            $table->decimal('amount', 10, 2);
            $table->decimal('paid_amount', 10, 2)->default(0);
            $table->date('due_date')->nullable();
            $table->enum('status', ['pending', 'partial', 'paid', 'cancelled'])->default('pending');
            
            $table->string('stripe_payment_id')->nullable();
            $table->string('transfer_id')->nullable(); // For Developer commission tracking
            $table->boolean('is_arbitration_penalty')->default(false);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financial_transactions');
    }
};
