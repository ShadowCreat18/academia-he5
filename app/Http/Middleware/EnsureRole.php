<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Verifica que el usuario autenticado tenga el rol requerido.
     * Uso en rutas: ->middleware('role:admin') o ->middleware('role:parent')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();

        if (!in_array($user->role, $roles)) {
            // Si es padre intentando acceder a admin → su dashboard
            if ($user->role === 'parent') {
                return redirect()->route('parent.dashboard')
                    ->with('error', 'No tienes permiso para acceder a esa sección.');
            }

            // Si es admin intentando acceder a ruta de parent → admin dashboard
            return redirect()->route('dashboard')
                ->with('error', 'Acceso no autorizado.');
        }

        return $next($request);
    }
}
