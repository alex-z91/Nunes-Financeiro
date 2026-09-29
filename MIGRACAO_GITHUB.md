# Mapeamento de migração — GitHub atual → schema 3

A aplicação lê os documentos atuais sem regravá-los automaticamente. A conversão só é persistida quando o usuário realiza uma alteração, dentro da mesma transação que salva essa alteração.

## Receitas

| Formato anterior | Schema 3 |
|---|---|
| `Extra` + `mesesPorAno` | `mode: custom`, uma ocorrência por competência, mesmo valor em cada competência |
| `FixaAte` + `intervaloCompleto` | `mode: monthly`, uma ocorrência por mês do intervalo |
| `Fixa` sem início | `pendingReview: true`; nenhum mês é inventado |

## Despesas

| Formato anterior | Schema 3 |
|---|---|
| `Variável` + `mesesPorAno` | `mode: custom` |
| `FixaAte` + `intervaloCompleto` | `mode: monthly` |
| `Fixa` sem início | `pendingReview: true` |

## Status de pagamento

- `Pago` vira uma baixa de 100% do valor da competência.
- `Parcial` vira uma baixa no valor de `valorParcial`.
- O sistema anterior armazenava mês/ano do status, mas não a data exata da baixa. Por isso a migração marca essa baixa como `estimated: true`.
- O mês do realizado é preservado; a UI informa que a data exata não foi registrada anteriormente.

## Banco Economia

- `Depósito` → `kind: deposit`.
- `Saque` ou valor negativo → `kind: withdraw`.
- `motivo`, valor e data são preservados.

## Perfil

As novas regras aceitam os campos usados pela versão antiga: `apelido`, `temaPadrao` e `fontePadrao`, além de `nome`, `sobrenome`, `email` e `fotoPerfil`.

O tema antigo `margaridas` não é transportado para o novo design system. Ao abrir a aplicação ele cai de forma segura no tema atual claro/escuro, sem impedir a atualização do perfil.
