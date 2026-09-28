# Corta Aí — Análise de negócio, backlog, MoSCoW, sprints e story points

> Continuação da **Especificação de Requisitos de Software** (seção 1 — Requisitos funcionais
> RF-01 a RF-05 e não funcionais RNF-01 a RNF-06). A numeração abaixo segue a do documento do TCC.

---

## 2 ANÁLISE DE NEGÓCIO E BACKLOG DO PRODUTO

### 2.1 Problema

Muitas pessoas controlam o próprio dinheiro com planilhas eletrônicas, cadernos ou, na maioria
das vezes, não controlam. As planilhas exigem conhecimento de fórmulas, quebram com facilidade,
são difíceis de usar no celular e não mostram de forma clara para onde o dinheiro está indo. Já
muitos aplicativos de finanças do mercado pedem acesso à conta bancária ou cobram pelos recursos
mais úteis, o que afasta quem só quer anotar e acompanhar os próprios gastos.

### 2.2 Proposta de valor

O **Corta Aí** é um sistema web gratuito de controle financeiro pessoal em que o usuário
**anota manualmente** suas entradas e saídas e recebe, na hora, o saldo, gráficos e o
acompanhamento das metas, sem integração bancária e sem precisar montar fórmulas.

| Dor do usuário                              | Como o Corta Aí resolve                                                   |
| ------------------------------------------- | ------------------------------------------------------------------------- |
| Planilha com fórmulas difíceis e frágeis    | Cálculos automáticos de saldo, totais e percentuais                       |
| Não saber para onde vai o dinheiro          | Gastos por categoria, ranking de maiores gastos e dica de onde cortar     |
| Planilha ruim de usar no celular            | Layout responsivo e botão rápido de “Nova movimentação”                   |
| Falta de objetivo para economizar           | Metas com progresso, prazo e quanto guardar por mês                       |
| Medo de conectar a conta do banco           | Registro manual: o usuário decide o que informar                          |

### 2.3 Público-alvo e personas

| Persona | Perfil | Objetivo com o sistema |
| ------- | ------ | ---------------------- |
| **Ana, 19 anos** — estudante e estagiária | Recebeu o primeiro salário e não sabe quanto gasta por mês | Registrar gastos pelo celular e juntar dinheiro para uma viagem |
| **Carlos, 34 anos** — trabalhador autônomo | Renda variável; usa uma planilha que “sempre quebra” | Ver entradas x saídas de cada mês e manter uma reserva de emergência |
| **Márcia, 45 anos** — responsável pelas contas da casa | Anota tudo em caderno; não confia em apps ligados ao banco | Organizar as contas fixas por categoria sem dar acesso ao banco |

### 2.4 Partes interessadas (stakeholders)

| Parte interessada                    | Interesse                                                        |
| ------------------------------------ | ---------------------------------------------------------------- |
| Usuários finais (personas)           | Controlar as finanças de forma simples e visual                  |
| Equipe de desenvolvimento            | Entregar o TCC funcionando, dentro do prazo                      |
| Professores / orientador (CEDUP)     | Avaliar requisitos, documentação, código e funcionamento         |

### 2.5 Análise do cenário (concorrência)

| Alternativa                                      | Pontos fortes                   | Pontos fracos                                                   |
| ------------------------------------------------ | ------------------------------- | --------------------------------------------------------------- |
| Planilhas (Excel, Google Planilhas)              | Flexíveis e conhecidas          | Exigem fórmulas, quebram fácil, ruins no celular, sem metas     |
| Caderno / anotações                              | Simples                         | Nenhum cálculo, sem gráficos, fácil de perder                   |
| Aplicativos de mercado (ex.: Mobills, Organizze) | Completos                       | Muitos recursos pagos, curva de aprendizado, foco em integração bancária |
| **Corta Aí**                                     | Gratuito, simples, visual, metas | Sem integração bancária (por escolha), depende do usuário anotar |

### 2.6 Análise SWOT

| **Forças**                                                        | **Fraquezas**                                                       |
| ----------------------------------------------------------------- | ------------------------------------------------------------------- |
| Interface simples e responsiva                                    | Depende da disciplina do usuário em registrar                       |
| Não exige dados bancários                                         | Equipe pequena e com tempo limitado                                 |
| Metas com cálculo automático de quanto guardar por mês            | Sem aplicativo nativo para celular                                  |
| **Oportunidades**                                                 | **Ameaças**                                                         |
| Muitas pessoas ainda usam planilhas ou nada                       | Apps de mercado com mais recursos                                   |
| Educação financeira em alta, principalmente entre jovens          | Desconfiança do público em sistemas que guardam dados financeiros   |
| Evoluir com notificações, recorrência e importação de planilhas   | Custo de hospedagem se o número de usuários crescer                 |

