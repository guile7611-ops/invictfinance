# 🧠 Lógica de Funcionamento - Dash Financeiro

Este documento serve como a "Fonte da Verdade" para a linha de raciocínio, cálculos e fluxos do projeto. Toda nova alteração deve ser documentada aqui.

---

## 1. Gestão de Sessão e Autenticação (`AuthContext`)

### 🔑 Propósito
Gerenciar a identidade do usuário, persistência de login e sincronização com o banco de dados (Supabase).

### ⚙️ Lógica Implementada
*   **Cache Estratégico**: O usuário é salvo no `localStorage` (`dash_user_cache`). 
*   **Carregamento Não-Bloqueante**: O sistema define `isLoaded: true` assim que o `supabase.auth.getSession()` retorna, mesmo que os dados do perfil ainda estejam sendo buscados em background. Isso evita travamentos na tela de loading.
*   **Race Condition Fix**: As chamadas ao banco (`AppContext`) aguardam a conclusão do check de sessão no `AuthContext` para evitar que o RLS (Row Level Security) bloqueie a requisição inicial.

---

## 2. Orquestração de Dados Globais (`AppContext`)

### 📊 Fluxo de Dados
*   **Centralização**: Todas as transações, recorrências, metas e cartões são carregados uma única vez no `fetchData`.
*   **fetchData Reativo**: A função de busca é disparada sempre que o objeto `user` muda (Login/F5).

### 🔢 Lógica de Cálculos Financeiros
*   **Saldo Total**: `user.initialBalance + Soma(Transações "completed")`.
*   **Receita/Gasto Mensal**: Filtrado por `status === "completed"` e `mes_atual`.
*   **Economia Mensal**: `Receita Mensal - Gastos Mensais`.
*   **% de Economia**: `(Economia Mensal / Receita Mensal) * 100` (limitado entre 0-100%).
*   **Saldo Projetado**: `Saldo Atual + Previsões de Receita - Previsões de Gasto` (pendências do mês).

---

## 3. Ciclo de Vida de Transações

### 🏷️ Status de Transação
1.  `completed`: Transação realizada que altera o saldo real e aparece na lista principal.
2.  `predicted`: Lançamento previsto (futuro ou pendente) vindo de uma recorrência.
3.  `pending`: Transação que já deveria ter ocorrido mas não foi confirmada.
4.  `overdue`: Transações com data passada e status não-concluído.

### 🔄 Lógica de Recorrências (Contas Fixas)
*   **Criação**: Ao criar uma recorrência, o sistema gera o registro na tabela `recurrences` e cria o primeiro lançamento com status `predicted` na tabela `transactions`.
*   **Confirmação (QuickConfirm)**:
    1.  O lançamento `predicted` atual é marcado como `completed`.
    2.  A data em `recurrences.next_due_date` é avançada em 1 mês.
    3.  Uma **nova** transação `predicted` é criada para o próximo mês automaticamente.

---

## 4. Regras de Exibição (UI/UX)

### 🖼️ Dashboard Principal
*   **Lista de Transações**: Filtrada estritamente para `status === "completed"`.
*   **KPI Cards**: 
    *   Card de Saldo reflete dinheiro real.
    *   Card de Economia usa cores dinâmicas (Verde se positivo, Vermelho se negativo).
*   **Gráfico de Fluxo de Caixa**: 
    *   Barras: Valores realizados (`completed`).
    *   Linha: Saldo projetado dia a dia.

### ⚠️ Painel de Alertas
*   Gera avisos dinâmicos baseados em:
    *   Transações `overdue` (Crítico).
    *   Transações `predicted` com data de hoje (Atenção).
    *   Metas de economia atingindo 90% (Info).

---

## 5. Histórico de Mudanças Recentes

