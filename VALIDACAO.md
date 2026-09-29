# Validação da entrega

Executado no ambiente de desenvolvimento:

- **25/25 testes automatizados aprovados** (`npm test`).
- Cobertura de centavos, datas, fim de mês, ano bissexto, parcelas entre anos, recorrência, competências personalizadas, migração de schemas 1/2 → 3, migração da estrutura atual do GitHub, registros sem ano, conflitos, limpeza, realizado, pagamentos parciais, remoção de baixa, Banco Economia, falhas de gravação, retry de transação e escolha de persistência de sessão.
- Verificação de sintaxe de `js/app.js`, `js/finance.js`, `js/repository.js` e `tests/browser-check.cjs` com Node.
- Verificação estrutural do HTML: 109 IDs únicos, sem IDs duplicados e todos os IDs referenciados por `app.js` presentes no documento.
- O teste de navegador foi atualizado para cobrir alerta direcionável, swipe, sidebar recolhível, XSS, parcelas, legado, pagamento parcial, Banco Economia, falhas de gravação e overflow em 320, 375, 390, 768 e 1440 px.

## Limitações do ambiente

- `npm run test:browser` não pôde ser concluído aqui. A instalação do Playwright excedeu o limite de execução do ambiente e o Chromium local bloqueou navegação local por política administrativa. O projeto mantém `playwright` em `devDependencies`; em ambiente local comum, rode `npm install` e depois `npm run test:browser`.
- As regras Firestore devem ser publicadas/validadas em um projeto Firebase de teste antes do deploy da aplicação.
- Nenhuma conta real, documento Firestore de produção ou regra publicada foi alterada nesta revisão.

## Estado desta revisão

A lógica financeira pura está validada por testes automatizados. O próximo gate antes de publicação é executar o teste E2E de navegador e, em seguida, testar a migração contra uma cópia dos documentos reais atuais do Firebase.
