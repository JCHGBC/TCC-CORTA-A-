<?php

/**
 * Configurações do back-end.
 *
 * Os valores padrão já funcionam no XAMPP (MySQL com usuário "root" sem senha).
 * Para usar outros dados SEM alterar este arquivo, crie "config.local.php" nesta
 * mesma pasta (ele é ignorado pelo Git) retornando só o que quiser mudar:
 *
 *   <?php return ['db' => ['pass' => 'minha-senha']];
 */

$config = [
    'db' => [
        'host' => getenv('DB_HOST') ?: '127.0.0.1',
        'port' => getenv('DB_PORT') ?: '3306',
        'name' => getenv('DB_NAME') ?: 'corta_ai',
        'user' => getenv('DB_USER') ?: 'root',
        'pass' => getenv('DB_PASS') !== false ? (string) getenv('DB_PASS') : '',
    ],

    // Duração do login: "manter conectado" marcado x desmarcado
    'session' => [
        'remember_days' => 30,
        'default_hours' => 12,
    ],

    // Endereços do front-end que podem chamar a API diretamente (CORS)
    'cors_origins' => ['http://localhost:3000', 'http://127.0.0.1:3000'],

    // true = mostra detalhes técnicos dos erros (use só em desenvolvimento)
    'debug' => getenv('APP_DEBUG') === '1',

    'timezone' => 'America/Sao_Paulo',
];

$localFile = __DIR__ . '/config.local.php';
if (is_file($localFile)) {
    $config = array_replace_recursive($config, require $localFile);
}

return $config;
