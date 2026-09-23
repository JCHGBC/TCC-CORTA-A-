<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

/** Tabela "categoria". */
final class Category
{
    /** Categorias criadas automaticamente no cadastro. */
    public const DEFAULTS = [
        ['Salário', 'entrada', '#10b981'],
        ['Freelance', 'entrada', '#0ea5e9'],
        ['Investimentos', 'entrada', '#6366f1'],
        ['Presentes', 'entrada', '#ec4899'],
        ['Outras entradas', 'entrada', '#64748b'],
        ['Alimentação', 'saida', '#f97316'],
        ['Moradia', 'saida', '#6366f1'],
        ['Transporte', 'saida', '#0ea5e9'],
        ['Contas', 'saida', '#eab308'],
        ['Saúde', 'saida', '#14b8a6'],
        ['Educação', 'saida', '#a855f7'],
        ['Lazer', 'saida', '#ec4899'],
        ['Compras', 'saida', '#f43f5e'],
        ['Outras saídas', 'saida', '#78716c'],
    ];

    public static function createDefaults(int $userId): void
    {
        foreach (self::DEFAULTS as [$name, $type, $color]) {
            self::create($userId, $name, $type, $color);
        }
    }

    /** @return list<array<string, mixed>> */
    public static function list(int $userId, ?string $type = null): array
    {
        $sql = 'SELECT * FROM categoria WHERE usuario_id = ?';
        $params = [$userId];
        if ($type !== null) {
            $sql .= ' AND tipo = ?';
            $params[] = $type;
        }
        return Database::fetchAll($sql . ' ORDER BY nome', $params);
    }

    /** @return array<string, mixed>|null */
    public static function find(int $userId, int $id): ?array
    {
        return Database::fetch('SELECT * FROM categoria WHERE id = ? AND usuario_id = ?', [$id, $userId]);
    }

    /** O banco compara sem diferenciar maiúsculas e acentos ("lazer" = "Lazer"). */
    public static function nameInUse(int $userId, string $type, string $name, ?int $ignoreId = null): bool
    {
        return Database::fetch(
            'SELECT id FROM categoria WHERE usuario_id = ? AND tipo = ? AND nome = ? AND id <> ?',
            [$userId, $type, $name, $ignoreId ?? 0],
        ) !== null;
    }

    public static function create(int $userId, string $name, string $type, string $color): int
    {
        return Database::insert(
            'INSERT INTO categoria (usuario_id, nome, tipo, cor) VALUES (?, ?, ?, ?)',
            [$userId, $name, $type, $color],
        );
    }

    public static function update(int $userId, int $id, string $name, string $type, string $color): void
    {
        Database::query(
            'UPDATE categoria SET nome = ?, tipo = ?, cor = ? WHERE id = ? AND usuario_id = ?',
            [$name, $type, $color, $id, $userId],
        );
    }

    public static function delete(int $userId, int $id): void
    {
        Database::query('DELETE FROM categoria WHERE id = ? AND usuario_id = ?', [$id, $userId]);
    }

    public static function countTransactions(int $id): int
    {
        return (int) Database::fetch('SELECT COUNT(*) AS total FROM movimentacao WHERE categoria_id = ?', [$id])['total'];
    }

    /** @return array<string, int> id da categoria => quantidade de movimentações */
    public static function usage(int $userId): array
    {
        $rows = Database::fetchAll(
            'SELECT categoria_id, COUNT(*) AS total FROM movimentacao WHERE usuario_id = ? GROUP BY categoria_id',
            [$userId],
        );
        $usage = [];
        foreach ($rows as $row) {
            $usage[(string) $row['categoria_id']] = (int) $row['total'];
        }
        return $usage;
    }

    /**
     * @param array<string, mixed> $row
     * @return array<string, mixed>
     */
    public static function toApi(array $row): array
    {
        return [
            'id' => (string) $row['id'],
            'userId' => (string) $row['usuario_id'],
            'name' => $row['nome'],
            'type' => $row['tipo'],
            'color' => $row['cor'],
            'createdAt' => date(DATE_ATOM, strtotime((string) $row['criado_em'])),
        ];
    }
}
