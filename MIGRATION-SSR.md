# Plano de Migração SSR — De Client Components para Server Components

## Visão Geral

Migração do projeto de 100% Client-Side Rendering para Server-Side Rendering (SSR) usando React Server Components do Next.js App Router.

**Objetivo:** Segurança (token não exposto ao client, dados fetchados no server) e preparação para hub.

---

## Fase Concluída: Home Page

### Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `lib/server-api.ts` | Helper de API server-side. Lê cookie `authUser` via `next/headers`, retorna instância com `get()` e `post()` que incluem header `{ token }` automaticamente. |
| `app/home/home-client.tsx` | Client Component (`'use client'`) com toda a UI do dashboard: KpiCards, StatusBadge, ChartOverView, pedidos recentes. Recebe `user` e `initialData` via props. |
| `app/home/page.tsx` | **Reescrito** como Server Component async. Busca dados dos 3 endpoints (`/pedidos/totais`, `/pedidos/totais-por-data`, `/pedidos/ultimos`) via `Promise.all` no server. Passa dados serializados para `<HomeClient />`. |

### Padrão Aplicado

```
page.tsx (Server Component, async)
  → lê cookie via getServerApi()
  → busca dados via fetch() no server
  → serializa dados
  → renderiza <ClientComponent dados={dados} />

client-component.tsx ('use client')
  → recebe dados via props
  → renderiza UI interativa
  → usa useRouter() para navegação
```

---

## Fase 1: Cadastros — Listas (7 páginas) — ✅ Concluída

### Padronização

Todas as páginas de lista de cadastros seguem o **mesmo padrão**:

```
'use client'
useAuth() → token
configApi() → axios
useState(pesquisa, dados, isLoading, filtroAtivo)
useEffect → auth redirect, debounced search, fetch
Render: header + Input search + filtro ativo/inativo + Table
```

### Páginas a Migrar

| Rota | Arquivo |
|------|---------|
| `/cadastros/clientes` | `app/cadastros/clientes/page.tsx` |
| `/cadastros/produtos` | `app/cadastros/produtos/page.tsx` |
| `/cadastros/servicos` | `app/cadastros/servicos/page.tsx` |
| `/cadastros/veiculos` | `app/cadastros/veiculos/page.tsx` |
| `/cadastros/marcas` | `app/cadastros/marcas/page.tsx` |
| `/cadastros/categorias` | `app/cadastros/categorias/page.tsx` |
| `/cadastros/perfis` | `app/cadastros/perfis/page.tsx` |

### Arquivo a Criar

**`app/cadastros/_components/cadastro-lista-client.tsx`** — Componente reutilizável que recebe:
- `title: string` — título da página
- `entityPath: string` — rota base (ex: `/cadastros/marcas`)
- `data: any[]` — dados iniciais buscados no server
- `columns: { key: string; label: string; width?: string }[]` — configuração das colunas
- `searchParam?: string` — nome do parâmetro de busca na API (padrão: `descricao`)
- `extraFilters?: ReactNode` — filtros extras (ex: selects de marca/categoria em produtos)

Gerencia internamente:
- `pesquisa` + debounce para refetch client-side
- `filtroAtivo` (S/N/all)
- Loading e error states
- Navegação para edição (`router.push(${entityPath}/${codigo})`)
- Botão "Novo" (`router.push(${entityPath}/novo)`)

### Alteração por page.tsx

Cada `page.tsx` vira Server Component:

```tsx
import { getServerApi } from "@/lib/server-api";
import { redirect } from "next/navigation";
import { CadastroListaClient } from "../_components/cadastro-lista-client";

export default async function MarcasPage() {
  const api = getServerApi();
  if (!api) redirect("/");

  const dados = await api.get("/marcas/search", { ativo: "S" });

  return (
    <CadastroListaClient
      title="Marcas"
      entityPath="/cadastros/marcas"
      data={dados}
      columns={[
        { key: "codigo", label: "Código", width: "10%" },
        { key: "descricao", label: "Descrição", width: "75%" },
      ]}
    />
  );
}
```

