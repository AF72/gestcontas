# GestContas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir uma aplicação web mobile-first de gestão de finanças pessoais com contas, movimentos, e estatísticas, com deploy no Vercel e Supabase como backend.

**Architecture:** Next.js 15 App Router com Server Components para data fetching, Server Actions para mutações, e Supabase (PostgreSQL + Auth + RLS) como backend. Protecção de rotas via Next.js middleware. UI com shadcn/ui + Tailwind CSS, gráficos com Recharts.

**Tech Stack:** Next.js 15, TypeScript, Supabase (@supabase/ssr), shadcn/ui, Tailwind CSS, Recharts, Lucide React, Vitest

---

## File Structure

```
app/
  (auth)/login/
    page.tsx                  → Página de login/registo
    actions.ts                → Server Actions: login, register, logout
  (app)/
    layout.tsx                → Layout com TabBar + BottomSheet (requer auth)
    dashboard/page.tsx        → Ecrã principal: saldo total, contas, recentes
    accounts/
      page.tsx                → Lista de contas
      actions.ts              → Server Actions: createAccount, deleteAccount
      [id]/
        page.tsx              → Movimentos de uma conta com filtros
    stats/page.tsx            → Gráficos de categoria e label
    settings/
      page.tsx                → Gestão de categorias e labels
      actions.ts              → Server Actions: CRUD categorias e labels
  page.tsx                    → Redirect para /dashboard
  layout.tsx                  → Root layout (fonte, metadata)

components/
  layout/
    tab-bar.tsx               → Barra de tabs inferior (Client Component)
    bottom-sheet.tsx          → Sheet animada para novo movimento (Client Component)
  accounts/
    account-card.tsx          → Cartão de conta com gradiente e estatísticas
    account-form.tsx          → Formulário criar/editar conta (Dialog)
  movements/
    movement-item.tsx         → Linha de movimento com categoria e label
    movement-list.tsx         → Lista com filtros de data/tipo/categoria/label
    movement-form.tsx         → Formulário de movimento (Client Component)
  charts/
    category-pie-chart.tsx    → PieChart Recharts por categoria
    label-bar-chart.tsx       → BarChart Recharts por label
  settings/
    icon-picker.tsx           → Grelha de ícones Lucide para labels
    category-form.tsx         → Formulário categoria (Dialog)
    label-form.tsx            → Formulário label com IconPicker (Dialog)

lib/
  supabase/
    server.ts                 → createClient para Server Components/Actions
    client.ts                 → createBrowserClient para Client Components
    middleware.ts             → updateSession helper
  queries/
    accounts.ts               → getAccounts, getAccountById, getAccountBalance
    movements.ts              → getMovements, getMovementsByAccount
    categories.ts             → getCategories
    labels.ts                 → getLabels
    stats.ts                  → getStatsByCategory, getStatsByLabel
  actions/
    movements.ts              → createMovement, updateMovement, deleteMovement
    categories.ts             → createCategory, updateCategory, deleteCategory
    labels.ts                 → createLabel, updateLabel, deleteLabel
  types.ts                    → Tipos TypeScript para todas as entidades
  utils.ts                    → cn, formatCurrency, formatDate, formatDateInput
  icons.ts                    → Lista de ícones Lucide disponíveis para labels

middleware.ts                 → Protecção de rotas Next.js
vitest.config.ts              → Configuração Vitest
.env.local                    → NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## Task 1: Project Initialization

**Files:**
- Create: projeto completo via create-next-app
- Create: `vitest.config.ts`
- Modify: `package.json`

- [ ] **Step 1: Criar o projecto Next.js**

```bash
cd "/Users/adrianofernandes/Documents/Projetos Pessoais"
npx create-next-app@latest gestcontas \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --yes
cd gestcontas
```

- [ ] **Step 2: Instalar dependências**

```bash
npm install @supabase/ssr @supabase/supabase-js
npm install recharts
npm install lucide-react
npm install sonner
npm install clsx tailwind-merge
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 3: Inicializar shadcn/ui**

```bash
npx shadcn@latest init --yes --defaults
npx shadcn@latest add button input label dialog sheet select badge skeleton tabs separator
```

Quando pedido, escolher: Style → Default, Base color → Slate, CSS variables → Yes.

- [ ] **Step 4: Configurar Vitest**

Criar `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
})
```

Criar `vitest.setup.ts`:

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Adicionar scripts ao package.json**

Editar `package.json` adicionando dentro de `"scripts"`:

```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 6: Criar estrutura de pastas**

```bash
mkdir -p app/\(auth\)/login
mkdir -p app/\(app\)/dashboard
mkdir -p app/\(app\)/accounts/\[id\]
mkdir -p app/\(app\)/stats
mkdir -p app/\(app\)/settings
mkdir -p components/layout
mkdir -p components/accounts
mkdir -p components/movements
mkdir -p components/charts
mkdir -p components/settings
mkdir -p lib/supabase
mkdir -p lib/queries
mkdir -p lib/actions
```

- [ ] **Step 7: Criar ficheiro .env.local**

Criar `.env.local` (preencher com as chaves do projecto Supabase criado no passo seguinte):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

- [ ] **Step 8: Criar .env.example para o repositório**

Criar `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

- [ ] **Step 9: Commit inicial**

```bash
git init
echo ".env.local" >> .gitignore
echo ".superpowers/" >> .gitignore
git add .
git commit -m "chore: project initialization with Next.js 15, Supabase, shadcn/ui"
```

---

## Task 2: TypeScript Types & Utilities

**Files:**
- Create: `lib/types.ts`
- Create: `lib/utils.ts`
- Create: `lib/icons.ts`
- Create: `lib/utils.test.ts`

- [ ] **Step 1: Escrever os testes de utils (TDD — falham primeiro)**

Criar `lib/utils.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate, formatDateInput } from './utils'

describe('formatCurrency', () => {
  it('formata um valor positivo em euros', () => {
    const result = formatCurrency(1234.56)
    expect(result).toContain('1')
    expect(result).toContain('234')
    expect(result).toContain('€')
  })

  it('formata zero', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0')
    expect(result).toContain('€')
  })

  it('formata um valor com duas casas decimais', () => {
    const result = formatCurrency(48)
    expect(result).toContain('48')
    expect(result).toContain('€')
  })
})

describe('formatDate', () => {
  it('formata uma data ISO para português', () => {
    const result = formatDate('2026-06-14')
    expect(result).toContain('2026')
    expect(result).toMatch(/14/)
  })
})

describe('formatDateInput', () => {
  it('converte uma data ISO para formato de input date (YYYY-MM-DD)', () => {
    expect(formatDateInput('2026-06-14T10:30:00')).toBe('2026-06-14')
  })

  it('mantém uma data já em formato YYYY-MM-DD', () => {
    expect(formatDateInput('2026-06-14')).toBe('2026-06-14')
  })
})
```

- [ ] **Step 2: Correr os testes — devem falhar**

```bash
npm run test:run
```

Resultado esperado: FAIL — `Cannot find module './utils'`

- [ ] **Step 3: Implementar lib/utils.ts**

Criar `lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateInput(date: string): string {
  return date.slice(0, 10)
}
```

- [ ] **Step 4: Correr os testes — devem passar**

```bash
npm run test:run
```

Resultado esperado: PASS (3 test suites, 5 tests)

- [ ] **Step 5: Criar lib/types.ts**

