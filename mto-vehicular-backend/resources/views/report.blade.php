<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte de Flota Vehicular - TURESMA</title>
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
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 30px;
        }
        .metric-card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            background-color: #f8fafc;
            text-align: center;
        }
        .metric-label {
            font-size: 10px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
        }
        .metric-value {
            font-size: 22px;
            font-weight: 800;
            color: #0f172a;
            margin: 0;
        }
        .metric-value.critical {
            color: #dc2626;
        }
        .metric-value.warning {
            color: #d97706;
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
            background-color: #fef2f2;
            color: #dc2626;
            border: 1px solid #fecaca;
        }
        .badge-warning {
            background-color: #fffbeb;
            color: #b45309;
            border: 1px solid #fde68a;
        }
        .badge-normal {
            background-color: #f1f5f9;
            color: #64748b;
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
        <p>Vista de Impresión del Reporte Formal</p>
        <button class="btn-print" onclick="window.print()">Descargar / Imprimir PDF</button>
    </div>

    <div class="header-container">
        <div class="logo-section">
            <img src="{{ asset('logo.png') }}" alt="Logo Turesma" style="height: 45px; object-fit: contain;">
        </div>
        <div class="report-meta">
            <p>Fecha de Reporte: <strong>{{ $generationDate }}</strong></p>
            <p>ID Documento: <strong>REP-{{ date('Ymd') }}-{{ rand(10,99) }}</strong></p>
        </div>
    </div>

    <div class="report-title">
        <h2>Reporte Consolidado de Operaciones</h2>
        <p>Resumen administrativo del estado mecánico e inversión de la flota activa</p>
    </div>

    <div class="metrics-grid">
        <div class="metric-card">
            <div class="metric-label">Flota Vehicular</div>
            <div class="metric-value">{{ $totalVehicles }} Unidades</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 5px;">{{ $activeVehicles }} Activos / {{ $workshopVehicles }} en Taller</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">Inversión del Mes</div>
            <div class="metric-value">${{ number_format($monthlyCosts, 2) }}</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 5px;">Mes actual</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">Alertas Próximas</div>
            <div class="metric-value warning">{{ $upcomingCount }} Alertas</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 5px;">Mantenimiento sugerido</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">Críticos Vencidos</div>
            <div class="metric-value critical">{{ $expiredCount }} Críticos</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 5px;">Atención inmediata</div>
        </div>
    </div>

    <div class="section-heading">Inventario y Estado de Unidades</div>
    <table>
        <thead>
            <tr>
                <th>Placa / Ficha</th>
                <th>Marca y Modelo</th>
                <th>Año</th>
                <th>Kilometraje</th>
                <th>Estado</th>
                <th>Alertas Críticas</th>
                <th>Alertas Próximas</th>
            </tr>
        </thead>
        <tbody>
            @foreach($vehiclesData as $vehicle)
            <tr>
                <td style="font-weight: bold; letter-spacing: 0.5px;">{{ $vehicle['plate'] }}</td>
                <td>{{ $vehicle['brand'] }} {{ $vehicle['model'] }}</td>
                <td>{{ $vehicle['year'] }}</td>
                <td>{{ number_format($vehicle['current_mileage']) }} km</td>
                <td>
                    <span class="badge {{ $vehicle['status'] === 'active' ? 'badge-active' : 'badge-workshop' }}">
                        {{ $vehicle['status'] === 'active' ? 'Activo' : 'En Taller' }}
                    </span>
                </td>
                <td>
                    @if($vehicle['expired_alerts'] > 0)
                        <span class="badge badge-danger">{{ $vehicle['expired_alerts'] }} Crítico</span>
                    @else
                        <span class="badge badge-normal">Ninguna</span>
                    @endif
                </td>
                <td>
                    @if($vehicle['upcoming_alerts'] > 0)
                        <span class="badge badge-warning">{{ $vehicle['upcoming_alerts'] }} Alerta</span>
                    @else
                        <span class="badge badge-normal">Ninguna</span>
                    @endif
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="section-heading">Historial de Mantenimientos Recientes</div>
    <table>
        <thead>
            <tr>
                <th>Fecha</th>
                <th>Placa</th>
                <th>Vehículo</th>
                <th>Tipo</th>
                <th>Operador / Encargado</th>
                <th>Descripción de Trabajo</th>
                <th>Inversión</th>
            </tr>
        </thead>
        <tbody>
            @foreach($recentActivity as $activity)
            <tr>
                <td>{{ $activity->date }}</td>
                <td style="font-weight: bold;">{{ $activity->vehicle->plate }}</td>
                <td>{{ $activity->vehicle->brand }} {{ $activity->vehicle->model }}</td>
                <td>
                    <span class="badge" style="background-color: {{ $activity->type === 'corrective' ? '#fee2e2' : '#dbeafe' }}; color: {{ $activity->type === 'corrective' ? '#991b1b' : '#1e40af' }}">
                        {{ $activity->type === 'corrective' ? 'Correctivo' : 'Preventivo' }}
                    </span>
                </td>
                <td>{{ $activity->responsible }}</td>
                <td>{{ $activity->description }}</td>
                <td style="font-weight: bold; color: #16a34a;">${{ number_format($activity->cost, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>Reporte Oficial Generado Automáticamente por TURESMA Control Vehicular.</p>
        <p>&copy; {{ date('Y') }} TURESMA. Todos los derechos reservados. Confidencial.</p>
    </div>

    <script>
        // Lanzar diálogo de impresión automáticamente al cargar la página
        window.onload = function() {
            // Un pequeño retraso para asegurar que los estilos carguen correctamente
            setTimeout(function() {
                window.print();
            }, 500);
        };
    </script>
</body>
</html>
