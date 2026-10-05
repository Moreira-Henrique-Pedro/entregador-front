# entregador-front

Front web da portaria do [Entregador](https://github.com/Moreira-Henrique-Pedro/entregador): lista as entregas, registra novas e marca como retiradas. Responsivo (PC e celular).

Stack: Vite + React + TypeScript, [Mantine](https://mantine.dev) (componentes), [TanStack Query](https://tanstack.com/query) (chamadas à API).

## Rodando

1. Suba a API (no repositório `entregador`): `make up`. Localmente ela roda sem autenticação (`AUTH_ENABLED=false` no `.env.test`) e já libera o CORS para `http://localhost:5173`.
2. Aqui:

```bash
npm install
npm run dev     # http://localhost:5173
```

A URL da API vem de `VITE_API_URL` (`.env.development`: `http://localhost:8081`).

## Scripts

| Comando           | O que faz |
|-------------------|-----------|
| `npm run dev`     | Servidor de desenvolvimento em http://localhost:5173 |
| `npm run build`   | Checa os tipos e gera o build em `dist/` |
| `npm run lint`    | oxlint |
| `npm run preview` | Serve o build localmente |

## Estrutura

```
src/
├── api/                     # Cliente HTTP, tipos e chamadas da API
├── features/deliveries/     # Tela de entregas: lista, ações, modal de nova entrega, queries
├── App.tsx                  # Layout (cabeçalho + página)
└── main.tsx                 # Providers: Mantine, React Query, modais e notificações
```