### Diferenças por Entidade

| Entidade | API Endpoint | Colunas | Filtros Extras |
|----------|-------------|---------|----------------|
| Clientes | `/clientes/search` | Código, Nome, CNPJ, Contato, Status | — |
| Produtos | `/produtos/search` | Foto, Código, Descrição, Preço, Estoque, Status | Select Marca, Select Categoria |
| Serviços | `/servicos/search` | Código, Aplicação, Valor, Status | — |
| Veículos | `/veiculos/search` | Código, Descrição, Status | — |
| Marcas | `/marcas/search` | Código, Descrição, Status | — |
| Categorias | `/categorias/search` | Código, Descrição, Status | — |
| Perfis | `/perfis/search` | Código, Descrição, Status | — |

---

## Fase 2: Cadastros — Formulários (14 páginas) — ✅ Concluída

### Páginas de Edição (`[codigo]`)

| Rota | Arquivo |
|------|---------|
| `/cadastros/clientes/[codigo]` | `app/cadastros/clientes/[codigo]/page.tsx` |
| `/cadastros/produtos/[codigo]` | `app/cadastros/produtos/[codigo]/page.tsx` |
| `/cadastros/servicos/[codigo]` | `app/cadastros/servicos/[codigo]/page.tsx` |
| `/cadastros/veiculos/[codigo]` | `app/cadastros/veiculos/[codigo]/page.tsx` |
| `/cadastros/marcas/[codigo]` | `app/cadastros/marcas/[codigo]/page.tsx` |
| `/cadastros/categorias/[codigo]` | `app/cadastros/categorias/[codigo]/page.tsx` |
| `/cadastros/perfis/[codigo]` | `app/cadastros/perfis/[codigo]/page.tsx` |

**Padrão:**

```tsx
// page.tsx — Server Component
import { getServerApi } from "@/lib/server-api";
import { redirect, notFound } from "next/navigation";
import { ClienteFormClient } from "./cliente-form-client";

type Props = { params: { codigo: string } };

export default async function EditarClientePage({ params }: Props) {
  const api = getServerApi();
  if (!api) redirect("/");

  const dados = await api.get(`/clientes/${params.codigo}`);
  if (!dados) notFound();

  return <ClienteFormClient dados={dados} />;
}
```

O componente client (`cliente-form-client.tsx`) recebe os dados iniciais e gerencia:
- Estado do formulário (`useState` para cada campo)
- Submissão (`gravar()` com POST/PUT)
- Validações
- Feedback (AlertDemo)

### Páginas de Novo

| Rota | Arquivo |
|------|---------|
| `/cadastros/clientes/novo` | `app/cadastros/clientes/novo/page.tsx` |
| `/cadastros/produtos/novo` | `app/cadastros/produtos/novo/page.tsx` |
| `/cadastros/servicos/novo` | `app/cadastros/servicos/novo/page.tsx` |
| `/cadastros/veiculos/novo` | `app/cadastros/veiculos/novo/page.tsx` |
| `/cadastros/marcas/novo` | `app/cadastros/marcas/novo/page.tsx` |
| `/cadastros/categorias/novo` | `app/cadastros/categorias/novo/page.tsx` |
| `/cadastros/perfis/novo` | `app/cadastros/perfis/novo/page.tsx` |

**Padrão:** Podem continuar `'use client'` (formulário vazio, sem benefício de SSR) OU serem Server Components que apenas delegam para o form client.

**Recomendação:** Converter para Server Component + client form para manter consistência:

```tsx
// page.tsx — Server Component
import { redirect } from "next/navigation";
import { getServerApi } from "@/lib/server-api";
import { ClienteFormClient } from "../[codigo]/cliente-form-client";

export default async function NovoClientePage() {
  const api = getServerApi();
  if (!api) redirect("/");
  // Formulário vazio — dados iniciais zerados
  return <ClienteFormClient dados={null} />;
}
```

