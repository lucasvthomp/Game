# Demo data mode

Marcamar inclui registros fictícios, claramente identificados, para testar o MVP antes do piloto.

O modo de demonstração fica ativo por padrão durante os testes. No início da aplicação são criados um capitão, um passageiro e três viagens de lancha em Ilhabela. As descrições usam o prefixo `[DEMO]` e aparecem na interface como **Exemplo de teste**.

## Contas de teste

As contas usam a senha `marcamar-demo`:

- `demo.capitao@marcamar.test`
- `demo.passageiro@marcamar.test`

## Remover dados de demonstração

1. Defina `DEMO_DATA=false` no Railway (e no `.env` local) antes do lançamento. Novos registros de demonstração deixarão de ser criados.
2. Remova uma vez os registros fictícios, na ordem abaixo:

```sql
DELETE FROM messages
WHERE reservation_id IN (
  SELECT id FROM reservations
  WHERE ride_id IN (SELECT id FROM rides WHERE description LIKE '[DEMO]%')
);

DELETE FROM incidents
WHERE reservation_id IN (
  SELECT id FROM reservations
  WHERE ride_id IN (SELECT id FROM rides WHERE description LIKE '[DEMO]%')
);

DELETE FROM reviews
WHERE ride_id IN (SELECT id FROM rides WHERE description LIKE '[DEMO]%');

DELETE FROM reservations
WHERE ride_id IN (SELECT id FROM rides WHERE description LIKE '[DEMO]%');

DELETE FROM rides WHERE description LIKE '[DEMO]%';

DELETE FROM captain_profiles
WHERE user_id IN (SELECT id FROM users WHERE username = 'demo-capitao');

DELETE FROM users
WHERE username IN ('demo-capitao', 'demo-passageiro');
```

A chave é reversível durante o desenvolvimento: basta remover `DEMO_DATA=false` para recriar os dados fictícios.