### 2.7 Objetivos de negócio e indicadores

| Objetivo específico do TCC                               | Indicador de sucesso (como medir)                                             |
| -------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 3 — Interface intuitiva                                  | Registrar uma movimentação em até **30 segundos**                             |
| 4 — Cadastro e gestão de entradas e saídas               | 100% dos testadores conseguem registrar, editar e excluir sem ajuda           |
| 5 — Criação e acompanhamento de metas                    | Testadores criam uma meta e guardam um valor sem ajuda                        |
| 6 — Informações organizadas e claras                     | Testadores respondem corretamente “qual foi seu maior gasto do mês?”          |
| 7 — Avaliar o funcionamento do sistema                   | Nota **SUS ≥ 68** (média de mercado da escala *System Usability Scale*) no questionário de avaliação |

### 2.8 Premissas e restrições

- **Sem integração bancária:** todas as movimentações são registradas manualmente (definição do projeto).
- Sistema **web**, acessado pelo navegador no computador ou no celular.
- Tecnologias definidas: **Next.js + Tailwind CSS** (front-end), **PHP** (API) e **MySQL** (banco de dados).
- Equipe de **4 integrantes**, trabalhando em paralelo com as demais disciplinas.
- Sprints **semanais**, com entrega final no fim do semestre letivo.

### 2.9 Riscos

| Risco                                            | Probabilidade | Impacto | Resposta                                                               |
| ------------------------------------------------ | ------------- | ------- | ---------------------------------------------------------------------- |
| Atraso por provas e trabalhos de outras matérias | Alta          | Médio   | Itens *Could* são os primeiros a sair da sprint                        |
| Pouca experiência com Next.js / PHP              | Média         | Alto    | Componentes reutilizáveis, documentação no README, programação em dupla |
| Problemas de instalação (npm, XAMPP) nas máquinas | Média        | Médio   | Passo a passo no README e seção de problemas comuns                    |
| Hospedagem online da API e do banco              | Média         | Médio   | Apresentação garantida com o sistema rodando localmente (XAMPP)        |
| Perda de código                                  | Baixa         | Alto    | Repositório no GitHub com commits frequentes                           |

### 2.10 Épicos

| Épico | Nome                          | Descrição                                                          | Requisitos        |
| ----- | ----------------------------- | ------------------------------------------------------------------ | ----------------- |
| E0    | Fundação técnica              | Projeto, protótipo, componentes, banco de dados, API e publicação  | RNF-03, 04, 05    |
| E1    | Conta e acesso                | Cadastro, login, perfil e segurança dos dados                      | RF-01, RF-02, RNF-02 |
| E2    | Movimentações                 | Entradas, saídas e categorias                                      | RF-03, RF-04      |
| E3    | Metas                         | Objetivos financeiros e acompanhamento                             | RF-05             |
| E4    | Acompanhamento                | Painel, histórico e relatórios                                     | RNF-01, RNF-06    |
| E5    | Institucional                 | Página inicial e conta de demonstração                             | RNF-01            |
| E6    | Qualidade e avaliação         | Testes, avaliação com usuários e documentação                      | Objetivo 7        |

### 2.11 Backlog do produto

Formato das histórias: *Como [quem], quero [o quê], para [por quê]*. Histórias técnicas (HT) são
tarefas necessárias que não são funcionalidades vistas pelo usuário. **SP** = story points (seção 5).

