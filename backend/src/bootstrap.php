<?php

declare(strict_types=1);

/**
 * Inicialização do back-end: carregamento automático das classes,
 * configurações e conexão com o banco.
 */

// Autoload: a classe App\Controllers\GoalController fica em src/Controllers/GoalController.php
spl_autoload_register(function (string $class): void {
    $prefix = 'App\\';
    if (!str_starts_with($class, $prefix)) {
        return;
    }
    $file = __DIR__ . '/' . str_replace('\\', '/', substr($class, strlen($prefix))) . '.php';
    if (is_file($file)) {
        require $file;
    }
});

$config = require dirname(__DIR__) . '/config/config.php';

date_default_timezone_set($config['timezone']);
App\Core\Database::configure($config['db']);

return $config;
