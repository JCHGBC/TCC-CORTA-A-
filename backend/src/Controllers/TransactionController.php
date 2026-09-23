<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\HttpException;
use App\Core\Request;
use App\Core\Response;
use App\Core\Validator;
use App\Models\Category;
use App\Models\Transaction;

/** RF-03 (entradas) e RF-04 (saídas). */
final class TransactionController
{
    /** GET /api/transactions?type=&month=AAAA-MM&categoryId=&search= */
    public function index(Request $request): Response
    {
        $type = $request->queryString('type');
        $month = $request->queryString('month');
        $categoryId = $request->queryString('categoryId');

        if ($type !== null && !in_array($type, Transaction::TYPES, true)) {
            throw new HttpException(422, 'Tipo inválido.');
        }
        if ($month !== null && !preg_match('/^\d{4}-(0[1-9]|1[0-2])$/', $month)) {
            throw new HttpException(422, 'Mês inválido. Use o formato AAAA-MM.');
        }

        $rows = Transaction::list($request->userId(), [
            'type' => $type,
            'month' => $month,
            'categoryId' => $categoryId !== null ? (int) $categoryId : null,
            'search' => $request->queryString('search'),
        ]);
        return Response::json(array_map([Transaction::class, 'toApi'], $rows));
    }

    /** POST /api/transactions */
    public function store(Request $request): Response
    {
        $userId = $request->userId();
        $data = $this->validate($request, $userId);
        $id = Transaction::create($userId, $data);
        return Response::created(Transaction::toApi(Transaction::find($userId, $id)));
    }

    /** PUT /api/transactions/{id} */
    public function update(Request $request): Response
    {
        $userId = $request->userId();
        $id = $request->param('id');
        if (Transaction::find($userId, $id) === null) {
            throw new HttpException(404, 'Movimentação não encontrada.');
        }
        $data = $this->validate($request, $userId);
        Transaction::update($userId, $id, $data);
        return Response::json(Transaction::toApi(Transaction::find($userId, $id)));
    }

    /** DELETE /api/transactions/{id} */
    public function destroy(Request $request): Response
    {
        $userId = $request->userId();
        $id = $request->param('id');
        if (Transaction::find($userId, $id) === null) {
            throw new HttpException(404, 'Movimentação não encontrada.');
        }
        Transaction::delete($userId, $id);
        return Response::noContent();
    }

    /** @return array<string, mixed> */
    private function validate(Request $request, int $userId): array
    {
        $v = new Validator($request->all());
        $data = [
            'type' => $v->oneOf('type', 'Tipo inválido.', Transaction::TYPES),
            'description' => $v->text('description', 'a descrição', 2, 60),
            'amount' => $v->money('amount', 'o valor'),
            'categoryId' => $v->id('categoryId', 'Selecione a origem/categoria.'),
            'date' => $v->date('date'),
            'paymentMethod' => $v->oneOf('paymentMethod', 'Selecione a forma de pagamento.', Transaction::PAYMENT_METHODS),
            'notes' => $v->text('notes', 'a observação', 0, 200, false),
        ];
        $v->validate();

        // A categoria precisa ser do próprio usuário e do mesmo tipo (entrada/saída)
        $category = Category::find($userId, $data['categoryId']);
        if ($category === null || $category['tipo'] !== $data['type']) {
            throw new HttpException(422, 'Categoria inválida.', ['categoryId' => 'Categoria inválida.']);
        }
        return $data;
    }
}