| ID    | Épico | História                                                                                                        | Requisito | MoSCoW | SP | Sprint |
| ----- | ----- | --------------------------------------------------------------------------------------------------------------- | --------- | ------ | -- | ------ |
| HT-01 | E0    | Configurar o projeto Next.js com Tailwind, estrutura de pastas e repositório no GitHub                         | RNF-04    | Must   | 3  | 1      |
| HT-02 | E0    | Criar a identidade visual e o protótipo das telas no Figma                                                    | RNF-05    | Must   | 8  | 1      |
| HT-03 | E0    | Criar os componentes de interface (botões, campos com máscara, modal, toasts, estados de carregando/vazio/erro) | RNF-01, 05 | Must  | 8  | 2      |
| HT-04 | E0    | Modelar o banco de dados MySQL (DER e script de criação)                                                       | RNF-04    | Must   | 5  | 1      |
| HT-05 | E0    | Estruturar a API em PHP (rotas, conexão com o banco, validação e tratamento de erros)                          | RNF-04    | Must   | 8  | 2      |
| HT-06 | E0    | Criar o layout responsivo da área logada (menu lateral, menu no celular, navegação)                            | RNF-03    | Must   | 5  | 3      |
| HU-01 | E1    | Como visitante, quero criar uma conta com nome, e-mail, telefone e senha, para acessar o sistema               | RF-01     | Must   | 5  | 3      |
| HU-02 | E1    | Como usuário, quero entrar com e-mail e senha, para acessar minhas finanças                                    | RF-02     | Must   | 5  | 3      |
| HU-03 | E1    | Como usuário, quero sair da minha conta, para que outra pessoa não use meu acesso                              | RF-02     | Must   | 1  | 3      |
| HU-04 | E1    | Como usuário, quero que só eu consiga ver e alterar os meus dados, para manter minhas finanças em sigilo       | RNF-02    | Must   | 3  | 4      |
| HU-13 | E2    | Como novo usuário, quero já ter categorias prontas, para começar a registrar sem configurar nada               | RF-03, 04 | Must   | 2  | 4      |
| HU-09 | E2    | Como usuário, quero registrar um valor recebido e sua origem, para controlar minhas receitas                   | RF-03     | Must   | 5  | 4      |
| HU-10 | E2    | Como usuário, quero registrar um gasto e sua categoria, para acompanhar minhas despesas                        | RF-04     | Must   | 3  | 4      |
| HU-11 | E2    | Como usuário, quero editar e excluir movimentações, para corrigir lançamentos errados                          | RF-03, 04 | Must   | 3  | 4      |
| HU-12 | E2    | Como usuário, quero ver as entradas e as saídas do mês com o total, para saber quanto recebi e gastei          | RF-03, 04 | Must   | 5  | 5      |
| HU-20 | E4    | Como usuário, quero um painel com saldo, entradas, saídas e economia do mês, para entender minha situação rapidamente | RNF-06 | Must | 8  | 5      |
| HU-21 | E4    | Como usuário, quero consultar o histórico de todas as movimentações, para lembrar o que fiz em outros meses    | RNF-06    | Must   | 3  | 5      |
| HU-16 | E3    | Como usuário, quero criar uma meta com valor e prazo, para planejar minhas economias                           | RF-05     | Must   | 5  | 6      |
| HU-17 | E3    | Como usuário, quero guardar ou retirar dinheiro de uma meta e ver o progresso, para saber quanto falta         | RF-05     | Must   | 5  | 6      |
| HU-18 | E3    | Como usuário, quero editar e excluir metas, para ajustar meus objetivos                                        | RF-05     | Should | 3  | 6      |
| HU-19 | E3    | Como usuário, quero ver quanto guardar por mês e se o prazo está perto, para cumprir a meta a tempo            | RF-05     | Should | 2  | 6      |
| HU-23 | E4    | Como usuário, quero relatórios com gráficos de entradas x saídas e gastos por categoria, para ver meus hábitos | RNF-04    | Should | 8  | 7      |
| HU-22 | E4    | Como usuário, quero filtrar o histórico por tipo, mês e categoria e buscar pela descrição, para achar um lançamento | RNF-01 | Should | 3  | 7      |
| HU-15 | E2    | Como usuário, quero um botão de “Nova movimentação” em qualquer tela, para registrar mais rápido               | RNF-01    | Should | 2  | 7      |
| HU-24 | E4    | Como usuário, quero exportar minhas movimentações em CSV, para abrir no Excel se precisar                      | RNF-04    | Could  | 2  | 7      |
| HU-14 | E2    | Como usuário, quero criar, editar e excluir minhas categorias, para organizar do meu jeito                     | RF-03, 04 | Should | 5  | 8      |
| HU-06 | E1    | Como usuário, quero editar meu nome, e-mail e telefone, para manter meus dados atualizados                     | RF-01     | Should | 3  | 8      |
| HU-07 | E1    | Como usuário, quero trocar minha senha, para manter minha conta segura                                         | RNF-02    | Should | 3  | 8      |
| HU-05 | E1    | Como usuário, quero recuperar minha senha pelo e-mail, para voltar a acessar se eu esquecer                    | RF-02     | Could  | 3  | 8      |
| HU-08 | E1    | Como usuário, quero excluir minha conta, para apagar meus dados do sistema                                     | RNF-02    | Could  | 2  | 8      |
| HU-26 | E5    | Como visitante, quero uma página inicial que explique o sistema, para decidir se vale a pena usar              | RNF-01    | Should | 3  | 9      |
| HU-27 | E5    | Como visitante, quero entrar numa conta de demonstração, para conhecer o sistema sem me cadastrar              | RNF-01    | Could  | 2  | 9      |
| HU-25 | E4    | Como usuário, quero uma dica mostrando meu maior gasto, para saber onde posso cortar                           | RNF-01    | Could  | 2  | 9      |
| HT-07 | E0    | Publicar o sistema online (front-end, API e banco de dados)                                                    | RNF-03    | Should | 8  | 9      |
| HT-08 | E6    | Testar todas as telas e fluxos (cadastro, movimentações, metas, relatórios, celular)                           | RNF-01, 03 | Must  | 5  | 10     |
| HT-09 | E6    | Avaliar o sistema com usuários reais (tarefas + questionário SUS) e registrar os resultados                    | Objetivo 7 | Must  | 5  | 10     |
| HT-10 | E6    | Finalizar a documentação (README, casos de uso, API, banco de dados)                                            | RNF-04    | Should | 3  | 10     |