### [2026-04-17] - Estabilização de Performance e Sessão
*   **Mudança**: Movido `isLoaded` para fora do `await refreshUserData`.
*   **Lógica**: Garante que o usuário veja a Dashboard assim que a conexão com o Supabase é estabelecida, sem esperar o carregamento de dados secundários.
*   **Mudança**: Restrição de status na Dashboard.
*   **Lógica**: Limpeza da visão principal para focar no que é **Real**, movendo o **Previsto** para as seções de Pendências/Alertas.
*   **Mudança**: Dinamização do `SavingsPanel`.
*   **Lógica**: Removido uso de `mockData` estático; agora as fatias de gastos por categoria são calculadas em tempo real a partir das transações do banco.

### [2026-04-17 (Update 2)] - Refinamento de Fluxo e Cálculos
*   **Mudança**: Correção matemática na `monthlyEconomy`.
*   **Lógica**: Alterado de `Income - Expenses` para `Income - ABS(Expenses)`. Como as despesas são armazenadas como valores negativos, a lógica anterior estava somando os valores em vez de subtrair.
*   **Mudança**: Agrupamento de Pendências por Mês.
*   **Lógica**: Implementada separação visual na aba de Pendências utilizando `date-fns` para agrupar as ocorrências por "Mês de Ano". Isso evita confusão visual e permite que o usuário identifique rapidamente o que pertence ao período atual e o que é futuro.

### [2026-04-17 (Update 7)] - Sistema de Metas Financeiras
*   **Mudança**: Gestão de Objetivos e Sonhos.
*   **Lógica**: Criada aba de Metas com suporte a visualização de progresso percentual. Implementado o `GoalModal` que permite customizar ícones (emojis) e cores para cada meta.
*   **Mudança**: Mecânica de Aportes.
*   **Lógica**: Ao realizar um aporte em uma meta, o sistema executa duas ações: 1) Incrementa o `current_amount` da meta no banco de dados e 2) Gera automaticamente uma transação do tipo `expense` (saída) na categoria "Investimentos". Isso garante que o dashboard e o saldo projetado reflitam a saída do dinheiro para a reserva, mantendo o controle de caixa preciso.

### [2026-04-17 (Update 6)] - Unificação de Recorrências e Projeção Virtual
*   **Mudança**: Projeção Virtual de 12 Meses.
*   **Lógica**: Ao contrário da lógica anterior que dependia de registros físicos no banco de dados para cada mês, o sistema agora gera "Ocorrências Virtuais" no `AppContext`. Ele cruza as `recurrences` ativas com as `transactions` existentes e preenche os vãos do calendário até Dezembro. Isso permite visualizar o fluxo de caixa futuro de forma imediata após criar um gasto recorrente.
*   **Mudança**: Nomenclatura Unificada.
*   **Lógica**: Abandono do termo "Pendências" em favor de "Recorrências". A aba de confirmações agora se chama "Recorrências Anuais" e a gestão de contratos "Contas Recorrentes". As confirmações de ocorrências virtuais agora acionam uma rotina de `insert` automático seguida de `update` na data da próxima recorrência.

### [2026-04-17 (Update 5)] - Planejamento Anual e Controles de Expansão
*   **Mudança**: Projeção de calendário até Dezembro.
*   **Lógica**: O sistema agora não depende apenas de transações existentes para criar os grupos de meses. Ele gera dinamicamente uma lista de todos os meses desde o atual até o fim do ano (Dezembro), garantindo que o usuário visualize seu horizonte financeiro completo.
*   **Mudança**: Controles Globais de Acordeão.
*   **Lógica**: Adicionados botões "Expandir Tudo" e "Recolher Tudo" que manipulam o array de estados `expandedMonths`. O mês atual é destacado com uma etiqueta "ATUAL" e um fundo diferenciado para facilitar a navegação rápida.

### [2026-04-17 (Update 3)] - Correção de Bugs de Runtime
*   **Mudança**: Remoção de referências inexistentes (`setIsLoaded`) e correção de imports (`useMemo`).
*   **Lógica**: Limpeza de código órfão resultante da transição de responsabilidade de carregamento entre contextos, garantindo que o sistema não trave por erros de referência.

