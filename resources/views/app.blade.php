<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <link rel="manifest" href="/manifest.json">
        <meta name="theme-color" content="#E31837">

        <!-- ===== Apple / iPhone PWA ===== -->
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="HE-5">
        <link rel="apple-touch-icon" href="/images/apple-touch-icon.png">
        <!-- Viewport full-screen en iPhone (safe-area para el notch) -->
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
        
        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-gray-900 text-white">
        @inertia

        <script>
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                    navigator.serviceWorker.register('/sw.js').then((registration) => {
                        console.log('Service Worker registered with scope:', registration.scope);
                    }, (err) => {
                        console.log('Service Worker registration failed:', err);
                    });
                });
            }
        </script>
    </body>
</html>