**Total: 37 itens · 154 story points.**

### 2.12 Critérios de aceitação das histórias *Must*

| ID    | Critérios de aceitação                                                                                                          |
| ----- | ------------------------------------------------------------------------------------------------------------------------------- |
| HU-01 | Valida nome (mín. 3 letras), e-mail, telefone com DDD (máscara) e senha forte (8+ caracteres, letra e número); não permite e-mail repetido; senha salva criptografada; ao concluir, o usuário já entra logado |
| HU-02 | E-mail ou senha errados mostram “E-mail ou senha incorretos” sem dizer qual; opção “Manter conectado”; leva para o painel ou para a página que o usuário tentou abrir |
| HU-03 | Encerra a sessão no servidor e volta para a tela de login                                                                       |
| HU-04 | Páginas internas exigem login; a API só devolve e altera dados do próprio usuário; tentar acessar dado de outro usuário retorna “não encontrado” |
| HU-09 | Campos: descrição, valor (máscara R$), data, origem, forma de recebimento e observação; valor maior que zero; saldo atualizado na hora |
| HU-10 | Mesmo formulário da entrada, com categoria de saída; mensagem de sucesso ao salvar                                              |
| HU-11 | Edição abre o formulário preenchido; exclusão pede confirmação; totais recalculados na hora                                     |
| HU-12 | Lista do mês com navegação entre meses, total do mês, quantidade de lançamentos e estado vazio quando não houver dados           |
| HU-13 | Ao se cadastrar, o usuário recebe 5 categorias de entrada e 9 de saída                                                          |
| HU-16 | Campos: nome, valor da meta, valor já guardado, prazo, descrição e cor; o valor guardado não pode ser maior que a meta           |
| HU-17 | Guardar soma e retirar subtrai do valor; não permite retirar mais do que foi guardado; barra de progresso; aviso ao concluir a meta |
| HU-20 | Mostra saldo acumulado, entradas, saídas e economia do mês, comparação com o mês anterior, gráfico de 6 meses, últimas movimentações e metas |
| HU-21 | Lista todas as movimentações agrupadas por dia, com o resultado de cada dia                                                     |
| HT-08 | Todos os fluxos testados no computador e no celular, sem erros no console                                                       |
| HT-09 | Pelo menos 5 pessoas testam o sistema; resultados e nota SUS registrados no TCC                                                 |

### 2.13 Fora do escopo desta versão (*Won’t have*)

