<?php

$controllerFile = __DIR__ . '/app/Http/Controllers/FinanceController.php';
$controllerContent = file_get_contents($controllerFile);
$controllerContent = str_replace(
    "'settings' => Setting::all()->pluck('value', 'key'),",
    "'settings' => Setting::all(),",
    $controllerContent
);
file_put_contents($controllerFile, $controllerContent);

echo "Updated FinanceController.php\n";
