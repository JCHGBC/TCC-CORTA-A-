<?php

declare(strict_types=1);

namespace App\Core;

/** Resposta HTTP em JSON. */
final class Response
{
    private function __construct(
        public readonly int $status,
        public readonly mixed $data,
    ) {
    }

    public static function json(mixed $data, int $status = 200): self
    {
        return new self($status, $data);
    }

    public static function created(mixed $data): self
    {
        return new self(201, $data);
    }

    public static function noContent(): self
    {
        return new self(204, null);
    }

    /** @param array<string, string> $fields */
    public static function error(int $status, string $message, array $fields = []): self
    {
        $body = ['error' => $message];
        if ($fields) {
            $body['fields'] = $fields;
        }
        return new self($status, $body);
    }

    public function send(): void
    {
        http_response_code($this->status);
        if ($this->status === 204) {
            return;
        }
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($this->data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
}
