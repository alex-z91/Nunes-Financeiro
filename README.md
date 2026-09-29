# Meu Financeiro

Aplicação web pessoal para organizar receitas, despesas, competências, pagamentos realizados e reservas financeiras.

## Estrutura

- `index.html` — interface e acessibilidade
- `styles.css` — design system responsivo/mobile-first
- `js/app.js` — interação e estado da interface
- `js/finance.js` — regras financeiras puras e migrações de dados
- `js/repository.js` — autenticação, persistência e concorrência no Firestore
- `firestore.rules` — isolamento e integridade dos dados
- `manifest.webmanifest` + `service-worker.js` — shell PWA
- `tests/` — testes unitários e validação de navegador

## Funcionalidades principais

- receitas e despesas únicas, parceladas, mensais ou por competências personalizadas;
- pagamentos/recebimentos parciais com histórico de baixas;
- previsto separado do realizado pela data efetiva da baixa;
- Banco Economia para depósitos e retiradas da reserva;
- concorrência por transações/revisões para evitar sobrescrita silenciosa;
- migração específica da estrutura atualmente encontrada no repositório antigo do GitHub;
- alertas de revisão clicáveis que levam ao lançamento exato;
- sidebar integrada/recolhível no desktop e bottom navigation com swipe no mobile;
- persistência de login opcional por dispositivo;
- PWA instalável com cache do shell da interface.

## Rodar localmente

```bash
npm install
npm start
```

Acesse `http://127.0.0.1:8000`.

## Testes

```bash
npm test
npm run test:browser
npm run test:all
```

O teste de navegador usa Playwright e valida fluxos críticos, overflow e navegação em diferentes larguras.

## Dados e migração

O formato atual é `schemaVersion: 3`. Versões 1 e 2 são promovidas sem perder lançamentos. O migrador também reconhece estruturas do projeto atual no GitHub, incluindo `FixaAte`, `Extra`, `Variável`, `statusPagamento` parcial e `economia`.

Registros sem competência confiável continuam como `pendingReview` e ficam fora dos totais. Nenhuma data desconhecida é inventada. Quando o sistema anterior possuía apenas o mês de um pagamento, a competência é preservada e a data exata permanece marcada como não registrada.

## Interface visual

A interface segue a direção Finstack: Urbanist, canvas off-white, superfícies brancas, preto como interação primária e verde `#1BFF85` apenas como acento. Consulte `DESIGN_SYSTEM.md` e `ALTERACOES_V3.md`.
