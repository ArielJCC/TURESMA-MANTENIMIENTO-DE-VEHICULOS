<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\Maintenance;
use App\Models\Reminder;
use App\Models\DeviceToken;
use Illuminate\Http\Request;
use Carbon\Carbon;

class VehicleController extends Controller
{
    public function dashboard()
    {
        $totalVehicles = Vehicle::count();
        $activeVehicles = Vehicle::where('status', 'active')->count();
        $workshopVehicles = Vehicle::where('status', 'workshop')->count();

        $monthlyCosts = Maintenance::whereMonth('date', Carbon::now()->month)
            ->whereYear('date', Carbon::now()->year)
            ->sum('cost');

        $recentActivity = Maintenance::with('vehicle:id,plate,brand,model')
            ->orderBy('date', 'desc')->take(5)->get();

        $reminders = Reminder::where('status', 'pending')->with('vehicle')->get();
        $expiredCount = 0; $upcomingCount = 0;
        $vehiclesRequiringAction = [];
        $addedVehicleIds = [];

        foreach ($reminders as $reminder) {
            $status = $reminder->alert_status;
            if ($status === 'expired') {
                $expiredCount++;
            } elseif ($status === 'upcoming') {
                $upcomingCount++;
            }

            if ($status === 'expired' || $status === 'upcoming') {
                $vehicleId = $reminder->vehicle->id;
                if (!in_array($vehicleId, $addedVehicleIds)) {
                    $addedVehicleIds[] = $vehicleId;
                    $vehiclesRequiringAction[$vehicleId] = [
                        'id' => $reminder->vehicle->id,
                        'plate' => $reminder->vehicle->plate,
                        'brand' => $reminder->vehicle->brand,
                        'model' => $reminder->vehicle->model,
                        'year' => $reminder->vehicle->year,
                        'current_mileage' => $reminder->vehicle->current_mileage,
                        'image_url' => $reminder->vehicle->image ? asset('storage/' . $reminder->vehicle->image) : null,
                        'action_status' => $status,
                    ];
                } else {
                    if ($status === 'expired') {
                        $vehiclesRequiringAction[$vehicleId]['action_status'] = 'expired';
                    }
                }
            }
        }

        $vehiclesList = array_values($vehiclesRequiringAction);

        return response()->json([
            'vehicles' => ['total' => $totalVehicles, 'active' => $activeVehicles, 'workshop' => $workshopVehicles],
            'alerts' => ['expired' => $expiredCount, 'upcoming' => $upcomingCount, 'list' => $vehiclesList],
            'monthly_expenses' => $monthlyCosts,
            'recent_activity' => $recentActivity,
        ]);
    }

    public function index()
    {
        $vehicles = Vehicle::all()->map(function ($vehicle) {
            $vehicle->image_url = $vehicle->image ? asset('storage/' . $vehicle->image) : null;
            return $vehicle;
        });

        return response()->json($vehicles);
    }

