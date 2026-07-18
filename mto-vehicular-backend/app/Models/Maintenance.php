<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Maintenance extends Model
{
    protected $fillable = ['vehicle_id', 'date', 'type', 'description', 'mileage', 'cost', 'responsible', 'address'];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}