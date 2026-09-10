<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Font;

class TemplateController extends Controller
{
    public function download()
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Plantilla Jugadores');

        // ── Encabezados ──
        $headers = [
            'A1' => 'nombre_jugador',
            'B1' => 'fecha_nacimiento',
            'C1' => 'nombre_padre',
            'D1' => 'usuario_padre',
            'E1' => 'telefono',
        ];

        foreach ($headers as $cell => $value) {
            $sheet->setCellValue($cell, $value);
        }

        // ── Estilo de encabezados ──
        $headerStyle = [
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 11,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '0033A0'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => '000000'],
                ],
            ],
        ];

        $sheet->getStyle('A1:E1')->applyFromArray($headerStyle);
        $sheet->getRowDimension(1)->setRowHeight(25);

        // ── Ejemplo de datos ──
        $example = [
            ['Juan Carlos López', '2012-05-15', 'María López García', 'maria_lopez', '614-123-4567'],
            ['Pedro Ramírez Torres', '2013-01-20', 'José Ramírez', 'jose_ramirez', '614-987-6543'],
        ];

        $row = 2;
        foreach ($example as $data) {
            $sheet->setCellValue("A{$row}", $data[0]);
            $sheet->setCellValue("B{$row}", $data[1]);
            $sheet->setCellValue("C{$row}", $data[2]);
            $sheet->setCellValue("D{$row}", $data[3]);
            $sheet->setCellValue("E{$row}", $data[4]);
            $row++;
        }

        // Estilo de ejemplo (texto gris para indicar que son datos de ejemplo)
        $exampleStyle = [
            'font' => [
                'italic' => true,
                'color' => ['rgb' => '999999'],
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => 'CCCCCC'],
                ],
            ],
        ];
        $sheet->getStyle('A2:E3')->applyFromArray($exampleStyle);

        // ── Ancho de columnas ──
        $sheet->getColumnDimension('A')->setWidth(30);
        $sheet->getColumnDimension('B')->setWidth(18);
        $sheet->getColumnDimension('C')->setWidth(30);
        $sheet->getColumnDimension('D')->setWidth(20);
        $sheet->getColumnDimension('E')->setWidth(18);

        // ── Instrucciones en una segunda hoja ──
        $instr = $spreadsheet->createSheet();
        $instr->setTitle('Instrucciones');
        $instr->setCellValue('A1', 'INSTRUCCIONES PARA LLENAR LA PLANTILLA');
        $instr->getStyle('A1')->getFont()->setBold(true)->setSize(14)->getColor()->setRGB('0033A0');
        $instr->setCellValue('A3', '1. Llena los datos en la hoja "Plantilla Jugadores".');
        $instr->setCellValue('A4', '2. Borra las filas de ejemplo (en gris) antes de importar.');
        $instr->setCellValue('A5', '3. El formato de fecha debe ser: AAAA-MM-DD (Ej. 2012-05-15).');
        $instr->setCellValue('A6', '4. El usuario_padre será el login del tutor. Si ya existe, se vinculará; si no, se creará uno nuevo.');
        $instr->setCellValue('A7', '5. La contraseña por defecto del tutor nuevo será: he5-1234');
        $instr->setCellValue('A9', 'Si tienes dudas, contacta al administrador del sistema.');
        $instr->getColumnDimension('A')->setWidth(80);

        // Seleccionar la primera hoja como activa
        $spreadsheet->setActiveSheetIndex(0);

        // Generar y descargar
        $tempFile = tempnam(sys_get_temp_dir(), 'template') . '.xlsx';
        $writer = new Xlsx($spreadsheet);
        $writer->save($tempFile);

        return response()->download($tempFile, 'Plantilla_Jugadores_HE5.xlsx')->deleteFileAfterSend(true);
    }
}