    public function store(Request $request)
    {
        // Forzamos un bloque try-catch para atrapar el error exacto si Postgres o el validador chillan
        try {
            $validated = $request->validate([
                'plate'           => 'required|string',
                'brand'           => 'required|string',
                'model'           => 'required|string',
                'year'            => 'required', 
                'current_mileage' => 'required', 
                'image_file'      => 'nullable'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }

        // Validar manualmente si la placa ya existe para mandar un mensaje amigable
        if (Vehicle::where('plate', strtoupper($request->plate))->exists()) {
            return response()->json(['errors' => ['plate' => ['Esta matrícula ya existe.']]], 422);
        }

        $imagePath = null;
        if ($request->hasFile('image_file')) {
            $imagePath = $request->file('image_file')->store('vehicles', 'public');
        }

        $vehicle = Vehicle::create([
            'plate'           => strtoupper($request->plate),
            'brand'           => $request->brand,
            'model'           => $request->model,
            'year'            => (int) $request->year,
            'current_mileage' => (int) $request->current_mileage,
            'image'           => $imagePath
        ]);

        return response()->json($vehicle, 201);
    }

    public function history($id)
    {
        $vehicle = Vehicle::findOrFail($id);
        $vehicle->image_url = $vehicle->image ? asset('storage/' . $vehicle->image) : null;

        $maintenances = $vehicle->maintenances()->orderBy('date', 'desc')->get();
        $reminders = $vehicle->reminders()->get();
        $totalSpent = $maintenances->sum('cost');
        $activeAlerts = $reminders->whereIn('alert_status', ['expired', 'upcoming'])->values();

        return response()->json([
            'vehicle' => $vehicle,
            'total_spent' => $totalSpent,
            'maintenances' => $maintenances,
            'reminders' => $reminders,
            'active_alerts' => $activeAlerts
        ]);
    }

    public function destroy($id)
    {
        $vehicle = Vehicle::findOrFail($id);

        // Eliminar imagen del almacenamiento si existe
        if ($vehicle->image) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($vehicle->image);
        }

        $vehicle->delete();

        return response()->json(['message' => 'Vehículo eliminado correctamente.'], 200);
    }

    public function registerDeviceToken(Request $request)
    {
        $validated = $request->validate([
            'token' => 'required|string',
        ]);

        $deviceToken = DeviceToken::firstOrCreate([
            'token' => $validated['token']
        ]);

        return response()->json([
            'message' => 'Token registrado con éxito.',
            'device_token' => $deviceToken
        ], 200);
    }

    public function generateReport(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $vehicles = Vehicle::with(['reminders', 'maintenances' => function($q) use ($startDate, $endDate) {
            if ($startDate) {
                $q->where('date', '>=', $startDate);
            }
            if ($endDate) {
                $q->where('date', '<=', $endDate);
            }
        }])->get();

        $totalVehicles = $vehicles->count();
        $activeVehicles = $vehicles->where('status', 'active')->count();
        $workshopVehicles = $vehicles->where('status', 'workshop')->count();

        // Si hay rango de fechas, calcular gastos del rango. Si no, gasto del mes actual.
        if ($startDate || $endDate) {
            $costsQuery = Maintenance::query();
            if ($startDate) {
                $costsQuery->where('date', '>=', $startDate);
            }
            if ($endDate) {
                $costsQuery->where('date', '<=', $endDate);
            }
            $monthlyCosts = $costsQuery->sum('cost');
        } else {
            $monthlyCosts = Maintenance::whereMonth('date', Carbon::now()->month)
                ->whereYear('date', Carbon::now()->year)
                ->sum('cost');
        }

        // Actividades recientes filtradas por el rango de fechas
        $recentActivityQuery = Maintenance::with('vehicle:id,plate,brand,model')->orderBy('date', 'desc');
        if ($startDate) {
            $recentActivityQuery->where('date', '>=', $startDate);
        }
        if ($endDate) {
            $recentActivityQuery->where('date', '<=', $endDate);
        }
        if (!$startDate && !$endDate) {
            $recentActivityQuery->take(10);
        }
        $recentActivity = $recentActivityQuery->get();

        $reminders = Reminder::where('status', 'pending')->with('vehicle')->get();
        $expiredCount = 0; $upcomingCount = 0;
        foreach ($reminders as $reminder) {
            if ($reminder->alert_status === 'expired') $expiredCount++;
            if ($reminder->alert_status === 'upcoming') $upcomingCount++;
        }

        // Generate data for each vehicle's pending actions
        $vehiclesData = $vehicles->map(function ($vehicle) {
            $expiredAlerts = $vehicle->reminders->where('status', 'pending')->filter(fn($r) => $r->alert_status === 'expired')->count();
            $upcomingAlerts = $vehicle->reminders->where('status', 'pending')->filter(fn($r) => $r->alert_status === 'upcoming')->count();
            
            return [
                'plate' => $vehicle->plate,
                'brand' => $vehicle->brand,
                'model' => $vehicle->model,
                'year' => $vehicle->year,
                'current_mileage' => $vehicle->current_mileage,
                'status' => $vehicle->status,
                'expired_alerts' => $expiredAlerts,
                'upcoming_alerts' => $upcomingAlerts,
            ];
        });

        $generationDate = Carbon::now()->format('d/m/Y H:i');

        return view('report', compact(
            'vehiclesData',
            'totalVehicles',
            'activeVehicles',
            'workshopVehicles',
            'monthlyCosts',
            'recentActivity',
            'expiredCount',
            'upcomingCount',
            'generationDate',
            'startDate',
            'endDate'
        ));
    }

    public function generateVehicleReport(Request $request, $id)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $vehicle = Vehicle::with(['maintenances' => function($q) use ($startDate, $endDate) {
            $q->orderBy('date', 'desc');
            if ($startDate) {
                $q->where('date', '>=', $startDate);
            }
            if ($endDate) {
                $q->where('date', '<=', $endDate);
            }
        }, 'reminders'])->findOrFail($id);

        $totalSpent = $vehicle->maintenances->sum('cost');

        $activeAlerts = $vehicle->reminders->where('status', 'pending')->filter(function($r) {
            return $r->alert_status === 'expired' || $r->alert_status === 'upcoming';
        })->values();

        $generationDate = Carbon::now()->format('d/m/Y H:i');

        return view('vehicle_report', compact(
            'vehicle',
            'totalSpent',
            'activeAlerts',
            'generationDate',
            'startDate',
            'endDate'
        ));
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:active,workshop,inactive',
        ]);

        $vehicle = Vehicle::findOrFail($id);
        $vehicle->update(['status' => $validated['status']]);

        return response()->json([
            'message' => 'Estado del vehículo actualizado correctamente.',
            'vehicle' => $vehicle
        ]);
    }

    public function storeReminder(Request $request, $id)
    {
        $vehicle = Vehicle::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'target_date' => 'required|date',
        ]);

        $reminder = $vehicle->reminders()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'target_date' => $validated['target_date'],
            'status' => 'pending'
        ]);

        return response()->json($reminder, 201);
    }

    public function destroyReminder($id)
    {
        $reminder = \App\Models\Reminder::findOrFail($id);
        $reminder->delete();

        return response()->json([
            'message' => 'Recordatorio eliminado correctamente.'
        ], 200);
    }
}