<?php

declare(strict_types=1);

/**
 * Ponto de entrada da API do Corta Aí.
 * Toda requisição passa por aqui e é direcionada para o controller certo.
 *
 * Rodar em desenvolvimento (na raiz do projeto):
 *   php -S localhost:8000 -t backend/public backend/public/index.php
 */

use App\Core\HttpException;
use App\Core\Request;
use App\Core\Response;

$config = require dirname(__DIR__) . '/src/bootstrap.php';

// CORS: permite que o front-end (localhost:3000) chame a API diretamente
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $config['cors_origins'], true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Vary: Origin');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
}
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    $request = Request::fromGlobals();
    $router = require dirname(__DIR__) . '/src/routes.php';
    $response = $router->dispatch($request);
} catch (HttpException $e) {
    $response = Response::error($e->status, $e->getMessage(), $e->fields);
} catch (Throwable $e) {
    error_log('[Corta Aí] ' . $e);
    $message = $config['debug'] ? $e->getMessage() : 'Erro interno no servidor. Tente novamente.';
    $response = Response::error(500, $message);
}

$response->send();
