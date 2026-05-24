# Vidamedics - Project Architecture

## Overview

Vidamedics is an e-commerce website for medical equipment built with TanStack Start (React 19 SSR framework) deployed on Netlify. It uses Netlify's managed services for data persistence, authentication, and file storage.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start |
| Frontend | React 19, TanStack Router v1 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 |
| Database | Netlify Database (Postgres) + Drizzle ORM |
| Authentication | Netlify Identity (@netlify/identity) |
| Image Storage | Netlify Blobs |
| Icons | Lucide React |
| Language | TypeScript 5.9 (strict mode) |
| Deployment | Netlify |

## Architecture Decisions

- **TanStack Start** was chosen for SSR, file-based routing, and server functions — all in one React framework.
- **Netlify Database** (Postgres + Drizzle ORM) stores product data. Prices are stored in cents (integer) to avoid floating-point issues.
- **Netlify Identity** handles authentication. The `nf_jwt` cookie provides SSR-compatible auth. Admin routes use role-based access via `user.roles`.
- **Netlify Blobs** stores uploaded product images. Images are served through an API route at `/api/images/:key`.
- **Cart state** uses client-side localStorage (no server-side cart). This is intentional for simplicity.

## Directory Structure

```
src/
├── components/
│   ├── CallbackHandler.tsx    # OAuth/email callback handler
│   ├── Footer.tsx             # Site footer
│   └── Header.tsx             # Site header with nav, auth state, cart
├── lib/
│   ├── auth.ts                # getServerUser server function
│   ├── cart-context.tsx       # Client-side cart state (localStorage)
│   ├── identity-context.tsx   # Client-side auth context
│   ├── images.ts              # Image upload server function (Netlify Blobs)
│   └── products.ts            # Product CRUD server functions
├── middleware/
│   └── identity.ts            # Auth middleware (identity, requireAuth, requireRole)
├── routes/
│   ├── admin/
│   │   ├── index.tsx                      # Product list table
│   │   ├── products.new.tsx               # Add new product form
│   │   └── products.$productId.edit.tsx   # Edit product form
│   ├── api/
│   │   └── images/$imageKey.ts            # Image serving API route
│   ├── checkout/
│   │   ├── cancel.tsx                     # Checkout cancelled page
│   │   └── success.tsx                    # Checkout success page
│   ├── products/
│   │   └── $productId.tsx                 # Product detail page
│   ├── __root.tsx             # Root layout (providers, header, footer)
│   ├── admin.tsx              # Admin layout with role guard
│   ├── cart.tsx               # Shopping cart page
│   ├── index.tsx              # Homepage / product catalog
│   ├── login.tsx              # Login page
│   └── signup.tsx             # Signup page
├── router.tsx                 # TanStack Router config
└── styles.css                 # Global styles with purple theme
db/
├── schema.ts                  # Drizzle ORM schema (products table)
└── index.ts                   # Database client
netlify/
├── database/migrations/       # Auto-generated SQL migrations
└── functions/
    └── identity-signup.ts     # Webhook: assigns 'user' role on signup
```

## Key Concepts

### File-Based Routing (TanStack Router)

Routes are defined by files in `src/routes/`:
- `__root.tsx` - Root layout wrapping all pages
- `index.tsx` - Route for `/`
- `admin.tsx` - Layout route for `/admin/*` with role guard
- `admin/index.tsx` - Admin product list
- `api/*.ts` - API routes

### Auth Flow

- New users sign up -> confirmation email -> click link -> account activated
- `identity-signup` webhook auto-assigns `'user'` role
- Admin role must be manually assigned in Netlify dashboard (`app_metadata.roles: ["admin"]`)
- Admin routes use `beforeLoad` guard that checks `user.roles.includes('admin')`

### Database

- Single `products` table with: id, name, description, short_description, price (cents), image_url, category, in_stock, created_at, updated_at
- Drizzle ORM with `@beta` dist-tag (required for Netlify Database adapter)
- Migrations auto-generated into `netlify/database/migrations/`
- Never modify applied migrations; always roll forward

## Development Commands

```bash
npm run dev      # Start dev server (port 3000)
npm run build    # Production build
```

## Conventions

### Naming
- Components: PascalCase
- Utilities/hooks: camelCase
- Routes: kebab-case files

### Styling
- Tailwind CSS 4 utility classes
- Custom purple theme defined in `src/styles.css`
- Brand colors: purple (#7e22ce), white, black

### TypeScript
- Strict mode enabled
- Import paths use `@/` alias for `src/*`
- Server functions use `.inputValidator()` (not `.validator()`)