```typescript
export type Account = {
  id: string
  user_id: string
  name: string
  account_number: string
  created_at: string
}

export type Category = {
  id: string
  user_id: string
  name: string
  type: 'expense' | 'income'
  created_at: string
}

export type Label = {
  id: string
  user_id: string
  name: string
  symbol: string
  created_at: string
}

export type MovementType = 'credit' | 'debit'

export type Movement = {
  id: string
  account_id: string
  user_id: string
  date: string
  description: string
  amount: number
  type: MovementType
  category_id: string | null
  label_id: string | null
  created_at: string
  categories?: Pick<Category, 'id' | 'name' | 'type'> | null
  labels?: Pick<Label, 'id' | 'name' | 'symbol'> | null
}

export type AccountWithStats = Account & {
  balance: number
  total_credit: number
  total_debit: number
  movement_count: number
}

export type MovementFilters = {
  type?: MovementType
  category_id?: string
  label_id?: string
  month?: number
  year?: number
}

export type StatsByCategory = {
  category_id: string | null
  category_name: string
  category_type: 'expense' | 'income'
  total: number
}

export type StatsByLabel = {
  label_id: string | null
  label_name: string
  label_symbol: string
  total: number
}
```

- [ ] **Step 6: Criar lib/icons.ts**

```typescript
import {
  Home, Plane, ShoppingCart, Car, Utensils, Heart, GraduationCap,
  Briefcase, Coffee, Music, Gamepad2, Gift, Shirt, Wrench, Zap,
  Wifi, Phone, BookOpen, Baby, Dumbbell, PiggyBank, TrendingUp,
  Building2, Leaf, Sun, Moon, Star, Camera, Dog, Wallet,
} from 'lucide-react'

export const AVAILABLE_ICONS = [
  { name: 'home', label: 'Casa', icon: Home },
  { name: 'plane', label: 'Viagens', icon: Plane },
  { name: 'shopping-cart', label: 'Compras', icon: ShoppingCart },
  { name: 'car', label: 'Automóvel', icon: Car },
  { name: 'utensils', label: 'Restaurante', icon: Utensils },
  { name: 'heart', label: 'Saúde', icon: Heart },
  { name: 'graduation-cap', label: 'Educação', icon: GraduationCap },
  { name: 'briefcase', label: 'Trabalho', icon: Briefcase },
  { name: 'coffee', label: 'Café', icon: Coffee },
  { name: 'music', label: 'Música', icon: Music },
  { name: 'gamepad-2', label: 'Lazer', icon: Gamepad2 },
  { name: 'gift', label: 'Presentes', icon: Gift },
  { name: 'shirt', label: 'Roupa', icon: Shirt },
  { name: 'wrench', label: 'Reparações', icon: Wrench },
  { name: 'zap', label: 'Electricidade', icon: Zap },
  { name: 'wifi', label: 'Internet', icon: Wifi },
  { name: 'phone', label: 'Telefone', icon: Phone },
  { name: 'book-open', label: 'Livros', icon: BookOpen },
  { name: 'baby', label: 'Filhos', icon: Baby },
  { name: 'dumbbell', label: 'Ginásio', icon: Dumbbell },
  { name: 'piggy-bank', label: 'Poupança', icon: PiggyBank },
  { name: 'trending-up', label: 'Investimento', icon: TrendingUp },
  { name: 'building-2', label: 'Renda', icon: Building2 },
  { name: 'leaf', label: 'Natureza', icon: Leaf },
  { name: 'sun', label: 'Férias', icon: Sun },
  { name: 'moon', label: 'Noite', icon: Moon },
  { name: 'star', label: 'Especial', icon: Star },
  { name: 'camera', label: 'Fotografia', icon: Camera },
  { name: 'dog', label: 'Animais', icon: Dog },
  { name: 'wallet', label: 'Carteira', icon: Wallet },
] as const

export type IconName = typeof AVAILABLE_ICONS[number]['name']

export function getIconComponent(name: string) {
  return AVAILABLE_ICONS.find((i) => i.name === name)?.icon ?? Wallet
}
```

- [ ] **Step 7: Commit**

```bash
git add lib/types.ts lib/utils.ts lib/utils.test.ts lib/icons.ts vitest.config.ts vitest.setup.ts package.json
git commit -m "feat: add TypeScript types, utilities, and icon registry"
```

---

## Task 3: Supabase Database Schema

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql` (referência local)

- [ ] **Step 1: Criar projecto Supabase**

Aceder a https://supabase.com/dashboard → New Project. Guardar:
- Project URL → colocar em `NEXT_PUBLIC_SUPABASE_URL` no `.env.local`
- Anon key → colocar em `NEXT_PUBLIC_SUPABASE_ANON_KEY` no `.env.local`

- [ ] **Step 2: Criar as tabelas no SQL Editor do Supabase**

No Supabase Dashboard → SQL Editor → New Query, colar e executar:

```sql
-- Activar extensão UUID
create extension if not exists "pgcrypto";

-- Contas
create table public.accounts (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  name           text not null,
  account_number text not null,
  created_at     timestamptz default now()
);

-- Categorias
create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  type       text not null check (type in ('expense', 'income')),
  created_at timestamptz default now()
);

-- Labels
create table public.labels (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  symbol     text not null,
  created_at timestamptz default now()
);

-- Movimentos
create table public.movements (
  id          uuid primary key default gen_random_uuid(),
  account_id  uuid not null references public.accounts(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  date        date not null,
  description text not null,
  amount      numeric(12,2) not null check (amount > 0),
  type        text not null check (type in ('credit', 'debit')),
  category_id uuid references public.categories(id) on delete set null,
  label_id    uuid references public.labels(id) on delete set null,
  created_at  timestamptz default now()
);
```

- [ ] **Step 3: Criar as políticas RLS**

No SQL Editor, colar e executar:

```sql
-- Activar RLS em todas as tabelas
alter table public.accounts  enable row level security;
alter table public.categories enable row level security;
alter table public.labels    enable row level security;
alter table public.movements enable row level security;

-- Policies para accounts
create policy "accounts: select próprios" on public.accounts
  for select using (auth.uid() = user_id);
create policy "accounts: insert próprios" on public.accounts
  for insert with check (auth.uid() = user_id);
create policy "accounts: update próprios" on public.accounts
  for update using (auth.uid() = user_id);
create policy "accounts: delete próprios" on public.accounts
  for delete using (auth.uid() = user_id);

-- Policies para categories
create policy "categories: select próprias" on public.categories
  for select using (auth.uid() = user_id);
create policy "categories: insert próprias" on public.categories
  for insert with check (auth.uid() = user_id);
create policy "categories: update próprias" on public.categories
  for update using (auth.uid() = user_id);
create policy "categories: delete próprias" on public.categories
  for delete using (auth.uid() = user_id);

-- Policies para labels
create policy "labels: select próprias" on public.labels
  for select using (auth.uid() = user_id);
create policy "labels: insert próprias" on public.labels
  for insert with check (auth.uid() = user_id);
create policy "labels: update próprias" on public.labels
  for update using (auth.uid() = user_id);
create policy "labels: delete próprias" on public.labels
  for delete using (auth.uid() = user_id);

-- Policies para movements
create policy "movements: select próprios" on public.movements
  for select using (auth.uid() = user_id);
create policy "movements: insert próprios" on public.movements
  for insert with check (auth.uid() = user_id);
create policy "movements: update próprios" on public.movements
  for update using (auth.uid() = user_id);
create policy "movements: delete próprios" on public.movements
  for delete using (auth.uid() = user_id);
```

- [ ] **Step 4: Guardar o schema localmente para referência**

```bash
mkdir -p supabase/migrations
```

Criar `supabase/migrations/001_initial_schema.sql` com o conteúdo das queries dos dois passos anteriores (copiar e colar).

- [ ] **Step 5: Commit**

```bash
git add supabase/ .env.example
git commit -m "feat: add Supabase database schema and RLS policies"
```

---

## Task 4: Supabase Client Configuration

**Files:**
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/middleware.ts`
- Create: `middleware.ts`

- [ ] **Step 1: Criar lib/supabase/server.ts**

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignorado em Server Components — o middleware trata disto
          }
        },
      },
    }
  )
}
```

- [ ] **Step 2: Criar lib/supabase/client.ts**

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 3: Criar lib/supabase/middleware.ts**

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAuthRoute = pathname.startsWith('/login')
  const isPublicRoute = pathname === '/' || isAuthRoute

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
```

