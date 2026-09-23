<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

/**
 * Tabela "sessao": tokens de login.
 * O token é gerado aleatoriamente e entregue ao usuário; no banco fica
 * apenas o hash SHA-256 dele (se o banco vazar, os tokens não podem ser usados).
 */
final class Session
{
    public static function create(int $userId, bool $remember, array $config): string
    {
        $token = bin2hex(random_bytes(32));
        $expiresAt = $remember
            ? strtotime("+{$config['remember_days']} days")
            : strtotime("+{$config['default_hours']} hours");

        // Aproveita para limpar sessões vencidas deste usuário
        Database::query('DELETE FROM sessao WHERE usuario_id = ? AND expira_em < ?', [$userId, self::now()]);

        Database::insert(
            'INSERT INTO sessao (usuario_id, token_hash, expira_em) VALUES (?, ?, ?)',
            [$userId, hash('sha256', $token), date('Y-m-d H:i:s', $expiresAt)],
        );
        return $token;
    }

    /** @return array<string, mixed>|null usuário dono do token, se a sessão ainda for válida */
    public static function findUserByToken(string $token): ?array
    {
        return Database::fetch(
            'SELECT u.* FROM sessao s
               JOIN usuario u ON u.id = s.usuario_id
              WHERE s.token_hash = ? AND s.expira_em > ?',
            [hash('sha256', $token), self::now()],
        );
    }

    public static function delete(string $token): void
    {
        Database::query('DELETE FROM sessao WHERE token_hash = ?', [hash('sha256', $token)]);
    }

    /** Encerra as outras sessões (ex.: depois de trocar a senha). */
    public static function deleteOthers(int $userId, string $currentToken): void
    {
        Database::query(
            'DELETE FROM sessao WHERE usuario_id = ? AND token_hash <> ?',
            [$userId, hash('sha256', $currentToken)],
        );
    }

    private static function now(): string
    {
        return date('Y-m-d H:i:s');
    }
}
