# Entrega parcial — Semana 2

**NOMES:** ENZO GUILHERME JANZ FRAINER, GABRIEL BALIN CABRAL, JULIO CESAR HEINZEN, VINICIUS DOS REIS
**TURMA:** DS 302

## Análise de Negócio e Backlog do Produto

O Corta Aí atende pessoas que têm dificuldade em organizar as próprias finanças e que hoje usam
anotações ou planilhas, público que representa cerca de 48% dos brasileiros conectados, conforme
a análise de mercado da Semana 1. A proposta de valor é oferecer uma plataforma gratuita e mais
intuitiva do que as planilhas, em que o usuário registra manualmente suas entradas e saídas,
acompanha o saldo e define metas, sem integração bancária. A receita futura virá de um plano
premium com recursos avançados, que por isso ficam fora da versão inicial.

A partir dos requisitos funcionais (RF-01 a RF-05) e não funcionais (RNF-01 a RNF-06), o backlog
do produto foi organizado em histórias de usuário (HU) e tarefas técnicas (T), no formato
*“Como usuário, quero… para…”*:

| ID   | Item do backlog                                                                                     | Prioridade | SP | Sprint |
| ---- | --------------------------------------------------------------------------------------------------- | ---------- | -- | ------ |
| T1   | Protótipo das telas no Figma e modelagem UML                                                        | Must       | 5  | 1      |
| T2   | Banco de dados no Firestore e autenticação com Firebase                                             | Must       | 8  | 1      |
| T3   | Estrutura do front-end: Next.js, Tailwind, layout responsivo e componentes                          | Must       | 8  | 2      |
| HU01 | Como visitante, quero criar uma conta, para acessar o sistema (RF-01)                               | Must       | 5  | 2      |
| HU02 | Como usuário, quero entrar e sair com e-mail e senha, para acessar só os meus dados (RF-02, RNF-02) | Must       | 5  | 3      |
| HU03 | Como usuário, quero registrar entradas e sua origem, para controlar minhas receitas (RF-03)         | Must       | 5  | 3      |
| HU04 | Como usuário, quero registrar saídas e sua categoria, para acompanhar minhas despesas (RF-04)       | Must       | 3  | 3      |
| HU05 | Como usuário, quero editar e excluir movimentações, para corrigir erros                             | Must       | 3  | 3      |
| HU06 | Como usuário, quero ver meu saldo e o resumo do mês, para entender minha situação                   | Must       | 8  | 4      |
| HU07 | Como usuário, quero consultar o histórico com filtros, para encontrar movimentações antigas         | Should     | 5  | 4      |
| HU08 | Como usuário, quero criar minhas próprias categorias, para organizar do meu jeito                   | Should     | 3  | 4      |
| HU09 | Como usuário, quero definir metas com valor e prazo, para planejar minhas economias (RF-05)         | Must       | 5  | 5      |
| HU10 | Como usuário, quero guardar dinheiro na meta e ver o progresso, para saber quanto falta (RF-05)     | Must       | 5  | 5      |
| HU11 | Como usuário, quero editar meu perfil e trocar a senha, para manter a conta segura                  | Should     | 3  | 5      |
| HU12 | Como usuário, quero recuperar minha senha, para voltar a acessar se eu esquecer                     | Could      | 3  | 5      |
| HU13 | Como visitante, quero uma página inicial que explique o sistema, para decidir se vou usar           | Could      | 3  | 2      |
| HU14 | Como usuário, quero gráficos simples de entradas x saídas, para visualizar meus gastos              | Should     | 8  | 6      |
| HU15 | Como visitante, quero uma conta de demonstração, para conhecer o sistema sem me cadastrar           | Could      | 2  | 6      |
| T4   | Testes, avaliação com usuários e documentação                                                       | Must       | 5  | 6      |

## Matriz de Prioridades MoSCoW

| Must have (obrigatório)                     | Should have (importante)        | Could have (desejável)      | Won’t have (fora desta versão)                    |
| ------------------------------------------- | ------------------------------- | --------------------------- | ------------------------------------------------- |
| Cadastro e login (HU01, HU02)               | Histórico com filtros (HU07)    | Recuperar senha (HU12)      | Relatórios avançados e exportação (plano premium) |
| Registro de entradas e saídas (HU03 a HU05) | Categorias personalizadas (HU08) | Página inicial (HU13)      | Notificações e lembretes                          |
| Saldo e resumo do mês (HU06)                | Editar perfil e senha (HU11)    | Conta de demonstração (HU15) | Integração com bancos                            |
| Metas financeiras (HU09, HU10)              | Gráficos simples (HU14)         |                             | Aplicativo mobile nativo                          |
| Protótipo, banco, API, front-end e testes (T1 a T4) |                         |                             |                                                   |

Os itens **Must** cobrem todos os requisitos funcionais e a segurança dos dados, sem eles o sistema
não cumpre sua proposta. Os itens **Could** são os primeiros a sair caso uma sprint atrase. Os
itens **Won’t** seguem o escopo definido na Semana 1 e ficam como melhorias futuras.

## Planejamento das Sprints (Semanal)

O desenvolvimento foi dividido em **6 sprints de uma semana**. No início de cada semana a equipe
escolhe os itens da sprint (*planning*), acompanha o andamento pelo grupo da equipe no WhatsApp (*daily*) e, no
fim da semana, apresenta o que ficou pronto e discute melhorias (*review* e *retrospectiva*).

| Sprint | Objetivo da semana                                    | Itens                    | SP |
| ------ | ----------------------------------------------------- | ------------------------ | -- |
| 1      | Protótipo, modelagem e banco de dados prontos         | T1, T2                   | 13 |
| 2      | Estrutura do site, página inicial e cadastro          | T3, HU01, HU13           | 16 |
| 3      | Login e registro de entradas e saídas funcionando     | HU02, HU03, HU04, HU05   | 16 |
| 4      | Painel com saldo, histórico e categorias              | HU06, HU07, HU08         | 16 |
| 5      | Metas financeiras e perfil do usuário                 | HU09, HU10, HU11, HU12   | 16 |
| 6      | Gráficos, testes, documentação e entrega final        | HU14, HU15, T4           | 15 |
|        | **Total**                                             |                          | **92** |

## Story Points

Os *story points* (SP) medem o tamanho de cada item em relação aos outros, considerando
complexidade, esforço e incerteza, e não em horas. A equipe usou a sequência de **Fibonacci**
(1, 2, 3, 5, 8, 13) e estimou com o **Planning Poker**: cada integrante escolhe uma carta em
segredo, todos revelam juntos e, se houver diferença, quem deu o maior e o menor valor explica o
motivo até chegar a um consenso.

| Pontos | Tamanho      | Exemplo                                                    |
| ------ | ------------ | ---------------------------------------------------------- |
| 2      | Pequeno      | Conta de demonstração (HU15)                               |
| 3      | Médio        | Registrar saídas (HU04), reaproveita o formulário de entradas |
| 5      | Grande       | Cadastro de usuário (HU01), com validações e banco de dados |
| 8      | Muito grande | Painel com saldo e resumo do mês (HU06)                    |
| 13     | Enorme       | Deve ser dividido em itens menores                         |

O backlog soma **92 story points**. Com 6 sprints, a velocidade planejada da equipe é de cerca de
**15 pontos por semana**.
