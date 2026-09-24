<?php

$controllerFile = __DIR__ . '/app/Http/Controllers/SettingController.php';
$controllerContent = file_get_contents($controllerFile);
$controllerContent = str_replace(
    "'settings.*.key' => 'required|string|exists:settings,key',",
    "'settings.*.key' => 'required|string',\n            'settings.*.name' => 'nullable|string',",
    $controllerContent
);
$controllerContent = str_replace(
    "Setting::where('key', \$settingData['key'])->update(['value' => \$settingData['value']]);",
    "Setting::updateOrCreate(\n                ['key' => \$settingData['key']],\n                [\n                    'value' => \$settingData['value'],\n                    'name' => \$settingData['name'] ?? \$settingData['key']\n                ]\n            );",
    $controllerContent
);
file_put_contents($controllerFile, $controllerContent);

echo "Updated SettingController.php\n";
