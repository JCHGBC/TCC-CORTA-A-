# ✂️ Corta Aí — Controle financeiro pessoal

Sistema web para controle financeiro pessoal que substitui as planilhas eletrônicas por uma
interface mais intuitiva e visual. O usuário anota manualmente suas entradas e saídas, acompanha
o saldo, consulta relatórios e acompanha metas financeiras, **sem integração bancária**.

> Trabalho de Conclusão de Curso — Técnico em Desenvolvimento de Sistemas (CEDUP)
>
> **Equipe:** Julio Cesar Heinzen · Gabriel Balin Cabral · Enzo Guilherme Janz Frainer · Vinicius dos Reis

| Parte       | Tecnologia                                              | Pasta       |
| ----------- | ------------------------------------------------------- | ----------- |
| Front-end   | Next.js 16 + React 19 + TypeScript + Tailwind CSS 4     | `src/`      |
| Back-end    | PHP 8.1+ (API REST, sem framework)                      | `backend/`  |
| Banco       | MySQL 8 / MariaDB 10.4+ (o do XAMPP funciona)           | `backend/database/` |

---

## 🚀 Como rodar (Windows + XAMPP)

Pré-requisitos: **Node.js 20+** com **npm 10+**, e o **XAMPP** (traz PHP e MySQL).

### 1. Ligar o MySQL
Abra o **XAMPP Control Panel** e clique em **Start** no **MySQL**. (O Apache não é necessário.)

### 2. Criar o banco de dados (só na primeira vez)
Na pasta do projeto, no PowerShell:

```powershell
C:\xampp\php\php.exe backend\database\setup.php
```

