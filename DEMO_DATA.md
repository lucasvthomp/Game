# Demo data mode

Marcamar includes fictional, clearly labelled records so the complete MVP can be
tested before real operators join the pilot.

Demo mode is enabled by default while the product is being tested. On startup it
creates one verified demo captain, one verified demo driver, one passenger, and
four future rides (three lanchas and one carona). Every demo ride description is
prefixed with `[DEMO]` and appears in the UI as **Exemplo de teste**.

## Test accounts

All three accounts use the password `marcamar-demo`:

- `demo.capitao@marcamar.test`
- `demo.motorista@marcamar.test`
- `demo.passageiro@marcamar.test`

## Removing demo records for launch

1. Set `DEMO_DATA=false` in Railway (and in local `.env`) before launch. New
   demo records will no longer be created.
2. Remove existing fictional rows from the database once, in dependency order:

```sql
DELETE FROM reservations
WHERE ride_id IN (SELECT id FROM rides WHERE description LIKE '[DEMO]%');

DELETE FROM rides WHERE description LIKE '[DEMO]%';

DELETE FROM captain_profiles
WHERE user_id IN (SELECT id FROM users WHERE username = 'demo-capitao');

DELETE FROM driver_profiles
WHERE user_id IN (SELECT id FROM users WHERE username = 'demo-motorista');

DELETE FROM users
WHERE username IN ('demo-capitao', 'demo-motorista', 'demo-passageiro');
```

This keeps the switch to real pilot data explicit and reversible during
development.
