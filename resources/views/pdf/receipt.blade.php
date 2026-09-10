@extends('pdf.layout')

@section('title', 'Recibo de Pago - ' . $transaction->concept)

@section('styles')
<style>
    .receipt-header {
        text-align: center;
        margin-bottom: 20px;
    }
    .receipt-header h1 {
        font-size: 24px;
        color: #0033A0;
        margin: 0;
    }
    .receipt-header p {
        margin: 5px 0;
        font-size: 14px;
    }
    .details-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
    }
    .details-table th, .details-table td {
        border: 1px solid #ddd;
        padding: 10px;
        text-align: left;
    }
    .details-table th {
        background-color: #f8f9fa;
        color: #333;
        width: 30%;
    }
    .total-row td {
        font-weight: bold;
        background-color: #e9ecef;
    }
    .status-badge {
        display: inline-block;
        padding: 5px 10px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
    }
    .status-paid { background-color: #28a745; }
    .status-pending { background-color: #ffc107; }
</style>
@endsection

@section('content')
<div class="receipt-header">
    <h1>RECIBO DE PAGO</h1>
    <p><strong>Folio:</strong> {{ str_pad($transaction->id, 6, '0', STR_PAD_LEFT) }}</p>
    <p><strong>Fecha de Emisión:</strong> {{ \Carbon\Carbon::now()->format('d/m/Y H:i') }}</p>
</div>

<table class="details-table">
    <tr>
        <th>Jugador / Alumno</th>
        <td>{{ $transaction->player ? $transaction->player->first_name . ' ' . $transaction->player->last_name : 'N/A' }}</td>
    </tr>
    <tr>
        <th>Padre / Tutor</th>
        <td>{{ $transaction->user->name ?? 'N/A' }}</td>
    </tr>
    <tr>
        <th>Concepto</th>
        <td>{{ ucfirst(str_replace('_', ' ', $transaction->concept)) }}</td>
    </tr>
    <tr>
        <th>Monto Total</th>
        <td>${{ number_format($transaction->amount, 2) }} MXN</td>
    </tr>
    <tr>
        <th>Monto Pagado</th>
        <td>${{ number_format($transaction->paid_amount, 2) }} MXN</td>
    </tr>
    <tr class="total-row">
        <th>Estado</th>
        <td>
            <span class="status-badge {{ $transaction->status === 'paid' ? 'status-paid' : 'status-pending' }}">
                {{ $transaction->status === 'paid' ? 'PAGADO' : 'ABONADO (Pendiente)' }}
            </span>
        </td>
    </tr>
</table>

<div style="margin-top: 50px; text-align: center;">
    <p>_____________________________________</p>
    <p>Firma de Recepción</p>
    <p><strong>ESCUELA DE FÚTBOL HÉCTOR ESPARZA</strong></p>
</div>
@endsection
