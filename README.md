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

Em desenvolvimento, o front chama a API pelo próprio endereço (`/v1/...`) e o Vite repassa para `API_PROXY_TARGET` (`.env.development`: `http://localhost:8081`). Por isso não precisa de CORS nem de IP fixo. Em produção, defina `VITE_API_URL` com a URL da API no build.

### Testar no celular

Com o celular na mesma rede Wi-Fi:

```bash
npm run dev:lan
```

O Vite mostra o endereço de rede (ex.: `Network: http://192.168.0.7:5173/`); abra esse endereço no celular. Se não carregar, libere a porta no firewall da máquina:

```bash
sudo ufw allow from 192.168.0.0/24 to any port 5173 proto tcp
```

## Scripts

| Comando           | O que faz |
|-------------------|-----------|
| `npm run dev`     | Servidor de desenvolvimento em http://localhost:5173 |
| `npm run dev:lan` | O mesmo, acessível pela rede (celular no mesmo Wi-Fi) |
| `npm run build`   | Checa os tipos e gera o build em `dist/` |
| `npm run lint`    | oxlint |
| `npm run preview` | Serve o build localmente |
| `npm test`        | Roda os testes uma vez (Vitest) |
| `npm run test:watch` | Testes em modo observação |
| `npm run generate:api` | Gera `src/api/schema.ts` a partir do `openapi.yaml` da API |

## Tipos da API

Os tipos de `src/api/types.ts` vêm de `src/api/schema.ts`, gerado a partir do contrato da API (`entregador/api/openapi.yaml`, também visível em http://localhost:8081/swagger). Quando a API mudar:

```bash
npm run generate:api                                   # usa ../entregador/api/openapi.yaml
OPENAPI_SPEC=http://localhost:8081/swagger/openapi.yaml npm run generate:api
```

Não edite `schema.ts` à mão. Se um campo mudar de nome ou tipo, o `npm run build` aponta onde o front precisa ser ajustado.

## Testes

[Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com) + [MSW](https://mswjs.io). Os testes renderizam as telas como o usuário vê e o MSW simula a API (`src/test/server.ts`, com dados em memória tipados pelo contrato da API). Para simular uma falha num teste, sobrescreva a rota com `server.use(...)`.

## CI

`.github/workflows/ci.yml` roda a cada push e pull request em `main` e `develop`: lint (oxlint) + checagem de tipos, testes unitários e, se os dois passarem, o build (o `dist/` fica como artefato por 7 dias). O Dependabot abre PRs semanais com atualizações de dependências. A versão do Node fica em `.nvmrc`.

## Estrutura

```
src/
├── api/                     # Cliente HTTP, tipos (gerados do OpenAPI) e chamadas da API
├── components/              # Componentes compartilhados (ex.: botão de tema)
├── features/deliveries/     # Tela de entregas: lista, ações, modal de nova entrega, queries
├── App.tsx                  # Layout (cabeçalho + página)
├── main.tsx                 # Providers: Mantine, React Query, modais e notificações
└── test/                    # Setup dos testes, servidor MSW, fixtures e render com providers
```
