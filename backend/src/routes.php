<?php

declare(strict_types=1);

/**
 * Todas as rotas da API.
 * O último parâmetro "false" indica rota pública (não exige login).
 */

use App\Controllers\AuthController;
use App\Controllers\CategoryController;
use App\Controllers\GoalController;
use App\Controllers\ProfileController;
use App\Controllers\TransactionController;
use App\Core\Response;
use App\Core\Router;

/** @var array<string, mixed> $config */

$router = new Router();

$auth = new AuthController($config['session']);
$profile = new ProfileController();
$categories = new CategoryController();
$transactions = new TransactionController();
$goals = new GoalController();

// Teste rápido: http://localhost:8000/api/health
$router->get('/api/health', fn () => Response::json(['status' => 'ok']), false);

// Autenticação
$router->post('/api/auth/register', [$auth, 'register'], false);
$router->post('/api/auth/login', [$auth, 'login'], false);
$router->post('/api/auth/forgot-password', [$auth, 'forgotPassword'], false);
$router->post('/api/auth/logout', [$auth, 'logout']);
$router->get('/api/auth/me', [$auth, 'me']);

// Perfil
$router->put('/api/profile', [$profile, 'update']);
$router->put('/api/profile/password', [$profile, 'changePassword']);
$router->delete('/api/profile', [$profile, 'destroy']);

// Categorias
$router->get('/api/categories', [$categories, 'index']);
$router->get('/api/categories/usage', [$categories, 'usage']);
$router->post('/api/categories', [$categories, 'store']);
$router->put('/api/categories/{id}', [$categories, 'update']);
$router->delete('/api/categories/{id}', [$categories, 'destroy']);

// Movimentações (entradas e saídas)
$router->get('/api/transactions', [$transactions, 'index']);
$router->post('/api/transactions', [$transactions, 'store']);
$router->put('/api/transactions/{id}', [$transactions, 'update']);
$router->delete('/api/transactions/{id}', [$transactions, 'destroy']);

// Metas
$router->get('/api/goals', [$goals, 'index']);
$router->post('/api/goals', [$goals, 'store']);
$router->put('/api/goals/{id}', [$goals, 'update']);
$router->post('/api/goals/{id}/move', [$goals, 'move']);
$router->delete('/api/goals/{id}', [$goals, 'destroy']);

return $router;
