# GestContas — Design Spec

**Data:** 2026-06-14  
**Stack:** Next.js 15 App Router · Supabase · Vercel  
**Objetivo:** Aplicação web de gestão de finanças pessoais, semelhante ao Spendee, com suporte multi-dispositivo via autenticação.

---

## 1. Visão Geral

Aplicação web mobile-first que permite ao utilizador gerir múltiplas contas bancárias, registar movimentos (créditos e débitos) e visualizar estatísticas por categoria e label num dashboard.

---

## 2. Stack Técnico

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| Base de dados & Auth | Supabase (PostgreSQL + Auth + RLS) |
| UI Components | shadcn/ui + Tailwind CSS |
| Gráficos | Recharts |
| Ícones | Lucide React |
| Deploy | Vercel |
| Linguagem | TypeScript |

---

## 3. Arquitectura

### Estrutura de pastas

```
app/
  (auth)/
    login/page.tsx          → ecrã de login/registo
  (app)/
    layout.tsx              → layout com tab bar (requer auth)
    dashboard/page.tsx      → ecrã principal
    accounts/page.tsx       → lista de contas
    accounts/[id]/page.tsx  → movimentos de uma conta
    stats/page.tsx          → gráficos e estatísticas
    settings/page.tsx       → gestão de categorias e labels
components/
  ui/                       → shadcn/ui base
  accounts/                 → AccountCard, AccountForm
  movements/                → MovementList, MovementForm, MovementItem
  charts/                   → CategoryPieChart, LabelBarChart
  layout/                   → TabBar, BottomSheet
lib/
  supabase/
    server.ts               → cliente Supabase para Server Components
    client.ts               → cliente Supabase para Client Components
  utils.ts                  → helpers (formatação de moeda, datas)
middleware.ts               → protecção de rotas, redirecção se não autenticado
```

### Fluxo de autenticação

- Supabase Auth com email + password
- `@supabase/ssr` gere tokens via cookies HTTP-only
- `middleware.ts` intercepta todas as rotas `/(app)/*` e redireciona para `/login` se não houver sessão válida
- Login e registo na mesma página (`/login`), com toggle entre os dois modos

### Segurança (RLS)

Todas as tabelas têm Row Level Security activada. Política base em todas as tabelas:
```sql
USING (auth.uid() = user_id)
```
Nenhum utilizador consegue ler ou escrever dados de outro utilizador.

---

## 4. Modelo de Dados

```sql
-- Contas bancárias
CREATE TABLE accounts (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           text NOT NULL,
  account_number text NOT NULL,
  created_at     timestamptz DEFAULT now()
);

-- Categorias (lista gerida pelo utilizador)
CREATE TABLE categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  type       text NOT NULL CHECK (type IN ('expense', 'income')),
  created_at timestamptz DEFAULT now()
);

-- Labels (lista gerida pelo utilizador, com ícone Lucide)
CREATE TABLE labels (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  symbol     text NOT NULL,  -- nome do ícone Lucide, ex: "home", "plane"
  created_at timestamptz DEFAULT now()
);

-- Movimentos
CREATE TABLE movements (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date        date NOT NULL,
  description text NOT NULL,
  amount      numeric(12,2) NOT NULL CHECK (amount > 0),
  type        text NOT NULL CHECK (type IN ('credit', 'debit')),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  label_id    uuid REFERENCES labels(id) ON DELETE SET NULL,
  created_at  timestamptz DEFAULT now()
);
```

**Notas:**
- `amount` é sempre positivo; `type` indica o sentido do movimento
- `category_id` e `label_id` são opcionais (nullable)
- `symbol` em `labels` guarda o nome do ícone Lucide (string), ex: `"home"`, `"plane"`, `"shopping-cart"`

---

## 5. Ecrãs e Navegação

### Tab Bar (presente em todos os ecrãs da app)

| Tab | Ícone | Destino |
|---|---|---|
| Home | House | `/dashboard` |
| Contas | Building2 | `/accounts` |
| + | (botão central) | Abre BottomSheet de novo movimento |
| Stats | BarChart2 | `/stats` |
| Config | Settings | `/settings` |

### Ecrã 1 — Dashboard (`/dashboard`)

- Hero com gradiente roxo/azul mostrando **saldo total** (soma de todas as contas)
- Resumo do mês: total de proveitos e total de despesas
- Lista horizontal de cartões de conta com saldo individual
- Lista vertical dos últimos 10 movimentos (todas as contas)

