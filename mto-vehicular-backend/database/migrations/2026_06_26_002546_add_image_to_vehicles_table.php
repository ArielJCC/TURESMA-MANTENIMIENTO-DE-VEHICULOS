<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->string('image')->nullable(); // Guardará la ruta de la foto
        });
    }

    public function down(): void {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropColumn('image');
        });
    }
};