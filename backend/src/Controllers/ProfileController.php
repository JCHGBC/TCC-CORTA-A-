<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\HttpException;
use App\Core\Request;
use App\Core\Response;
use App\Core\Validator;
use App\Models\Session;
use App\Models\User;

/** Dados do perfil, troca de senha e exclusão de conta. */
final class ProfileController
{
    /** PUT /api/profile */
    public function update(Request $request): Response
    {
        $userId = $request->userId();
        $v = new Validator($request->all());
        $name = $v->name();
        $email = $v->email();
        $phone = $v->phone();
        $v->validate();

        if (User::emailInUse($email, $userId)) {
            throw new HttpException(409, 'Este e-mail já está sendo usado por outra conta.', [
                'email' => 'Este e-mail já está sendo usado por outra conta.',
            ]);
        }

        User::update($userId, $name, $email, $phone);
        return Response::json(User::toApi(User::findById($userId)));
    }

    /** PUT /api/profile/password */
    public function changePassword(Request $request): Response
    {
        $user = $request->user();
        $v = new Validator($request->all());
        $current = $v->required('currentPassword', 'Informe sua senha atual.');
        $new = $v->password('newPassword');
        $v->validate();

        if (!password_verify($current, $user['senha_hash'])) {
            throw new HttpException(422, 'A senha atual está incorreta.', [
                'currentPassword' => 'A senha atual está incorreta.',
            ]);
        }
        if ($current === $new) {
            throw new HttpException(422, 'A nova senha deve ser diferente da atual.', [
                'newPassword' => 'A nova senha deve ser diferente da atual.',
            ]);
        }

        User::updatePassword((int) $user['id'], $new);
        // Por segurança, desconecta os outros dispositivos
        Session::deleteOthers((int) $user['id'], (string) $request->bearerToken());
        return Response::noContent();
    }

    /** DELETE /api/profile — exclui a conta e todos os dados */
    public function destroy(Request $request): Response
    {
        User::delete($request->userId());
        return Response::noContent();
    }
}