### Implementação Realizada

Em vez de um único `cadastro-form-client.tsx` genérico, foram criados **form clients por entidade** (cada um gerencia o submit POST/PUT com o token do AuthContext) e as páginas `novo`/`[codigo]` viraram thin Server Components que buscam os dados iniciais via `getServerApi()`:

| Entidade | Form Client | Fetch inicial (edit) | POST (novo) | PUT (edit) |
|----------|-------------|----------------------|-------------|------------|
| Marcas | `app/cadastros/marcas/_components/marcas-form-client.tsx` | `GET /marcas?codigo=` → `[0]` | `/offline/marcas` | `/next/marcas` |
| Categorias | `app/cadastros/categorias/_components/categorias-form-client.tsx` | `GET /categorias?codigo=` → `[0]` | `/offline/categorias` | `/next/categorias` |
| Serviços | `app/cadastros/servicos/_components/servicos-form-client.tsx` | `GET /servicos/search?codigo=` | `/servicos` | `/servicos` |
| Veículos | `app/cadastros/veiculos/_components/veiculos-form-client.tsx` | `GET /veiculos/search?codigo=` → `[0]` | `/veiculos` | `/veiculos` |
| Clientes | `app/cadastros/clientes/_components/clientes-form-client.tsx` | `GET /clientes/{codigo}` | `/cliente` | `/cliente` |
| Produtos | `app/cadastros/produtos/_components/produtos-form-client.tsx` | `GET /produtos/{codigo}` + `GET /fotos/produto?codigo=` | `/produtos` | `/produtos` |
| Produtos (tributação) | `app/cadastros/produtos/_components/produtos-tributacao-client.tsx` | `GET /produto/{codigo}` → `[0]` | — | `/produto` (singular) |
| Produtos (anúncios) | **100% Server Component** (sem client) | `GET /ml/anuncios?codigo_produto=` | — | — |
| Perfis | `app/cadastros/perfis/_components/perfis-form-client.tsx` | `GET /perfis/search?codigo=&withPermissoes=S` + `GET /permissoes` | — | `PUT /perfis` + `POST /perfis/{codigo}/permissoes` |

**Observações:**
- `perfis/novo` permaneceu `'use client'` (formulário vazio, sem fetch inicial — sem benefício de SSR).
- As páginas `[codigo]` usam `notFound()` quando o registro não existe (antes ficavam em loading infinito).
- `produtos/[codigo]/anuncios` virou página 100% server (navegação com `<Link>`).
- Migração dos forms: first-load de dados movido para o server (nenhum fetch inicial no client); o submit (POST/PUT) continua no client com token via header customizado (decisão mantida).

---

## Fase 3: Pedidos — ✅ Concluída

### 3.1 — Lista (`/pedidos`)

| Arquivo | Ação |
|---------|------|
| `app/pedidos/page.tsx` | ✅ Reescrever como Server Component |
| `app/pedidos/_components/pedidos-lista-client.tsx` | ✅ **Criado** — Client Component com filtros, tabela |

**Implementado:**
- `page.tsx` calcula o range de datas (1º dia do mês → hoje) e busca `GET /pedidos` no server (`vendedor` do usuário, `limit: 20`), passando `pedidosIniciais` + datas + `vendedor`.
- O client mantém a busca interativa (Buscar/Enter), filtros de situação e roteamento.
- `dynamic = "force-dynamic"` no server page.

### 3.2 — Imprimir (`/pedidos/[codigo]/imprimir`)

| Arquivo | Ação |
|---------|------|
| `app/pedidos/[codigo]/imprimir/page.tsx` | ✅ Reescrever como **100% Server Component** |
| `app/pedidos/_components/imprimir-actions.tsx` | ✅ **Criado** — botões Imprimir/Voltar (único client da página) |

