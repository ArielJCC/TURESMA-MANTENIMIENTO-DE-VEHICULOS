<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\Reminder;
use App\Services\ExpoNotificationService;
use Carbon\Carbon;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Comando de Artisan para enviar notificaciones de recordatorios
Artisan::command('reminders:send', function () {
    $reminders = Reminder::with('vehicle')->get();
    
    $criticalCount = 0;
    $upcomingCount = 0;
    $details = [];

    foreach ($reminders as $reminder) {
        $vehicle = $reminder->vehicle;
        if (!$vehicle) continue;

        // Validar límite por fecha
        $dateLimitPassed = false;
        $dateNearLimit = false;
        if ($reminder->target_date) {
            $daysLeft = Carbon::now()->diffInDays(Carbon::parse($reminder->target_date), false);
            if ($daysLeft < 0) {
                $dateLimitPassed = true;
            } elseif ($daysLeft <= 15) {
                $dateNearLimit = true;
            }
        }

        if ($dateLimitPassed) {
            $criticalCount++;
            $details[] = "🚨 {$vehicle->plate} - {$reminder->title} (CRÍTICO)";
        } elseif ($dateNearLimit) {
            $upcomingCount++;
            $details[] = "⚠️ {$vehicle->plate} - {$reminder->title} (PRÓXIMO)";
        }
    }

    if ($criticalCount > 0 || $upcomingCount > 0) {
        $title = "Turesma Control Vehicular";
        $body = "Tienes " . ($criticalCount > 0 ? "{$criticalCount} alerta(s) crítica(s)" : "") . 
                ($criticalCount > 0 && $upcomingCount > 0 ? " y " : "") . 
                ($upcomingCount > 0 ? "{$upcomingCount} alerta(s) próxima(s)" : "") . " de mantenimiento pendientes.";
        
        $this->info("Enviando notificación push: {$body}");
        ExpoNotificationService::sendToAll($title, $body, [
            'critical' => $criticalCount,
            'upcoming' => $upcomingCount,
            'details' => array_slice($details, 0, 5)
        ]);
    } else {
        $this->info("No se encontraron alertas críticas ni próximas de mantenimiento.");
    }
})->purpose('Enviar notificaciones push para recordatorios de vehículos críticos y próximos');

// Programación de tarea: Ejecutar cada 2 horas en caso de tener alertas pendientes
Schedule::command('reminders:send')->everyTwoHours();