| ID   | Ideia para versões futuras                                         | Motivo de ficar de fora                                  |
| ---- | ------------------------------------------------------------------ | -------------------------------------------------------- |
| W-01 | Integração com bancos / Open Finance                               | Fora da proposta do projeto (registro manual)            |
| W-02 | Notificações e lembretes (ex.: “registre seus gastos de hoje”)     | Citado no RNF-04 como evolução futura                    |
| W-03 | Movimentações recorrentes (ex.: aluguel todo mês automaticamente)  | Aumenta a complexidade; não é essencial para o TCC       |
| W-04 | Orçamento com limite de gasto por categoria                        | Evolução natural das metas, fica para depois             |
| W-05 | Importar movimentações de uma planilha (CSV/Excel)                 | Útil para quem migra de planilhas, mas não é essencial   |
| W-06 | Aplicativo nativo para celular                                     | O site responsivo já funciona no celular                 |
| W-07 | Modo escuro                                                        | Recurso visual, sem impacto nos objetivos                |
| W-08 | Conta compartilhada (casal/família)                                | Exige outro modelo de permissões                         |
| W-09 | Envio real de e-mail na recuperação de senha                       | Precisa de servidor de e-mail; hoje o fluxo é simulado   |

### 2.14 Rastreabilidade com os requisitos do front-end

Os requisitos do trabalho de front-end foram incorporados ao backlog do TCC:

| Requisito do front-end                         | Onde está no backlog              |
| ---------------------------------------------- | --------------------------------- |
| Aplicação Next.js e organização das pastas     | HT-01                             |
| Tailwind CSS, layout responsivo e navegação    | HT-01, HT-06                      |
| Componentização, ícones, formulários           | HT-03 e todas as HU com formulário |
| Máscaras de entrada (moeda, telefone)          | HT-03, HU-01, HU-09, HU-16        |
| Validações de campos                           | HT-03 e critérios de aceitação    |
| Mensagens de feedback (toast)                  | HT-03                             |
| Estados visuais: carregando, vazio, erro, sucesso | HT-03, HU-12, HU-20            |
| Todas as telas do backlog                      | HU-01 a HU-27                     |

---

## 3 MATRIZ DE PRIORIDADES MOSCOW

A técnica **MoSCoW** classifica cada item do backlog em quatro níveis de prioridade:

- **Must have (deve ter):** sem isso o sistema não cumpre os requisitos funcionais nem os objetivos do TCC.
- **Should have (deveria ter):** importante e agrega muito valor, mas o sistema funciona sem.
- **Could have (poderia ter):** desejável; é o primeiro a sair se a sprint atrasar.
- **Won’t have (não terá agora):** fica registrado para versões futuras.

### 3.1 Matriz

| **Must have** (deve ter)                       | **Should have** (deveria ter)                  | **Could have** (poderia ter)            | **Won’t have** (não terá agora)        |
| ---------------------------------------------- | ---------------------------------------------- | --------------------------------------- | -------------------------------------- |
| HT-01 Configurar projeto                       | HU-06 Editar perfil                            | HU-05 Recuperar senha                   | W-01 Integração bancária               |
| HT-02 Protótipo no Figma                       | HU-07 Trocar senha                             | HU-08 Excluir conta                     | W-02 Notificações                      |
| HT-03 Componentes de interface                 | HU-14 Gerenciar categorias                     | HU-24 Exportar CSV                      | W-03 Movimentações recorrentes         |
| HT-04 Modelar banco de dados                   | HU-15 Botão rápido de movimentação             | HU-25 Dica de maior gasto               | W-04 Orçamento por categoria           |
| HT-05 Estruturar API PHP                       | HU-18 Editar/excluir metas                     | HU-27 Conta de demonstração             | W-05 Importar planilha                 |
| HT-06 Layout responsivo                        | HU-19 Quanto guardar por mês                   |                                         | W-06 App nativo                        |
| HU-01 Cadastro **(RF-01)**                     | HU-22 Filtros e busca                          |                                         | W-07 Modo escuro                       |
| HU-02 Login **(RF-02)**                        | HU-23 Relatórios com gráficos                  |                                         | W-08 Conta compartilhada               |
| HU-03 Logout                                   | HU-26 Página inicial                           |                                         | W-09 E-mail real de recuperação        |
| HU-04 Dados só do usuário **(RNF-02)**         | HT-07 Publicar online                          |                                         |                                        |
| HU-09 Registrar entrada **(RF-03)**            | HT-10 Documentação                             |                                         |                                        |
| HU-10 Registrar saída **(RF-04)**              |                                                |                                         |                                        |
| HU-11 Editar/excluir movimentação              |                                                |                                         |                                        |
| HU-12 Listas do mês com totais                 |                                                |                                         |                                        |
| HU-13 Categorias padrão                        |                                                |                                         |                                        |
| HU-16 Criar meta **(RF-05)**                   |                                                |                                         |                                        |
| HU-17 Guardar/retirar da meta **(RF-05)**      |                                                |                                         |                                        |
| HU-20 Painel com saldo                         |                                                |                                         |                                        |
| HU-21 Histórico                                |                                                |                                         |                                        |
| HT-08 Testes                                   |                                                |                                         |                                        |
| HT-09 Avaliação com usuários                   |                                                |                                         |                                        |

