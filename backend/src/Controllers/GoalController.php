<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Database;
use App\Core\HttpException;
use App\Core\Request;
use App\Core\Response;
use App\Core\Validator;
use App\Models\Goal;

/** RF-05 — Definição de metas. */
final class GoalController
{
    /** GET /api/goals */
    public function index(Request $request): Response
    {
        return Response::json(array_map([Goal::class, 'toApi'], Goal::list($request->userId())));
    }

    /** POST /api/goals */
    public function store(Request $request): Response
    {
        $userId = $request->userId();
        $id = Goal::create($userId, $this->validate($request));
        return Response::created(Goal::toApi(Goal::find($userId, $id)));
    }

    /** PUT /api/goals/{id} */
    public function update(Request $request): Response
    {
        $userId = $request->userId();
        $id = $request->param('id');
        $this->findOrFail($userId, $id);
        Goal::update($userId, $id, $this->validate($request));
        return Response::json(Goal::toApi(Goal::find($userId, $id)));
    }

    /** POST /api/goals/{id}/move — guardar (deposit) ou retirar (withdraw) dinheiro */
    public function move(Request $request): Response
    {
        $userId = $request->userId();
        $id = $request->param('id');

        $v = new Validator($request->all());
        $operation = $v->oneOf('operation', 'Operação inválida.', ['deposit', 'withdraw']);
        $amount = $v->money('amount', 'o valor');
        $v->validate();

        $goal = Database::transaction(function () use ($userId, $id, $operation, $amount): array {
            // "FOR UPDATE" trava a linha para duas operações ao mesmo tempo não se atrapalharem
            $goal = Database::fetch('SELECT * FROM meta WHERE id = ? AND usuario_id = ? FOR UPDATE', [$id, $userId])
                ?? throw new HttpException(404, 'Meta não encontrada.');

            if ($operation === 'withdraw' && $amount > (int) $goal['valor_atual_centavos']) {
                throw new HttpException(422, 'Você não pode retirar mais do que já foi guardado nesta meta.');
            }
            Goal::changeCurrentAmount($userId, $id, $operation === 'deposit' ? $amount : -$amount);
            return Goal::find($userId, $id);
        });

        return Response::json(Goal::toApi($goal));
    }

    /** DELETE /api/goals/{id} */
    public function destroy(Request $request): Response
    {
        $userId = $request->userId();
        $id = $request->param('id');
        $this->findOrFail($userId, $id);
        Goal::delete($userId, $id);
        return Response::noContent();
    }

    /** @return array<string, mixed> */
    private function validate(Request $request): array
    {
        $v = new Validator($request->all());
        $data = [
            'name' => $v->text('name', 'o nome da meta', 2, 40),
            'description' => $v->text('description', 'a descrição', 0, 120, false),
            'targetAmount' => $v->money('targetAmount', 'o valor da meta'),
            'currentAmount' => $v->money('currentAmount', 'o valor guardado', true),
            'deadline' => $v->date('deadline', 'o prazo'),
            'color' => $v->color(),
        ];
        $v->validate();

        if ($data['currentAmount'] > $data['targetAmount']) {
            throw new HttpException(422, 'O valor guardado não pode ser maior que o valor da meta.', [
                'currentAmount' => 'O valor guardado não pode ser maior que o valor da meta.',
            ]);
        }
        return $data;
    }

    /** @return array<string, mixed> */
    private function findOrFail(int $userId, int $id): array
    {
        return Goal::find($userId, $id) ?? throw new HttpException(404, 'Meta não encontrada.');
    }
}
