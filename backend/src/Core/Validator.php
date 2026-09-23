<?php

declare(strict_types=1);

namespace App\Core;

/**
 * Validação dos dados recebidos (as mesmas regras do front-end).
 * Nunca confie só na validação do navegador: ela pode ser burlada.
 *
 * Uso:
 *   $v = new Validator($request->all());
 *   $nome = $v->text('name', 'o nome', 3, 80);
 *   $v->validate(); // lança erro 422 se algo estiver inválido
 */
final class Validator
{
    /** @var array<string, string> */
    private array $errors = [];

    /** @param array<string, mixed> $data */
    public function __construct(private readonly array $data)
    {
    }

    private function raw(string $field): mixed
    {
        return $this->data[$field] ?? null;
    }

    private function fail(string $field, string $message): void
    {
        $this->errors[$field] ??= $message;
    }

    /** Texto obrigatório (ou opcional) com tamanho mínimo e máximo. */
    public function text(string $field, string $label, int $min, int $max, bool $required = true): string
    {
        $value = $this->raw($field);
        $value = is_string($value) ? trim($value) : '';

        if ($value === '') {
            if ($required) {
                $this->fail($field, "Informe {$label}.");
            }
            return '';
        }
        $length = mb_strlen($value);
        $subject = mb_strtoupper(mb_substr($label, 0, 1)) . mb_substr($label, 1);
        if ($length < $min) {
            $this->fail($field, "{$subject} deve ter pelo menos {$min} caracteres.");
        } elseif ($length > $max) {
            $this->fail($field, "{$subject} deve ter no máximo {$max} caracteres.");
        }
        return $value;
    }

    public function name(string $field = 'name'): string
    {
        $value = $this->text($field, 'o nome', 3, 80);
        if ($value !== '' && !preg_match("/^[\p{L}\s'.-]+$/u", $value)) {
            $this->fail($field, 'O nome deve conter apenas letras.');
        }
        return $value;
    }

    public function email(string $field = 'email'): string
    {
        $value = mb_strtolower($this->text($field, 'seu e-mail', 1, 120));
        if ($value !== '' && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
            $this->fail($field, 'Digite um e-mail válido. Ex.: nome@email.com');
        }
        return $value;
    }

    /** Telefone com DDD: (47) 99999-8888 ou (47) 3333-4444 */
    public function phone(string $field = 'phone'): string
    {
        $value = $this->text($field, 'o telefone', 1, 20);
        $digits = preg_replace('/\D/', '', $value) ?? '';
        if ($value !== '' && !in_array(strlen($digits), [10, 11], true)) {
            $this->fail($field, 'Informe um telefone válido com DDD. Ex.: (47) 99999-8888');
        }
        // Salva sempre no mesmo formato
        if (strlen($digits) === 11) {
            return sprintf('(%s) %s-%s', substr($digits, 0, 2), substr($digits, 2, 5), substr($digits, 7));
        }
        if (strlen($digits) === 10) {
            return sprintf('(%s) %s-%s', substr($digits, 0, 2), substr($digits, 2, 4), substr($digits, 6));
        }
        return $value;
    }

    /** Senha forte: 8+ caracteres, com letra e número. */
    public function password(string $field = 'password'): string
    {
        $value = $this->raw($field);
        $value = is_string($value) ? $value : '';
        if ($value === '') {
            $this->fail($field, 'Informe a senha.');
        } elseif (strlen($value) < 8) {
            $this->fail($field, 'A senha deve ter pelo menos 8 caracteres.');
        } elseif (strlen($value) > 64) {
            $this->fail($field, 'A senha deve ter no máximo 64 caracteres.');
        } elseif (!preg_match('/[A-Za-z]/', $value)) {
            $this->fail($field, 'A senha deve conter pelo menos uma letra.');
        } elseif (!preg_match('/\d/', $value)) {
            $this->fail($field, 'A senha deve conter pelo menos um número.');
        }
        return $value;
    }

    /** Campo obrigatório qualquer (ex.: senha atual no login). */
    public function required(string $field, string $message): string
    {
        $value = $this->raw($field);
        if (!is_string($value) || $value === '') {
            $this->fail($field, $message);
            return '';
        }
        return $value;
    }

    /** Valor em centavos (número inteiro). */
    public function money(string $field, string $label, bool $allowZero = false): int
    {
        $value = $this->raw($field);
        if ($value === null || $value === '') {
            if (!$allowZero) {
                $this->fail($field, "Informe {$label}.");
            }
            return 0;
        }
        if (!is_int($value) && !(is_string($value) && ctype_digit($value))) {
            $this->fail($field, 'Valor inválido.');
            return 0;
        }
        $cents = (int) $value;
        if ($cents < 0 || (!$allowZero && $cents === 0)) {
            $this->fail($field, 'O valor deve ser maior que zero.');
        } elseif ($cents > 9_999_999_999) {
            $this->fail($field, 'Valor muito alto.');
        }
        return $cents;
    }

    /** Data no formato AAAA-MM-DD */
    public function date(string $field, string $label = 'a data'): string
    {
        $value = $this->raw($field);
        $value = is_string($value) ? trim($value) : '';
        $date = \DateTime::createFromFormat('!Y-m-d', $value);
        if ($value === '') {
            $this->fail($field, "Informe {$label}.");
        } elseif (!$date || $date->format('Y-m-d') !== $value) {
            $this->fail($field, 'Data inválida.');
        }
        return $value;
    }

    /** @param list<string> $allowed */
    public function oneOf(string $field, string $message, array $allowed): string
    {
        $value = $this->raw($field);
        if (!is_string($value) || !in_array($value, $allowed, true)) {
            $this->fail($field, $message);
            return $allowed[0];
        }
        return $value;
    }

    /** Cor no formato #RRGGBB */
    public function color(string $field = 'color'): string
    {
        $value = $this->raw($field);
        if (!is_string($value) || !preg_match('/^#[0-9a-fA-F]{6}$/', $value)) {
            $this->fail($field, 'Escolha uma cor válida.');
            return '#10b981';
        }
        return strtolower($value);
    }

    public function id(string $field, string $message): int
    {
        $value = $this->raw($field);
        if (!is_numeric($value) || (int) $value <= 0) {
            $this->fail($field, $message);
            return 0;
        }
        return (int) $value;
    }

    public function boolean(string $field): bool
    {
        return filter_var($this->raw($field), FILTER_VALIDATE_BOOLEAN);
    }

    /** Lança erro 422 com a primeira mensagem e a lista de erros por campo. */
    public function validate(): void
    {
        if ($this->errors) {
            throw new HttpException(422, reset($this->errors), $this->errors);
        }
    }
}
