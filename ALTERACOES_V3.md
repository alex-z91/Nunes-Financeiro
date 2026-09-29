# Alterações V3 — fusão seletiva com o projeto do GitHub

A versão Finstack continua sendo a base oficial. As funcionalidades relevantes do projeto antigo foram trazidas para a arquitetura nova, sem reintroduzir o `app.js` monolítico ou a interface anterior.

## Dados e finanças

- `schemaVersion` atualizado para **3**.
- Pagamento/recebimento agora é um histórico de baixas (`payments[]`) por ocorrência.
- Suporte real a pagamento parcial, múltiplas baixas e remoção de uma baixa específica.
- Fluxo realizado usa a data efetiva de cada baixa; previsão continua usando a competência do lançamento.
- Competências personalizadas permitem meses não consecutivos com o mesmo valor por competência.
- Migrador específico para formatos encontrados no GitHub (`FixaAte`, `Extra`, `Variável`, `mesesPorAno`, `statusPagamento` e `economia`).
- Lançamentos permanentes antigos sem início conhecido continuam pendentes em vez de receber uma data inventada.

## Banco Economia

- Nova página integrada ao design Finstack.
- Depósitos e retiradas com data, motivo e valor.
- Saldo da reserva calculado separadamente do fluxo de receitas/despesas.
- Operações protegidas pelo mesmo mecanismo de revisão/concorrência do restante do sistema.

## Conta e perfil

- Campo opcional `apelido`; o header usa apelido → nome como fallback.
- Tema/fonte podem ser preservados no perfil da nuvem.
- Perfis da versão anterior com `apelido`, `temaPadrao` e `fontePadrao` passam a ser compatíveis com as novas regras.
- Checkbox “Manter conectado neste dispositivo”: sessão local somente quando o usuário escolhe.

## PWA

- `manifest.webmanifest`.
- Ícones 192 e 512 px.
- `service-worker.js` com cache do shell da interface.
- `display: standalone` e meta tags para experiência instalada.

## UX

- Bottom navigation passou a cinco destinos: Início, Receitas, Despesas, Economia e Ajustes.
- Swipe acompanha a mesma ordem no mobile.
- Modal de pagamento mostra previsto, total já pago/recebido, restante e histórico de baixas.
- Competências personalizadas usam chips removíveis dentro do modal de lançamento.
