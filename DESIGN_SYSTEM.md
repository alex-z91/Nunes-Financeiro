# Design System — Meu Financeiro / direção Finstack

## Princípio visual

A interface usa linguagem fintech editorial: canvas off-white, superfícies brancas, preto como interação primária e verde neon somente como acento/status. A hierarquia vem de tipografia, espaçamento, composição e movimento curto — não de sombras pesadas ou blocos saturados.

## Tipografia

- Primária: Urbanist
- H1: 28–38px / 500
- Título de card: 12–17px / 500–600
- KPI: 27–42px / 600
- Corpo: 13–16px / 400–500
- Micro labels: 9–11px / 500–600

## Cores

- Canvas: `#F7F7F5`
- Surface: `#FFFFFF`
- Soft surface: `#F1F2F0`
- Muted surface: `#EEF0F2`
- Texto: `#101010`
- Texto secundário: `#777A78`
- Preto primário: `#000000`
- Accent green: `#1BFF85`
- Positivo: `#0E9F62`
- Negativo: `#E86472`

## Radius

- Small: 10px
- Medium: 14px
- Large cards: 20px
- Pills: 999px

## Navegação

### Desktop

A sidebar é integrada ao shell da página, sem aparência de card flutuante. Aberta, usa aproximadamente 230px e mostra ícone + rótulo. Recolhida, ocupa cerca de 76px e mantém os ícones. O estado recolhido é preservado no navegador.

O último item é Configurações e abre um menu contextual com:

- Configurações
- Sair

O cabeçalho contém foto + saudação do usuário. No lado direito ficam os atalhos de notificações e logout.

### Mobile e tablet

Até 899px a navegação principal é inferior, com cinco destinos. O usuário pode navegar também com swipe horizontal entre:

`Início → Receitas → Despesas → Economia → Ajustes`

Inputs, botões, selects e dialogs bloqueiam a captura de swipe para não interferir com formulários.

## Cards

Cards usam superfícies brancas, borda neutra de 1px e pouca ou nenhuma sombra. O balanço é o KPI herói. Receita e despesa são métricas secundárias com gradientes contextuais extremamente suaves.

## Alertas acionáveis

Alertas de migração/revisão não são apenas informativos. Cada item é clicável, abre a página correta, rola até o lançamento que originou o problema e aplica destaque temporário para orientar a correção.

## Microinterações

- hover curto em botões, cards e navegação;
- feedback `active` por escala;
- sidebar com transição de largura;
- popover de configurações com entrada curta;
- transição direcional entre páginas;
- destaque animado ao navegar para um erro;
- indicador de conexão pulsante;
- KPIs e anel de comprometimento contam do zero na primeira carga da sessão;
- animações respeitam `prefers-reduced-motion`.

## Ícones

Lucide, aproximadamente 18px com `stroke-width: 1.65`. Ícones permanecem neutros; verde/vermelho são reservados para significado financeiro.


## Banco Economia

A área de reserva usa o mesmo vocabulário visual do dashboard, mas permanece conceitualmente separada do fluxo mensal. O saldo guardado é apresentado como KPI próprio; depósitos usam semântica positiva e retiradas usam semântica negativa sem colorir superfícies inteiras.

## Pagamentos parciais

A baixa financeira é tratada como histórico, não como simples toggle. O modal apresenta previsto, realizado, restante e baixas anteriores. Isso permite comunicar estados `Pendente`, `Parcial` e `Integral` sem introduzir cores ou componentes fora do design system.