### 3.2 Distribuição do esforço

| Prioridade  | Itens | Story points | % do esforço |
| ----------- | ----- | ------------ | ------------ |
| Must have   | 21    | 100          | 65%          |
| Should have | 11    | 43           | 28%          |
| Could have  | 5     | 11           | 7%           |
| **Total**   | **37**| **154**      | **100%**     |
| Won’t have  | 9     | —            | não estimado |

O método recomenda que os itens *Must* fiquem perto de 60% do esforço, para sobrar folga para
imprevistos. Aqui eles ficam um pouco acima (65%) porque o TCC tem entregas obrigatórias além das
funcionalidades (protótipo no Figma, banco de dados e avaliação com usuários). A folga fica nos
itens *Could*: se uma sprint atrasar, eles são os primeiros a sair.

### 3.3 Justificativa das decisões

- **Todos os requisitos funcionais (RF-01 a RF-05) são Must**, junto com a segurança dos dados
  (RNF-02), o painel com saldo e o histórico, que fazem parte da proposta do sistema.
- **Relatórios com gráficos são Should:** o painel já mostra o essencial; os relatórios aprofundam a análise.
- **Recuperação de senha é Could:** a versão atual simula o envio de e-mail; o envio real ficou em Won’t (W-09).
- **Integração bancária é Won’t** por definição do projeto: o diferencial é o registro manual.

---

## 4 PLANEJAMENTO DAS SPRINTS (SEMANAL)

### 4.1 Organização do Scrum na equipe

| Item                  | Definição                                                                                     |
| --------------------- | --------------------------------------------------------------------------------------------- |
| Duração da sprint     | **1 semana**                                                                                  |
| Quantidade de sprints | **10 sprints** de desenvolvimento                                                             |
| Equipe                | 4 integrantes: Julio Cesar Heinzen, Gabriel Balin Cabral, Enzo Guilherme Janz Frainer e Vinicius dos Reis |
| Papéis                | Um integrante como *Product Owner* (prioriza o backlog) e outro como *Scrum Master* (organiza as cerimônias); todos desenvolvem |
| Velocidade planejada  | **~16 story points por sprint** (154 SP ÷ 10 sprints)                                          |
| Ferramentas           | GitHub (código e tarefas), Figma (protótipo), WhatsApp (daily)                                |

**Cerimônias de cada semana:**

| Quando          | Cerimônia                       | O que acontece                                                       |
| --------------- | ------------------------------- | -------------------------------------------------------------------- |
| Início da semana | *Sprint Planning* (30 min)     | Escolher as histórias da sprint e dividir as tarefas                 |
| Todo dia        | *Daily* (mensagem no grupo)     | O que fiz, o que vou fazer, se tenho algum impedimento               |
| Fim da semana   | *Sprint Review* (20 min)        | Mostrar o que ficou pronto funcionando                               |
| Fim da semana   | *Retrospectiva* (10 min)        | O que foi bem, o que melhorar na próxima semana                      |

**Definição de Pronto (Definition of Done)** — uma história só está pronta quando:

1. Atende a todos os critérios de aceitação.
2. Funciona no computador e no celular.
3. Mostra os estados de carregando, vazio, erro e sucesso quando se aplicam.
4. O código foi enviado para o GitHub, sem erros de build ou de lint.
5. Foi testada por outro integrante da equipe.

### 4.2 Sprints

