<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Estado de Cuenta - {{ $player->first_name }} {{ $player->last_name }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333;
            font-size: 14px;
            margin: 0;
            padding: 0;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #E31837;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #0033A0;
            margin: 0 0 10px 0;
            font-size: 24px;
        }
        .header p {
            margin: 0;
            color: #666;
        }
        .player-info {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 30px;
        }
        .player-info h2 {
            margin: 0 0 10px 0;
            font-size: 18px;
            color: #0f172a;
        }
        .summary {
            display: table;
            width: 100%;
            margin-bottom: 30px;
        }
        .summary-box {
            display: table-cell;
            width: 33.33%;
            text-align: center;
            padding: 15px;
            border: 1px solid #e2e8f0;
        }
        .summary-box.total {
            background-color: #fef2f2;
            border-color: #fecaca;
        }
        .summary-box h3 {
            margin: 0 0 5px 0;
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
        }
        .summary-box .amount {
            font-size: 20px;
            font-weight: bold;
        }
        .text-red { color: #dc2626; }
        .text-green { color: #16a34a; }
        
        .year-section {
            margin-bottom: 30px;
        }
        .year-title {
            background-color: #0033A0;
            color: white;
            padding: 8px 15px;
            font-size: 16px;
            margin: 0;
            border-radius: 5px 5px 0 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            padding: 10px;
            border: 1px solid #e2e8f0;
            text-align: left;
        }
        th {
            background-color: #f8fafc;
            font-weight: bold;
            color: #475569;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .badge {
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
        }
        .bg-red { background-color: #fee2e2; color: #991b1b; }
        .bg-green { background-color: #dcfce7; color: #166534; }
        .bg-yellow { background-color: #fef9c3; color: #854d0e; }
        
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
        }
    </style>
</head>
<body>

    <div class="header">
        <h1>Estado de Cuenta</h1>
        <p>Centro de Formación HE-5</p>
        <p>Fecha de emisión: {{ date('d/m/Y') }}</p>
    </div>

    <div class="player-info">
        <h2>{{ $player->first_name }} {{ $player->last_name }}</h2>
        <p><strong>Categoría:</strong> {{ $player->category }} {{ $player->secondary_category ? ' (+'.$player->secondary_category.')' : '' }}</p>
    </div>

    <div class="summary">
        <div class="summary-box">
            <h3>Total Cargado</h3>
            <div class="amount">${{ number_format($totalCharged, 2) }}</div>
        </div>
        <div class="summary-box">
            <h3>Total Pagado</h3>
            <div class="amount text-green">${{ number_format($totalPaid, 2) }}</div>
        </div>
        <div class="summary-box total">
            <h3>Saldo Pendiente Total</h3>
            <div class="amount text-red">${{ number_format(max(0, $totalCharged - $totalPaid), 2) }}</div>
        </div>
    </div>

    @foreach($transactionsByYear as $year => $transactions)
        <div class="year-section">
            <h3 class="year-title">Año: {{ $year }}</h3>
            <table>
                <thead>
                    <tr>
                        <th>Concepto</th>
                        <th>Fecha</th>
                        <th class="text-right">Monto</th>
                        <th class="text-right">Pagado</th>
                        <th class="text-right">Pendiente</th>
                        <th class="text-center">Estado</th>
                    </tr>
                </thead>
                <tbody>
                    @php
                        $yearTotal = 0;
                        $yearPaid = 0;
                    @endphp
                    @foreach($transactions as $tx)
                        @php
                            $remaining = max(0, $tx->amount - $tx->paid_amount);
                            $yearTotal += $tx->amount;
                            $yearPaid += $tx->paid_amount;
                            
                            $statusClass = 'bg-red';
                            $statusText = 'Pendiente';
                            if ($tx->status === 'paid') {
                                $statusClass = 'bg-green';
                                $statusText = 'Pagado';
                            } elseif ($tx->status === 'partial') {
                                $statusClass = 'bg-yellow';
                                $statusText = 'Parcial';
                            }
                        @endphp
                        <tr>
                            <td>
                                {{ $tx->concept }}
                                @if($tx->is_arbitration_penalty)
                                    <br><small style="color: #ea580c;">(Arbitraje)</small>
                                @endif
                            </td>
                            <td>{{ $tx->due_date ? date('d/m/Y', strtotime($tx->due_date)) : '' }}</td>
                            <td class="text-right">${{ number_format($tx->amount, 2) }}</td>
                            <td class="text-right text-green">${{ number_format($tx->paid_amount, 2) }}</td>
                            <td class="text-right text-red">${{ number_format($remaining, 2) }}</td>
                            <td class="text-center">
                                <span class="badge {{ $statusClass }}">{{ $statusText }}</span>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
                <tfoot>
                    <tr>
                        <th colspan="2" class="text-right">Subtotal {{ $year }}</th>
                        <th class="text-right">${{ number_format($yearTotal, 2) }}</th>
                        <th class="text-right text-green">${{ number_format($yearPaid, 2) }}</th>
                        <th class="text-right text-red">${{ number_format(max(0, $yearTotal - $yearPaid), 2) }}</th>
                        <th></th>
                    </tr>
                </tfoot>
            </table>
        </div>
    @endforeach

    <div class="footer">
        Este documento es un comprobante de saldo emitido por la plataforma HE-5.<br>
        Cualquier duda o aclaración, favor de comunicarse con la administración.
    </div>

</body>
</html>
