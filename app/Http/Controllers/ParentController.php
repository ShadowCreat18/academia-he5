<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Player;
use App\Models\Game;
use App\Models\User;
use App\Models\DataDeletionRequest;
use App\Models\Setting;
use App\Models\FinancialTransaction;

class ParentController extends Controller
{
    private function getChildrenQuery($user)
    {
        return Player::whereHas('parents', function ($q) use ($user) {
            $q->where('users.id', $user->id);
        });
    }

    private function getConsentStatus($user, $children)
    {
        $needsConsent = true;
        if ($user->accepted_data_consent_at) {
            $needsConsent = false;
        } else {
            $hasAcceptedParent = User::whereNotNull('accepted_data_consent_at')
                ->whereHas('players', function($q) use ($children) {
                    $q->whereIn('players.id', $children->pluck('id'));
                })->exists();
            
            if ($hasAcceptedParent) {
                $needsConsent = false;
            }
        }
        return $needsConsent;
    }

    public function index()
    {
        $user = Auth::user();
        $children = $this->getChildrenQuery($user)->get();
        $needsConsent = $this->getConsentStatus($user, $children);

        // Fetch just the very next game for the dashboard overview
        $categories = $children->pluck('category')->filter()->unique()->toArray();
        $secondaryCategories = $children->pluck('secondary_category')->filter()->unique()->toArray();
        $allCategories = array_unique(array_merge($categories, $secondaryCategories));
        
        $nextGame = null;
        if (!empty($allCategories)) {
            $nextGame = Game::whereIn('category', $allCategories)
                ->where('date', '>=', now()->startOfDay())
                ->orderBy('date', 'asc')
                ->first();
        }

        return Inertia::render('Parent/Dashboard', [
            'needsConsent'    => $needsConsent,
            'nextGame'        => $nextGame,
            'childrenCount'   => $children->count(),
            'deletionRequest' => DataDeletionRequest::where('user_id', $user->id)
                ->orderByDesc('created_at')
                ->first(['status', 'created_at']),
        ]);
    }

    public function children()
    {
        $user = Auth::user();
        $children = $this->getChildrenQuery($user)->get();
        
        return Inertia::render('Parent/Children', [
            'children' => $children,
        ]);
    }