**Implementado:** busca `GET /pedido` (params `{ codigo }` + header `vendedor` do usuário) no server, `notFound()` se não existir. First Load JS caiu para ~88 kB (só os botões).

**Observação:** `getServerApi().get/post` agora aceita **headers extras** (ex.: `vendedor`) — estendido em `lib/server-api.ts`.

### 3.3 — Novo Pedido (`/pedidos/novo`)

| Arquivo | Ação |
|---------|------|
| `app/pedidos/novo/page.tsx` | ✅ Server Component que gera os dados iniciais do pedido |
| `app/pedidos/_components/novo-pedido-client.tsx` | ✅ **Criado** — Client Component com formulário multi-aba |

**Implementado:** o server gera `codigo` (timestamp+vendedor), `id` (último id + 1 via `GET /pedidos` com `data: 0000-00-00`), datas e parcela inicial, e passa `dadosOrcamentoInicial` + `newId`. O client não busca mais nada no mount e mantém abas/cálculos/gravação.

### 3.4 — Editar Pedido (`/pedidos/[codigo]`)

| Arquivo | Ação |
|---------|------|
| `app/pedidos/[codigo]/page.tsx` | ✅ Server Component que busca dados do pedido |
| `app/pedidos/_components/editar-pedido-client.tsx` | ✅ **Criado** — Client Component com formulário |

**Implementado:** busca `GET /pedido` (params `{ codigo }` + header `vendedor`) no server; `notFound()` se não existir. O client recebe `pedidoInicial` e semeia todos os estados iniciais (produtos/serviços/cliente/situação/observações) a partir dele — a lógica de edição foi mantida intacta.

---

## Fase 4: Marketplaces — ✅ Concluída

| Rota | Arquivo |
|------|---------|
| `/marketplaces` | `app/marketplaces/page.tsx` |
| `/marketplaces/integracoes` | `app/marketplaces/integracoes/page.tsx` |
| `/marketplaces/consulta` | `app/marketplaces/consulta/page.tsx` |
| `/marketplaces/status` | `app/marketplaces/status/page.tsx` |

**Nota:** `layout.tsx` do marketplaces continua `'use client'` (tem sidebar/navbar próprias).

### 4.1 — Anúncios (`/marketplaces`)

| Arquivo | Ação |
|---------|------|
| `app/marketplaces/page.tsx` | ✅ Reescrever como Server Component |
| `app/marketplaces/_components/anuncios-client.tsx` | ✅ **Criado** — Client Component (grid/carrossel por plataforma + modais "Criar Anúncio") |

**Implementado:** o server busca `GET /ml/app/anuncios` (token) e passa `anunciosIniciais` ao client. O client mantém o carrossel agrupado por plataforma, o estado de refetch (`busca()` após criar anúncio) e os modais `SelectProdutoModal` + `ModalAnuncio` (submit client-side com token, decisão mantida) — removido o loading/auth-gate inicial.

### 4.2 — Integrações (`/marketplaces/integracoes`)

| Arquivo | Ação |
|---------|------|
| `app/marketplaces/integracoes/page.tsx` | ✅ Reescrever como Server Component |
| `app/marketplaces/integracoes/_components/integracoes-client.tsx` | ✅ **Criado** — Client Component (fluxos de conectar/finalizar, lista de lojas) |

**Implementado:** o server busca `GET /ml/accounts/{codigo}` e passa `integrationsInicial`. O client semeia `dataIntegration`, mantém o callback OAuth via `useSearchParams`, o fluxo `getCode`/`finalizeIntegration` e a lista de lojas vinculadas (refetch pós-conexão mantido). Removido `isLoadingList` inicial.

### 4.3 — Consulta Anúncios (`/marketplaces/consulta`)

