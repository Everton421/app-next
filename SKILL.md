---
name: app-next-internal
description: Conventions and patterns specific to this internal Next.js project. Includes security best practices, API patterns, auth handling, Server Components, and professional UI standards.
---

Conventions and patterns specific to this internal Next.js project.

## Project Overview

- **Next.js 14** (App Router)
- **Auth**: Custom AuthContext with localStorage (NOT next-auth)
- **UI**: Heroui + Radix UI + PrimeReact
- **Styling**: TailwindCSS with cn() utility
- **Structure**: Standard Next.js + libs pattern

## Project Structure

```
var/www/html/app-next/
├── app/                    # Next.js App Router (routes)
│   ├── clientes/           # Feature: clientes (page, components, [codigo])
│   ├── pedidos/             # Feature: pedidos
│   ├── produtos/           # Feature: produtos
│   ├── veiculos/           # Feature: veiculos
│   ├── servicos/           # Feature: servicos
│   ├── marcas/             # Feature: marcas
│   ├── categorias/         # Feature: categorias
│   ├── home/               # Dashboard
│   ├── login/              # Auth page
│   └── layout.tsx          # Root layout
├── components/             # Reusable components
│   ├── ui/                 # shadcn/ui base components
│   ├── layout/             # Sidebar, Navbar, Footer
│   └── [feature]/          # Feature-specific components
├── contexts/              # React Context (AuthContext)
├── lib/                   # Utilities & API
│   ├── api.tsx             # Axios configuration
│   ├── dateService.ts      # Date utilities
│   └── utils.ts            # cn() utility
├── types/                 # Global TypeScript types
│   ├── cliente.ts
│   ├── pedido.ts
│   ├── produto.ts
│   └── servico.ts
└── public/                # Static assets
```

## Import Patterns

```tsx
// API - use @/lib/api
import { configApi } from "@/lib/api";

// Utils - use @/lib/utils
import { cn } from "@/lib/utils";

// Types - use @/types
import type { Cliente, Pedido } from "@/types";

// UI Components - use @/components/ui
import { Button, Input, Table } from "@/components/ui";

// Context - use @/contexts
import { useAuth } from "@/contexts/AuthContext";
```

## Deprecation Notice

Old import paths still work but are deprecated:

```tsx
// ✅ New (recommended)
import { configApi } from "@/lib/api";
import { DateService } from "@/lib/dateService";
import { Cliente } from "@/types/cliente";

// ⚠️ Old (deprecated - will show warning)
import { configApi } from "@/app/services/api";
import { DateService } from "@/app/services/dateService";
import { Cliente } from "@/app/clientes/types/cliente";
```

## Security Best Practices

### API Token Handling

**NEVER hardcode tokens in the API config.** The current implementation has a hardcoded token - this is a security vulnerability:

```tsx
// ❌ WRONG - Hardcoded token
config.headers["authorization"] = `token h43895jt9858094bun6098grubn48u59dsgfg234543tf`;

// ✅ CORRECT - Use dynamic token from AuthContext
config.headers["authorization"] = `token ${user?.token}`;
```

### Secure API Configuration

Always use the following pattern for secure API calls:

```tsx
import { configApi } from "@/app/services/api";
import { useAuth } from "@/contexts/AuthContext";

export default function MyComponent() {
  const { user, loading }: any = useAuth();
  
  const fetchData = async () => {
    const api = configApi();
    const response = await api.get('/endpoint', {
      headers: {
        'Authorization': `Bearer ${user?.token}`, // Dynamic token
        'Content-Type': 'application/json',
      },
      params: { /* query params */ }
    });
  };
  
  // Always check loading and user before rendering
  if (loading) return <Loading />;
  if (!user) { router.push('/login'); return null; }
  
  return <div>...</div>;
}
```

### Required Security Headers

Always include these headers in API requests:

```tsx
headers: {
  'Authorization': `Bearer ${user?.token}`,
  'Content-Type': 'application/json',
  // Add CSRF token if available
  'X-CSRF-Token': getCsrfToken(),
}
```

### Environment Variables

Store sensitive data in environment variables:

```env
# .env.local
NEXT_PUBLIC_API_URL=https://api.example.com/v1
API_TOKEN=your-secure-token-here
```

Never commit `.env.local` or `.env` files to version control.

## API Patterns

### Import Pattern

Always import from the correct path:

```tsx
import { configApi } from "@/app/services/api";
```

### Base URL Configuration

The API base URL should be configured via environment variable:

```tsx
const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/v1/";

export function configApi() {
  const api = axios.create({
    baseURL,
  });
  // ... interceptors
}
```

### HTTP Methods

```tsx
// GET
const api = configApi();
const response = await api.get('/endpoint', { params: { key: 'value' } });

// POST
const response = await api.post('/endpoint', data);

// PUT
const response = await api.put('/endpoint', data);

// DELETE
const response = await api.delete('/endpoint/1');
```

### Error Handling

Always handle API errors:

```tsx
try {
  const response = await api.get('/endpoint');
  return response.data;
} catch (error) {
  if (axios.isAxiosError(error)) {
    console.error('API Error:', error.response?.data);
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      logout();
    }
  }
  throw error;
}
```

## Auth Pattern

### Using useAuth Hook

```tsx
import { useAuth } from "@/contexts/AuthContext";

export default function MyPage() {
  const { user, loading, logout, setUser }: any = useAuth();
  
  // ... use user properties
  // user: { codigo, cnpj, vendedor, nome, token? }
}
```

### Auth Check Pattern

**CRITICAL**: Always check auth state before rendering protected content:

```tsx
if (loading) return <LoadingSpinner />;
if (!user) {
  router.push('/login');
  return null;
}
```

### Complete Example

```tsx
'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { configApi } from "@/app/services/api";
import { ThreeDot } from "react-loading-indicators";

export default function ProtectedPage() {
  const router = useRouter();
  const { user, loading }: any = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const api = configApi();
      const response = await api.get('/data');
      setData(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ThreeDot variant="pulsate" color="#2563eb" size="medium" text="" />
      </div>
    );
  }

  return <div>Protected content: {user.nome}</div>;
}
```

## Component Structure

```
components/
├── ui/           # shadcn/ui components (Radix-based)
├── sidebar/      # Custom layout components
├── navbar/       # Custom layout components
└── [feature]/   # Feature-specific components
```

## Pages Pattern

All pages are **Client Components** (`'use client'`):
- Use `useRouter` from `next/navigation`
- Fetch data in `useEffect`
- Handle auth check in `useEffect`

## Routes Structure

```
app/
├── clientes/         # List + CRUD
├── produtos/        # List + CRUD + sub-routes
├── pedidos/         # List + CRUD + components/
├── veiculos/        # List + CRUD
├── servicos/        # List + CRUD
├── marcas/          # List + CRUD
├── categorias/      # List + CRUD
├── home/            # Dashboard
├── login/           # Auth page
└── novaConta/       # Registration
```

## Loading State

Use `react-loading-indicators`:

```tsx
import { ThreeDot } from "react-loading-indicators";

<ThreeDot variant="pulsate" color="#2563eb" size="medium" text="" />
```

## UI Components

Import from `@/components/ui/`:
- Button, Input, Table
- Dialog, Sheet, Popover
- Checkbox, Select, Tabs
- Card, Alert, Tooltip

## Tailwind Classes

Common patterns:
- `min-h-screen flex flex-col sm:ml-14 p-4`
- `bg-slate-100` / `bg-white`
- `shadow-md rounded-lg`
- `text-gray-800 font-bold`

## Security Checklist

- [ ] No hardcoded tokens in source code
- [ ] API calls use dynamic tokens from AuthContext
- [ ] Environment variables for sensitive data
- [ ] Error handling for 401/403 responses
- [ ] Auth check on all protected routes
- [ ] No sensitive data in localStorage without encryption
- [ ] CSRF protection enabled
- [ ] HTTPS only in production

## Server Components Best Practices

### When to Use Server Components

- **Use Server Components (default)** for:
  - Fetching data (GET requests)
  - Rendering static content
  - Pages that don't need user interaction
  - Components that only display data

- **Use Client Components** for:
  - User interactions (onClick, onChange)
  - useState, useEffect hooks
  - Browser APIs (localStorage, window)
  - Event handlers

### Secure Server Component Pattern

```tsx
// ✅ Server Component - fetches data securely
import { cookies } from "next/headers";

async function getData() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token");

  const response = await fetch(`${process.env.API_URL}/data`, {
    headers: {
      Authorization: `Bearer ${token?.value}`,
      "Content-Type": "application/json",
    },
    cache: "no-store", // or "force-cache" for static data
  });

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  return response.json();
}

export default async function Page() {
  const data = await getData();

  return (
    <div>
      {data.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

### Hybrid Approach: Server + Client

For pages that need both server data and client interaction:

```tsx
// ✅ Server Component (page.tsx)
import { Suspense } from "react";
import { DataTable } from "./data-table";
import { LoadingSkeleton } from "./loading-skeleton";

