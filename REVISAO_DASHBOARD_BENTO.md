# Revisão Dashboard Bento — 28/09/2026

Esta entrega altera somente a primeira tela para evitar misturar muitas mudanças na mesma rodada.

## Aplicado
- Dashboard mobile-first em bento grid.
- Receita e Despesa como indicadores de maior hierarquia.
- Receita mostra previsto, recebido e a receber.
- Despesa mostra previsto, pago e a pagar.
- Balanço realizado, balanço previsto e comprometimento agrupados no card de Fluxo.
- Indicadores de progresso de recebimentos e pagamentos.
- Próximos compromissos limitados a 5 itens.
- Filtros rápidos: A pagar, Atrasadas e Pagas.
- Período integrado ao cabeçalho da visão financeira.
- Remoção visual da mensagem permanente de sincronização; estados de conexão passam para notificações.
- Mais respiro, alinhamento e diferenças de hierarquia entre cards.
- Cores contextuais suaves em Receita e Despesa.
- Cards de Receita e Despesa levam às páginas correspondentes.
- Movimentações e confirmações antigas preservadas em painel recolhível abaixo da dashboard para não perder funções.

## Adiado para a próxima rodada
- Novo extrato dentro de Minhas Receitas.
- Novo extrato dentro de Minhas Despesas.
- Filtros avançados por período, categoria, valor e status nessas páginas.
- Reorganização das listas de Receitas e Despesas em linhas mais compactas.
- Paginação/carregamento progressivo dos extratos.

## Validação
- `node --check js/app.js`: aprovado.
- `npm test`: 16/16 testes aprovados.
- Teste E2E com Playwright não executado porque Playwright não está instalado neste ambiente.
