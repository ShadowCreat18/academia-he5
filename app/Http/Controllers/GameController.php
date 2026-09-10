<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\Setting;
use App\Models\Player;
use App\Models\GameGoal;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Models\FinancialTransaction;
use App\Models\TransactionPayment;
use Illuminate\Support\Facades\Auth;

class GameController extends Controller
{
    /**
     * Display a listing of the games.
     */
    public function index()
    {
        $games = Game::with(['goals.player'])->orderBy('date', 'desc')->get();
        
        // Cargar los transactions de arbitraje para los juegos
        $games->load('financialTransactions');

        $players = Player::where('status', 'active')->with('parents:id,name,phone')->orderBy('first_name')->get();

        return Inertia::render('Admin/Matches/Index', [
            'games' => $games,
            'players' => $players,
            'senderPhone' => Setting::getVal('whatsapp_sender_phone', '4921226800'),
            'senderName' => Setting::getVal('whatsapp_sender_name', 'Prof. Héctor Esparza'),
        ]);
    }

    /**
     * Store a newly created game in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'opponent' => 'required|string|max:255',
            'date'     => 'required|date',
            'location' => 'nullable|string|max:255',
            'category' => 'required|string|max:255',
            'uniform_type' => 'nullable|string|max:255',
        ]);

        $game = Game::create($validated);

        // Fetch all active players in the category (or secondary category)
        $players = Player::where('status', 'active')
            ->where(function ($q) use ($validated) {
                $q->where('category', $validated['category'])
                  ->orWhere('secondary_category', $validated['category']);
            })
            ->with('parents:id,name,phone')
            ->get();

        $phonesToNotify = [];
        foreach ($players as $player) {
            foreach ($player->parents as $parent) {
                if (!empty($parent->phone)) {
                    $cleanPhone = preg_replace('/\D/', '', $parent->phone);
                    if (strlen($cleanPhone) === 10) {
                        $cleanPhone = '52' . $cleanPhone;
                    }
                    $phonesToNotify[$cleanPhone] = true; // Use array keys to get unique phones
                }
            }
        }
        
        $phonesToNotify = array_keys($phonesToNotify);

        // Format Date
        $gameDate = \Carbon\Carbon::parse($game->date);
        $formattedDate = $gameDate->translatedFormat('l d \d\e F') . ' a las ' . $gameDate->format('h:i A');

        $message = "🏆 *NUEVO PARTIDO PROGRAMADO* 🏆\n\n";
        $message .= "⚽ *Categoría:* " . $game->category . "\n";
        $message .= "🆚 *Rival:* " . $game->opponent . "\n";
        $message .= "📅 *Fecha:* " . ucfirst($formattedDate) . "\n";
        if ($game->location) {
            $message .= "📍 *Lugar:* " . $game->location . "\n";
        }
        if ($game->uniform_type) {
            $message .= "👕 *Uniforme:* " . $game->uniform_type . "\n";
        }
        $message .= "\n¡Por favor confirmen asistencia y lleguen puntuales!";

        // Dispatch jobs with delay
        $delaySeconds = 0;
        $interval = 15; // 15 seconds between messages
        
        foreach ($phonesToNotify as $phone) {
            \App\Jobs\SendWhatsAppMessage::dispatch($phone, $message)
                ->delay(now()->addSeconds($delaySeconds));
            
            $delaySeconds += $interval;
        }

        return back()->with('success', 'Partido registrado exitosamente. Se programaron ' . count($phonesToNotify) . ' avisos por WhatsApp.');
    }

    /**
     * Update the specified game in storage.
     */
    public function update(Request $request, Game $game)
    {
        $request->validate([
            'opponent'         => 'sometimes|required|string|max:255',
            'date'             => 'sometimes|required|date',
            'location'         => 'nullable|string|max:255',
            'category'         => 'sometimes|required|string|max:255',
            'uniform_type'     => 'nullable|string|max:255',
            'score_us'         => 'nullable|integer|min:0',
            'score_them'       => 'nullable|integer|min:0',
            'goals'            => 'nullable|array',
            'goals.*.player_id'=> 'required|exists:players,id',
            'goals.*.goals'    => 'required|integer|min:1',
        ]);

        DB::transaction(function () use ($request, $game) {
            $fields = $request->only(['opponent', 'location', 'category', 'uniform_type', 'score_us', 'score_them']);

            // Store date exactly as entered (no timezone conversion)
            if ($request->has('date') && $request->date) {
                $fields['date'] = $request->date;
            }

            $game->update($fields);

            // Only sync goals when the score modal explicitly sends them
            if ($request->has('goals')) {
                $game->goals()->delete();
                if (is_array($request->goals)) {
                    foreach ($request->goals as $goalData) {
                        GameGoal::create([
                            'game_id'   => $game->id,
                            'player_id' => $goalData['player_id'],
                            'goals'     => $goalData['goals'],
                        ]);
                    }
                }
            }
        });

        return back()->with('success', 'Partido actualizado exitosamente.');
    }

    /**
     * Remove the specified game from storage.
     */
    public function destroy(Game $game)
    {
        $game->delete();

        return back()->with('success', 'Partido eliminado exitosamente.');
    }
    public function processArbitration(Request $request, Game $game)
    {
        $request->validate([
            'paid_players' => 'array',
            'paid_players.*' => 'exists:players,id',
        ]);

        $paidPlayerIds = $request->paid_players ?? [];
        $amount = 50.00; // Costo fijo por ahora

        DB::transaction(function () use ($game, $paidPlayerIds, $amount) {
            $players = Player::where('status', 'active')
                ->where(function ($q) use ($game) {
                    $q->where('category', $game->category)
                      ->orWhere('secondary_category', $game->category);
                })->get();

            foreach ($players as $player) {
                $hasPaid = in_array($player->id, $paidPlayerIds);
                
                $transaction = FinancialTransaction::firstOrNew([
                    'player_id' => $player->id,
                    'game_id' => $game->id,
                ]);

                if (!$transaction->exists) {
                    $transaction->user_id = $player->parents->first()->id ?? Auth::id();
                    $transaction->concept = "Arbitraje - " . $game->opponent . " (" . $game->date->format('d/m/Y') . ")";
                    $transaction->amount = $amount;
                    $transaction->due_date = $game->date;
                    $transaction->is_arbitration_penalty = true;
                }

                if ($hasPaid) {
                    $transaction->paid_amount = $amount;
                    $transaction->status = 'paid';
                    $transaction->save();

                    // Registrar el pago si no existe
                    TransactionPayment::firstOrCreate([
                        'financial_transaction_id' => $transaction->id,
                    ], [
                        'user_id' => Auth::id(),
                        'amount' => $amount,
                        'method' => 'cash',
                    ]);
                } else {
                    $transaction->paid_amount = 0;
                    $transaction->status = 'pending';
                    $transaction->save();
                    
                    // Eliminar pagos asociados si existían
                    $transaction->transactionPayments()->delete();
                }
            }
        });

        return back()->with('success', 'Asistencia y arbitraje procesado exitosamente.');
    }
}