| Sprint | Semana   | Meta da sprint (Sprint Goal)                                      | Itens                                              | SP |
| ------ | -------- | ----------------------------------------------------------------- | -------------------------------------------------- | -- |
| 1      | Semana 1 | Projeto configurado, protótipo no Figma e banco de dados modelado | HT-01, HT-02, HT-04                                | 16 |
| 2      | Semana 2 | Base técnica pronta: componentes visuais e API funcionando        | HT-03, HT-05                                       | 16 |
| 3      | Semana 3 | Usuário consegue se cadastrar, entrar e sair                      | HT-06, HU-01, HU-02, HU-03                         | 16 |
| 4      | Semana 4 | Usuário registra, edita e exclui entradas e saídas com segurança  | HU-04, HU-13, HU-09, HU-10, HU-11                  | 16 |
| 5      | Semana 5 | Usuário acompanha o saldo e consulta o histórico                  | HU-12, HU-20, HU-21                                | 16 |
| 6      | Semana 6 | Usuário cria metas e acompanha o progresso                        | HU-16, HU-17, HU-18, HU-19                         | 15 |
| 7      | Semana 7 | Usuário analisa os hábitos com relatórios e filtros               | HU-23, HU-22, HU-15, HU-24                         | 15 |
| 8      | Semana 8 | Usuário gerencia as categorias e a própria conta                  | HU-14, HU-06, HU-07, HU-05, HU-08                  | 16 |
| 9      | Semana 9 | Sistema apresentável e publicado na internet                      | HU-26, HU-27, HU-25, HT-07                         | 15 |
| 10     | Semana 10 | Sistema testado, avaliado com usuários e documentado             | HT-08, HT-09, HT-10                                | 13 |
|        |          |                                                                   | **Total**                                          | **154** |

### 4.3 Detalhamento das sprints

**Sprint 1 — Fundação (16 SP)**
- HT-01 Configurar projeto Next.js, Tailwind, pastas e GitHub (3)
- HT-02 Identidade visual e protótipo no Figma (8)
- HT-04 Modelar o banco de dados: DER e script SQL (5)
- *Entregável:* repositório criado, protótipo das telas e diagrama do banco.

**Sprint 2 — Base técnica (16 SP)**
- HT-03 Componentes de interface: botão, campos com máscara, modal, toasts e estados visuais (8)
- HT-05 API em PHP: rotas, conexão PDO com o MySQL, validação e erros (8)
- *Entregável:* biblioteca de componentes e API respondendo em `/api/health`.

**Sprint 3 — Acesso (16 SP)**
- HT-06 Layout da área logada: menu lateral e menu do celular (5)
- HU-01 Cadastro (5) · HU-02 Login (5) · HU-03 Logout (1)
- *Entregável:* usuário cria conta, entra e sai do sistema.

**Sprint 4 — Movimentações (16 SP)**
- HU-04 Dados protegidos por usuário (3) · HU-13 Categorias padrão (2)
- HU-09 Registrar entrada (5) · HU-10 Registrar saída (3) · HU-11 Editar/excluir (3)
- *Entregável:* RF-03 e RF-04 funcionando e gravando no banco.

**Sprint 5 — Acompanhamento (16 SP)**
- HU-12 Telas de Entradas e Saídas com totais do mês (5)
- HU-20 Painel com saldo, cards e gráfico (8) · HU-21 Histórico (3)
- *Entregável:* painel mostrando a situação financeira do mês.

**Sprint 6 — Metas (15 SP)**
- HU-16 Criar meta (5) · HU-17 Guardar/retirar valor (5)
- HU-18 Editar/excluir metas (3) · HU-19 Quanto guardar por mês (2)
- *Entregável:* RF-05 funcionando.

**Sprint 7 — Relatórios (15 SP)**
- HU-23 Relatórios com gráficos (8) · HU-22 Filtros e busca (3)
- HU-15 Botão rápido de movimentação (2) · HU-24 Exportar CSV (2)
- *Entregável:* tela de relatórios e histórico com filtros.

**Sprint 8 — Conta e categorias (16 SP)**
- HU-14 Gerenciar categorias (5) · HU-06 Editar perfil (3) · HU-07 Trocar senha (3)
- HU-05 Recuperar senha (3) · HU-08 Excluir conta (2)
- *Entregável:* telas de Categorias e Meu perfil.

**Sprint 9 — Apresentação e publicação (15 SP)**
- HU-26 Página inicial (3) · HU-27 Conta de demonstração (2) · HU-25 Dica de maior gasto (2)
- HT-07 Publicar front-end, API e banco online (8)
- *Entregável:* sistema acessível por um link.

**Sprint 10 — Qualidade e avaliação (13 SP)**
- HT-08 Testes de todas as telas (5)
- HT-09 Avaliação com usuários e questionário SUS (5)
- HT-10 Documentação final (3)
- *Entregável:* resultados da avaliação para o capítulo de resultados do TCC.
- A folga de 3 SP desta sprint fica para correções encontradas nos testes.

