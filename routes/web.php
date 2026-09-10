<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\WalletController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\ParentManagementController;
use App\Http\Controllers\AdminProfileController;

use Inertia\Inertia;
use Illuminate\Support\Facades\Artisan;

Route::get('/', function () {
    return Inertia::render('Welcome');
});

Route::get('/limpiar-cache-total', function () {
    Artisan::call('optimize:clear');
    Artisan::call('view:clear');
    Artisan::call('route:clear');
    Artisan::call('config:clear');
    Artisan::call('cache:clear');
    return response('<h1>Caché de Laravel limpia.</h1><p>Si sigues viendo la versión vieja, purga la caché desde el panel de Hostinger (LiteSpeed).</p>')
           ->header('X-LiteSpeed-Purge', '*');
});

Route::middleware(['guest', 'throttle:10,1'])->group(function () {
    Route::get('/login', [\App\Http\Controllers\AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [\App\Http\Controllers\AuthController::class, 'login']);
});

Route::post('/logout', [\App\Http\Controllers\AuthController::class, 'logout'])->name('logout')->middleware('throttle:10,1');

Route::get('/letterhead/download', [\App\Http\Controllers\LetterheadController::class, 'download'])->name('letterhead.download');

Route::get('/plantilla/download', [\App\Http\Controllers\TemplateController::class, 'download'])->name('csv.template');

// Stripe Webhook — SIN CSRF (Stripe firma los requests con su propio secret)
Route::post('/stripe/webhook', [\App\Http\Controllers\StripePaymentController::class, 'handleWebhook'])
    ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class])
    ->name('stripe.webhook');

Route::middleware(['auth', 'throttle:60,1', 'role:admin'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Players & Categories
    Route::post('/players/bulk-import', [\App\Http\Controllers\PlayerImportController::class, 'import'])->name('players.bulk-import');
    Route::post('/parents/store', [PlayerController::class, 'storeParent'])->name('parents.store');
    Route::get('/players/export/{category}', [PlayerController::class, 'exportCategory'])->name('players.export-category');
    Route::post('/players/bulk-category', [PlayerController::class, 'bulkUpdateCategory'])->name('players.bulk-category');
    Route::post('/players/store-many', [PlayerController::class, 'storeMany'])->name('players.store-many');
    Route::post('/players/{player}/deactivate', [PlayerController::class, 'deactivate'])->name('players.deactivate');
    Route::post('/players/{player}/reactivate', [PlayerController::class, 'reactivate'])->name('players.reactivate');
    Route::resource('players', PlayerController::class);
    Route::resource('categories', CategoryController::class);
    
    // Parents (Admin)
    Route::resource('parents', ParentManagementController::class)->except(['create', 'show', 'edit', 'store']);

    // PDF Generation (admin)
    Route::get('/transactions/{id}/receipt', [\App\Http\Controllers\PdfController::class, 'downloadReceipt'])->name('pdf.receipt');
    Route::get('/finances/statement/{player}', [\App\Http\Controllers\PdfController::class, 'downloadStatement'])->name('pdf.statement');

    Route::post('/categories/process-year-change', [CategoryController::class, 'processYearChange']);

    // Wallet & Transactions (admin)
    Route::post('/wallet/top-up', [WalletController::class, 'topUp'])->middleware('throttle:10,1');
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::post('/transactions/charge', [TransactionController::class, 'storeCharge']);
    Route::post('/transactions/checkout', [TransactionController::class, 'checkoutCart'])->middleware('throttle:10,1');

    // Finance Management (Admin)
    Route::get('/finances', [\App\Http\Controllers\FinanceController::class, 'index'])->name('finances.index');
    Route::post('/finances/charge', [\App\Http\Controllers\FinanceController::class, 'storeCharge'])->name('finances.store-charge');
    Route::post('/finances/charge-many', [\App\Http\Controllers\FinanceController::class, 'storeMany'])->name('finances.store-many');
    Route::put('/finances/charge/{transaction}', [\App\Http\Controllers\FinanceController::class, 'updateCharge'])->name('finances.update-charge');
    Route::delete('/finances/charge/{transaction}', [\App\Http\Controllers\FinanceController::class, 'destroyCharge'])->name('finances.destroy-charge');
    Route::post('/finances/payment/{transaction}', [\App\Http\Controllers\FinanceController::class, 'registerPayment'])->name('finances.register-payment');
    Route::post('/finances/bulk-charge', [\App\Http\Controllers\FinanceController::class, 'bulkCharge'])->name('finances.bulk-charge');

    Route::get('/settings', [\App\Http\Controllers\SettingController::class, 'index'])->name('settings.index');
    Route::put('/settings', [\App\Http\Controllers\SettingController::class, 'update'])->name('settings.update');
    Route::post('/settings/deletion-requests/{deletionRequest}/process', [\App\Http\Controllers\SettingController::class, 'processDeletion'])->name('settings.deletion-requests.process');

    // Admin Profile
    Route::get('/profile', [AdminProfileController::class, 'index'])->name('admin.profile.index');
    Route::put('/profile', [AdminProfileController::class, 'update'])->name('admin.profile.update');

    // Matches/Games
    Route::post('/matches/{game}/arbitration', [\App\Http\Controllers\GameController::class, 'processArbitration'])->name('matches.arbitration');
    Route::resource('matches', \App\Http\Controllers\GameController::class)->except(['create', 'show', 'edit'])->parameters(['matches' => 'game']);
});

