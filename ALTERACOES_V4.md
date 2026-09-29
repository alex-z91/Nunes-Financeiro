# Alterações V4 — Dashboard enxuta e leitura financeira completa

## Primeira dobra
- Remove o badge visual de sincronização quando a conexão está normal; o status continua acessível e reaparece ao carregar, salvar ou ficar offline.
- Remove o rótulo editorial `Overview` e compacta cabeçalho + seletor de período.
- Troca o hero único por quatro cards financeiros que respondem o mês de forma direta:
  - Receitas previstas, recebido no mês e a receber.
  - Despesas previstas, pago no mês e a pagar.
  - Balanço realizado (fluxo efetivo do mês).
  - Previsão de fechamento (receitas previstas − despesas previstas).
- Mantém as ações rápidas de Receita e Despesa fora dos cards para reduzir ruído.

## Próximos compromissos
- O antigo `Lançamentos do mês` virou `Próximos compromissos`.
- A dashboard não cresce indefinidamente: mostra no máximo 5 despesas por filtro.
- Filtros rápidos em pills: `A pagar`, `Atrasadas` e `Pagas`.
- `A pagar` prioriza contas atrasadas e depois ordena pelas próximas datas.
- O rodapé informa quando existem mais itens que os exibidos.
- `Ver todas as despesas` encaminha para a página completa de Despesas.

## Leitura do mês
- O antigo card grande de análise foi reduzido para um bloco compacto com comprometimento e situação do mês.

## Anotações
- Continuam disponíveis, mas ficam recolhidas por padrão em `Anotações rápidas`, liberando espaço nobre da dashboard.

## Interações
- Mantidas as animações de entrada dos indicadores, swipe mobile, sidebar recolhível e microinterações existentes.
- O service worker foi atualizado para cache `v4`, evitando que a PWA mantenha assets antigos após a publicação.
