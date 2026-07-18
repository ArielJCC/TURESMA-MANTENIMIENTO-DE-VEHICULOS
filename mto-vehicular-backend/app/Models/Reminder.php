<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Reminder extends Model
{
    protected $fillable = ['vehicle_id', 'title', 'description', 'target_date', 'target_mileage', 'status'];
    protected $appends = ['alert_status'];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function getAlertStatusAttribute()
    {
        if ($this->status === 'done') return 'normal';

        $vehicle = $this->vehicle;
        $isExpired = false;
        $isUpcoming = false;

        if ($this->target_mileage) {
            $remainingKm = $this->target_mileage - $vehicle->current_mileage;
            if ($remainingKm <= 0) $isExpired = true;
            elseif ($remainingKm <= 1000) $isUpcoming = true;
        }

        if ($this->target_date) {
            $daysLeft = Carbon::now()->diffInDays(Carbon::parse($this->target_date), false);
            if ($daysLeft < 0) $isExpired = true;
            elseif ($daysLeft <= 7) $isUpcoming = true;
        }

        if ($isExpired) return 'expired';
        if ($isUpcoming) return 'upcoming';
        return 'normal';
    }
}