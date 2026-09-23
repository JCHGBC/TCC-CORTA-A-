<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

/** Tabela "usuario". */
final class User
{
    /** @return array<string, mixed>|null */
    public static function findById(int $id): ?array
    {
        return Database::fetch('SELECT * FROM usuario WHERE id = ?', [$id]);
    }

    /** @return array<string, mixed>|null */
    public static function findByEmail(string $email): ?array
    {
        return Database::fetch('SELECT * FROM usuario WHERE email = ?', [mb_strtolower(trim($email))]);
    }

    public static function emailInUse(string $email, ?int $ignoreId = null): bool
    {
        $row = Database::fetch(
            'SELECT id FROM usuario WHERE email = ? AND id <> ?',
            [mb_strtolower(trim($email)), $ignoreId ?? 0],
        );
        return $row !== null;
    }

    public static function create(string $name, string $email, string $phone, string $password): int
    {
        return Database::insert(
            'INSERT INTO usuario (nome, email, telefone, senha_hash) VALUES (?, ?, ?, ?)',
            [$name, mb_strtolower($email), $phone, password_hash($password, PASSWORD_DEFAULT)],
        );
    }

    public static function update(int $id, string $name, string $email, string $phone): void
    {
        Database::query(
            'UPDATE usuario SET nome = ?, email = ?, telefone = ? WHERE id = ?',
            [$name, mb_strtolower($email), $phone, $id],
        );
    }

    public static function updatePassword(int $id, string $password): void
    {
        Database::query(
            'UPDATE usuario SET senha_hash = ? WHERE id = ?',
            [password_hash($password, PASSWORD_DEFAULT), $id],
        );
    }

    /** Apaga a conta e todos os dados do usuário (na ordem certa por causa das chaves estrangeiras). */
    public static function delete(int $id): void
    {
        Database::transaction(function () use ($id): void {
            Database::query('DELETE FROM movimentacao WHERE usuario_id = ?', [$id]);
            Database::query('DELETE FROM meta WHERE usuario_id = ?', [$id]);
            Database::query('DELETE FROM categoria WHERE usuario_id = ?', [$id]);
            Database::query('DELETE FROM sessao WHERE usuario_id = ?', [$id]);
            Database::query('DELETE FROM usuario WHERE id = ?', [$id]);
        });
    }

    /**
     * Formato enviado ao front-end (sem o hash da senha!).
     *
     * @param array<string, mixed> $row
     * @return array<string, mixed>
     */
    public static function toApi(array $row): array
    {
        return [
            'id' => (string) $row['id'],
            'name' => $row['nome'],
            'email' => $row['email'],
            'phone' => $row['telefone'],
            'createdAt' => date(DATE_ATOM, strtotime((string) $row['criado_em'])),
        ];
    }
}
