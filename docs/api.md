# API — Corta Aí

API REST em PHP. Endereço padrão: `http://127.0.0.1:8000/api` (pelo front-end: `/api`).

- Envio e resposta em **JSON**.
- Rotas marcadas com 🔒 exigem o cabeçalho `Authorization: Bearer <token>` (recebido no login/cadastro).
- Valores em dinheiro em **centavos** (inteiro). Datas no formato `AAAA-MM-DD`.
- Em caso de erro a resposta é `{ "error": "mensagem", "fields": { "campo": "mensagem" } }`.

| Código | Significado                                         |
| ------ | --------------------------------------------------- |
| 200    | OK                                                  |
| 201    | Criado                                              |
| 204    | OK, sem conteúdo (ex.: exclusão)                    |
| 401    | Não logado / sessão expirada / senha incorreta      |
| 404    | Registro não encontrado (ou é de outro usuário)     |
| 409    | Conflito (e-mail já cadastrado, categoria em uso…)  |
| 422    | Dados inválidos (ver `fields`)                      |
| 503    | Banco de dados fora do ar                           |

---

## Autenticação

| Método | Rota                         | Corpo                                              | Resposta              |
| ------ | ---------------------------- | -------------------------------------------------- | --------------------- |
| POST   | `/auth/register`             | `name, email, phone, password`                     | 201 `{ token, user }` |
| POST   | `/auth/login`                | `email, password, remember`                        | 200 `{ token, user }` |
| POST   | `/auth/forgot-password`      | `email`                                            | 200 (simulado)        |
| POST   | `/auth/logout` 🔒            | —                                                  | 204                   |
| GET    | `/auth/me` 🔒                | —                                                  | 200 `user`            |

Exemplo — login:

```http
POST /api/auth/login
Content-Type: application/json

{ "email": "demo@cortaai.com", "password": "Demo@123", "remember": true }
```

```json
{
  "token": "3f9c…",
  "user": { "id": "1", "name": "Usuário Demonstração", "email": "demo@cortaai.com", "phone": "(47) 99999-0000", "createdAt": "2026-09-23T16:16:47-03:00" }
}
```

## Perfil 🔒

| Método | Rota                 | Corpo                                  | Resposta   |
| ------ | -------------------- | -------------------------------------- | ---------- |
| PUT    | `/profile`           | `name, email, phone`                   | 200 `user` |
| PUT    | `/profile/password`  | `currentPassword, newPassword`         | 204        |
| DELETE | `/profile`           | — (exclui a conta e todos os dados)    | 204        |

## Categorias 🔒

| Método | Rota                    | Corpo / parâmetros            | Resposta                     |
| ------ | ----------------------- | ----------------------------- | ---------------------------- |
| GET    | `/categories?type=`     | `type` = `entrada` \| `saida` (opcional) | 200 lista          |
| GET    | `/categories/usage`     | —                             | 200 `{ "idCategoria": qtd }` |
| POST   | `/categories`           | `name, type, color`           | 201 categoria                |
| PUT    | `/categories/{id}`      | `name, type, color`           | 200 categoria                |
| DELETE | `/categories/{id}`      | — (409 se tiver movimentações) | 204                         |

## Movimentações (entradas e saídas) 🔒

| Método | Rota                    | Corpo / parâmetros                                                        | Resposta           |
| ------ | ----------------------- | ------------------------------------------------------------------------- | ------------------ |
| GET    | `/transactions`         | filtros opcionais: `type`, `month` (AAAA-MM), `categoryId`, `search`      | 200 lista          |
| POST   | `/transactions`         | `type, description, amount, categoryId, date, paymentMethod, notes`       | 201 movimentação   |
| PUT    | `/transactions/{id}`    | mesmo corpo do POST                                                       | 200 movimentação   |
| DELETE | `/transactions/{id}`    | —                                                                         | 204                |

`paymentMethod`: `dinheiro`, `pix`, `debito`, `credito`, `boleto`, `transferencia`.

Exemplo — registrar uma saída:

```json
{
  "type": "saida",
  "description": "Mercado",
  "amount": 8990,
  "categoryId": "6",
  "date": "2026-09-23",
  "paymentMethod": "pix",
  "notes": ""
}
```

## Metas 🔒

| Método | Rota                  | Corpo                                                                 | Resposta   |
| ------ | --------------------- | --------------------------------------------------------------------- | ---------- |
| GET    | `/goals`              | —                                                                     | 200 lista  |
| POST   | `/goals`              | `name, description, targetAmount, currentAmount, deadline, color`     | 201 meta   |
| PUT    | `/goals/{id}`         | mesmo corpo do POST                                                   | 200 meta   |
| POST   | `/goals/{id}/move`    | `operation` (`deposit` \| `withdraw`), `amount`                       | 200 meta   |
| DELETE | `/goals/{id}`         | —                                                                     | 204        |

## Outros

| Método | Rota       | Resposta               |
| ------ | ---------- | ---------------------- |
| GET    | `/health`  | `{ "status": "ok" }`   |