### Ecrã 2 — Contas (`/accounts`)

- Lista de contas em cartões com gradiente
- Cada cartão mostra: nome, número de conta (truncado), saldo, total entradas, total saídas, nº de movimentos do mês
- Botão "+" no header para criar nova conta
- Tocar numa conta navega para `/accounts/[id]`

### Ecrã 2a — Movimentos de uma Conta (`/accounts/[id]`)

- Header com nome e saldo da conta
- Lista completa de movimentos ordenados por data (mais recente primeiro)
- Filtros por: período (mês/ano), categoria, label, tipo (crédito/débito)
- Botão "Adicionar Movimento" (pré-preenche a conta no formulário)
- Tocar num movimento abre edição; swipe para eliminar

### Ecrã 3 — Novo Movimento (BottomSheet)

Acessível pelo botão + da tab bar ou pelo botão dentro de `/accounts/[id]`.

Campos do formulário:
- **Tipo** — toggle Débito / Crédito
- **Valor** — input numérico em euros (€)
- **Data** — date picker (default: hoje)
- **Descrição** — campo de texto
- **Conta** — dropdown (pré-preenchido se acedido de `/accounts/[id]`, não editável nesse caso)
- **Categoria** — dropdown com lista de categorias do utilizador (opcional)
- **Label** — dropdown com lista de labels do utilizador com ícone (opcional)

### Ecrã 4 — Estatísticas (`/stats`)

- Filtro de período: mês corrente / ano corrente (toggles)
- **Gráfico de pizza** — distribuição de despesas por categoria (Recharts PieChart)
- **Gráfico de barras horizontais** — valor total por label (Recharts BarChart)
- Ambos os gráficos mostram apenas as categorias/labels com movimentos no período seleccionado

### Ecrã 5 — Configurações (`/settings`)

- Secção de perfil: email do utilizador, botão de logout
- **Categorias** — lista com tipo (despesa/proveito), botão para adicionar, editar e eliminar
- **Labels** — lista com ícone Lucide + nome, botão para adicionar, editar e eliminar
- Ao criar/editar uma label: campo de nome + grelha de selecção de ícone Lucide (conjunto fixo de ~30 ícones relevantes para finanças pessoais)

---

## 6. Componentes Principais

| Componente | Responsabilidade |
|---|---|
| `TabBar` | Navegação global, botão + abre BottomSheet |
| `BottomSheet` | Container animado que sobe do fundo do ecrã |
| `MovementForm` | Formulário de criação/edição de movimento |
| `AccountCard` | Cartão de conta com gradiente e estatísticas |
| `MovementItem` | Linha de movimento com ícone de categoria, valor colorido |
| `CategoryPieChart` | Gráfico de pizza por categoria (Recharts) |
| `LabelBarChart` | Gráfico de barras por label com ícone (Recharts) |
| `IconPicker` | Grelha de selecção de ícone Lucide para labels |

---

## 7. Tratamento de Erros e Estados

- **Loading:** Skeleton screens em todos os ecrãs enquanto dados carregam (shadcn/ui Skeleton)
- **Empty state:** Ilustração + CTA em ecrãs sem dados (ex: "Ainda não tens contas — cria a primeira")
- **Erros de formulário:** Validação inline com mensagens em português
- **Erros de rede:** Toast com mensagem de erro (shadcn/ui Toast / Sonner)
- **Auth expirada:** Middleware redireciona automaticamente para `/login`

---

## 8. Paleta de Cores e Tema

| Elemento | Cor |
|---|---|
| Primária | `#4f46e5` (indigo-600) |
| Secundária | `#7c3aed` (violet-600) |
| Gradiente hero | `linear-gradient(160deg, #4f46e5, #7c3aed)` |
| Fundo | `#f8f9fe` (cinza muito suave) |
| Texto principal | `#1f2937` (gray-800) |
| Crédito | `#16a34a` (green-600) |
| Débito | `#dc2626` (red-600) |
| Borda | `#e5e7eb` (gray-200) |

Fonte: Inter (Next.js font optimisation).

---

## 9. Fora de Âmbito (v1)

- Orçamentos / limites por categoria
- Exportação para CSV/PDF
- Notificações push
- Multi-utilizador / partilha de contas
- Conversão de moeda
- Importação de extractos bancários
- Modo escuro
