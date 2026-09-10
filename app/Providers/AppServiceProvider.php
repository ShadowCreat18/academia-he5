<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     * Fuerza HTTPS cuando APP_URL usa https (necesario para tunnel localhost.run / producción)
     */
    public function boot(): void
    {
        // Si APP_URL empieza con https, forzar scheme https en todas las URLs generadas
        if (str_starts_with(config('app.url'), 'https')) {
            URL::forceScheme('https');
        }
    }
}
