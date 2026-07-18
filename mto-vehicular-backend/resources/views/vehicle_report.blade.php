<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte de Historial - Unidad {{ $vehicle->plate }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 30px;
            font-size: 13px;
            background-color: #ffffff;
        }
        .header-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 20px;
            margin-bottom: 25px;
        }
        .logo-section h1 {
            font-size: 24px;
            font-weight: 800;
            color: #0f172a;
            margin: 0;
            letter-spacing: 0.5px;
        }
        .logo-section p {
            color: #64748b;
            font-size: 11px;
            font-weight: bold;
            margin: 2px 0 0 0;
            text-transform: uppercase;
        }
        .report-meta {
            text-align: right;
        }
        .report-meta p {
            margin: 3px 0;
            font-size: 12px;
            color: #475569;
        }
        .report-meta strong {
            color: #0f172a;
        }
        .report-title {
            text-align: center;
            margin-bottom: 30px;
        }
        .report-title h2 {
            font-size: 18px;
            font-weight: 700;
            color: #1e293b;
            margin: 0 0 5px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .report-title p {
            color: #64748b;
            margin: 0;
            font-size: 13px;
        }
        .vehicle-summary-card {
            border: 1px solid #edf2f7;
            border-radius: 12px;
            padding: 20px;
            background-color: #f8fafc;
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        .summary-col {
            flex: 1;
        }
        .summary-item {
            margin-bottom: 12px;
        }
        .summary-label {
            font-size: 10px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            margin-bottom: 3px;
        }
        .summary-val {
            font-size: 15px;
            font-weight: 800;
            color: #0f172a;
        }
        .badge {
            display: inline-block;
            padding: 3px 6px;
            font-size: 10px;
            font-weight: 700;
            border-radius: 4px;
            text-transform: uppercase;
        }
        .badge-active {
            background-color: #dcfce7;
            color: #15803d;
        }
        .badge-workshop {
            background-color: #fee2e2;
            color: #b91c1c;
        }
        .badge-danger {
            background-color: #fee2e2;
            color: #b91c1c;
        }
        .badge-warning {
            background-color: #fffbeb;
            color: #b45309;
        }
        .section-heading {
            font-size: 14px;
            font-weight: 700;
            color: #0f172a;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 8px;
            margin-top: 30px;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .alert-row {
            background-color: #fff;
            border: 1px solid #edf2f7;
            border-radius: 8px;
            padding: 12px 15px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .alert-row-expired {
            border-left: 5px solid #dc2626;
        }
        .alert-row-upcoming {
            border-left: 5px solid #d97706;
        }
        .alert-info h4 {
            margin: 0 0 4px 0;
            font-size: 13px;
            font-weight: 700;
            color: #0f172a;
        }
        .alert-info p {
            margin: 0;
            font-size: 12px;
            color: #64748b;
        }
        .alert-status-badge {
            font-weight: 800;
            font-size: 11px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }
        th {
            background-color: #f1f5f9;
            color: #475569;
            font-weight: 700;
            text-align: left;
            padding: 10px 12px;
            font-size: 11px;
            text-transform: uppercase;
            border-bottom: 2px solid #cbd5e1;
        }
        td {
            padding: 10px 12px;
            border-bottom: 1px solid #e2e8f0;
            color: #334155;
            font-size: 12px;
        }
        tr:nth-child(even) td {
            background-color: #f8fafc;
        }
        .footer {
            margin-top: 50px;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
            text-align: center;
            font-size: 10px;
            color: #94a3b8;
        }
        .no-print-bar {
            background-color: #0f172a;
            color: #ffffff;
            padding: 12px 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 100;
            margin: -30px -30px 20px -30px;
        }
        .no-print-bar p {
            margin: 0;
            font-weight: bold;
            font-size: 12px;
        }
        .btn-print {
            background-color: #2563eb;
            color: #ffffff;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: bold;
            cursor: pointer;
            font-size: 12px;
            transition: background-color 0.2s;
        }
        .btn-print:hover {
            background-color: #1d4ed8;
        }
        @media print {
            .no-print-bar {
                display: none !important;
            }
            body {
                padding: 0;
            }
            @page {
                size: portrait;
                margin: 1.5cm;
            }
        }
    </style>
</head>
<body>

    <div class="no-print-bar">
        <p>Vista de Impresión - Historial de Mantenimientos</p>
        <button class="btn-print" onclick="window.print()">Descargar / Imprimir PDF</button>
    </div>

    <div class="header-container">
        <div class="logo-section">
            <img src="{{ asset('logo.png') }}" alt="Logo Turesma" style="height: 45px; object-fit: contain;">
        </div>
        <div class="report-meta">
            <p>Generado el: <strong>{{ $generationDate }}</strong></p>
            <p>Código Ficha: <strong>UNIT-{{ $vehicle->plate }}</strong></p>
        </div>
    </div>

    <div class="report-title">
        <h2>Ficha de Historial y Mantenimientos</h2>
        <p>Reporte detallado de intervenciones mecánicas y alertas vigentes del vehículo</p>
    </div>

    <div class="vehicle-summary-card">
        <div class="summary-col">
            <div class="summary-item">
                <div class="summary-label">Placa / Ficha</div>
                <div class="summary-val" style="font-size: 18px; letter-spacing: 0.5px;">{{ $vehicle->plate }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Vehículo</div>
                <div class="summary-val">{{ $vehicle->brand }} {{ $vehicle->model }} ({{ $vehicle->year }})</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Estado Operativo</div>
                <div class="summary-val">
                    <span class="badge {{ $vehicle->status === 'active' ? 'badge-active' : 'badge-workshop' }}">
                        {{ $vehicle->status === 'active' ? 'Activo' : 'En Taller' }}
                    </span>
                </div>
            </div>
        </div>
        <div class="summary-col" style="border-left: 1px solid #edf2f7; padding-left: 30px;">
            <div class="summary-item">
                <div class="summary-label">Kilometraje Actual</div>
                <div class="summary-val">{{ number_format($vehicle->current_mileage) }} km</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Inversión Total en Mantenimientos</div>
                <div class="summary-val" style="color: #16a34a; font-size: 18px;">${{ number_format($totalSpent, 2) }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Órdenes Registradas</div>
                <div class="summary-val">{{ $vehicle->maintenances->count() }} Trabajos</div>
            </div>
        </div>
    </div>

    @if($activeAlerts->count() > 0)
        <div class="section-heading">Alertas de Atención Requerida</div>
        @foreach($activeAlerts as $alert)
            @php
                $isExpired = $alert->alert_status === 'expired';
                $statusText = "";
                if ($alert->target_mileage) {
                    $remaining = $alert->target_mileage - $vehicle->current_mileage;
                    if ($remaining <= 0) {
                        $statusText .= "Límite de " . number_format($alert->target_mileage) . " km excedido por " . number_format(abs($remaining)) . " km. ";
                    } else {
                        $statusText .= "Límite de " . number_format($alert->target_mileage) . " km (faltan " . number_format($remaining) . " km). ";
                    }
                }
                if ($alert->target_date) {
                    $today = \Carbon\Carbon::today();
                    $limitDate = \Carbon\Carbon::parse($alert->target_date);
                    $daysLeft = $today->diffInDays($limitDate, false);
                    if ($daysLeft < 0) {
                        $statusText .= "Fecha límite (" . $alert->target_date . ") vencida hace " . abs($daysLeft) . " días.";
                    } elseif ($daysLeft == 0) {
                        $statusText .= "Fecha límite (" . $alert->target_date . ") vence hoy.";
                    } else {
                        $statusText .= "Fecha límite (" . $alert->target_date . ") vence en " . $daysLeft . " días.";
                    }
                }
            @endphp
            <div class="alert-row {{ $isExpired ? 'alert-row-expired' : 'alert-row-upcoming' }}">
                <div class="alert-info">
                    <h4>{{ $alert->title }}</h4>
                    <p>{{ $alert->description ?: 'Sin descripción detallada' }}</p>
                    <p style="margin-top: 4px; font-weight: bold; color: #334155;">{{ $statusText }}</p>
                </div>
                <div>
                    <span class="badge {{ $isExpired ? 'badge-danger' : 'badge-warning' }} alert-status-badge">
                        {{ $isExpired ? 'CRÍTICO' : 'PRÓXIMO' }}
                    </span>
                </div>
            </div>
        @endforeach
    @endif

    <div class="section-heading">Historial de Órdenes de Trabajo</div>
    <table>
        <thead>
            <tr>
                <th>Fecha</th>
                <th>Kilometraje</th>
                <th>Tipo de Trabajo</th>
                <th>Operador / Taller</th>
                <th>Descripción de Tareas</th>
                <th>Ubicación</th>
                <th>Costo</th>
            </tr>
        </thead>
        <tbody>
            @forelse($vehicle->maintenances as $maintenance)
            <tr>
                <td style="white-space: nowrap;">{{ $maintenance->date }}</td>
                <td>{{ number_format($maintenance->mileage) }} km</td>
                <td>
                    <span class="badge" style="background-color: {{ $maintenance->type === 'corrective' ? '#fee2e2' : '#dbeafe' }}; color: {{ $maintenance->type === 'corrective' ? '#991b1b' : '#1e40af' }}">
                        {{ $maintenance->type === 'corrective' ? 'Correctivo' : 'Preventivo' }}
                    </span>
                </td>
                <td>{{ $maintenance->responsible }}</td>
                <td>{{ $maintenance->description }}</td>
                <td>{{ $maintenance->address ?: '-' }}</td>
                <td style="font-weight: bold; color: #16a34a; white-space: nowrap;">${{ number_format($maintenance->cost, 2) }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="7" style="text-align: center; color: #64748b; font-style: italic; padding: 20px;">
                    Esta unidad no registra órdenes de trabajo cargadas en el sistema aún.
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        <p>Reporte de Historial Técnico de Unidad - Generado por TURESMA Control Vehicular.</p>
        <p>&copy; {{ date('Y') }} TURESMA. Todos los derechos reservados. Confidencial.</p>
    </div>

    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 500);
        };
    </script>
</body>
</html>