    public function finances()
    {
        $user = Auth::user();
        $children = $this->getChildrenQuery($user)
            ->with(['financialTransactions' => function ($q) {
                $q->orderByDesc('due_date');
            }, 'financialTransactions.transactionPayments'])
            ->get();

        $currentYear = date('Y');

        foreach ($children as $child) {
            if ($child->charges_generated_year < $currentYear) {
                $costInscripcion = Setting::getVal('cost_inscripcion', 1250);
                $costMaterial = Setting::getVal('cost_material', 1000);
                $costTorneo = Setting::getVal('cost_torneo', 250);
                $costUniformes = Setting::getVal('cost_uniformes', 2000);
                $costMensualidad = Setting::getVal('cost_mensualidad', 500);

                $concepts = [
                    ['concept' => 'Inscripción', 'amount' => $costInscripcion, 'due_date' => "$currentYear-01-15"],
                    ['concept' => 'Apoyo Material Deportivo', 'amount' => $costMaterial, 'due_date' => "$currentYear-02-01"],
                    ['concept' => 'Inscripción Torneo', 'amount' => $costTorneo, 'due_date' => "$currentYear-02-15"],
                    ['concept' => 'Uniformes', 'amount' => $costUniformes, 'due_date' => "$currentYear-01-15"],
                ];

                $meses = [
                    1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril',
                    5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto',
                    9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre'
                ];

                // Determine start month based on player creation date
                $playerYear = date('Y', strtotime($child->created_at));
                $startMonth = ($playerYear == $currentYear) ? (int)date('n', strtotime($child->created_at)) : 1;

                for ($m = $startMonth; $m <= 12; $m++) {
                    $concepts[] = [
                        'concept' => 'Mensualidad ' . $meses[$m],
                        'amount' => $costMensualidad,
                        'due_date' => "$currentYear-" . str_pad($m, 2, '0', STR_PAD_LEFT) . "-01",
                    ];
                }

                foreach ($concepts as $c) {
                    FinancialTransaction::create([
                        'player_id' => $child->id,
                        'user_id' => $user->id,
                        'concept' => $c['concept'],
                        'amount' => $c['amount'],
                        'paid_amount' => 0,
                        'due_date' => $c['due_date'],
                        'status' => 'pending',
                    ]);
                }

                $child->charges_generated_year = $currentYear;
                $child->save();

                $child->load(['financialTransactions' => function ($q) {
                    $q->orderByDesc('due_date');
                }, 'financialTransactions.transactionPayments']);
            }

            $totalDebt = 0;
            foreach ($child->financialTransactions as $tx) {
                $paid = $tx->transactionPayments->sum('amount');
                $debt = max(0, $tx->amount - $paid);
                $tx->paid_amount = $paid; 
                $totalDebt += $debt;
            }
            $child->total_debt = $totalDebt;
        }

        $userPayments = \App\Models\TransactionPayment::where('user_id', $user->id)
            ->with(['financialTransaction' => function($q) {
                $q->with('player:id,first_name,last_name');
            }])
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Parent/Finances', [
            'children' => $children,
            'userPayments' => $userPayments,
        ]);
    }

    public function games()
    {
        $user = Auth::user();
        $children = $this->getChildrenQuery($user)->get();
        
        $categories = $children->pluck('category')->filter()->unique()->toArray();
        $secondaryCategories = $children->pluck('secondary_category')->filter()->unique()->toArray();
        $allCategories = array_unique(array_merge($categories, $secondaryCategories));

        $upcomingGames = collect();
        $pastGames = collect();
        
        if (!empty($allCategories)) {
            $upcomingGames = Game::whereIn('category', $allCategories)
                ->where('date', '>=', now()->startOfDay())
                ->orderBy('date', 'asc')
                ->take(10)
                ->get();
                
            $pastGames = Game::whereIn('category', $allCategories)
                ->where('date', '<', now()->startOfDay())
                ->whereNotNull('score_us')
                ->with('goals.player')
                ->orderBy('date', 'desc')
                ->take(10)
                ->get();
        }

        return Inertia::render('Parent/Games', [
            'upcomingGames' => $upcomingGames,
            'pastGames' => $pastGames,
        ]);
    }

    public function updateProfile(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        
        $request->validate([
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'photo' => 'nullable|image|max:2048',
        ]);

        $user->address = $request->address;
        $user->phone = $request->phone;

        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $filename = uniqid('parent_') . '.' . $file->getClientOriginalExtension();
            $path = public_path('storage/profile-photos/' . $filename);
            
            if (!file_exists(public_path('storage/profile-photos'))) {
                mkdir(public_path('storage/profile-photos'), 0755, true);
            }
            
            // Move the file instead of using Intervention Image since we don't resize parents yet
            $file->move(public_path('storage/profile-photos'), $filename);
            $user->profile_photo_path = 'profile-photos/' . $filename;
        }

        $user->save();

        return back()->with('success', 'Perfil actualizado correctamente.');
    }

    public function updateChild(Request $request, Player $player)
    {
        $user = Auth::user();
        
        $isParent = $player->parents()->where('users.id', $user->id)->exists();
        if (!$isParent) {
            abort(403);
        }

        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'birth_date' => 'nullable|date',
            'curp' => 'nullable|string|size:18',
            'category' => 'nullable|string|max:255',
            'jersey_number' => 'nullable|integer',
        ]);

        $player->update([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'birth_date' => $request->birth_date,
            'curp' => $request->curp,
            'category' => $request->category,
            'jersey_number' => $request->jersey_number,
        ]);

        return back()->with('success', 'Datos del jugador actualizados correctamente.');
    }

    public function acceptConsent(Request $request)
    {
        $user = $request->user();
        if (!$user->accepted_data_consent_at) {
            $user->accepted_data_consent_at = now();
            $user->save();
        }
        return back()->with('success', 'Consentimiento aceptado.');
    }

    /**
     * Solicitar eliminación de datos personales (LFPDPPP).
     */
    public function requestDeletion(Request $request)
    {
        $user = $request->user();

        // Only allow one pending request at a time
        $existing = DataDeletionRequest::where('user_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return back()->with('info', 'Ya tienes una solicitud de eliminación de datos pendiente. Te contactaremos pronto.');
        }

        DataDeletionRequest::create([
            'user_id' => $user->id,
            'status'  => 'pending',
            'reason'  => $request->input('reason'),
        ]);

        return back()->with('success', 'Tu solicitud de eliminación de datos ha sido recibida. La academia la procesará dentro de los próximos 20 días hábiles conforme a la LFPDPPP.');
    }

    /**
     * Cancelar una solicitud de eliminación de datos pendiente.
     */
    public function cancelDeletion(Request $request)
    {
        $user = $request->user();

        DataDeletionRequest::where('user_id', $user->id)
            ->where('status', 'pending')
            ->delete();

        return back()->with('success', 'Solicitud de eliminación cancelada.');
    }
}