- [ ] **Step 4: Criar middleware.ts (raiz do projecto)**

```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

- [ ] **Step 5: Verificar que o servidor arranca sem erros**

```bash
npm run dev
```

Resultado esperado: servidor a correr em http://localhost:3000, sem erros de TypeScript.

- [ ] **Step 6: Commit**

```bash
git add lib/supabase/ middleware.ts
git commit -m "feat: configure Supabase SSR client and route protection middleware"
```

---

## Task 5: Authentication

**Files:**
- Create: `app/(auth)/login/page.tsx`
- Create: `app/(auth)/login/actions.ts`
- Modify: `app/layout.tsx`
- Create: `app/page.tsx`

- [ ] **Step 1: Criar app/page.tsx (redirect raiz)**

```typescript
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/dashboard')
}
```

- [ ] **Step 2: Actualizar app/layout.tsx**

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GestContas',
  description: 'Gestão de contas pessoais',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt">
      <body className={inter.className}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Criar app/(auth)/login/actions.ts**

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) {
    return { error: 'Email ou password incorrectos.' }
  }

  redirect('/dashboard')
}

export async function register(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
```

- [ ] **Step 4: Criar app/(auth)/login/page.tsx**

```typescript
'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { login, register } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'A processar...' : label}
    </Button>
  )
}

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    const action = mode === 'login' ? login : register
    const result = await action(formData)
    if (result?.error) setError(result.error)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-bold text-xl">G</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">GestContas</h1>
          <p className="text-gray-500 text-sm mt-1">Gestão de finanças pessoais</p>
        </div>

        {/* Toggle */}
        <div className="bg-gray-100 rounded-lg p-1 flex mb-6">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              mode === 'login'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              mode === 'register'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            Criar conta
          </button>
        </div>

        {/* Form */}
        <form action={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="email@exemplo.com"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
              className="mt-1"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">
              {error}
            </p>
          )}

          <SubmitButton label={mode === 'login' ? 'Entrar' : 'Criar conta'} />
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Testar o fluxo de autenticação**

```bash
npm run dev
```

1. Abrir http://localhost:3000 → deve redirigir para /login
2. Criar uma conta com email + password
3. Após registo → deve redirigir para /dashboard (que ainda não existe — 404 é esperado)
4. Aceder a http://localhost:3000/login com sessão activa → deve redirigir para /dashboard

- [ ] **Step 6: Commit**

```bash
git add app/
git commit -m "feat: add authentication with Supabase Auth (login/register/logout)"
```

---

## Task 6: App Layout & Navigation

**Files:**
- Create: `app/(app)/layout.tsx`
- Create: `components/layout/tab-bar.tsx`
- Create: `components/layout/bottom-sheet.tsx`

- [ ] **Step 1: Criar components/layout/tab-bar.tsx**

```typescript
'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Home, Building2, Plus, BarChart2, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/accounts', icon: Building2, label: 'Contas' },
  { href: null, icon: Plus, label: 'Adicionar' }, // botão especial
  { href: '/stats', icon: BarChart2, label: 'Stats' },
  { href: '/settings', icon: Settings, label: 'Config' },
]

export function TabBar() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  function openAddMovement() {
    const params = new URLSearchParams(searchParams.toString())
    params.set('add-movement', 'true')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center justify-around px-2 py-2 z-40 max-w-lg mx-auto">
      {TABS.map((tab) => {
        if (!tab.href) {
          return (
            <button
              key="add"
              onClick={openAddMovement}
              className="flex flex-col items-center"
              aria-label="Adicionar movimento"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-full flex items-center justify-center shadow-lg -mt-4">
                <Plus className="w-6 h-6 text-white" />
              </div>
            </button>
          )
        }

        const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/')

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors',
              isActive ? 'text-indigo-600' : 'text-gray-400'
            )}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 2: Criar components/layout/bottom-sheet.tsx**

```typescript
'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { MovementForm } from '@/components/movements/movement-form'
import type { Account, Category, Label } from '@/lib/types'

type BottomSheetProps = {
  accounts: Account[]
  categories: Category[]
  labels: Label[]
}

export function BottomSheet({ accounts, categories, labels }: BottomSheetProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const isOpen = searchParams.get('add-movement') === 'true'
  const preselectedAccountId = searchParams.get('account') ?? undefined

  function handleClose() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('add-movement')
    params.delete('account')
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Novo Movimento</SheetTitle>
        </SheetHeader>
        <MovementForm
          accounts={accounts}
          categories={categories}
          labels={labels}
          preselectedAccountId={preselectedAccountId}
          onSuccess={handleClose}
        />
      </SheetContent>
    </Sheet>
  )
}
```

- [ ] **Step 3: Criar app/(app)/layout.tsx**

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TabBar } from '@/components/layout/tab-bar'
import { BottomSheet } from '@/components/layout/bottom-sheet'
import { getAccounts } from '@/lib/queries/accounts'
import { getCategories } from '@/lib/queries/categories'
import { getLabels } from '@/lib/queries/labels'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [accounts, categories, labels] = await Promise.all([
    getAccounts(),
    getCategories(),
    getLabels(),
  ])

  return (
    <div className="min-h-screen bg-slate-50 max-w-lg mx-auto relative">
      <main className="pb-20">{children}</main>
      <TabBar />
      <BottomSheet
        accounts={accounts}
        categories={categories}
        labels={labels}
      />
    </div>
  )
}
```

- [ ] **Step 4: Commit (o layout ainda vai causar erros — as queries ainda não existem)**

Continuar para o Task 7 antes de fazer commit.

---

## Task 7: Query Functions

**Files:**
- Create: `lib/queries/accounts.ts`
- Create: `lib/queries/movements.ts`
- Create: `lib/queries/categories.ts`
- Create: `lib/queries/labels.ts`
- Create: `lib/queries/stats.ts`

- [ ] **Step 1: Criar lib/queries/categories.ts**

```typescript
import { createClient } from '@/lib/supabase/server'
import type { Category } from '@/lib/types'

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) throw new Error(error.message)
  return data ?? []
}
```

- [ ] **Step 2: Criar lib/queries/labels.ts**

```typescript
import { createClient } from '@/lib/supabase/server'
import type { Label } from '@/lib/types'

export async function getLabels(): Promise<Label[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('labels')
    .select('*')
    .order('name')

  if (error) throw new Error(error.message)
  return data ?? []
}
```

- [ ] **Step 3: Criar lib/queries/accounts.ts**

```typescript
import { createClient } from '@/lib/supabase/server'
import type { Account, AccountWithStats } from '@/lib/types'

