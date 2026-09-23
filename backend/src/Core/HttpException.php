<?php

declare(strict_types=1);

namespace App\Core;

use RuntimeException;

/**
 * Erro "esperado" que vira uma resposta HTTP com mensagem para o usuário.
 * Ex.: throw new HttpException(404, 'Meta não encontrada.');
 */
final class HttpException extends RuntimeException
{
    /** @param array<string, string> $fields erros por campo (validação) */
    public function __construct(
        public readonly int $status,
        string $message,
        public readonly array $fields = [],
    ) {
        parent::__construct($message);
    }
}