export default async function Page() {
  const initialData = await fetchData(); // Server-side fetch

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <DataTable initialData={initialData} /> {/* Client component */}
    </Suspense>
  );
}
```

### Server Actions (替代 Client API Calls)

Use Server Actions for mutations instead of client-side API calls:

```tsx
// ✅ Server Action (app/actions.ts)
"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function createItem(formData: FormData) {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token");

  const response = await fetch(`${process.env.API_URL}/items`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token?.value}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(Object.fromEntries(formData)),
  });

  if (!response.ok) {
    throw new Error("Failed to create item");
  }

  revalidatePath("/items");
  return response.json();
}

// Client component using Server Action
"use client";

import { createItem } from "@/app/actions";

export function CreateForm() {
  return (
    <form action={createItem}>
      <input name="name" />
      <button type="submit">Create</button>
    </form>
  );
}
```

### Auth in Server Components

```tsx
// ✅ Check auth server-side
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const cookieStore = cookies();
  const user = cookieStore.get("auth_user");

  if (!user) {
    redirect("/login");
  }

  const userData = JSON.parse(user.value);

  return <div>Welcome, {userData.nome}</div>;
}
```

### Middleware for Route Protection

```ts
// middleware.ts (in app directory)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("auth_token");
  const { pathname } = request.nextUrl;

  // Public routes
  if (pathname === "/" || pathname === "/login" || pathname === "/novaConta") {
    return NextResponse.next();
  }

  // Protected routes - require auth
  if (!authToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
```

## UI Professional Standards

### Design Principles

1. **Consistent Spacing**: Use multiples of 4 (4, 8, 12, 16, 24, 32, 48)
2. **Professional Typography**: Use system fonts or proven fonts
3. **Subtle Shadows**: `shadow-sm` for cards, `shadow-md` for modals
4. **Consistent Borders**: `border border-gray-200` or `border-gray-300`
5. **Neutral Colors**: Primary slate/gray palette

### Professional UI Pattern

```tsx
// ✅ Professional Card Layout
<div className="bg-white rounded-lg border border-gray-200 shadow-sm">
  <div className="px-6 py-4 border-b border-gray-200">
    <h2 className="text-lg font-semibold text-gray-900">Title</h2>
  </div>
  <div className="p-6">
    {/* Content */}
  </div>
</div>

// ✅ Professional Table
<Table className="w-full border border-gray-200 rounded-lg overflow-hidden">
  <TableHeader className="bg-gray-50">
    <TableRow>
      <TableHead className="text-gray-600 font-medium">Header</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="hover:bg-gray-50">
      <TableCell className="text-gray-700">Data</TableCell>
    </TableRow>
  </TableBody>
</Table>

// ✅ Professional Button
<Button className="bg-gray-900 hover:bg-gray-800 text-white">
  Action
</Button>

// ✅ Secondary Button
<Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
  Cancel
</Button>
```

### Loading States

```tsx
// ✅ Professional Loading
<div className="flex items-center justify-center min-h-[400px]">
  <div className="flex flex-col items-center gap-3">
    <ThreeDot variant="pulsate" color="#4B5563" size="medium" />
    <span className="text-sm text-gray-500">Carregando dados...</span>
  </div>
</div>
```

### Error States

```tsx
// ✅ Professional Error
<div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
  <div className="text-red-500">
    <AlertCircle className="h-12 w-12" />
  </div>
  <p className="text-gray-600">Erro ao carregar dados</p>
  <Button variant="outline" onClick={refresh}>Tentar novamente</Button>
</div>
```

### Empty States

```tsx
// ✅ Professional Empty
<div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
  <Package className="h-12 w-12 text-gray-400" />
  <p className="text-gray-500">Nenhum registro encontrado</p>
  <Button onClick={createNew}>Adicionar registro</Button>
</div>
```

### Responsive Design

```tsx
// ✅ Professional responsive patterns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards adapt to screen size */}
</div>

// ✅ Table responsive
<div className="overflow-x-auto">
  <Table>...</Table>
</div>
```

### Form Styles

```tsx
// ✅ Professional Form Input
<Input
  className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
  placeholder="Nome do cliente"
/>

// ✅ Form Label
<Label className="text-gray-700 font-medium">Nome</Label>

// ✅ Form Error
<p className="text-sm text-red-600">Campo obrigatório</p>
```