### 4.4 Burndown planejado

Story points restantes no fim de cada sprint (linha ideal do gráfico de *burndown*):

| Início | S1  | S2  | S3  | S4  | S5 | S6 | S7 | S8 | S9 | S10 |
| ------ | --- | --- | --- | --- | -- | -- | -- | -- | -- | --- |
| 154    | 138 | 122 | 106 | 90  | 74 | 59 | 44 | 28 | 13 | 0   |

---

## 5 STORY POINTS

### 5.1 O que são

*Story points* (pontos de história) medem o **tamanho relativo** de uma história, e não horas.
A estimativa considera três fatores: **complexidade** (quão difícil é), **esforço** (quanto
trabalho dá) e **incerteza** (o quanto a equipe ainda não sabe como fazer).

### 5.2 Escala utilizada (Fibonacci)

| Pontos | Tamanho      | Significado                                                              | Exemplo do backlog                          |
| ------ | ------------ | ------------------------------------------------------------------------ | ------------------------------------------- |
| **1**  | Muito pequeno | Mudança simples, sem risco                                              | HU-03 Logout                                |
| **2**  | Pequeno      | Uma tela ou ação simples, sem regra de negócio nova                      | HU-13 Categorias padrão, HU-24 Exportar CSV |
| **3**  | Médio        | Formulário ou listagem com validações, reaproveitando componentes        | HU-10 Registrar saída, HU-07 Trocar senha   |
| **5**  | Grande       | Tela nova com formulário, regras de negócio e integração com a API       | HU-01 Cadastro, HU-16 Criar meta            |
| **8**  | Muito grande | Várias partes juntas ou algo que a equipe ainda não domina               | HU-20 Painel, HU-23 Relatórios, HT-05 API   |
| **13** | Enorme       | Grande demais para uma sprint: deve ser **quebrado** em histórias menores | — (nenhum item ficou com 13)                |

A sequência de Fibonacci é usada porque, quanto maior a tarefa, maior a incerteza. Por isso os
números ficam cada vez mais distantes e a equipe não perde tempo discutindo se algo vale 6 ou 7.

### 5.3 Como a equipe estimou (Planning Poker)

1. O *Product Owner* lê a história e os critérios de aceitação.
2. Cada integrante escolhe, em segredo, uma carta: 1, 2, 3, 5, 8 ou 13.
3. Todos mostram as cartas ao mesmo tempo.
4. Se os valores forem diferentes, quem deu o maior e o menor explicam o porquê.
5. Vota-se de novo até chegar a um consenso.

**Histórias de referência** (usadas para comparar as outras):
- **1 ponto — HU-03 Logout:** um botão que encerra a sessão.
- **3 pontos — HU-10 Registrar saída:** reaproveita o formulário da entrada, mudando o tipo.
- **5 pontos — HU-09 Registrar entrada:** formulário completo com máscara, validação e gravação no banco.
- **8 pontos — HU-20 Painel:** cálculos, cards, gráfico, listas e vários estados visuais na mesma tela.

Por que a saída (3) vale menos que a entrada (5)? Porque o formulário, as validações e a gravação
são criados na entrada e só reaproveitados na saída.

### 5.4 Pontos por épico

| Épico                      | Itens | Story points |
| -------------------------- | ----- | ------------ |
| E0 — Fundação técnica      | 7     | 45           |
| E1 — Conta e acesso        | 8     | 25           |
| E2 — Movimentações         | 7     | 25           |
| E3 — Metas                 | 4     | 15           |
| E4 — Acompanhamento        | 6     | 26           |
| E5 — Institucional         | 2     | 5            |
| E6 — Qualidade e avaliação | 3     | 13           |
| **Total**                  | **37**| **154**      |

### 5.5 Velocidade

- **Velocidade planejada:** 16 SP por sprint (≈ 4 SP por integrante por semana).
- **Velocidade real:** somar, no fim de cada sprint, os pontos das histórias que atenderam à
  Definição de Pronto. Histórias incompletas não contam pontos e voltam para o backlog.
- Se a velocidade real ficar abaixo da planejada por duas sprints seguidas, os itens *Could* são
  retirados do planejamento, na ordem: HU-27, HU-25, HU-24, HU-08, HU-05.
