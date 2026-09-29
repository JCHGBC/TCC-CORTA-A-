# ✂️ Corta Aí — Controle financeiro pessoal

Sistema web para controle financeiro pessoal que substitui as planilhas eletrônicas por uma
interface mais intuitiva e visual. O usuário anota manualmente suas entradas e saídas, acompanha
o saldo, consulta relatórios e acompanha metas financeiras, **sem integração bancária**.

> Trabalho de Conclusão de Curso — Técnico em Desenvolvimento de Sistemas (CEDUP)
>
> **Equipe:** Julio Cesar Heinzen · Gabriel Balin Cabral · Enzo Guilherme Janz Frainer · Vinicius dos Reis

| Parte              | Tecnologia                                          | Pasta / arquivo    |
| ------------------ | --------------------------------------------------- | ------------------ |
| Front-end          | Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 | `src/`             |
| Back-end / login   | Firebase Authentication (e-mail e senha)            | `src/services/`    |
| Banco de dados     | Cloud Firestore (NoSQL)                             | `firestore.rules`  |
| Hospedagem         | Vercel                                              |                    |

---

## 🚀 Como rodar

Pré-requisitos: **Node.js 20+** com **npm 10+**. Não precisa instalar banco de dados: ele fica
no Firebase (na nuvem).

```powershell
npm install      # só na primeira vez
npm run dev
```

Abra **http://localhost:3000**.

**Conta de demonstração** (é criada sozinha, com 6 meses de dados, no primeiro login):

| E-mail             | Senha      |
| ------------------ | ---------- |
| `demo@cortaai.com` | `Demo@123` |

Na tela de login há o botão **“Usar conta de demonstração”**, que preenche os campos.

### Configuração do Firebase (só uma vez)