| Arquivo | Ação |
|---------|------|
| `app/marketplaces/consulta/page.tsx` | ✅ Reescrever como Server Component |
| `app/marketplaces/consulta/_components/consulta-client.tsx` | ✅ **Criado** — Client Component (seleção de conta + tabs de anúncios) |

**Implementado:** o server busca `GET /ml/accounts/{codigo}` e passa `contasIniciais`. O client calcula o estado inicial de forma determinística a partir delas (1 conta → seleciona; >1 → abre `SelecionarContaModal`; 0 → tela "Selecione uma conta") — o `SelecionarContaModal` continua buscando contas no client ao abrir (interativo).

### 4.4 — Status (`/marketplaces/status`)

| Arquivo | Ação |
|---------|------|
| `app/marketplaces/status/page.tsx` | ✅ Reescrever como Server Component |
| `app/marketplaces/status/_components/status-client.tsx` | ✅ **Criado** — Client Component |

**Implementado:** o server busca as contas (`GET /ml/accounts/{codigo}`) filtradas por `ML` e, quando há exatamente 1 conta ML, também busca o status no server (`GET /ml/tools/status_vendedor` com header `ml_user_id`), passando `statusInicial`. O client mantém "Trocar Conta" e o refetch de status (`buscarStatusConta`) ao selecionar outra conta.

---

## Fase 5: Páginas Simples — ✅ Concluída

### `/configuracoes`

| Arquivo | Ação |
|---------|------|
| `app/configuracoes/page.tsx` | ✅ **100% Server Component** (sem client) — `router.push()` substituído por `<Link>` + `Button asChild` |

Página sem fetch: apenas dois botões de navegação ("Voltar" → `/home` e "Integrações").

### `/caracteristicas-produtos`

| Arquivo | Ação |
|---------|------|
| `app/caracteristicas-produtos/page.tsx` | ✅ Reescrever como Server Component |
| `app/caracteristicas-produtos/_components/caracteristicas-client.tsx` | ✅ **Criado** — Client Component |

**Implementado:** o server busca `GET /caracteristicas/search` (`descricao: ""`, `ativo: "S"` — filtro inicial padrão) e passa `dadosIniciais`. O client semeia a tabela com esses dados e mantém a busca com debounce, o toggle ativo/inativo (`filtroAtivo`), o botão "Novo" e a edição (`router.push` para `/[codigo]`). Um `useRef` (`primeiroRender`) evita refetch redundante no mount — `busca()` só roda após interação (pesquisa ou toggle).

### `/novaConta`
- Permanece `'use client'` (formulário público, benefício mínimo de SSR).

---

## Arquivos a Criar (Resumo)

| Arquivo | Descrição |
|---------|-----------|
| `lib/server-api.ts` | ✅ Já criado |
| `app/home/home-client.tsx` | ✅ Já criado |
| `app/cadastros/_components/cadastro-lista-client.tsx` | ✅ Já criado |
| `app/cadastros/_components/cadastro-form-client.tsx` | Substituído por form clients por entidade (ver Fase 2) |
| `app/pedidos/pedidos-client.tsx` | Client Component da lista de pedidos |
| `app/pedidos/novo/novo-pedido-client.tsx` | Client Component do form de novo pedido |
| `app/pedidos/[codigo]/editar-pedido-client.tsx` | Client Component do form de edição |
| `app/marketplaces/_components/marketplace-client.tsx` | Substituído por client por página (`anuncios-client`, `integracoes-client`, `consulta-client`, `status-client`) |

---

## Arquivos a Modificar (Resumo)

