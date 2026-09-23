<?php

declare(strict_types=1);

/**
 * Cria o banco de dados, as tabelas e a conta de demonstração.
 *
 * Uso (na raiz do projeto):
 *   php backend/database/setup.php            cria tudo (não apaga dados existentes)
 *   php backend/database/setup.php --reset    APAGA o banco inteiro e cria de novo
 *   php backend/database/setup.php --no-demo  não cria a conta de demonstração
 *
 * Conta de demonstração: demo@cortaai.com / Demo@123
 */

use App\Core\Database;
use App\Models\Category;
use App\Models\Goal;
use App\Models\Transaction;
use App\Models\User;

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('Execute este script pelo terminal: php backend/database/setup.php');
}

$config = require dirname(__DIR__) . '/src/bootstrap.php';
$db = $config['db'];
$reset = in_array('--reset', $argv, true);
$withDemo = !in_array('--no-demo', $argv, true);

function info(string $message): void
{
    echo "  • {$message}" . PHP_EOL;
}

echo PHP_EOL . "Corta Aí — configuração do banco de dados" . PHP_EOL;
echo str_repeat('-', 45) . PHP_EOL;

// 1) Conecta no MySQL (ainda sem escolher o banco)
try {
    $pdo = new PDO("mysql:host={$db['host']};port={$db['port']};charset=utf8mb4", $db['user'], $db['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
} catch (PDOException $e) {
    echo PHP_EOL . "ERRO: não foi possível conectar ao MySQL em {$db['host']}:{$db['port']} com o usuário \"{$db['user']}\"." . PHP_EOL;
    echo "Verifique se o MySQL está ligado (no XAMPP: botão Start do MySQL)." . PHP_EOL;
    echo "Detalhe: {$e->getMessage()}" . PHP_EOL . PHP_EOL;
    exit(1);
}
info("Conectado ao MySQL ({$db['host']}:{$db['port']})");

// 2) Cria o banco e as tabelas a partir do schema.sql
if ($reset) {
    $pdo->exec("DROP DATABASE IF EXISTS `{$db['name']}`");
    info("Banco \"{$db['name']}\" apagado (--reset)");
}
$schema = file_get_contents(__DIR__ . '/schema.sql');
if ($db['name'] !== 'corta_ai') {
    $schema = str_replace('corta_ai', $db['name'], $schema);
}
$pdo->exec($schema);
info("Banco \"{$db['name']}\" e tabelas prontos");

// 3) Conta de demonstração com 6 meses de movimentações e 3 metas
if (!$withDemo) {
    echo PHP_EOL . "Pronto! (sem conta de demonstração)" . PHP_EOL . PHP_EOL;
    exit(0);
}
if (User::findByEmail('demo@cortaai.com') !== null) {
    info('A conta de demonstração já existe (nada foi alterado)');
    echo PHP_EOL . "Pronto!" . PHP_EOL . PHP_EOL;
    exit(0);
}

Database::transaction(function (): void {
    $userId = User::create('Usuário Demonstração', 'demo@cortaai.com', '(47) 99999-0000', 'Demo@123');
    Category::createDefaults($userId);

    $categoryIds = [];
    foreach (Category::list($userId) as $category) {
        $categoryIds[$category['nome']] = (int) $category['id'];
    }

    mt_srand(42); // mesma "sorte" sempre: dados de exemplo parecidos a cada instalação
    $random = fn (int $min, int $max): int => mt_rand($min, $max);
    $today = new DateTimeImmutable('today');
    $count = 0;

    $add = function (DateTimeImmutable $month, int $day, string $type, string $description, string $category, int $amount, string $payment)
        use ($userId, $categoryIds, $today, &$count): void {
        $day = min($day, (int) $month->format('t'));
        $date = $month->setDate((int) $month->format('Y'), (int) $month->format('m'), $day);
        if ($date > $today) {
            return; // não cria lançamentos no futuro
        }
        Transaction::create($userId, [
            'type' => $type,
            'description' => $description,
            'amount' => $amount,
            'categoryId' => $categoryIds[$category],
            'date' => $date->format('Y-m-d'),
            'paymentMethod' => $payment,
            'notes' => '',
        ]);
        $count++;
    };

    for ($offset = -5; $offset <= 0; $offset++) {
        $month = $today->modify('first day of this month')->modify("{$offset} month");

        $add($month, 5, 'entrada', 'Salário', 'Salário', 350000, 'transferencia');
        if ($random(0, 9) > 3) {
            $add($month, 18, 'entrada', 'Projeto de site', 'Freelance', $random(40000, 130000), 'pix');
        }
        if ($random(0, 9) > 6) {
            $add($month, 25, 'entrada', 'Rendimento poupança', 'Investimentos', $random(2500, 6500), 'transferencia');
        }

        $add($month, 10, 'saida', 'Aluguel', 'Moradia', 110000, 'boleto');
        $add($month, 12, 'saida', 'Conta de luz', 'Contas', $random(14000, 22000), 'boleto');
        $add($month, 12, 'saida', 'Internet', 'Contas', 9990, 'debito');
        $add($month, 3, 'saida', 'Mercado do mês', 'Alimentação', $random(48000, 70000), 'debito');
        $add($month, 17, 'saida', 'Mercado', 'Alimentação', $random(12000, 27000), 'pix');
        $add($month, 8, 'saida', 'Combustível', 'Transporte', $random(18000, 27000), 'credito');
        $add($month, 21, 'saida', 'Uber', 'Transporte', $random(2500, 6500), 'credito');
        $add($month, 14, 'saida', 'Lanche com amigos', 'Lazer', $random(4500, 12500), 'pix');
        if ($random(0, 9) > 4) {
            $add($month, 22, 'saida', 'Cinema', 'Lazer', 6000, 'credito');
        }
        if ($random(0, 9) > 4) {
            $add($month, 15, 'saida', 'Farmácia', 'Saúde', $random(3500, 12500), 'debito');
        }
        $add($month, 7, 'saida', 'Curso online', 'Educação', 5990, 'credito');
        if ($random(0, 9) > 5) {
            $add($month, 27, 'saida', 'Roupa nova', 'Compras', $random(9000, 29000), 'credito');
        }
    }
    info("Conta de demonstração criada com {$count} movimentações");

    $goals = [
        ['Reserva de emergência', 'Guardar 6 meses de custos fixos.', 1000000, 345000, '+10 months', '#10b981'],
        ['Viagem para Florianópolis', 'Férias de verão com a família.', 250000, 182000, '+3 months', '#0ea5e9'],
        ['Notebook novo', 'Para os estudos e o TCC.', 400000, 400000, '+1 month', '#a855f7'],
    ];
    foreach ($goals as [$name, $description, $target, $current, $deadline, $color]) {
        Goal::create($userId, [
            'name' => $name,
            'description' => $description,
            'targetAmount' => $target,
            'currentAmount' => $current,
            'deadline' => $today->modify($deadline)->format('Y-m-d'),
            'color' => $color,
        ]);
    }
    info('3 metas de exemplo criadas');
});

echo PHP_EOL . "Pronto! Entre com demo@cortaai.com / Demo@123" . PHP_EOL . PHP_EOL;