// Portal de Padres
Route::middleware(['auth', 'throttle:60,1', 'role:parent'])->group(function () {
    Route::get('/parent/dashboard', [\App\Http\Controllers\ParentController::class, 'index'])->name('parent.dashboard');
    Route::get('/parent/children', [\App\Http\Controllers\ParentController::class, 'children'])->name('parent.children');
    Route::get('/parent/finances', [\App\Http\Controllers\ParentController::class, 'finances'])->name('parent.finances');
    Route::get('/parent/games', [\App\Http\Controllers\ParentController::class, 'games'])->name('parent.games');
    Route::post('/parent/profile', [\App\Http\Controllers\ParentController::class, 'updateProfile'])->name('parent.profile.update');
    Route::post('/parent/accept-consent', [\App\Http\Controllers\ParentController::class, 'acceptConsent'])->name('parent.accept-consent');
    Route::put('/parent/child/{player}', [\App\Http\Controllers\ParentController::class, 'updateChild'])->name('parent.child.update');
    Route::post('/parent/request-deletion', [\App\Http\Controllers\ParentController::class, 'requestDeletion'])->name('parent.request-deletion');
    Route::delete('/parent/cancel-deletion', [\App\Http\Controllers\ParentController::class, 'cancelDeletion'])->name('parent.cancel-deletion');

    // Payments (Stripe Checkout & Monedero)
    Route::post('/parent/payments/checkout-session', [\App\Http\Controllers\StripePaymentController::class, 'createCheckoutSession'])->name('parent.stripe.checkout')->middleware('throttle:10,1');
    Route::get('/parent/payments/success', [\App\Http\Controllers\StripePaymentController::class, 'handleSuccess'])->name('parent.stripe.success');
    Route::post('/parent/payments/wallet', [\App\Http\Controllers\StripePaymentController::class, 'payWithWallet'])->name('parent.wallet.pay')->middleware('throttle:10,1');
});


// Fallback to serve storage files directly if symlink is missing or broken on shared hosting
Route::get('/storage/{path}', function ($path) {
    $fullPath = storage_path('app/public/' . $path);
    if (!file_exists($fullPath)) {
        abort(404);
    }
    
    // Check if it's a valid mime type (basic security check)
    $mimeType = mime_content_type($fullPath);
    if (!$mimeType || strpos($mimeType, 'image/') !== 0) {
        // You can allow PDFs or other types if needed, for now just images
        // Actually let's allow images and PDFs
        if (strpos($mimeType, 'application/pdf') !== 0 && strpos($mimeType, 'image/') !== 0) {
            abort(404);
        }
    }
    
    return response()->file($fullPath);
})->where('path', '.*');
