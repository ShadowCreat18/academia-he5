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
        Schema::create('games', function (Blueprint $table) {
            $table->id();
            $table->string('opponent');
            $table->dateTime('date');
            $table->string('location')->nullable();
            $table->string('category');
            $table->string('uniform_type')->nullable(); // Local, Visitante, etc
            $table->integer('score_us')->nullable();
            $table->integer('score_them')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('games');
    }
};
