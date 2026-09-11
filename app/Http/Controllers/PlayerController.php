<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Player;
use App\Models\User;

class PlayerController extends Controller
{
    /**
     * Muestra la lista de jugadores agrupados por categoría.
     */
    public function index()
    {
        $players = Player::with(['parents', 'financialTransactions', 'goals'])->orderBy('first_name')->get();
        
        $activePlayers = $players->where('status', 'active');
        $inactivePlayers = $players->where('status', 'inactive')->values();

        $playersByCategory = [];
        foreach ($activePlayers as $player) {
            $player->total_goals = $player->goals->sum('goals');
            
            $cat = $player->category ?: 'Sin Categoría';
            if (!isset($playersByCategory[$cat])) {
                $playersByCategory[$cat] = collect();
            }
            $playersByCategory[$cat]->push($player);

            if (!empty($player->secondary_category)) {
                $secCat = $player->secondary_category;
                if (!isset($playersByCategory[$secCat])) {
                    $playersByCategory[$secCat] = collect();
                }
                
                $refuerzo = clone $player;
                $refuerzo->setAttribute("is_refuerzo", true);
                $playersByCategory[$secCat]->push($refuerzo);
            }
        }

        // Calculate debts for inactive players to show in the UI
        $inactivePlayers->each(function($player) {
            $player->total_debt = $player->financialTransactions->where('status', '!=', 'paid')->sum(function($t) {
                return max(0, $t->amount - $t->paid_amount);
            });
        });

        $parents = User::where('role', 'parent')->orderBy('name')->get(['id', 'name']);

        $allPlayers = Player::where('status', 'active')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'category']);

        return inertia('Admin/Players/Index', [
            'playersByCategory' => $playersByCategory,
            'inactivePlayers' => $inactivePlayers,
            'parents' => $parents,
            'allPlayers' => $allPlayers,
        ]);
    }

    /**
     * Registro manual de un niño, con foto y tutores.
     */
    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'curp' => 'nullable|string|max:18',
            'jersey_number' => 'nullable|string|max:10',
            'date_of_birth' => 'required|date',
            'category' => 'nullable|string',
            'secondary_category' => 'nullable|string',
            'parent_ids' => 'nullable|array',
            'parent_ids.*' => 'exists:users,id',
            'photo' => 'nullable|image|max:10240', // 10MB max
        ]);

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $filename = uniqid('player_') . '.' . $file->getClientOriginalExtension();
            
            // 2.5cm x 3cm is a 5:6 aspect ratio. Let's crop to 250x300 pixels
            $manager = new \Intervention\Image\ImageManager(new \Intervention\Image\Drivers\Gd\Driver());
            $image = $manager->decode($file);
            $image->cover(250, 300);
            
            $path = public_path('storage/photos/' . $filename);
            if (!file_exists(public_path('storage/photos'))) {
                mkdir(public_path('storage/photos'), 0755, true);
            }
            $image->save($path);
            $photoPath = 'photos/' . $filename;
        }

        $player = Player::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'curp' => $request->curp,
            'jersey_number' => $request->jersey_number,
            'birth_date' => $request->date_of_birth,
            'category' => $request->category,
            'secondary_category' => $request->secondary_category,
            'photo_path' => $photoPath,
        ]);

        if ($request->has('parent_ids') && is_array($request->parent_ids)) {
            $player->parents()->attach($request->parent_ids);
        }

        return back()->with('success', "Jugador registrado con éxito.");
    }

    /**
     * Registrar un nuevo padre/tutor desde la pantalla de jugadores.
     */
    public function storeParent(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:25',
            'player_ids' => 'nullable|array',
            'player_ids.*' => 'exists:players,id',
        ]);

        $parent = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => 'parent',
            'saldo_disponible' => 0,
        ]);

        if ($request->has('player_ids') && is_array($request->player_ids)) {
            foreach ($request->player_ids as $playerId) {
                $player = Player::find($playerId);
                if ($player) {
                    $player->parents()->syncWithoutDetaching([$parent->id]);
                }
            }
        }

        $playerNames = '';
        if ($request->has('player_ids') && count($request->player_ids) > 0) {
            $names = Player::whereIn('id', $request->player_ids)->get()->map(fn($p) => $p->first_name)->join(', ');
            $playerNames = " Vinculado a: {$names}.";
        }

        return back()->with('success', "Tutor '{$parent->name}' registrado exitosamente.{$playerNames}");
    }

    /**
     * Descargar lista de jugadores por categoría (nombre, fecha de nacimiento, CURP).
     */
    public function exportCategory($category)
    {
        $players = Player::where('category', $category)
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        $filename = "lista_jugadores_" . Str::slug($category) . "_" . date('Y_m_d') . ".csv";
        $headers = [
            "Content-type"        => "text/csv; charset=UTF-8",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function() use($players) {
            $file = fopen('php://output', 'w');
            // BOM for Excel UTF-8 compatibility
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($file, ['Nombre Completo', 'Fecha de Nacimiento', 'CURP']);

            foreach ($players as $player) {
                fputcsv($file, [
                    $player->first_name . ' ' . $player->last_name,
                    $player->birth_date ? \Carbon\Carbon::parse($player->birth_date)->format('d/m/Y') : 'N/A',
                    $player->curp ?? 'N/A',
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function update(Request $request, Player $player)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'curp' => 'nullable|string|max:18',
            'jersey_number' => 'nullable|string|max:10',
            'date_of_birth' => 'required|date',
            'category' => 'nullable|string',
            'secondary_category' => 'nullable|string',
            'parent_ids' => 'nullable|array',
            'parent_ids.*' => 'exists:users,id',
            'photo' => 'nullable|image|max:10240',
        ]);

        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $filename = uniqid('player_') . '.' . $file->getClientOriginalExtension();
            
            $manager = new \Intervention\Image\ImageManager(new \Intervention\Image\Drivers\Gd\Driver());
            $image = $manager->decode($file);
            $image->cover(250, 300);
            
            $path = public_path('storage/photos/' . $filename);
            if (!file_exists(public_path('storage/photos'))) {
                mkdir(public_path('storage/photos'), 0755, true);
            }
            $image->save($path);
            $player->photo_path = 'photos/' . $filename;
        }

        $player->update([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'curp' => $request->curp,
            'jersey_number' => $request->jersey_number,
            'birth_date' => $request->date_of_birth,
            'category' => $request->category,
            'secondary_category' => $request->secondary_category,
        ]);

        if ($request->has('parent_ids')) {
            $player->parents()->sync($request->parent_ids);
        }

        return back()->with('success', 'Jugador actualizado con éxito.');
    }

    public function bulkUpdateCategory(Request $request)
    {
        $request->validate([
            'player_ids' => 'required|array',
            'player_ids.*' => 'exists:players,id',
            'category' => 'required|string',
        ]);

        Player::whereIn('id', $request->player_ids)->update(['category' => $request->category]);

        return back()->with('success', 'Categoría actualizada masivamente.');
    }

    public function deactivate(Player $player)
    {
        $player->update(['status' => 'inactive']);
        return back()->with('success', 'Jugador dado de baja.');
    }

    public function reactivate(Player $player)
    {
        $player->update(['status' => 'active']);
        return back()->with('success', "Jugador {$player->first_name} reactivado exitosamente.");
    }

    public function destroy(Player $player)
    {
        // Compute remaining debt
        $debt = $player->financialTransactions()->where('status', '!=', 'paid')->sum(DB::raw('amount - paid_amount'));
        
        if ($debt > 0) {
            return back()->withErrors(['error' => 'No se puede eliminar un jugador con deudas pendientes.']);
        }

        $player->delete();
        return back()->with('success', 'Jugador eliminado definitivamente.');
    }


    public function storeMany(Request $request)
    {
        $request->validate([
            'players' => 'required|array|min:1',
            'players.*.first_name' => 'required|string|max:255',
            'players.*.last_name' => 'required|string|max:255',
            'players.*.curp' => 'nullable|string|max:18',
            'players.*.jersey_number' => 'nullable|string|max:10',
            'players.*.date_of_birth' => 'required|date',
            'players.*.category' => 'nullable|string',
        ]);

        $count = 0;
        foreach ($request->players as $pData) {
            Player::create([
                'first_name' => $pData['first_name'],
                'last_name' => $pData['last_name'],
                'curp' => $pData['curp'] ?? null,
                'jersey_number' => $pData['jersey_number'] ?? null,
                'birth_date' => $pData['date_of_birth'],
                'category' => $pData['category'] ?? null,
                'status' => 'active',
            ]);
            $count++;
        }

        return back()->with('success', "Se han registrado {$count} jugadores exitosamente.");
    }

}
