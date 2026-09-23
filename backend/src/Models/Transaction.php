<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

/** Tabela "movimentacao" (entradas e saídas). */
final class Transaction
{
    public const TYPES = ['entrada', 'saida'];
    public const PAYMENT_METHODS = ['dinheiro', 'pix', 'debito', 'credito', 'boleto', 'transferencia'];

    /**
     * @param array{type?: ?string, month?: ?string, categoryId?: ?int, search?: ?string} $filters
     * @return list<array<string, mixed>>
     */
    public static function list(int $userId, array $filters = []): array
    {
        $sql = 'SELECT * FROM movimentacao WHERE usuario_id = ?';
        $params = [$userId];

        if (!empty($filters['type'])) {
            $sql .= ' AND tipo = ?';
            $params[] = $filters['type'];
        }
        if (!empty($filters['month'])) {
            // "2026-09" -> de 2026-09-01 até 2026-09-30
            $first = $filters['month'] . '-01';
            $sql .= ' AND data BETWEEN ? AND LAST_DAY(?)';
            array_push($params, $first, $first);
        }
        if (!empty($filters['categoryId'])) {
            $sql .= ' AND categoria_id = ?';
            $params[] = $filters['categoryId'];
        }
        if (!empty($filters['search'])) {
            // O collation utf8mb4_unicode_ci já ignora maiúsculas e acentos
            $like = '%' . addcslashes($filters['search'], '%_\\') . '%';
            $sql .= ' AND (descricao LIKE ? OR observacao LIKE ?)';
            array_push($params, $like, $like);
        }

        return Database::fetchAll($sql . ' ORDER BY data DESC, id DESC', $params);
    }

    /** @return array<string, mixed>|null */
    public static function find(int $userId, int $id): ?array
    {
        return Database::fetch('SELECT * FROM movimentacao WHERE id = ? AND usuario_id = ?', [$id, $userId]);
    }

    /** @param array<string, mixed> $data */
    public static function create(int $userId, array $data): int
    {
        return Database::insert(
            'INSERT INTO movimentacao
                (usuario_id, categoria_id, tipo, descricao, valor_centavos, data, forma_pagamento, observacao)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
                $userId,
                $data['categoryId'],
                $data['type'],
                $data['description'],
                $data['amount'],
                $data['date'],
                $data['paymentMethod'],
                $data['notes'] ?: null,
            ],
        );
    }

    /** @param array<string, mixed> $data */
    public static function update(int $userId, int $id, array $data): void
    {
        Database::query(
            'UPDATE movimentacao
                SET categoria_id = ?, tipo = ?, descricao = ?, valor_centavos = ?, data = ?,
                    forma_pagamento = ?, observacao = ?
              WHERE id = ? AND usuario_id = ?',
            [
                $data['categoryId'],
                $data['type'],
                $data['description'],
                $data['amount'],
                $data['date'],
                $data['paymentMethod'],
                $data['notes'] ?: null,
                $id,
                $userId,
            ],
        );
    }

    public static function delete(int $userId, int $id): void
    {
        Database::query('DELETE FROM movimentacao WHERE id = ? AND usuario_id = ?', [$id, $userId]);
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
            'type' => $row['tipo'],
            'description' => $row['descricao'],
            'amount' => (int) $row['valor_centavos'],
            'categoryId' => (string) $row['categoria_id'],
            'date' => (string) $row['data'],
            'paymentMethod' => $row['forma_pagamento'],
            'createdAt' => date(DATE_ATOM, strtotime((string) $row['criado_em'])),
        ];
        if ($row['observacao'] !== null) {
            $data['notes'] = $row['observacao'];
        }
        return $data;
    }
}
