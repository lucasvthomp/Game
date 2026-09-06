# Verification research and launch boundary

This note records the safe MVP decision for the São Paulo launch. It is product/engineering guidance, not legal advice.

## What the official services expose

- The [Polícia Federal certificate service](https://www.gov.br/pf/pt-br/assuntos/carta-de-servicos/antecedentes-criminais) lets a person issue a Federal Police criminal-background certificate and provides an official validation flow. We did not find a documented public API for arbitrary third-party lookups. Marcamar must not scrape the site or imply that it can query the Federal Police database.
- The [SERPRO Datavalid service](https://centraldeajuda.serpro.gov.br/duvidas/pt/avisos/datavalidsenatran/) is a potential future provider for contracted biographic/facial/liveness and document validation. It requires commercial onboarding, controlled credentials, a defined purpose, and a separate adapter. It is not enabled by the `manual` MVP configuration.
- The Brazilian Navy DPC describes the [Carteira de Habilitação de Amador (CHA)](https://www.marinha.mil.br/dpc/carta-de-servicos/carteira-de-habilita%C3%A7%C3%A3o-de-amador-cha) and the [inscrição de embarcações](https://www.marinha.mil.br/dpc/carta-de-servicos/inscri%C3%A7%C3%A3o-de-embarca%C3%A7%C3%B5es). The operator workflow therefore requests the applicable nautical credential and the vessel registration/TIE for staff review. No public real-time DPC verification API is assumed.

## Current Marcamar implementation

1. A user can upload an identity document or an official criminal-background certificate from Profile, with an explicit review consent.
2. A captain must have a profile photo before requesting approval.
3. Captain onboarding stores the nautical credential and optional TIE/registration upload as `boat_license` and `boat_registration` submissions.
4. Every submission starts as `pending`, records the provider as `manual`, and is visible only to the authenticated user and the admin review queue.
5. Staff can approve, reject, or request review. Each decision records the reviewer and an audit event.
6. The first staff account is created only when `ADMIN_EMAIL` and a 12+ character `ADMIN_PASSWORD` are explicitly set in the deployment environment.

## Provider adapter boundary

Do not mark a submission as automatically verified unless a contracted provider returns a verifiable reference and the result is stored with a purpose, consent record, retention rule, and failure path. A future Datavalid integration should sit behind a server-side provider adapter; browser code must never receive provider secrets.

## Data protection

Identity images, profile photos, biometric signals, and criminal-background information are personal or potentially sensitive data. The product drafts at `/termos` and `/privacidade` are São Paulo-only launch drafts and require the final legal entity, DPO contact, retention periods, vendor list, and Brazilian counsel review before public launch.
