# ✂️ Corta Aí — Controle financeiro pessoal

Sistema web para controle financeiro pessoal que substitui as planilhas eletrônicas por uma
interface mais intuitiva e visual. O usuário anota manualmente suas entradas e saídas, acompanha
o saldo, consulta relatórios e acompanha metas financeiras, **sem integração bancária**.

> Trabalho de Conclusão de Curso — Técnico em Desenvolvimento de Sistemas (CEDUP)
>
> **Equipe:** Julio Cesar Heinzen · Gabriel Balin Cabral · Enzo Guilherme Janz Frainer · Vinicius dos Reis

---

## 🚀 Como rodar

Pré-requisitos: **Node.js 20+** e npm.

```bash
npm install      # instala as dependências
npm run dev      # ambiente de desenvolvimento em http://localhost:3000
npm run build    # gera a versão de produção
npm start        # roda a versão de produção
npm run lint     # verifica o padrão do código
```

**Conta de demonstração** (já vem com 6 meses de dados e metas):

| E-mail             | Senha      |
| ------------------ | ---------- |
| `demo@cortaai.com` | `Demo@123` |

Na tela de login há o botão **“Usar conta de demonstração”**, que preenche os campos.

---

## 🧰 Tecnologias

| Item                         | Ferramenta                                                          |
| ---------------------------- | ------------------------------------------------------------------- |
| Framework                    | [Next.js 16](https://nextjs.org) (App Router) + React 19            |
| Linguagem                    | TypeScript                                                          |
| Estilo / layout responsivo   | [Tailwind CSS 4](https://tailwindcss.com)                           |
| Ícones                       | [lucide-react](https://lucide.dev)                                  |
| Formulários                  | [react-hook-form](https://react-hook-form.com)                      |
| Validações                   | [zod](https://zod.dev)                                              |
| Mensagens de feedback (toast)| [sonner](https://sonner.emilkowal.ski)                              |
| Gráficos                     | [Recharts](https://recharts.org)                                    |
| Máscaras de entrada          | Implementação própria em `src/lib/masks.ts` (moeda, telefone, data) |

---

## 🗂️ Organização das pastas (arquitetura)

```
src/
├── app/                      # ROTAS (Next.js App Router) — só "casca" das páginas
│   ├── (auth)/               # grupo de rotas públicas de autenticação
│   │   ├── login/            #   /login
│   │   ├── cadastro/         #   /cadastro
│   │   └── recuperar-senha/  #   /recuperar-senha
│   ├── (app)/                # grupo de rotas protegidas (exige login)
│   │   ├── dashboard/        #   /dashboard  — painel
│   │   ├── entradas/         #   /entradas   — RF-03
│   │   ├── saidas/           #   /saidas     — RF-04
│   │   ├── historico/        #   /historico
│   │   ├── metas/            #   /metas      — RF-05
│   │   ├── relatorios/       #   /relatorios
│   │   ├── categorias/       #   /categorias
│   │   └── perfil/           #   /perfil
│   ├── page.tsx              # landing page (/)
│   ├── not-found.tsx         # página 404
│   ├── error.tsx             # tela de erro inesperado
│   ├── layout.tsx            # layout raiz (fonte, metadados)
│   └── providers.tsx         # provedores globais (sessão + toasts)
│
├── components/               # COMPONENTES REUTILIZÁVEIS
│   ├── ui/                   # Button, Input, Select, Modal, Card, feedback (Spinner, Skeleton,
│   │                         # EmptyState, ErrorState), ConfirmDialog, ColorPicker...
│   ├── layout/               # AppShell (menu lateral, barra superior, menu mobile)
│   └── shared/               # Logo, PageHeader, StatCard, MonthSelector
│
├── features/                 # MÓDULOS POR FUNCIONALIDADE (telas + componentes específicos)
│   ├── auth/                 # login, cadastro, recuperar senha, contexto de sessão, guards
│   ├── dashboard/            # painel
│   ├── transactions/         # entradas, saídas, histórico, formulário de movimentação
│   ├── goals/                # metas
│   ├── categories/           # categorias (origem dos valores)
│   ├── reports/              # relatórios e gráficos
│   ├── profile/              # perfil do usuário
│   └── landing/              # página inicial pública
│
├── services/                 # CAMADA DE DADOS (única parte que acessa os dados)
├── hooks/                    # hooks genéricos (useAsyncData, useDebouncedValue)
├── lib/                      # utilitários: máscaras, formatadores, validações, cálculos
├── config/                   # constantes e itens do menu
└── types/                    # tipos TypeScript do domínio (User, Transaction, Goal...)
```

### Fluxo de dados

```
Tela (features/*)  →  hook (useAsyncData)  →  service (services/*)  →  armazenamento
```

- As **telas nunca acessam os dados diretamente**: sempre chamam um *service*.
- Hoje os services salvam no `localStorage` do navegador (simulando a API, inclusive com
  atraso de rede para mostrar os estados de carregamento). Quando o back-end ficar pronto,
  **basta trocar a implementação dos services por chamadas `fetch` para a API** — nenhuma tela
  precisa mudar (RNF-04 — Escalabilidade).
- Valores em dinheiro são guardados em **centavos (números inteiros)** para evitar erros de
  arredondamento (ex.: `R$ 12,34` = `1234`).
- Sempre que um dado muda, o sistema dispara um evento e as consultas abertas são refeitas na
  hora (RNF-06 — Atualização das informações).

---

## ✅ Requisitos atendidos

### Requisitos funcionais

| Código | Requisito            | Onde está                                              |
| ------ | -------------------- | ------------------------------------------------------ |
| RF-01  | Cadastrar cliente    | `/cadastro` — `features/auth/register-form.tsx`        |
| RF-02  | Login do cliente     | `/login` — `features/auth/login-form.tsx`              |
| RF-03  | Registro de entrada  | `/entradas` + botão “Nova movimentação”                |
| RF-04  | Registro de saída    | `/saidas` + botão “Nova movimentação”                  |
| RF-05  | Definição de metas   | `/metas` — criar, editar, guardar/retirar valor        |

Extras: painel com resumo, histórico com filtros, relatórios com gráficos, categorias
personalizáveis, exportação CSV, perfil (editar dados, trocar senha, excluir conta) e
recuperação de senha.

### Requisitos não funcionais

| Código | Requisito                  | Como foi atendido                                                                 |
| ------ | -------------------------- | --------------------------------------------------------------------------------- |
| RNF-01 | Usabilidade                | Formulários curtos, máscaras, mensagens claras, botão flutuante no celular        |
| RNF-02 | Segurança                  | Rotas protegidas por login; services filtram tudo pelo `userId` do usuário logado |
| RNF-03 | Compatibilidade            | Tailwind + recursos padrão da web; testado em Chromium, layout responsivo         |
| RNF-04 | Escalabilidade             | Arquitetura em camadas (telas → services), componentes reutilizáveis              |
| RNF-05 | Consistência visual        | Cores da marca centralizadas em `globals.css` e componentes de UI únicos          |
| RNF-06 | Atualização das informações| Evento `corta-ai:data-changed` recarrega as consultas imediatamente               |

### Checklist do front-end

- [x] Aplicação Next.js · [x] Organização das pastas · [x] Tailwind CSS · [x] Layout responsivo
- [x] Navegação entre telas · [x] Componentização · [x] Ícones · [x] Formulários
- [x] Máscaras de entrada (moeda `R$ 1.234,56`, telefone `(47) 99999-8888`)
- [x] Validações de campos (zod: obrigatórios, e-mail, telefone, senha forte, confirmação, valores > 0)
- [x] Mensagens de feedback / Toast (sucesso, erro, aviso)
- [x] Estados visuais: **carregando** (skeletons/spinners), **vazio** (EmptyState), **erro** (ErrorState com “Tentar novamente”), **sucesso** (toasts e tela de confirmação)

---

## 📚 Documentação complementar

- [`docs/backlog.md`](docs/backlog.md) — backlog do produto (histórias de usuário) e telas
- [`docs/casos-de-uso.md`](docs/casos-de-uso.md) — casos de uso
- [`docs/banco-de-dados.md`](docs/banco-de-dados.md) — modelo do banco de dados (DER + SQL)
