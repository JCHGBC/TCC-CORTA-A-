<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\HttpException;
use App\Core\Request;
use App\Core\Response;
use App\Core\Validator;
use App\Models\Category;
use App\Models\Transaction;

/** Categorias: origem das entradas e destino das saídas. */
final class CategoryController
{
    /** GET /api/categories?type=entrada|saida */
    public function index(Request $request): Response
    {
        $type = $request->queryString('type');
        if ($type !== null && !in_array($type, Transaction::TYPES, true)) {
            throw new HttpException(422, 'Tipo inválido.');
        }
        $rows = Category::list($request->userId(), $type);
        return Response::json(array_map([Category::class, 'toApi'], $rows));
    }

    /** GET /api/categories/usage — quantidade de movimentações por categoria */
    public function usage(Request $request): Response
    {
        return Response::json((object) Category::usage($request->userId()));
    }

    /** POST /api/categories */
    public function store(Request $request): Response
    {
        $userId = $request->userId();
        [$name, $type, $color] = $this->validate($request);

        if (Category::nameInUse($userId, $type, $name)) {
            throw new HttpException(409, 'Já existe uma categoria com este nome.', ['name' => 'Já existe uma categoria com este nome.']);
        }

        $id = Category::create($userId, $name, $type, $color);
        return Response::created(Category::toApi(Category::find($userId, $id)));
    }

    /** PUT /api/categories/{id} */
    public function update(Request $request): Response
    {
        $userId = $request->userId();
        $id = $request->param('id');
        $category = $this->findOrFail($userId, $id);
        [$name, $type, $color] = $this->validate($request);

        if ($category['tipo'] !== $type && Category::countTransactions($id) > 0) {
            throw new HttpException(422, 'Não é possível mudar o tipo de uma categoria que já possui movimentações.');
        }
        if (Category::nameInUse($userId, $type, $name, $id)) {
            throw new HttpException(409, 'Já existe uma categoria com este nome.', ['name' => 'Já existe uma categoria com este nome.']);
        }

        Category::update($userId, $id, $name, $type, $color);
        return Response::json(Category::toApi(Category::find($userId, $id)));
    }

    /** DELETE /api/categories/{id} */
    public function destroy(Request $request): Response
    {
        $userId = $request->userId();
        $id = $request->param('id');
        $this->findOrFail($userId, $id);

        $inUse = Category::countTransactions($id);
        if ($inUse > 0) {
            $word = $inUse === 1 ? 'movimentação' : 'movimentações';
            throw new HttpException(409, "Esta categoria possui {$inUse} {$word} e não pode ser excluída.");
        }

        Category::delete($userId, $id);
        return Response::noContent();
    }

    /** @return array{0: string, 1: string, 2: string} */
    private function validate(Request $request): array
    {
        $v = new Validator($request->all());
        $name = $v->text('name', 'o nome', 2, 30);
        $type = $v->oneOf('type', 'Tipo inválido.', Transaction::TYPES);
        $color = $v->color();
        $v->validate();
        return [$name, $type, $color];
    }

    /** @return array<string, mixed> */
    private function findOrFail(int $userId, int $id): array
    {
        return Category::find($userId, $id) ?? throw new HttpException(404, 'Categoria não encontrada.');
    }
}