Isso cria o banco `corta_ai`, as tabelas e a **conta de demonstração** com 6 meses de dados.
Alternativa: no **phpMyAdmin** (http://localhost/phpmyadmin) → aba **Importar** → arquivo
`backend/database/schema.sql` (cria só as tabelas, sem a conta demo).

### 3. Ligar a API (PHP) — deixe este terminal aberto

```powershell
C:\xampp\php\php.exe -S 127.0.0.1:8000 -t backend/public backend/public/index.php
```

Teste no navegador: http://127.0.0.1:8000/api/health → deve aparecer `{"status":"ok"}`.

### 4. Ligar o site — em outro terminal

```powershell
npm install      # só na primeira vez
npm run dev
```

Abra **http://localhost:3000**.

> 💡 Se você colocar `C:\xampp\php` no **PATH** do Windows, pode usar os atalhos
> `npm run db:setup` (passo 2) e `npm run api` (passo 3).

**Conta de demonstração:**

| E-mail             | Senha      |
| ------------------ | ---------- |
| `demo@cortaai.com` | `Demo@123` |

Na tela de login há o botão **“Usar conta de demonstração”**, que preenche os campos.

### Configuração do banco
Por padrão a API usa o MySQL do XAMPP: `127.0.0.1:3306`, usuário `root`, **sem senha**, banco
`corta_ai`. Se o seu MySQL tiver senha, crie o arquivo `backend/config/config.local.php`
(ele não vai para o GitHub):

```php
<?php return ['db' => ['user' => 'root', 'pass' => 'sua-senha']];
```

Para **apagar tudo e recriar** o banco com os dados de exemplo: `php backend/database/setup.php --reset`.

### Problemas comuns

**“Não foi possível conectar ao servidor. Verifique se a API (PHP) e o MySQL estão ligados.”**
O terminal da API (passo 3) está fechado, ou o MySQL não está ligado no XAMPP.

**“Não foi possível conectar ao banco de dados…”** O MySQL está desligado, o banco não foi
criado (passo 2) ou a senha está errada (veja *Configuração do banco*).

**`Cannot find native binding` / `Cannot find module '@tailwindcss/oxide-win32-x64-msvc'`**
Quase sempre é um **npm antigo** (ex.: npm 9 junto com Node 24), que tem um bug e não baixa os
arquivos do Tailwind específicos do Windows. Confira com `npm -v`. Pare o `npm run dev`
(Ctrl + C) e, no PowerShell:

```powershell
Remove-Item -Recurse -Force node_modules, .next
npx -y npm@11 install      # instala usando o npm 11, sem precisar de administrador
npm run dev
```

Para corrigir de vez no computador: `npm install -g npm@latest` (pode pedir administrador).

---

## 🧰 Tecnologias

| Item                          | Ferramenta                                                          |
| ----------------------------- | ------------------------------------------------------------------- |
| Framework front-end           | [Next.js 16](https://nextjs.org) (App Router) + React 19            |
| Linguagem front-end           | TypeScript                                                          |
| Estilo / layout responsivo    | [Tailwind CSS 4](https://tailwindcss.com)                           |
| Ícones                        | [lucide-react](https://lucide.dev)                                  |
| Formulários                   | [react-hook-form](https://react-hook-form.com)                      |
| Validações (front)            | [zod](https://zod.dev)                                              |
| Mensagens de feedback (toast) | [sonner](https://sonner.emilkowal.ski)                              |
| Gráficos                      | [Recharts](https://recharts.org)                                    |
| Máscaras de entrada           | Implementação própria em `src/lib/masks.ts` (moeda, telefone)       |
| API                           | PHP 8.1+ puro, PDO (prepared statements), `password_hash` (bcrypt)  |
| Banco de dados                | MySQL / MariaDB                                                     |

---

## 🗂️ Organização das pastas (arquitetura)

```
├── backend/                      # API REST em PHP
│   ├── config/config.php         #   configurações (banco, sessão, CORS)
│   ├── database/
│   │   ├── schema.sql            #   script de criação das tabelas
│   │   └── setup.php             #   cria o banco + conta de demonstração
│   ├── public/
│   │   ├── index.php             #   ponto de entrada (toda requisição passa aqui)
│   │   └── .htaccess             #   para rodar no Apache, se preferir
│   └── src/
│       ├── Core/                 #   Router, Request, Response, Database (PDO), Validator
│       ├── Models/               #   consultas SQL: User, Session, Category, Transaction, Goal
│       ├── Controllers/          #   regras de cada endpoint (valida → chama o model → responde)
│       ├── routes.php            #   lista de todas as rotas da API
│       └── bootstrap.php         #   autoload das classes e configurações
│
├── src/                          # FRONT-END (Next.js)
│   ├── app/                      #   ROTAS (App Router) — só a "casca" das páginas
│   │   ├── (auth)/               #     /login, /cadastro, /recuperar-senha
│   │   ├── (app)/                #     área logada: /dashboard, /entradas, /saidas, /historico,
│   │   │                         #     /metas, /relatorios, /categorias, /perfil
│   │   ├── page.tsx              #     landing page (/)
│   │   └── not-found.tsx, error.tsx, layout.tsx, providers.tsx
│   ├── components/               #   componentes reutilizáveis (ui/, layout/, shared/)
│   ├── features/                 #   telas por funcionalidade (auth, dashboard, transactions,
│   │                             #   goals, categories, reports, profile, landing)
│   ├── services/                 #   ÚNICA parte que conversa com a API (http.ts + *.service.ts)
│   ├── hooks/                    #   useAsyncData (carregando/erro/sucesso), useDebouncedValue
│   ├── lib/                      #   máscaras, formatadores, validações, cálculos financeiros
│   ├── config/                   #   constantes e itens do menu
│   └── types/                    #   tipos TypeScript do domínio
│
└── docs/                         # backlog, casos de uso, banco de dados, API
```

### Como as partes conversam

```
Navegador ──► Next.js (localhost:3000) ──/api/*──► PHP (127.0.0.1:8000) ──► MySQL
   tela          services/http.ts           rewrite          Controller → Model      corta_ai
```

- As **telas nunca acessam os dados diretamente**: sempre chamam um *service* (`src/services`).
- O Next.js repassa tudo que começa com `/api` para o PHP (`rewrites` em `next.config.ts`).
  Para usar outro endereço de API, defina a variável de ambiente `API_URL`.
- **Login por token:** ao entrar, a API gera um token aleatório; o navegador o envia no
  cabeçalho `Authorization: Bearer ...` em cada requisição. No banco fica só o hash do token.
- Toda consulta da API filtra pelo usuário do token (**RNF-02**): um usuário nunca vê nem altera
  os dados de outro.
- Valores em dinheiro são guardados em **centavos (números inteiros)** (ex.: `R$ 12,34` = `1234`).
- Depois de qualquer alteração, o front dispara um evento e as telas abertas recarregam os dados
  na hora (**RNF-06**).

---

## ✅ Requisitos atendidos

### Requisitos funcionais

| Código | Requisito            | Tela                                                   | API                          |
| ------ | -------------------- | ------------------------------------------------------ | ---------------------------- |
| RF-01  | Cadastrar cliente    | `/cadastro`                                            | `POST /api/auth/register`    |
| RF-02  | Login do cliente     | `/login`                                               | `POST /api/auth/login`       |
| RF-03  | Registro de entrada  | `/entradas` + botão “Nova movimentação”                | `/api/transactions`          |
| RF-04  | Registro de saída    | `/saidas` + botão “Nova movimentação”                  | `/api/transactions`          |
| RF-05  | Definição de metas   | `/metas` — criar, editar, guardar/retirar valor        | `/api/goals`                 |

Extras: painel com resumo, histórico com filtros, relatórios com gráficos, categorias
personalizáveis, exportação CSV, perfil (editar dados, trocar senha, excluir conta) e
recuperação de senha (simulada — não envia e-mail).

### Requisitos não funcionais

| Código | Requisito                   | Como foi atendido                                                                        |
| ------ | --------------------------- | ---------------------------------------------------------------------------------------- |
| RNF-01 | Usabilidade                 | Formulários curtos, máscaras, mensagens claras, botão flutuante no celular               |
| RNF-02 | Segurança                   | Login com senha em bcrypt, token por sessão, toda consulta filtrada pelo usuário, SQL com prepared statements, validação também no servidor |
| RNF-03 | Compatibilidade             | Tailwind + recursos padrão da web; layout responsivo                                     |
| RNF-04 | Escalabilidade              | Camadas separadas (telas → services → API → models → banco), componentes reutilizáveis   |
| RNF-05 | Consistência visual         | Cores da marca centralizadas em `globals.css` e componentes de UI únicos                 |
| RNF-06 | Atualização das informações | Evento `corta-ai:data-changed` recarrega as consultas logo após cada alteração           |

### Checklist do front-end

- [x] Aplicação Next.js · [x] Organização das pastas · [x] Tailwind CSS · [x] Layout responsivo
- [x] Navegação entre telas · [x] Componentização · [x] Ícones · [x] Formulários
- [x] Máscaras de entrada (moeda `R$ 1.234,56`, telefone `(47) 99999-8888`)
- [x] Validações de campos (zod no front **e** validação no PHP)
- [x] Mensagens de feedback / Toast (sucesso, erro, aviso)
- [x] Estados visuais: **carregando** (skeletons/spinners), **vazio** (EmptyState), **erro** (ErrorState com “Tentar novamente”), **sucesso** (toasts e tela de confirmação)

---

## 📚 Documentação complementar

- [`docs/backlog.md`](docs/backlog.md) — backlog do produto (histórias de usuário) e telas
- [`docs/casos-de-uso.md`](docs/casos-de-uso.md) — casos de uso
- [`docs/banco-de-dados.md`](docs/banco-de-dados.md) — modelo do banco de dados (DER + tabelas)
- [`docs/api.md`](docs/api.md) — todos os endpoints da API
