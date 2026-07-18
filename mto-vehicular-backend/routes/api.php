<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\VehicleController;
use App\Http\Controllers\Api\MaintenanceController;

Route::get('/dashboard', [VehicleController::class, 'dashboard']);
Route::get('/dashboard/report', [VehicleController::class, 'generateReport']);
Route::get('/vehicles', [VehicleController::class, 'index']);
Route::post('/vehicles', [VehicleController::class, 'store']);
Route::delete('/vehicles/{id}', [VehicleController::class, 'destroy']);
Route::patch('/vehicles/{id}/status', [VehicleController::class, 'updateStatus']);
Route::get('/vehicles/{id}/history', [VehicleController::class, 'history']);
Route::get('/vehicles/{id}/report', [VehicleController::class, 'generateVehicleReport']);
Route::post('/maintenances', [MaintenanceController::class, 'store']);
Route::delete('/maintenances/{id}', [MaintenanceController::class, 'destroy']);
Route::put('/maintenances/{id}', [MaintenanceController::class, 'update']);
Route::post('/register-device-token', [VehicleController::class, 'registerDeviceToken']);
Route::post('/vehicles/{id}/reminders', [VehicleController::class, 'storeReminder']);
Route::delete('/reminders/{id}', [VehicleController::class, 'destroyReminder']);