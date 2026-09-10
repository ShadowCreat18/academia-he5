<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>@yield('title', 'Documento HE-5')</title>
    <style>
        @page {
            margin: 0cm 0cm;
        }
        body {
            margin-top: 4cm;
            margin-left: 2cm;
            margin-right: 2cm;
            margin-bottom: 2cm;
            font-family: Arial, Helvetica, sans-serif;
        }
        
        /* HEADER - Logos in Corners and Center */
        header {
            position: fixed;
            top: 1cm;
            left: 1cm;
            right: 1cm;
            height: 3cm;
            text-align: center;
        }

        .logo-left {
            position: absolute;
            left: 0;
            top: 0;
            height: 2.5cm;
        }

        .logo-right {
            position: absolute;
            right: 0;
            top: 0;
            height: 2.5cm;
        }

        .logo-center {
            position: absolute;
            left: 50%;
            top: 0;
            transform: translateX(-50%);
            height: 2.5cm;
        }
        
        /* FOOTER */
        footer {
            position: fixed;
            bottom: 1cm;
            left: 2cm;
            right: 2cm;
            height: 1cm;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 5px;
        }

        main {
            font-size: 14px;
            color: #333;
            line-height: 1.5;
        }
    </style>
    @yield('styles')
</head>
<body>

    <header>
        <img src="{{ public_path('images/he5-classic-1.png') }}" class="logo-left" alt="HE-5 Classic">
        <img src="{{ public_path('images/he5-shield-logo.png') }}" class="logo-right" alt="HE-5 Shield">
        <img src="{{ public_path('images/he5-round-logo.png') }}" class="logo-center" alt="HE-5 Center">
    </header>

    <main>
        @yield('content')
    </main>

    <footer>
        HE-5 ZACATECAS - ESCUELA DE FÚTBOL HÉCTOR ESPARZA
    </footer>

</body>
</html>
