<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Maintenance;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MaintenanceController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'date' => 'required|date',
            'type' => 'required|in:preventive,corrective',
            'description' => 'required|string',
            'mileage' => 'required|integer',
            'cost' => 'required|numeric',
            'responsible' => 'required|string',
            'address' => 'nullable|string',
        ]);

        $maintenance = DB::transaction(function () use ($validated) {
            $maintenance = Maintenance::create($validated);
            $vehicle = Vehicle::find($validated['vehicle_id']);
            if ($validated['mileage'] > $vehicle->current_mileage) {
                $vehicle->update(['current_mileage' => $validated['mileage']]);
            }
            return $maintenance;
        });



        return response()->json($maintenance, 201);
    }

    public function destroy($id)
    {
        $maintenance = Maintenance::findOrFail($id);
        $maintenance->delete();

        return response()->json(['message' => 'Trabajo de mantenimiento eliminado correctamente.'], 200);
    }

    public function update(Request $request, $id)
    {
        $maintenance = Maintenance::findOrFail($id);

        $validated = $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'date' => 'required|date',
            'type' => 'required|in:preventive,corrective',
            'description' => 'required|string',
            'mileage' => 'required|integer',
            'cost' => 'required|numeric',
            'responsible' => 'required|string',
            'address' => 'nullable|string',
        ]);

        $maintenance = DB::transaction(function () use ($maintenance, $validated) {
            $maintenance->update($validated);
            $vehicle = Vehicle::find($validated['vehicle_id']);
            if ($validated['mileage'] > $vehicle->current_mileage) {
                $vehicle->update(['current_mileage' => $validated['mileage']]);
            }
            return $maintenance;
        });



        return response()->json($maintenance, 200);
    }
}