export async function getAccounts(): Promise<Account[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .order('created_at')

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getAccountById(id: string): Promise<Account | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function getAccountsWithStats(): Promise<AccountWithStats[]> {
  const supabase = await createClient()

  const { data: accounts, error } = await supabase
    .from('accounts')
    .select('*')
    .order('created_at')

  if (error) throw new Error(error.message)
  if (!accounts) return []

  const accountsWithStats = await Promise.all(
    accounts.map(async (account) => {
      const { data: movements } = await supabase
        .from('movements')
        .select('amount, type')
        .eq('account_id', account.id)

      const total_credit = (movements ?? [])
        .filter((m) => m.type === 'credit')
        .reduce((sum, m) => sum + Number(m.amount), 0)

      const total_debit = (movements ?? [])
        .filter((m) => m.type === 'debit')
        .reduce((sum, m) => sum + Number(m.amount), 0)

      return {
        ...account,
        balance: total_credit - total_debit,
        total_credit,
        total_debit,
        movement_count: (movements ?? []).length,
      }
    })
  )

  return accountsWithStats
}
```

- [ ] **Step 4: Criar lib/queries/movements.ts**

```typescript
import { createClient } from '@/lib/supabase/server'
import type { Movement, MovementFilters } from '@/lib/types'

export async function getMovements(filters?: MovementFilters): Promise<Movement[]> {
  const supabase = await createClient()

  let query = supabase
    .from('movements')
    .select(`
      *,
      categories(id, name, type),
      labels(id, name, symbol)
    `)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (filters?.type) query = query.eq('type', filters.type)
  if (filters?.category_id) query = query.eq('category_id', filters.category_id)
  if (filters?.label_id) query = query.eq('label_id', filters.label_id)

  if (filters?.month && filters?.year) {
    const start = `${filters.year}-${String(filters.month).padStart(2, '0')}-01`
    const end = new Date(filters.year, filters.month, 0)
      .toISOString()
      .slice(0, 10)
    query = query.gte('date', start).lte('date', end)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data as Movement[]) ?? []
}

export async function getMovementsByAccount(
  accountId: string,
  filters?: MovementFilters
): Promise<Movement[]> {
  const supabase = await createClient()

  let query = supabase
    .from('movements')
    .select(`
      *,
      categories(id, name, type),
      labels(id, name, symbol)
    `)
    .eq('account_id', accountId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (filters?.type) query = query.eq('type', filters.type)
  if (filters?.category_id) query = query.eq('category_id', filters.category_id)
  if (filters?.label_id) query = query.eq('label_id', filters.label_id)

  if (filters?.month && filters?.year) {
    const start = `${filters.year}-${String(filters.month).padStart(2, '0')}-01`
    const end = new Date(filters.year, filters.month, 0)
      .toISOString()
      .slice(0, 10)
    query = query.gte('date', start).lte('date', end)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data as Movement[]) ?? []
}

export async function getRecentMovements(limit = 10): Promise<Movement[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('movements')
    .select(`
      *,
      categories(id, name, type),
      labels(id, name, symbol)
    `)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return (data as Movement[]) ?? []
}
```

- [ ] **Step 5: Criar lib/queries/stats.ts**

```typescript
import { createClient } from '@/lib/supabase/server'
import type { StatsByCategory, StatsByLabel } from '@/lib/types'

export async function getStatsByCategory(
  month: number,
  year: number,
  movementType: 'debit' | 'credit' = 'debit'
): Promise<StatsByCategory[]> {
  const supabase = await createClient()

  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const end = new Date(year, month, 0).toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('movements')
    .select(`
      amount,
      type,
      category_id,
      categories(id, name, type)
    `)
    .eq('type', movementType)
    .gte('date', start)
    .lte('date', end)

  if (error) throw new Error(error.message)
  if (!data) return []

  const grouped = new Map<string, StatsByCategory>()

  for (const movement of data as any[]) {
    const key = movement.category_id ?? 'sem-categoria'
    const existing = grouped.get(key)

    if (existing) {
      existing.total += Number(movement.amount)
    } else {
      grouped.set(key, {
        category_id: movement.category_id,
        category_name: movement.categories?.name ?? 'Sem categoria',
        category_type: movement.categories?.type ?? movementType === 'debit' ? 'expense' : 'income',
        total: Number(movement.amount),
      })
    }
  }

  return Array.from(grouped.values()).sort((a, b) => b.total - a.total)
}

export async function getStatsByLabel(
  month: number,
  year: number
): Promise<StatsByLabel[]> {
  const supabase = await createClient()

  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const end = new Date(year, month, 0).toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('movements')
    .select(`
      amount,
      type,
      label_id,
      labels(id, name, symbol)
    `)
    .gte('date', start)
    .lte('date', end)
    .not('label_id', 'is', null)

  if (error) throw new Error(error.message)
  if (!data) return []

  const grouped = new Map<string, StatsByLabel>()

  for (const movement of data as any[]) {
    if (!movement.label_id) continue
    const key = movement.label_id
    const amount = movement.type === 'debit'
      ? -Number(movement.amount)
      : Number(movement.amount)

    const existing = grouped.get(key)
    if (existing) {
      existing.total += amount
    } else {
      grouped.set(key, {
        label_id: movement.label_id,
        label_name: movement.labels?.name ?? '',
        label_symbol: movement.labels?.symbol ?? 'wallet',
        total: amount,
      })
    }
  }

  return Array.from(grouped.values()).sort((a, b) => Math.abs(b.total) - Math.abs(a.total))
}
```

- [ ] **Step 6: Commit**

```bash
git add lib/queries/ lib/
git commit -m "feat: add Supabase query functions for all entities"
```

---

## Task 8: Server Actions (Mutations)

**Files:**
- Create: `app/(app)/accounts/actions.ts`
- Create: `app/(app)/settings/actions.ts`
- Create: `lib/actions/movements.ts`

- [ ] **Step 1: Criar app/(app)/accounts/actions.ts**

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createAccount(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { error } = await supabase.from('accounts').insert({
    user_id: user.id,
    name: formData.get('name') as string,
    account_number: formData.get('account_number') as string,
  })

  if (error) return { error: error.message }
  revalidatePath('/accounts')
  revalidatePath('/dashboard')
}

export async function deleteAccount(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('accounts').delete().eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/accounts')
  revalidatePath('/dashboard')
}
```

- [ ] **Step 2: Criar lib/actions/movements.ts**

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createMovement(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { error } = await supabase.from('movements').insert({
    user_id: user.id,
    account_id: formData.get('account_id') as string,
    date: formData.get('date') as string,
    description: formData.get('description') as string,
    amount: Number(formData.get('amount')),
    type: formData.get('type') as 'credit' | 'debit',
    category_id: (formData.get('category_id') as string) || null,
    label_id: (formData.get('label_id') as string) || null,
  })

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  revalidatePath('/accounts')
  revalidatePath('/', 'layout')
}

export async function updateMovement(id: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('movements')
    .update({
      account_id: formData.get('account_id') as string,
      date: formData.get('date') as string,
      description: formData.get('description') as string,
      amount: Number(formData.get('amount')),
      type: formData.get('type') as 'credit' | 'debit',
      category_id: (formData.get('category_id') as string) || null,
      label_id: (formData.get('label_id') as string) || null,
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  revalidatePath('/accounts')
  revalidatePath('/', 'layout')
}

export async function deleteMovement(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('movements').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  revalidatePath('/accounts')
  revalidatePath('/', 'layout')
}
```

- [ ] **Step 3: Criar app/(app)/settings/actions.ts**

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// --- Categories ---

export async function createCategory(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { error } = await supabase.from('categories').insert({
    user_id: user.id,
    name: formData.get('name') as string,
    type: formData.get('type') as 'expense' | 'income',
  })

  if (error) return { error: error.message }
  revalidatePath('/settings')
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('categories')
    .update({
      name: formData.get('name') as string,
      type: formData.get('type') as 'expense' | 'income',
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/settings')
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/settings')
}

// --- Labels ---

export async function createLabel(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { error } = await supabase.from('labels').insert({
    user_id: user.id,
    name: formData.get('name') as string,
    symbol: formData.get('symbol') as string,
  })

  if (error) return { error: error.message }
  revalidatePath('/settings')
}

export async function updateLabel(id: string, formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('labels')
    .update({
      name: formData.get('name') as string,
      symbol: formData.get('symbol') as string,
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/settings')
}

export async function deleteLabel(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('labels').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/settings')
}
```

- [ ] **Step 4: Commit**

```bash
git add app/\(app\)/accounts/actions.ts app/\(app\)/settings/actions.ts lib/actions/
git commit -m "feat: add server actions for accounts, movements, categories and labels"
```

---

## Task 9: Movement Form Component

**Files:**
- Create: `components/movements/movement-form.tsx`
- Create: `components/movements/movement-item.tsx`

- [ ] **Step 1: Criar components/movements/movement-item.tsx**

```typescript
import { formatCurrency, formatDate } from '@/lib/utils'
import { getIconComponent } from '@/lib/icons'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Movement } from '@/lib/types'

type MovementItemProps = {
  movement: Movement
  onClick?: () => void
}

export function MovementItem({ movement, onClick }: MovementItemProps) {
  const isCredit = movement.type === 'credit'
  const IconComponent = movement.labels?.symbol
    ? getIconComponent(movement.labels.symbol)
    : null

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-indigo-200 transition-colors text-left"
    >
      {/* Ícone de label ou círculo de categoria */}
      <div className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
        isCredit ? 'bg-green-50' : 'bg-red-50'
      )}>
        {IconComponent ? (
          <IconComponent className={cn('w-5 h-5', isCredit ? 'text-green-600' : 'text-red-500')} />
        ) : (
          <div className={cn('w-3 h-3 rounded-full', isCredit ? 'bg-green-500' : 'bg-red-500')} />
        )}
      </div>

      {/* Descrição e categoria */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm truncate">
          {movement.description}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs text-gray-400">{formatDate(movement.date)}</span>
          {movement.categories && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
              {movement.categories.name}
            </Badge>
          )}
        </div>
      </div>

      {/* Valor */}
      <span className={cn(
        'font-semibold text-sm flex-shrink-0',
        isCredit ? 'text-green-600' : 'text-red-500'
      )}>
        {isCredit ? '+' : '-'}{formatCurrency(Number(movement.amount))}
      </span>
    </button>
  )
}
```

- [ ] **Step 2: Criar components/movements/movement-form.tsx**

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createMovement, updateMovement } from '@/lib/actions/movements'
import { formatDateInput } from '@/lib/utils'
import { getIconComponent } from '@/lib/icons'
import type { Account, Category, Label as LabelType, Movement } from '@/lib/types'

type MovementFormProps = {
  accounts: Account[]
  categories: Category[]
  labels: LabelType[]
  preselectedAccountId?: string
  movement?: Movement
  onSuccess?: () => void
}

export function MovementForm({
  accounts,
  categories,
  labels,
  preselectedAccountId,
  movement,
  onSuccess,
}: MovementFormProps) {
  const [type, setType] = useState<'debit' | 'credit'>(movement?.type ?? 'debit')
  const [categoryId, setCategoryId] = useState(movement?.category_id ?? '')
  const [labelId, setLabelId] = useState(movement?.label_id ?? '')
  const [accountId, setAccountId] = useState(
    movement?.account_id ?? preselectedAccountId ?? accounts[0]?.id ?? ''
  )
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const isPreselected = !!preselectedAccountId && !movement

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set('type', type)
    formData.set('account_id', accountId)
    formData.set('category_id', categoryId)
    formData.set('label_id', labelId)

    const result = movement
      ? await updateMovement(movement.id, formData)
      : await createMovement(formData)

    setLoading(false)

    if (result?.error) {
      toast.error(result.error)
      return
    }

    toast.success(movement ? 'Movimento actualizado.' : 'Movimento registado.')
    router.refresh()
    onSuccess?.()
  }

  const filteredCategories = categories.filter((c) =>
    type === 'debit' ? c.type === 'expense' : c.type === 'income'
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      {/* Toggle débito/crédito */}
      <div className="bg-gray-100 rounded-lg p-1 flex">
        <button
          type="button"
          onClick={() => { setType('debit'); setCategoryId('') }}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
            type === 'debit' ? 'bg-red-500 text-white shadow-sm' : 'text-gray-500'
          }`}
        >
          Débito
        </button>
        <button
          type="button"
          onClick={() => { setType('credit'); setCategoryId('') }}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
            type === 'credit' ? 'bg-green-500 text-white shadow-sm' : 'text-gray-500'
          }`}
        >
          Crédito
        </button>
      </div>

      {/* Valor */}
      <div>
        <Label htmlFor="amount">Valor (€)</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0,00"
          defaultValue={movement ? Number(movement.amount) : ''}
          required
          className="mt-1 text-lg font-semibold"
        />
      </div>

      {/* Data */}
      <div>
        <Label htmlFor="date">Data</Label>
        <Input
          id="date"
          name="date"
          type="date"
          defaultValue={movement ? formatDateInput(movement.date) : new Date().toISOString().slice(0, 10)}
          required
          className="mt-1"
        />
      </div>

      {/* Descrição */}
      <div>
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          name="description"
          placeholder="Ex: Supermercado Continente"
          defaultValue={movement?.description ?? ''}
          required
          className="mt-1"
        />
      </div>

      {/* Conta */}
      <div>
        <Label>Conta</Label>
        <Select
          value={accountId}
          onValueChange={setAccountId}
          disabled={isPreselected}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Seleccionar conta" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Categoria */}
      <div>
        <Label>Categoria</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Sem categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Sem categoria</SelectItem>
            {filteredCategories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Label */}
      <div>
        <Label>Label</Label>
        <Select value={labelId} onValueChange={setLabelId}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Sem label" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Sem label</SelectItem>
            {labels.map((lbl) => {
              const Icon = getIconComponent(lbl.symbol)
              return (
                <SelectItem key={lbl.id} value={lbl.id}>
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {lbl.name}
                  </span>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
        disabled={loading}
      >
        {loading ? 'A guardar...' : movement ? 'Actualizar' : 'Guardar Movimento'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add components/movements/
git commit -m "feat: add MovementForm and MovementItem components"
```

---

## Task 10: Dashboard Page

**Files:**
- Create: `app/(app)/dashboard/page.tsx`
- Create: `components/accounts/account-card.tsx`

- [ ] **Step 1: Criar components/accounts/account-card.tsx**

```typescript
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import type { AccountWithStats } from '@/lib/types'

const GRADIENTS = [
  'from-indigo-600 to-violet-600',
  'from-cyan-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-red-500',
  'from-pink-500 to-rose-600',
]

type AccountCardProps = {
  account: AccountWithStats
  index?: number
  compact?: boolean
}

export function AccountCard({ account, index = 0, compact = false }: AccountCardProps) {
  const gradient = GRADIENTS[index % GRADIENTS.length]

  if (compact) {
    return (
      <Link
        href={`/accounts/${account.id}`}
        className={`bg-gradient-to-br ${gradient} rounded-xl p-4 text-white min-w-[140px] flex-shrink-0 block`}
      >
        <p className="text-xs opacity-80 truncate">{account.name}</p>
        <p className="text-xl font-bold mt-1">{formatCurrency(account.balance)}</p>
      </Link>
    )
  }

  return (
    <Link
      href={`/accounts/${account.id}`}
      className="block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className={`bg-gradient-to-br ${gradient} p-5 text-white`}>
        <p className="text-sm opacity-80">{account.name}</p>
        <p className="text-3xl font-bold mt-1">{formatCurrency(account.balance)}</p>
        <p className="text-xs opacity-60 mt-1 truncate">{account.account_number}</p>
      </div>
      <div className="flex divide-x divide-gray-100">
        <div className="flex-1 p-3 text-center">
          <p className="text-xs text-gray-400">Entradas</p>
          <p className="text-sm font-semibold text-green-600">
            +{formatCurrency(account.total_credit)}
          </p>
        </div>
        <div className="flex-1 p-3 text-center">
          <p className="text-xs text-gray-400">Saídas</p>
          <p className="text-sm font-semibold text-red-500">
            -{formatCurrency(account.total_debit)}
          </p>
        </div>
        <div className="flex-1 p-3 text-center">
          <p className="text-xs text-gray-400">Movimentos</p>
          <p className="text-sm font-semibold text-gray-700">{account.movement_count}</p>
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Criar app/(app)/dashboard/page.tsx**

```typescript
import { formatCurrency } from '@/lib/utils'
import { getAccountsWithStats } from '@/lib/queries/accounts'
import { getRecentMovements } from '@/lib/queries/movements'
import { AccountCard } from '@/components/accounts/account-card'
import { MovementItem } from '@/components/movements/movement-item'

export default async function DashboardPage() {
  const [accounts, recentMovements] = await Promise.all([
    getAccountsWithStats(),
    getRecentMovements(10),
  ])

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0)
  const totalCredit = accounts.reduce((sum, a) => sum + a.total_credit, 0)
  const totalDebit = accounts.reduce((sum, a) => sum + a.total_debit, 0)

  const now = new Date()
  const monthName = now.toLocaleString('pt-PT', { month: 'long', year: 'numeric' })

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 px-5 pt-12 pb-8 text-white">
        <p className="text-sm opacity-70 capitalize">{monthName}</p>
        <p className="text-sm opacity-80 mt-2">Saldo Total</p>
        <p className="text-4xl font-bold mt-1">{formatCurrency(totalBalance)}</p>
        <div className="flex gap-3 mt-4">
          <div className="flex-1 bg-white/15 rounded-xl p-3">
            <p className="text-xs opacity-80">Proveitos</p>
            <p className="font-semibold">+{formatCurrency(totalCredit)}</p>
          </div>
          <div className="flex-1 bg-white/15 rounded-xl p-3">
            <p className="text-xs opacity-80">Despesas</p>
            <p className="font-semibold">-{formatCurrency(totalDebit)}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-6">
        {/* Contas em scroll horizontal */}
        {accounts.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Contas
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {accounts.map((account, i) => (
                <AccountCard key={account.id} account={account} index={i} compact />
              ))}
            </div>
          </section>
        )}

        {/* Movimentos recentes */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Recentes
          </h2>
          {recentMovements.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-sm">Ainda não tens movimentos.</p>
              <p className="text-xs mt-1">Toca em + para adicionar o primeiro.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentMovements.map((movement) => (
                <MovementItem key={movement.id} movement={movement} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verificar o dashboard no browser**

```bash
npm run dev
```

Abrir http://localhost:3000 → login → dashboard deve mostrar saldo total e lista vazia.

- [ ] **Step 4: Commit**

```bash
git add app/\(app\)/dashboard/ components/accounts/account-card.tsx
git commit -m "feat: add dashboard page with balance hero and recent movements"
```

---

## Task 11: Accounts Page

**Files:**
- Create: `app/(app)/accounts/page.tsx`
- Create: `app/(app)/accounts/[id]/page.tsx`
- Create: `components/accounts/account-form.tsx`
- Create: `components/movements/movement-list.tsx`

- [ ] **Step 1: Criar components/accounts/account-form.tsx**

```typescript
'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { createAccount } from '@/app/(app)/accounts/actions'
import { Plus } from 'lucide-react'

export function AccountForm() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await createAccount(formData)
    setLoading(false)

    if (result?.error) {
      toast.error(result.error)
      return
    }

    toast.success('Conta criada.')
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Conta</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <Label htmlFor="name">Nome da conta</Label>
            <Input id="name" name="name" placeholder="Ex: Conta Principal" required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="account_number">Número de conta</Label>
            <Input id="account_number" name="account_number" placeholder="Ex: PT50 0002 0123..." required className="mt-1" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'A criar...' : 'Criar Conta'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Criar app/(app)/accounts/page.tsx**

```typescript
import { getAccountsWithStats } from '@/lib/queries/accounts'
import { AccountCard } from '@/components/accounts/account-card'
import { AccountForm } from '@/components/accounts/account-form'

export default async function AccountsPage() {
  const accounts = await getAccountsWithStats()

  return (
    <div className="px-4 pt-12 pb-5">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contas</h1>
        <AccountForm />
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">Ainda não tens contas.</p>
          <p className="text-xs mt-1">Toca em + para criar a primeira.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((account, i) => (
            <AccountCard key={account.id} account={account} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Criar components/movements/movement-list.tsx**

```typescript
'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { MovementItem } from './movement-item'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Movement, Category, Label } from '@/lib/types'

type MovementListProps = {
  movements: Movement[]
  categories: Category[]
  labels: Label[]
  accountId: string
}

export function MovementList({ movements, categories, labels, accountId }: MovementListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.replace(`${pathname}?${params.toString()}`)
  }

  function openEdit(movementId: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('edit-movement', movementId)
    router.push(`${pathname}?${params.toString()}`)
  }

  const typeFilter = searchParams.get('type') ?? ''
  const categoryFilter = searchParams.get('category_id') ?? ''
  const labelFilter = searchParams.get('label_id') ?? ''

  return (
    <div>
      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        <Select value={typeFilter} onValueChange={(v) => updateFilter('type', v === 'all' ? '' : v)}>
          <SelectTrigger className="min-w-[110px] h-8 text-xs">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="debit">Débito</SelectItem>
            <SelectItem value="credit">Crédito</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={(v) => updateFilter('category_id', v === 'all' ? '' : v)}>
          <SelectTrigger className="min-w-[130px] h-8 text-xs">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={labelFilter} onValueChange={(v) => updateFilter('label_id', v === 'all' ? '' : v)}>
          <SelectTrigger className="min-w-[110px] h-8 text-xs">
            <SelectValue placeholder="Label" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {labels.map((l) => (
              <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista */}
      {movements.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">Sem movimentos para os filtros seleccionados.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {movements.map((movement) => (
            <MovementItem
              key={movement.id}
              movement={movement}
              onClick={() => openEdit(movement.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Criar app/(app)/accounts/[id]/page.tsx**

```typescript
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { getAccountById } from '@/lib/queries/accounts'
import { getMovementsByAccount } from '@/lib/queries/movements'
import { getCategories } from '@/lib/queries/categories'
import { getLabels } from '@/lib/queries/labels'
import { MovementList } from '@/components/movements/movement-list'
import { formatCurrency } from '@/lib/utils'
import type { MovementFilters } from '@/lib/types'

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string>>
}

export default async function AccountDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const sp = await searchParams

  const [account, categories, labels] = await Promise.all([
    getAccountById(id),
    getCategories(),
    getLabels(),
  ])

  if (!account) notFound()

  const filters: MovementFilters = {
    type: sp.type as MovementFilters['type'],
    category_id: sp.category_id,
    label_id: sp.label_id,
  }

  const movements = await getMovementsByAccount(id, filters)

  const balance = movements.reduce(
    (sum, m) => sum + (m.type === 'credit' ? Number(m.amount) : -Number(m.amount)),
    0
  )

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 px-4 pt-10 pb-6 text-white">
        <Link href="/accounts" className="flex items-center gap-1 text-white/80 text-sm mb-4">
          <ChevronLeft className="w-4 h-4" />
          Contas
        </Link>
        <p className="text-sm opacity-80">{account.name}</p>
        <p className="text-3xl font-bold mt-1">{formatCurrency(balance)}</p>
        <p className="text-xs opacity-60 mt-1">{account.account_number}</p>
      </div>

      <div className="px-4 pt-4">
        <MovementList
          movements={movements}
          categories={categories}
          labels={labels}
          accountId={id}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add app/\(app\)/accounts/ components/accounts/ components/movements/movement-list.tsx
git commit -m "feat: add accounts page, account detail with movements list and filters"
```

---

## Task 12: Settings Page (Categories & Labels)

**Files:**
- Create: `app/(app)/settings/page.tsx`
- Create: `components/settings/icon-picker.tsx`
- Create: `components/settings/category-form.tsx`
- Create: `components/settings/label-form.tsx`

- [ ] **Step 1: Criar components/settings/icon-picker.tsx**

```typescript
'use client'

import { AVAILABLE_ICONS } from '@/lib/icons'
import { cn } from '@/lib/utils'

type IconPickerProps = {
  value: string
  onChange: (iconName: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {AVAILABLE_ICONS.map(({ name, label, icon: Icon }) => (
        <button
          key={name}
          type="button"
          title={label}
          onClick={() => onChange(name)}
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
            value === name
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          <Icon className="w-5 h-5" />
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Criar components/settings/category-form.tsx**

```typescript
'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createCategory, updateCategory } from '@/app/(app)/settings/actions'
import { Plus, Pencil } from 'lucide-react'
import type { Category } from '@/lib/types'

type CategoryFormProps = {
  category?: Category
}

export function CategoryForm({ category }: CategoryFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<'expense' | 'income'>(category?.type ?? 'expense')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.set('type', type)

    const result = category
      ? await updateCategory(category.id, formData)
      : await createCategory(formData)

    setLoading(false)
    if (result?.error) { toast.error(result.error); return }
    toast.success(category ? 'Categoria actualizada.' : 'Categoria criada.')
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {category ? (
          <button className="text-gray-400 hover:text-indigo-600">
            <Pencil className="w-4 h-4" />
          </button>
        ) : (
          <button className="w-full border-2 border-dashed border-gray-200 rounded-xl p-3 text-sm text-gray-400 hover:border-indigo-300 hover:text-indigo-500 flex items-center justify-center gap-2 transition-colors">
            <Plus className="w-4 h-4" />
            Nova categoria
          </button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <Label>Nome</Label>
            <Input name="name" defaultValue={category?.name} placeholder="Ex: Alimentação" required className="mt-1" />
          </div>
          <div>
            <Label>Tipo</Label>
            <div className="bg-gray-100 rounded-lg p-1 flex mt-1">
              <button type="button" onClick={() => setType('expense')}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${type === 'expense' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
                Despesa
              </button>
              <button type="button" onClick={() => setType('income')}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${type === 'income' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
                Proveito
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'A guardar...' : 'Guardar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 3: Criar components/settings/label-form.tsx**

```typescript
'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createLabel, updateLabel } from '@/app/(app)/settings/actions'
import { IconPicker } from './icon-picker'
import { getIconComponent } from '@/lib/icons'
import { Plus, Pencil } from 'lucide-react'
import type { Label as LabelType } from '@/lib/types'

type LabelFormProps = {
  label?: LabelType
}

export function LabelForm({ label }: LabelFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [symbol, setSymbol] = useState(label?.symbol ?? 'wallet')
  const router = useRouter()

  const SelectedIcon = getIconComponent(symbol)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.set('symbol', symbol)

    const result = label
      ? await updateLabel(label.id, formData)
      : await createLabel(formData)

    setLoading(false)
    if (result?.error) { toast.error(result.error); return }
    toast.success(label ? 'Label actualizada.' : 'Label criada.')
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {label ? (
          <button className="text-gray-400 hover:text-indigo-600">
            <Pencil className="w-4 h-4" />
          </button>
        ) : (
          <button className="w-full border-2 border-dashed border-gray-200 rounded-xl p-3 text-sm text-gray-400 hover:border-indigo-300 hover:text-indigo-500 flex items-center justify-center gap-2 transition-colors">
            <Plus className="w-4 h-4" />
            Nova label
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{label ? 'Editar Label' : 'Nova Label'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <Label>Nome</Label>
            <Input name="name" defaultValue={label?.name} placeholder="Ex: Férias" required className="mt-1" />
          </div>
          <div>
            <Label>Ícone seleccionado</Label>
            <div className="mt-1 flex items-center gap-2 p-3 bg-indigo-50 rounded-lg">
              <SelectedIcon className="w-5 h-5 text-indigo-600" />
              <span className="text-sm text-indigo-700 font-medium">{symbol}</span>
            </div>
          </div>
          <div>
            <Label>Escolher ícone</Label>
            <div className="mt-2">
              <IconPicker value={symbol} onChange={setSymbol} />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'A guardar...' : 'Guardar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 4: Criar app/(app)/settings/page.tsx**

```typescript
import { createClient } from '@/lib/supabase/server'
import { getCategories } from '@/lib/queries/categories'
import { getLabels } from '@/lib/queries/labels'
import { logout } from '@/app/(auth)/login/actions'
import { CategoryForm } from '@/components/settings/category-form'
import { LabelForm } from '@/components/settings/label-form'
import { DeleteButton } from '@/components/settings/delete-button'
import { getIconComponent } from '@/lib/icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const [categories, labels] = await Promise.all([getCategories(), getLabels()])

  return (
    <div className="px-4 pt-12 pb-5 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>

      {/* Perfil */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-lg">
            {user?.email?.[0]?.toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{user?.email}</p>
        </div>
        <form action={logout}>
          <Button variant="ghost" size="icon" type="submit" title="Sair">
            <LogOut className="w-4 h-4 text-gray-400" />
          </Button>
        </form>
      </div>

      {/* Categorias */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Categorias
        </h2>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {categories.length === 0 && (
            <p className="text-sm text-gray-400 p-4 text-center">Sem categorias.</p>
          )}
          {categories.map((cat, i) => (
            <div key={cat.id} className={`flex items-center justify-between p-3 ${i < categories.length - 1 ? 'border-b border-gray-50' : ''}`}>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-gray-900">{cat.name}</span>
                <Badge variant={cat.type === 'expense' ? 'destructive' : 'default'} className="text-[10px]">
                  {cat.type === 'expense' ? 'despesa' : 'proveito'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <CategoryForm category={cat} />
                <DeleteButton id={cat.id} type="category" />
              </div>
            </div>
          ))}
          <div className="p-3">
            <CategoryForm />
          </div>
        </div>
      </section>

      {/* Labels */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Labels
        </h2>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {labels.length === 0 && (
            <p className="text-sm text-gray-400 p-4 text-center">Sem labels.</p>
          )}
          {labels.map((lbl, i) => {
            const Icon = getIconComponent(lbl.symbol)
            return (
              <div key={lbl.id} className={`flex items-center justify-between p-3 ${i < labels.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="font-medium text-sm text-gray-900">{lbl.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <LabelForm label={lbl} />
                  <DeleteButton id={lbl.id} type="label" />
                </div>
              </div>
            )
          })}
          <div className="p-3">
            <LabelForm />
          </div>
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 5: Criar components/settings/delete-button.tsx**

```typescript
'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { deleteCategory, deleteLabel } from '@/app/(app)/settings/actions'

type DeleteButtonProps = {
  id: string
  type: 'category' | 'label'
}

export function DeleteButton({ id, type }: DeleteButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Tens a certeza? Esta acção não pode ser desfeita.')) return
    setLoading(true)
    const result = type === 'category' ? await deleteCategory(id) : await deleteLabel(id)
    setLoading(false)
    if (result?.error) { toast.error(result.error); return }
    toast.success(type === 'category' ? 'Categoria eliminada.' : 'Label eliminada.')
    router.refresh()
  }

  return (
    <button onClick={handleDelete} disabled={loading} className="text-gray-400 hover:text-red-500 transition-colors">
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add app/\(app\)/settings/ components/settings/
git commit -m "feat: add settings page with categories and labels CRUD and icon picker"
```

---

## Task 13: Statistics Page

**Files:**
- Create: `app/(app)/stats/page.tsx`
- Create: `components/charts/category-pie-chart.tsx`
- Create: `components/charts/label-bar-chart.tsx`

- [ ] **Step 1: Criar components/charts/category-pie-chart.tsx**

```typescript
'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import type { StatsByCategory } from '@/lib/types'

const COLORS = ['#4f46e5', '#7c3aed', '#0891b2', '#059669', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6']

type CategoryPieChartProps = {
  data: StatsByCategory[]
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Sem dados para o período seleccionado.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="category_name"
          cx="50%"
          cy="45%"
          outerRadius={80}
          innerRadius={50}
          paddingAngle={2}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), 'Total']}
          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
        />
        <Legend
          formatter={(value) => <span style={{ fontSize: '11px', color: '#374151' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 2: Criar components/charts/label-bar-chart.tsx**

```typescript
'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { getIconComponent } from '@/lib/icons'
import type { StatsByLabel } from '@/lib/types'

const COLORS = ['#4f46e5', '#7c3aed', '#0891b2', '#059669', '#f59e0b', '#ef4444']

type LabelBarChartProps = {
  data: StatsByLabel[]
}

function CustomYAxisTick({ x, y, payload }: any) {
  const Icon = getIconComponent(payload.symbol ?? 'wallet')
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={-4} y={4} textAnchor="end" fontSize={11} fill="#6b7280">
        {payload.value}
      </text>
    </g>
  )
}

export function LabelBarChart({ data }: LabelBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Sem labels com movimentos no período seleccionado.
      </div>
    )
  }

  const chartData = data.map((d) => ({
    name: d.label_name,
    total: Math.abs(d.total),
    symbol: d.label_symbol,
  }))

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 48)}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
        <XAxis
          type="number"
          tickFormatter={(v) => `€${v}`}
          tick={{ fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={80}
        />
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), 'Total']}
          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
        />
        <Bar dataKey="total" radius={[0, 6, 6, 0]}>
          {chartData.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 3: Criar app/(app)/stats/page.tsx**

```typescript
import { getStatsByCategory, getStatsByLabel } from '@/lib/queries/stats'
import { CategoryPieChart } from '@/components/charts/category-pie-chart'
import { LabelBarChart } from '@/components/charts/label-bar-chart'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type PageProps = {
  searchParams: Promise<Record<string, string>>
}

export default async function StatsPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const now = new Date()
  const month = Number(sp.month ?? now.getMonth() + 1)
  const year = Number(sp.year ?? now.getFullYear())

  const monthName = new Date(year, month - 1).toLocaleString('pt-PT', {
    month: 'long',
    year: 'numeric',
  })

  const [expensesByCategory, incomeByCategory, statsByLabel] = await Promise.all([
    getStatsByCategory(month, year, 'debit'),
    getStatsByCategory(month, year, 'credit'),
    getStatsByLabel(month, year),
  ])

  return (
    <div className="px-4 pt-12 pb-5">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Estatísticas</h1>
        <span className="text-sm text-gray-500 capitalize">{monthName}</span>
      </div>

      <Tabs defaultValue="expenses">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="expenses" className="flex-1">Despesas</TabsTrigger>
          <TabsTrigger value="income" className="flex-1">Proveitos</TabsTrigger>
          <TabsTrigger value="labels" className="flex-1">Labels</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses">
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Despesas por categoria
            </h2>
            <CategoryPieChart data={expensesByCategory} />
          </div>
        </TabsContent>

        <TabsContent value="income">
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Proveitos por categoria
            </h2>
            <CategoryPieChart data={incomeByCategory} />
          </div>
        </TabsContent>

        <TabsContent value="labels">
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Movimentos por label
            </h2>
            <LabelBarChart data={statsByLabel} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add app/\(app\)/stats/ components/charts/
git commit -m "feat: add statistics page with pie chart by category and bar chart by label"
```

---

## Task 14: Polish — Skeletons, Empty States & Final Wiring

**Files:**
- Create: `app/(app)/dashboard/loading.tsx`
- Create: `app/(app)/accounts/loading.tsx`
- Create: `app/(app)/stats/loading.tsx`
- Verify: `components/layout/bottom-sheet.tsx` — edit movement flow

- [ ] **Step 1: Criar loading skeletons**

Criar `app/(app)/dashboard/loading.tsx`:

```typescript
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div>
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 px-5 pt-12 pb-8">
        <Skeleton className="h-4 w-24 bg-white/20 mb-3" />
        <Skeleton className="h-10 w-40 bg-white/20 mb-4" />
        <div className="flex gap-3">
          <Skeleton className="h-16 flex-1 bg-white/20 rounded-xl" />
          <Skeleton className="h-16 flex-1 bg-white/20 rounded-xl" />
        </div>
      </div>
      <div className="px-4 py-5 space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}
```

Criar `app/(app)/accounts/loading.tsx`:

```typescript
import { Skeleton } from '@/components/ui/skeleton'

export default function AccountsLoading() {
  return (
    <div className="px-4 pt-12 pb-5 space-y-4">
      <Skeleton className="h-8 w-32" />
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-32 w-full rounded-2xl" />
      ))}
    </div>
  )
}
```

Criar `app/(app)/stats/loading.tsx`:

```typescript
import { Skeleton } from '@/components/ui/skeleton'

export default function StatsLoading() {
  return (
    <div className="px-4 pt-12 pb-5 space-y-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-12 w-full rounded-lg" />
      <Skeleton className="h-72 w-full rounded-2xl" />
    </div>
  )
}
```

- [ ] **Step 2: Verificar fluxo completo no browser**

```bash
npm run dev
```

Verificar:
1. Login/registo funciona
2. Dashboard mostra saldo (inicialmente 0 com empty state)
3. Criar uma conta em /accounts
4. Adicionar categoria e label em /settings
5. Adicionar movimento via botão + → seleccionar conta, categoria, label → guardar
6. Dashboard actualiza com o movimento
7. /accounts/[id] mostra o movimento
8. /stats mostra os gráficos
9. Logout funciona

- [ ] **Step 3: Testar em mobile (viewport 375px)**

No DevTools do Chrome → Responsive mode → iPhone SE ou similar.
Verificar: tab bar não cobre conteúdo, hero fica bem, formulários são usáveis.

- [ ] **Step 4: Correr os testes finais**

```bash
npm run test:run
```

Resultado esperado: todos os testes passam.

- [ ] **Step 5: Commit final**

```bash
git add .
git commit -m "feat: complete GestContas MVP with dashboard, accounts, movements, stats and settings"
```

---

## Task 15: Deploy no Vercel

- [ ] **Step 1: Criar repositório Git remoto e fazer push**

```bash
git remote add origin https://github.com/SEU_USERNAME/gestcontas.git
git branch -M main
git push -u origin main
```

- [ ] **Step 2: Conectar ao Vercel**

1. Aceder a https://vercel.com/new
2. Importar o repositório `gestcontas`
3. Framework: Next.js (detectado automaticamente)
4. Adicionar as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL` → URL do projecto Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Anon key do Supabase

- [ ] **Step 3: Deploy e verificar**

Clicar Deploy. Após concluir, abrir o URL de produção e verificar login + criação de conta.

- [ ] **Step 4: Configurar URL de produção no Supabase**

No Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `https://gestcontas.vercel.app` (ou o URL do teu projecto)
- Redirect URLs: adicionar `https://gestcontas.vercel.app/**`

---

## Self-Review

**Spec coverage:**
- ✅ Contas com nome e número → Task 11 (AccountForm, accounts/actions.ts)
- ✅ Movimentos com data, descrição, valor, tipo, categoria, label → Task 9 (MovementForm)
- ✅ Dashboard com saldos e movimentos recentes → Task 10
- ✅ Gráfico por categoria → Task 13 (CategoryPieChart)
- ✅ Gráfico por label → Task 13 (LabelBarChart)
- ✅ Autenticação Supabase → Task 5
- ✅ RLS → Task 3
- ✅ Categorias geridas pelo utilizador → Task 12
- ✅ Labels com ícone Lucide pré-definido → Task 12 (IconPicker)
- ✅ Mobile-first com tab bar → Task 6
- ✅ Tema claro azul-roxo → AccountCard gradientes, hero dashboard
- ✅ Deploy Vercel → Task 15

**Type consistency:** `MovementForm` usa `createMovement`/`updateMovement` de `lib/actions/movements.ts` com assinatura `(formData)` e `(id, formData)` respectivamente — consistente em todos os tasks.

**Nenhum placeholder, TBD ou TODO no plano.**
