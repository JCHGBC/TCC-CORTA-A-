# Backlog do produto — Corta Aí

Prioridade: **Alta** = obrigatório para a entrega · **Média** = importante · **Baixa** = desejável.

| ID    | Como...  | Quero...                                                  | Para...                                        | Requisito | Prioridade | Tela             | Status |
| ----- | -------- | --------------------------------------------------------- | ---------------------------------------------- | --------- | ---------- | ---------------- | ------ |
| US-01 | visitante| conhecer o sistema antes de criar conta                   | decidir se vale a pena usar                    | —         | Média      | `/` Landing      | ✅     |
| US-02 | visitante| criar uma conta com nome, e-mail, telefone e senha        | acessar o sistema                              | RF-01     | Alta       | `/cadastro`      | ✅     |
| US-03 | usuário  | entrar com e-mail e senha                                 | acessar meus dados                             | RF-02     | Alta       | `/login`         | ✅     |
| US-04 | usuário  | recuperar minha senha                                     | voltar a acessar se eu esquecer                | RF-02     | Baixa      | `/recuperar-senha` | ✅ (simulado) |
| US-05 | usuário  | ver um resumo do mês (saldo, entradas, saídas, economia)  | saber rapidamente como estão minhas finanças   | RNF-01    | Alta       | `/dashboard`     | ✅     |
| US-06 | usuário  | registrar um valor recebido e sua origem                  | controlar minhas receitas                      | RF-03     | Alta       | `/entradas`      | ✅     |
| US-07 | usuário  | registrar um gasto e sua categoria                        | controlar minhas despesas                      | RF-04     | Alta       | `/saidas`        | ✅     |
| US-08 | usuário  | editar e excluir movimentações                            | corrigir lançamentos errados                   | RF-03/04  | Alta       | `/entradas`, `/saidas`, `/historico` | ✅ |
| US-09 | usuário  | criar metas com valor e prazo                             | planejar minhas economias                      | RF-05     | Alta       | `/metas`         | ✅     |
| US-10 | usuário  | guardar/retirar dinheiro de uma meta e ver o progresso    | acompanhar quanto falta                        | RF-05     | Alta       | `/metas`         | ✅     |
| US-11 | usuário  | consultar o histórico com filtros e busca                 | encontrar movimentações antigas                | RNF-06    | Média      | `/historico`     | ✅     |
| US-12 | usuário  | ver gráficos de entradas x saídas e gastos por categoria  | entender meus hábitos                          | RNF-06    | Média      | `/relatorios`    | ✅     |
| US-13 | usuário  | exportar minhas movimentações                             | usar os dados em outro lugar                   | RNF-04    | Baixa      | `/historico`, `/relatorios` | ✅ (CSV) |
| US-14 | usuário  | criar/editar minhas categorias                            | organizar do meu jeito                         | RF-03/04  | Média      | `/categorias`    | ✅     |
| US-15 | usuário  | editar meus dados e trocar minha senha                    | manter minha conta atualizada e segura         | RNF-02    | Média      | `/perfil`        | ✅     |
| US-16 | usuário  | excluir minha conta                                       | apagar meus dados do sistema                   | RNF-02    | Baixa      | `/perfil`        | ✅     |
| US-17 | usuário  | receber notificações de metas e gastos                    | não esquecer de registrar                      | RNF-04    | Baixa      | —                | 🔜 futuro |

## Mapa de navegação

```
Landing (/)
 ├── Login (/login) ──── Recuperar senha (/recuperar-senha)
 └── Cadastro (/cadastro)
          │
          ▼ (após login)
 Área logada ── menu lateral
 ├── Painel (/dashboard)
 ├── Entradas (/entradas)
 ├── Saídas (/saidas)
 ├── Histórico (/historico)
 ├── Metas (/metas)
 ├── Relatórios (/relatorios)
 ├── Categorias (/categorias)
 └── Meu perfil (/perfil)
```

O botão **“Nova movimentação”** (topo da página e botão flutuante no celular) abre o
formulário de entrada/saída em qualquer tela da área logada.
