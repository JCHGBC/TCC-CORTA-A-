<?php

declare(strict_types=1);

namespace App\Core;

/** Dados da requisição HTTP recebida. */
final class Request
{
    /** Usuário autenticado (preenchido pelo Router nas rotas protegidas). */
    public ?array $user = null;

    /** @var array<string, string> parâmetros da URL, ex.: {id} */
    public array $params = [];

    /**
     * @param array<string, mixed> $query
     * @param array<string, mixed> $body
     */
    public function __construct(
        public readonly string $method,
        public readonly string $path,
        public readonly array $query,
        private readonly array $body,
        private readonly ?string $authorization,
    ) {
    }

    public static function fromGlobals(): self
    {
        $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
        $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

        // Funciona tanto em http://localhost:8000/api/... quanto em
        // http://localhost/qualquer-pasta/backend/public/api/... (Apache/XAMPP)
        $apiPosition = strpos($path, '/api');
        $path = $apiPosition === false ? $path : substr($path, $apiPosition);
        $path = rtrim($path, '/') ?: '/';

        $body = [];
        $raw = file_get_contents('php://input');
        if ($raw !== false && trim($raw) !== '') {
            $decoded = json_decode($raw, true);
            if (!is_array($decoded)) {
                throw new HttpException(400, 'O corpo da requisição deve ser um JSON válido.');
            }
            $body = $decoded;
        }

        $authorization = $_SERVER['HTTP_AUTHORIZATION']
            ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
            ?? (function_exists('getallheaders') ? (getallheaders()['Authorization'] ?? null) : null);

        return new self($method, $path, $_GET, $body, $authorization);
    }

    /** @return array<string, mixed> */
    public function all(): array
    {
        return $this->body;
    }

    public function input(string $key, mixed $default = null): mixed
    {
        return $this->body[$key] ?? $default;
    }

    public function queryString(string $key): ?string
    {
        $value = $this->query[$key] ?? null;
        return is_string($value) && trim($value) !== '' ? trim($value) : null;
    }

    public function param(string $key): int
    {
        return (int) ($this->params[$key] ?? 0);
    }

    /** Token enviado no cabeçalho "Authorization: Bearer <token>". */
    public function bearerToken(): ?string
    {
        if ($this->authorization && preg_match('/^Bearer\s+(\S+)$/i', $this->authorization, $matches)) {
            return $matches[1];
        }
        return null;
    }

    /** @return array<string, mixed> */
    public function user(): array
    {
        if ($this->user === null) {
            throw new HttpException(401, 'Sessão expirada. Faça login novamente.');
        }
        return $this->user;
    }

    public function userId(): int
    {
        return (int) $this->user()['id'];
    }
}
