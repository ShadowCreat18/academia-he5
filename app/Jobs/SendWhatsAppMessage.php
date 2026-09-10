<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendWhatsAppMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $phone;
    public $message;

    /**
     * Create a new job instance.
     */
    public function __construct($phone, $message)
    {
        $this->phone = $phone;
        $this->message = $message;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $apiUrl = env('WHATSAPP_API_URL');
        $apiKey = env('WHATSAPP_API_KEY', ''); // in case it needs auth

        if (!$apiUrl) {
            Log::warning("WHATSAPP_API_URL no está configurada. Mensaje a {$this->phone} omitido.");
            return;
        }

        try {
            $response = Http::post($apiUrl, [
                'number' => $this->phone,
                'message' => $this->message
            ]);

            if ($response->failed()) {
                Log::error("Error enviando WhatsApp a {$this->phone}: " . $response->body());
            }
        } catch (\Exception $e) {
            Log::error("Excepción enviando WhatsApp a {$this->phone}: " . $e->getMessage());
        }
    }
}

