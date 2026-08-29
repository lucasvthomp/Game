# MVP status

Updated: 2026-08-29

Este repositório é um protótipo MVP funcional do Marcamar, com experiência em português, responsiva e focada em viagens de lancha costeira.

## Entregue no protótipo

- Landing page responsiva e navegação compartilhada, com títulos curtos e seção Comercial.
- Dropdowns de site com autocomplete, sem controles nativos nas jornadas principais.
- Busca por embarque, desembarque, data e passageiros, com praias de Ilhabela e litoral paulista.
- Resultados de lanchas com mapa, ordenação, filtro de preço, estados vazios e pedido de rota.
- Mapa interativo com clique e arraste para posicionar os pins de embarque e desembarque.
- Detalhe da viagem com capitão, reservas, mensagens, check-in, conclusão, incidentes, avaliações e condições marítimas.
- Condições marítimas via Open-Meteo Marine API, com fonte e aviso visíveis no detalhe.
- Cadastro e aprovação de capitães, rotas marítimas e incidentes no painel administrativo.
- Waitlist pública para transporte comercial de pessoas e cargas.
- Dados fictícios de teste opcionais e documentados, além de migrações de inicialização, CI e configuração de deploy Railway.

## Endurecimento recomendado antes de cobrar

- Registro de verificação por documento e armazenamento privado com retenção/exclusão.
- Pagamentos PIX/cartão, webhooks, reembolsos e repasses com provedor brasileiro definido.
- Armazenamento durável para uploads.
- Transações de capacidade e suíte de concorrência para reservas.
- Console operacional/financeiro completo, notificações externas, analytics e apps nativos.

Consulte [PROJECT_AUDIT.md](PROJECT_AUDIT.md) para o diagnóstico original e os riscos de migração.
