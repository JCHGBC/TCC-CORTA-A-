<?php

declare(strict_types=1);

namespace App\Core;

use App\Models\Session;

/**
 * Roteador simples: associa "MÉTODO /caminho" a um método de controller.
 * Rotas protegidas exigem o token de login (RNF-02).
 */
final class Router
{
    /** @var list<array{method: string, regex: string, handler: callable, auth: bool}> */
    private array $routes = [];

    public function get(string $path, callable $handler, bool $auth = true): void
    {
        $this->add('GET', $path, $handler, $auth);
    }

    public function post(string $path, callable $handler, bool $auth = true): void
    {
        $this->add('POST', $path, $handler, $auth);
    }

    public function put(string $path, callable $handler, bool $auth = true): void
    {
        $this->add('PUT', $path, $handler, $auth);
    }

    public function delete(string $path, callable $handler, bool $auth = true): void
    {
        $this->add('DELETE', $path, $handler, $auth);
    }

    private function add(string $method, string $path, callable $handler, bool $auth): void
    {
        // "/api/goals/{id}" -> "#^/api/goals/(?P<id>\d+)$#"
        $regex = '#^' . preg_replace('/\{(\w+)\}/', '(?P<$1>\d+)', $path) . '$#';
        $this->routes[] = ['method' => $method, 'regex' => $regex, 'handler' => $handler, 'auth' => $auth];
    }

    public function dispatch(Request $request): Response
    {
        $pathExists = false;

        foreach ($this->routes as $route) {
            if (!preg_match($route['regex'], $request->path, $matches)) {
                continue;
            }
            $pathExists = true;
            if ($route['method'] !== $request->method) {
                continue;
            }

            $request->params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);

            if ($route['auth']) {
                $request->user = $this->authenticate($request);
            }

            return ($route['handler'])($request);
        }

        if ($pathExists) {
            throw new HttpException(405, 'Método não permitido para este endereço.');
        }
        throw new HttpException(404, 'Endereço da API não encontrado.');
    }

    /** @return array<string, mixed> */
    private function authenticate(Request $request): array
    {
        $token = $request->bearerToken();
        $user = $token ? Session::findUserByToken($token) : null;
        if ($user === null) {
            throw new HttpException(401, 'Sessão expirada. Faça login novamente.');
        }
        return $user;
    }
}
