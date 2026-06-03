# InvManager — Inventory & Order Management System

A production-ready full-stack inventory, quotation, and order management system built with Next.js 16, TypeScript, Prisma 7, Neon PostgreSQL, and Tailwind CSS v4.

---

## Features

### Authentication
- JWT-based stateless sessions (jose, httpOnly cookies)
- Role-based access: **ADMIN** and **USER**
- Registration, login, logout
- Protected routes via `proxy.ts` (Next.js 16 middleware replacement)

### Admin
- **Dashboard** — stats cards, charts (orders by status, products by category), recent orders table
- **Product Management** — create, read, update, delete, search, filter, paginate, toggle active
- **Inventory Management** — view stock in base units + display units, update stock, value summary
- **Order Management** — view all orders with full detail, approve / reject / complete orders

### User
- **Dashboard** — personal stats, quick actions, recent orders
- **Product Browser** — search, filter by category/unit, sort by name/price/date, add to order
- **Quotation Builder** — multi-product order with live unit conversion and price calculation
- **Order History** — track status, expandable order item details

### Unit Conversion System
| Type   | Base Unit | User Units | Conversion       |
|--------|-----------|------------|------------------|
| Weight | `g`       | g, kg      | 1 kg = 1000 g    |
| Volume | `mL`      | mL, L      | 1 L  = 1000 mL   |
| Count  | `item`    | item       | 1:1              |

All quantities stored in base units. Display automatically converts to readable form (5000 g → 5 kg).

---

## Tech Stack

| Layer        | Technology                              |
|--------------|-----------------------------------------|
| Framework    | Next.js 16 (App Router, Turbopack)      |
| Language     | TypeScript 5 (strict mode)              |
| Styling      | Tailwind CSS v4 + Radix UI primitives   |
| Database     | Neon PostgreSQL (serverless)            |
| ORM          | Prisma 7 + @prisma/adapter-neon         |
| Auth         | Custom JWT sessions (jose)              |
| Validation   | Zod v4                                  |
| Charts       | Recharts                                |
| Icons        | Lucide React                            |
| Deployment   | Vercel                                  |

---

## Database Schema

```prisma
model User       { id, name, email, password, role (ADMIN|USER), ... }
model Product    { id, name, sku, category, baseUnit, pricePerBaseUnit NUMERIC(20,8), stockQuantity NUMERIC(20,8), ... }
model Order      { id, userId, status (PENDING|APPROVED|REJECTED|COMPLETED), totalAmount NUMERIC(20,8), ... }
model OrderItem  { id, orderId, productId, enteredQuantity, enteredUnit, convertedQuantity, pricePerUnit, lineTotal — all NUMERIC(20,8) }
```

### Why NUMERIC(20,8)?
Floating-point types (`FLOAT`, `DOUBLE`) cannot represent decimal values exactly — e.g. `0.1 + 0.2 ≠ 0.3` in IEEE 754. For financial and scientific quantities, this causes real money errors. `NUMERIC(20,8)` stores exact decimal values with up to 8 decimal places, preventing rounding errors in price calculations and unit conversions.

---

## Price Storage Strategy

- `pricePerBaseUnit` — stored per 1 base unit (₹/g, ₹/mL, ₹/item)
- `lineTotal` = `convertedQuantity × pricePerUnit`
- `totalAmount` = sum of all `lineTotal` values
- All arithmetic in JS uses `Number` for display; stored via Prisma `Decimal` → PostgreSQL `NUMERIC(20,8)`

---

## Project Structure

```
src/
├── actions/          # Server Actions (auth, products, orders)
├── app/
│   ├── (auth)/       # login, register pages
│   ├── (protected)/
│   │   ├── admin/    # admin dashboard, products, inventory, orders
│   │   └── dashboard/ # user dashboard, products, quotation, orders
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── layout/       # Sidebar, PageHeader
│   └── ui/           # Button, Card, Badge, Dialog, Select, Toast, ...
├── hooks/            # useToast
├── lib/
│   ├── prisma.ts     # Prisma singleton (Neon adapter)
│   ├── session.ts    # JWT session management
│   ├── units.ts      # Unit conversion utilities
│   ├── validations.ts # Zod schemas
│   ├── types.ts      # Shared TypeScript types
│   └── utils.ts      # cn, formatDate, formatDateTime
├── generated/prisma/ # Auto-generated Prisma client (Prisma 7)
└── proxy.ts          # Next.js 16 proxy (replaces middleware.ts)
prisma/
├── schema.prisma
├── seed.ts
└── migrations/
```

---

## Setup Instructions

### 1. Clone & install
```bash
git clone <repo-url>
cd inventoryproject
npm install
```

### 2. Environment variables
Copy `.env.example` to `.env` and fill in values:
```env
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"
AUTH_SECRET="your-32-char-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

Generate `AUTH_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Neon PostgreSQL setup
1. Go to [neon.tech](https://neon.tech) → create a free project
2. Click **Connection string** → turn off **Connection pooling**  
3. Copy the URL into `DATABASE_URL` in `.env`

### 4. Run migrations
```bash
npx prisma migrate dev --name init
```

### 5. Seed the database
```bash
npm run db:seed
```

### 6. Start dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Demo Credentials

| Role  | Email                 | Password  |
|-------|-----------------------|-----------|
| Admin | admin@example.com     | Admin123@ |
| User  | user@example.com      | User123@  |

---

## NPM Scripts

| Command             | Description                        |
|---------------------|------------------------------------|
| `npm run dev`       | Start development server           |
| `npm run build`     | Production build                   |
| `npm run start`     | Start production server            |
| `npm run db:migrate`| Run Prisma migrations              |
| `npm run db:seed`   | Seed the database                  |
| `npm run db:generate`| Regenerate Prisma client          |
| `npm run db:studio` | Open Prisma Studio                 |

---

## Vercel Deployment

1. Push to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Add environment variables:
   - `DATABASE_URL` — your Neon connection string
   - `AUTH_SECRET` — your generated secret
   - `NEXTAUTH_URL` — your Vercel deployment URL
4. Deploy

---

## Key Design Decisions

- **`proxy.ts` not `middleware.ts`** — Next.js 16 renamed middleware to proxy. The function is also named `proxy` not `middleware`.
- **All async APIs** — `cookies()`, `headers()`, `params`, `searchParams` are all `await`ed (Next.js 16 removed sync fallbacks).
- **No NextAuth library** — using custom JWT sessions with `jose` for full control and no OAuth complexity.
- **Prisma 7 adapter pattern** — connection URL is no longer in `schema.prisma`; it's passed via `PrismaNeon` adapter constructor.
- **`@neondatabase/serverless`** — Neon's official driver, handles HTTP-based connections that work in serverless/edge environments.

---

## Future Improvements

- Email notifications on order status change
- Export orders to PDF/CSV
- Inventory alerts (low stock emails)
- Bulk product import via CSV
- Role: Manager (approve but not manage products)
- Audit log for all admin actions
- Dark mode toggle
- Mobile app (React Native)
