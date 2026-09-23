<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

/** Tabela "meta" (objetivos financeiros). */
final class Goal
{
    /** @return list<array<string, mixed>> */
    public static function list(int $userId): array
    {
        return Database::fetchAll('SELECT * FROM meta WHERE usuario_id = ? ORDER BY prazo, id', [$userId]);
    }

    /** @return array<string, mixed>|null */
    public static function find(int $userId, int $id): ?array
    {
        return Database::fetch('SELECT * FROM meta WHERE id = ? AND usuario_id = ?', [$id, $userId]);
    }

    /** @param array<string, mixed> $data */
    public static function create(int $userId, array $data): int
    {
        return Database::insert(
            'INSERT INTO meta (usuario_id, nome, descricao, valor_alvo_centavos, valor_atual_centavos, prazo, cor)
             VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                $userId,
                $data['name'],
                $data['description'] ?: null,
                $data['targetAmount'],
                $data['currentAmount'],
                $data['deadline'],
                $data['color'],
            ],
        );
    }

    /** @param array<string, mixed> $data */
    public static function update(int $userId, int $id, array $data): void
    {
        Database::query(
            'UPDATE meta
                SET nome = ?, descricao = ?, valor_alvo_centavos = ?, valor_atual_centavos = ?, prazo = ?, cor = ?
              WHERE id = ? AND usuario_id = ?',
            [
                $data['name'],
                $data['description'] ?: null,
                $data['targetAmount'],
                $data['currentAmount'],
                $data['deadline'],
                $data['color'],
                $id,
                $userId,
            ],
        );
    }

    /** Soma (guardar) ou subtrai (retirar) do valor atual da meta. */
    public static function changeCurrentAmount(int $userId, int $id, int $delta): void
    {
        Database::query(
            'UPDATE meta SET valor_atual_centavos = valor_atual_centavos + ? WHERE id = ? AND usuario_id = ?',
            [$delta, $id, $userId],
        );
    }

    public static function delete(int $userId, int $id): void
    {
        Database::query('DELETE FROM meta WHERE id = ? AND usuario_id = ?', [$id, $userId]);
    }

    /**
     * @param array<string, mixed> $row
     * @return array<string, mixed>
     */
    public static function toApi(array $row): array
    {
        $data = [
            'id' => (string) $row['id'],
            'userId' => (string) $row['usuario_id'],
            'name' => $row['nome'],
            'targetAmount' => (int) $row['valor_alvo_centavos'],
            'currentAmount' => (int) $row['valor_atual_centavos'],
            'deadline' => (string) $row['prazo'],
            'color' => $row['cor'],
            'createdAt' => date(DATE_ATOM, strtotime((string) $row['criado_em'])),
        ];
        if ($row['descricao'] !== null) {
            $data['description'] = $row['descricao'];
        }
        return $data;
    }
}
