<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Database;
use App\Core\HttpException;
use App\Core\Request;
use App\Core\Response;
use App\Core\Validator;
use App\Models\Category;
use App\Models\Session;
use App\Models\User;

/** RF-01 (cadastro) e RF-02 (login). */
final class AuthController
{
    /** @param array{remember_days: int, default_hours: int} $sessionConfig */
    public function __construct(private readonly array $sessionConfig)
    {
    }

    /** POST /api/auth/register */
    public function register(Request $request): Response
    {
        $v = new Validator($request->all());
        $name = $v->name();
        $email = $v->email();
        $phone = $v->phone();
        $password = $v->password();
        $v->validate();

        if (User::emailInUse($email)) {
            throw new HttpException(409, 'Já existe uma conta cadastrada com este e-mail.', [
                'email' => 'Já existe uma conta cadastrada com este e-mail.',
            ]);
        }

        $userId = Database::transaction(function () use ($name, $email, $phone, $password): int {
            $id = User::create($name, $email, $phone, $password);
            Category::createDefaults($id);
            return $id;
        });

        $token = Session::create($userId, true, $this->sessionConfig);
        return Response::created([
            'token' => $token,
            'user' => User::toApi(User::findById($userId)),
        ]);
    }

    /** POST /api/auth/login */
    public function login(Request $request): Response
    {
        $v = new Validator($request->all());
        $email = $v->email();
        $password = $v->required('password', 'Informe sua senha.');
        $remember = $v->boolean('remember');
        $v->validate();

        $user = User::findByEmail($email);
        // Mensagem genérica: não revela se o e-mail existe (boa prática de segurança)
        if ($user === null || !password_verify($password, $user['senha_hash'])) {
            throw new HttpException(401, 'E-mail ou senha incorretos.');
        }

        $token = Session::create((int) $user['id'], $remember, $this->sessionConfig);
        return Response::json(['token' => $token, 'user' => User::toApi($user)]);
    }

    /** POST /api/auth/logout */
    public function logout(Request $request): Response
    {
        $token = $request->bearerToken();
        if ($token) {
            Session::delete($token);
        }
        return Response::noContent();
    }

    /** GET /api/auth/me — dados do usuário logado */
    public function me(Request $request): Response
    {
        return Response::json(User::toApi($request->user()));
    }

    /**
     * POST /api/auth/forgot-password
     * Simulação: num sistema em produção, aqui seria enviado um e-mail com link de redefinição.
     * A resposta é sempre a mesma para não revelar quais e-mails estão cadastrados.
     */
    public function forgotPassword(Request $request): Response
    {
        $v = new Validator($request->all());
        $v->email();
        $v->validate();
        return Response::json(['message' => 'Se o e-mail estiver cadastrado, você receberá as instruções.']);
    }
}