O projeto já está ligado ao Firebase `corta-ai-bd1c1` (configuração em `src/lib/firebase.ts`).
No [Console do Firebase](https://console.firebase.google.com):

1. **Authentication → Método de login →** ativar **E-mail/senha**.
2. **Firestore Database →** criar o banco.
3. **Firestore Database → Regras →** colar o conteúdo do arquivo [`firestore.rules`](firestore.rules)
   e clicar em **Publicar**. Sem isso o Firestore bloqueia tudo e o site não consegue salvar.

Para usar **outro projeto** do Firebase, crie um arquivo `.env.local` com as variáveis
`NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`,
`NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` e
`NEXT_PUBLIC_FIREBASE_APP_ID` (as mesmas também podem ser cadastradas na Vercel).

### Problemas comuns

**“Você não tem permissão para acessar estes dados.”** As regras do Firestore não foram
publicadas (passo 3 da configuração do Firebase).

**“O login por e-mail e senha não está ativado no Firebase.”** Falta o passo 1.

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
| Login / autenticação          | [Firebase Authentication](https://firebase.google.com/docs/auth)    |
| Banco de dados                | [Cloud Firestore](https://firebase.google.com/docs/firestore) (NoSQL) |
| Hospedagem                    | [Vercel](https://vercel.com)                                        |

---

## 🗂️ Organização das pastas (arquitetura)

```
├── src/                          # código do site (Next.js)
│   ├── app/                      #   ROTAS (App Router) — só a "casca" das páginas
│   │   ├── (auth)/               #     /login, /cadastro, /recuperar-senha
│   │   ├── (app)/                #     área logada: /dashboard, /entradas, /saidas, /historico,
│   │   │                         #     /metas, /relatorios, /categorias, /perfil
│   │   ├── page.tsx              #     landing page (/)
│   │   └── not-found.tsx, error.tsx, layout.tsx, providers.tsx
│   ├── components/               #   componentes reutilizáveis (ui/, layout/, shared/)
│   ├── features/                 #   telas por funcionalidade (auth, dashboard, transactions,
│   │                             #   goals, categories, reports, profile, landing)
│   ├── services/                 #   ÚNICA parte que conversa com o Firebase (*.service.ts)
│   ├── hooks/                    #   useAsyncData (carregando/erro/sucesso), useDebouncedValue
│   ├── lib/                      #   firebase.ts, máscaras, formatadores, validações, cálculos
│   ├── config/                   #   constantes e itens do menu
│   └── types/                    #   tipos TypeScript do domínio
│
├── docs/                         # backlog, casos de uso, banco de dados
├── firestore.rules               # regras de segurança do banco
└── firebase.json                 # configuração do Firebase (regras e emulador)
```

### Como as partes conversam

```
Navegador (Next.js) ──► services/*.service.ts ──► Firebase Authentication (login)
                                              └─► Cloud Firestore (dados)
```

- As **telas nunca acessam os dados diretamente**: sempre chamam um *service* (`src/services`).
- **Login:** feito pelo Firebase Authentication, que guarda as senhas com segurança.
- **Segurança (RNF-02):** as regras do Firestore (`firestore.rules`) só deixam cada usuário ler e
  gravar os próprios dados. Estrutura do banco em [`docs/banco-de-dados.md`](docs/banco-de-dados.md).
- Valores em dinheiro são guardados em **centavos (números inteiros)** (ex.: `R$ 12,34` = `1234`).
- Depois de qualquer alteração, o front dispara um evento e as telas abertas recarregam os dados
  na hora (**RNF-06**).

---

## ✅ Requisitos atendidos

### Requisitos funcionais

| Código | Requisito            | Tela                                                   | Firebase                         |
| ------ | -------------------- | ------------------------------------------------------ | -------------------------------- |
| RF-01  | Cadastrar cliente    | `/cadastro`                                            | Authentication + `usuarios`      |
| RF-02  | Login do cliente     | `/login`                                               | Authentication                   |
| RF-03  | Registro de entrada  | `/entradas` + botão “Nova movimentação”                | `movimentacoes`                  |
| RF-04  | Registro de saída    | `/saidas` + botão “Nova movimentação”                  | `movimentacoes`                  |
| RF-05  | Definição de metas   | `/metas` — criar, editar, guardar/retirar valor        | `metas`                          |

Extras: painel com resumo, histórico com filtros, relatórios com gráficos, categorias
personalizáveis, exportação CSV, perfil (editar dados, trocar senha, excluir conta) e
recuperação de senha (envia e-mail pelo Firebase).

### Requisitos não funcionais

| Código | Requisito                   | Como foi atendido                                                                        |
| ------ | --------------------------- | ---------------------------------------------------------------------------------------- |
| RNF-01 | Usabilidade                 | Formulários curtos, máscaras, mensagens claras, botão flutuante no celular               |
| RNF-02 | Segurança                   | Login pelo Firebase Authentication, regras do Firestore que só liberam os dados do próprio usuário, validação dos campos nas regras |
| RNF-03 | Compatibilidade             | Tailwind + recursos padrão da web; layout responsivo                                     |
| RNF-04 | Escalabilidade              | Camadas separadas (telas → services → Firebase), componentes reutilizáveis; Firebase e Vercel escalam sozinhos |
| RNF-05 | Consistência visual         | Cores da marca centralizadas em `globals.css` e componentes de UI únicos                 |
| RNF-06 | Atualização das informações | Evento `corta-ai:data-changed` recarrega as consultas logo após cada alteração           |

### Checklist do front-end

- [x] Aplicação Next.js · [x] Organização das pastas · [x] Tailwind CSS · [x] Layout responsivo
- [x] Navegação entre telas · [x] Componentização · [x] Ícones · [x] Formulários
- [x] Máscaras de entrada (moeda `R$ 1.234,56`, telefone `(47) 99999-8888`)
- [x] Validações de campos (zod no front **e** regras do Firestore)
- [x] Mensagens de feedback / Toast (sucesso, erro, aviso)
- [x] Estados visuais: **carregando** (skeletons/spinners), **vazio** (EmptyState), **erro** (ErrorState com “Tentar novamente”), **sucesso** (toasts e tela de confirmação)

---

## 📚 Documentação complementar

- [`docs/analise-de-negocio-e-planejamento.md`](docs/analise-de-negocio-e-planejamento.md) — análise de negócio, backlog do produto, matriz MoSCoW, sprints e story points
- [`docs/casos-de-uso.md`](docs/casos-de-uso.md) — casos de uso
- [`docs/banco-de-dados.md`](docs/banco-de-dados.md) — estrutura do banco no Firestore
