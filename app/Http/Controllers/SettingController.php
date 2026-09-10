<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\DataDeletionRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{

    public function update(Request $request)
    {
        $data = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string|exists:settings,key',
            'settings.*.value' => 'required|string',
        ]);

        foreach ($data['settings'] as $settingData) {
            Setting::where('key', $settingData['key'])->update(['value' => $settingData['value']]);
        }

        return redirect()->back()->with('success', 'Configuración actualizada correctamente.');
    }

    public function index()
    {
        $settings = Setting::all();
        $deletionRequests = DataDeletionRequest::with('user')
            ->orderByRaw("FIELD(status, 'pending', 'rejected', 'completed')")
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Admin/Settings/Index', [
            'settings'         => $settings,
            'deletionRequests' => $deletionRequests,
        ]);
    }

    public function processDeletion(Request $request, DataDeletionRequest $deletionRequest)
    {
        $request->validate(['action' => 'required|in:completed,rejected']);

        $deletionRequest->update([
            'status'       => $request->action,
            'processed_at' => now(),
            'processed_by' => $request->user()->name,
        ]);

        return back()->with('success', 'Solicitud procesada correctamente.');
    }
}
