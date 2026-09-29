# R1 — Dashboard Bento

Base: `meu-financeiro-finstack-v3-integrado`.

Esta rodada altera somente a dashboard. As telas de Receitas, Despesas, Economia, Configurações, o schema V3 e a persistência permanecem com a mesma arquitetura.

## Aplicado

- Remoção do `Overview` acima do título.
- Título `Visão financeira` aproximado do header.
- Período integrado ao cabeçalho da dashboard e usado como contexto global da tela.
- Bento grid mobile-first com 4 blocos funcionais.
- Receita e Despesa são os indicadores de maior hierarquia.
- Receita mostra: previsto, recebido e a receber.
- Despesa mostra: previsto, pago e a pagar.
- Fluxo reúne balanço atual, balanço previsto, comprometimento e gráfico de progresso previsto x realizado.
- Compromissos mostra no máximo 5 despesas pendentes, priorizando atrasadas e depois vencimentos mais próximos.
- Clique em Receita, Despesa ou Fluxo abre um resumo detalhado sem lotar a dashboard.
- Clique em um compromisso abre a baixa daquele lançamento.
- Anotações continuam disponíveis, mas abaixo da primeira dobra.
- Cores contextuais suaves foram mantidas para Receita e Despesa.
- A mensagem permanente “Dados carregados…” deixa de ocupar espaço quando a conexão está pronta; a confirmação passa a usar o aviso temporário já existente.
- Contadores e barras continuam com animação leve no primeiro acesso da sessão.

## Não alterado nesta rodada

- Estrutura das telas `Minhas receitas` e `Minhas despesas`.
- Novo extrato por período.
- Filtros avançados.
- Lista em linha nas páginas de Receita e Despesa.
- Arquitetura Firestore/paginação.
- Modelo financeiro V3.

## Validação

- `node --check js/app.js`: aprovado.
- `node --check tests/browser-check.cjs`: aprovado.
- `npm test`: 25/25 testes aprovados.
- O teste de navegador foi atualizado para os novos indicadores da dashboard, mas depende do Playwright instalado no ambiente para execução completa.
