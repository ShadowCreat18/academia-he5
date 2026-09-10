<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\SimpleType\Jc;
use PhpOffice\PhpWord\Style\Image as ImageStyle;

class LetterheadController extends Controller
{
    public function download()
    {
        $phpWord = new PhpWord();

        // Configurar estilos predeterminados
        $phpWord->setDefaultFontName('Arial');
        $phpWord->setDefaultFontSize(11);

        // Crear sección con márgenes
        $section = $phpWord->addSection([
            'marginTop'    => 600,   // ~0.42 pulgadas
            'marginBottom' => 600,
            'marginLeft'   => 1200,  // ~0.83 pulgadas
            'marginRight'  => 1200,
        ]);

        // ── ENCABEZADO: logos en esquinas + logo central ──
        $header = $section->addHeader();
        $headerTable = $header->addTable([
            'alignment' => Jc::CENTER,
            'cellMargin' => 0,
        ]);
        $headerTable->addRow();

        // Logo izquierdo (he5-classic-1)
        $cellLeft = $headerTable->addCell(3200, ['valign' => 'center']);
        $classicPath = public_path('images/he5-classic-1.png');
        if (file_exists($classicPath)) {
            $cellLeft->addImage($classicPath, [
                'width'  => 80,
                'height' => 80,
                'alignment' => Jc::START,
            ]);
        }

        // Logo central (he5-round-logo)
        $cellCenter = $headerTable->addCell(3200, ['valign' => 'center']);
        $roundPath = public_path('images/he5-round-logo.png');
        if (file_exists($roundPath)) {
            $cellCenter->addImage($roundPath, [
                'width'  => 100,
                'height' => 100,
                'alignment' => Jc::CENTER,
            ]);
        }

        // Logo derecho (he5-shield-logo)
        $cellRight = $headerTable->addCell(3200, ['valign' => 'center']);
        $shieldPath = public_path('images/he5-shield-logo.png');
        if (file_exists($shieldPath)) {
            $cellRight->addImage($shieldPath, [
                'width'  => 80,
                'height' => 80,
                'alignment' => Jc::END,
            ]);
        }

        // Línea separadora debajo del encabezado
        $header->addText('');
        $header->addText(
            '────────────────────────────────────────────────────────────',
            ['color' => '0033A0', 'size' => 8],
            ['alignment' => Jc::CENTER]
        );

        // ── NOMBRE DE LA ACADEMIA ──
        $section->addText(
            'ACADEMIA DE FÚTBOL HE-5',
            ['bold' => true, 'size' => 16, 'color' => '0033A0', 'name' => 'Arial'],
            ['alignment' => Jc::CENTER, 'spaceAfter' => 100]
        );
        $section->addText(
            'Formando Campeones del Futuro',
            ['italic' => true, 'size' => 10, 'color' => '666666'],
            ['alignment' => Jc::CENTER, 'spaceAfter' => 400]
        );

        // ── ESPACIO PARA CONTENIDO ──
        // Agregar espacio en blanco para que el usuario escriba
        for ($i = 0; $i < 20; $i++) {
            $section->addText('');
        }

        // ── PIE DE PÁGINA ──
        $footer = $section->addFooter();
        $footer->addText(
            '────────────────────────────────────────────────────────────',
            ['color' => '0033A0', 'size' => 8],
            ['alignment' => Jc::CENTER]
        );
        $footer->addText(
            'Academia de Fútbol HE-5 | Chihuahua, México',
            ['size' => 8, 'color' => '999999'],
            ['alignment' => Jc::CENTER]
        );

        // Generar y descargar
        $tempFile = tempnam(sys_get_temp_dir(), 'letterhead') . '.docx';
        $writer = IOFactory::createWriter($phpWord, 'Word2007');
        $writer->save($tempFile);

        return response()->download($tempFile, 'Hoja_Membretada_HE5.docx')->deleteFileAfterSend(true);
    }
}
