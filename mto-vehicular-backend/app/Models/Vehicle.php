<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = ['plate', 'brand', 'model', 'year', 'current_mileage', 'status', 'image'];

    public function maintenances()
    {
        return $this->hasMany(Maintenance::class);
    }

    public function reminders()
    {
        return $this->hasMany(Reminder::class);
    }
}