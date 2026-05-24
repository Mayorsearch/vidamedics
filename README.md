# Vidamedics - Professional Medical Equipment E-Commerce

A professional e-commerce website for Vidamedics, selling medical equipment including stethoscopes, gloves, diagnostic tools, PPE, and more.

## Tech Stack

- **Framework**: TanStack Start (React 19, SSR)
- **Styling**: Tailwind CSS 4
- **Database**: Netlify Database (managed Postgres) with Drizzle ORM
- **Authentication**: Netlify Identity (`@netlify/identity`)
- **Image Storage**: Netlify Blobs
- **Deployment**: Netlify
- **Icons**: Lucide React

## Features

- Product catalog with search and category filtering
- Product detail pages
- Shopping cart with localStorage persistence
- User registration and login (Netlify Identity)
- Admin dashboard for product management (CRUD)
- Product image upload via Netlify Blobs
- Role-based access control (admin vs user)
- Responsive design with purple/white/black branding

## Running Locally

```bash
npm install
npm run dev
```

The site runs on `http://localhost:3000`. Note that Netlify Identity authentication only works when deployed to Netlify — it does not function on localhost.

## Admin Access

To create an admin user:
1. Deploy the site to Netlify
2. Go to **Netlify Dashboard > Project configuration > Identity**
3. Create or invite a user
4. Under that user's profile, set `app_metadata` to `{ "roles": ["admin"] }`

Admin users can access `/admin` to manage products (add, edit, delete).

## Project Structure

```
src/
├── components/         # Shared UI components
├── lib/               # Server functions, auth, cart context
├── middleware/         # TanStack Start middleware (auth)
├── routes/            # File-based routes
│   ├── admin/         # Admin dashboard pages
│   ├── api/           # API routes (image serving)
│   ├── checkout/      # Checkout success/cancel pages
│   └── products/      # Product detail page
db/
├── schema.ts          # Drizzle ORM schema
└── index.ts           # Database client
netlify/
├── database/migrations/ # Auto-generated SQL migrations
└── functions/         # Netlify Functions (identity webhook)
```