### Já Modificados
- `app/home/page.tsx` — ✅ Server Component
- 7× `app/cadastros/*/page.tsx` (listas) — ✅ Server Components (Fase 1)
- 7× `app/cadastros/*/novo/page.tsx` + 7× `app/cadastros/*/[codigo]/page.tsx` — ✅ Server Components (Fase 2)
- `app/cadastros/produtos/[codigo]/tributacao/page.tsx` — ✅ Server Component (Fase 2)
- `app/cadastros/produtos/[codigo]/anuncios/page.tsx` — ✅ 100% Server Component (Fase 2)
- `app/pedidos/page.tsx` + `app/pedidos/novo/page.tsx` + `app/pedidos/[codigo]/page.tsx` + `app/pedidos/[codigo]/imprimir/page.tsx` — ✅ Server Components (Fase 3)
- 4× `app/marketplaces/**/page.tsx` — ✅ Server Components (Fase 4)
- `app/configuracoes/page.tsx` — ✅ 100% Server Component (Fase 5)
- `app/caracteristicas-produtos/page.tsx` — ✅ Server Component (Fase 5)
- `lib/server-api.ts` — ✅ suporte a headers extras em `get`/`post`

### A Modificar — Cadastros (21 arquivos)
- 7× `app/cadastros/*/page.tsx` (listas)
- 7× `app/cadastros/*/[codigo]/page.tsx` (edição)
- 7× `app/cadastros/*/novo/page.tsx` (novo)

### A Modificar — Pedidos (4 arquivos)
- `app/pedidos/page.tsx`
- `app/pedidos/novo/page.tsx`
- `app/pedidos/[codigo]/page.tsx`
- `app/pedidos/[codigo]/imprimir/page.tsx`

### A Modificar — Marketplaces (4 arquivos) — ✅ Concluído
- `app/marketplaces/page.tsx`
- `app/marketplaces/integracoes/page.tsx`
- `app/marketplaces/consulta/page.tsx`
- `app/marketplaces/status/page.tsx`

### A Modificar — Outros (2 arquivos)
- `app/configuracoes/page.tsx` ✅
- `app/caracteristicas-produtos/page.tsx` ✅

---

## Ordem de Execução

1. Criar `cadastro-lista-client.tsx` (componente reutilizável) ✅
2. Migrar 7 listas de cadastros ✅
3. Criar form clients de cadastro ✅ (por entidade, ver Fase 2)
4. Migrar 14 forms de cadastros ✅ (incl. `produtos/tributacao` e `produtos/anuncios`)
5. Migrar `/pedidos` (lista) ✅
6. Migrar `/pedidos/[codigo]/imprimir` (100% server) ✅
7. Migrar `/pedidos/novo` e `/pedidos/[codigo]` (forms) ✅
8. Migrar 4 páginas de marketplaces ✅
9. Migrar `/configuracoes` e `/caracteristicas-produtos` ✅

---

## Notas

- `app/cadastros/usuarios/` é **trabalho em andamento** (fora do plano). Está excluído do typecheck via `tsconfig.json` (`exclude: ["app/cadastros/usuarios", ".next/types/app/cadastros/usuarios/**"]`) até ser finalizado — remover os dois excludes quando concluído (o 2º é necessário porque o `.next/types` regenerado importa a página, o que negaria o 1º no `tsc`).
- Para build a partir de estado com `.next` desatualizado, apagar `.next` antes (`Cannot find module for page: /_document` é artefato obsoleto). Se o erro `/_document` reaparecer no 1º build logo após limpar, rodar o build uma 2ª vez (cache/race de escrita do `.next`).

---

## Checklist de Segurança por Página

| Página | Token no Client? | API URL no Client? | Dados no HTML? |
|--------|:-----------------:|:-------------------:|:--------------:|
| Home | ❌ | ❌ | ✅ |
| Cadastros Lista | ❌ | ❌ | ✅ |
| Cadastros Form | ❌ | ❌ | ✅ |
| Pedidos Lista | ❌ | ❌ | ✅ |
| Pedidos Imprimir | ❌ | ❌ | ✅ |
| Pedidos Form | ❌ | ❌ | ✅ |
| Marketplaces | ❌ | ❌ | ✅ |

**Legenda:** ❌ = Seguro (não exposto), ✅ = SSR (renderizado no server)
