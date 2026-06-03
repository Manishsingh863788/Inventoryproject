# 🏢 InvManager - Complete Inventory & Order Management System

A modern, full-stack inventory and order management system built with Next.js 15, TypeScript, Prisma, and Neon PostgreSQL.

## 🚀 Live Demo

- **Demo URL**: [Your deployed URL here]
- **Admin Account**: `admin@example.com` / `Admin123@`
- **User Account**: `user@example.com` / `User123@`

## ✨ Features

### 🔐 Authentication & Authorization
- Role-based access control (Admin & User roles)
- Secure JWT-based sessions
- Protected routes and API endpoints
- Password hashing with bcrypt

### 👨‍💼 Admin Dashboard
- **Analytics Overview**: Total products, orders, pending orders, inventory value
- **Product Management**: Create, read, update, delete products
- **Inventory Control**: Stock tracking with unit conversions
- **Order Management**: Approve, reject, and complete orders
- **Interactive Charts**: Order status distribution, product categories

### 👤 User Dashboard
- **Product Browsing**: Search, filter, and browse products
- **Quotation System**: Create quotations with multiple products
- **Order Placement**: Convert quotations to orders
- **Order Tracking**: View order history and status

### 📊 Advanced Features
- **Unit Conversion System**: Automatic conversion between g/kg, mL/L, items
- **Precision Calculations**: Uses DECIMAL types for accurate pricing
- **Real-time Updates**: Server actions for instant UI updates
- **Responsive Design**: Mobile-first, modern UI with dark mode
- **Search & Filtering**: Advanced product search and filtering

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for components
- **Lucide React** for icons

### Backend
- **Next.js Server Actions** for API logic
- **Prisma ORM** for database operations
- **Neon PostgreSQL** for production database
- **bcrypt** for password hashing
- **jose** for JWT sessions

### Validation & Utils
- **Zod** for schema validation
- **React Hook Form** for form handling
- **Date-fns** for date formatting

## 📁 Project Structure

```
src/
├── actions/          # Server actions
├── app/
│   ├── (auth)/      # Authentication pages
│   ├── (protected)/ # Protected dashboard pages
│   └── globals.css  # Global styles
├── components/
│   ├── ui/          # Reusable UI components
│   └── layout/      # Layout components
├── hooks/           # Custom React hooks
└── lib/            # Utilities and configurations
prisma/
├── schema.prisma   # Database schema
├── migrations/     # Database migrations
└── seed.ts        # Database seeding
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Git
- Neon PostgreSQL account

### 1. Clone the Repository
```bash
git clone https://github.com/Manishsingh863788/Inventoryproject.git
cd Inventoryproject
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:

```env
# Database - Neon PostgreSQL
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"

# Auth Secret (generate with: openssl rand -base64 32)
AUTH_SECRET="your-secure-random-secret-key"

# App URL
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Database Setup
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed the database
npx prisma db seed
```

### 5. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🎯 Usage

### Admin Account Features:
1. Login with `admin@example.com` / `Admin123@`
2. Access admin dashboard at `/admin`
3. Manage products, inventory, and orders
4. View analytics and generate reports

### User Account Features:
1. Login with `user@example.com` / `User123@`
2. Browse products at `/dashboard`
3. Create quotations and place orders
4. Track order status and history

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Fork/Clone this repository**

2. **Import to Vercel**:
   - Connect your GitHub account
   - Import the repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**:
   ```env
   DATABASE_URL=your-neon-postgresql-url
   AUTH_SECRET=your-auth-secret
   NEXTAUTH_URL=https://your-app.vercel.app
   ```

4. **Deploy**:
   - Vercel will automatically build and deploy
   - Database migrations run automatically

### Database (Neon PostgreSQL)

1. **Create Neon Account**: [neon.tech](https://neon.tech)
2. **Create Database**: Get connection string
3. **Add to Environment**: Update `DATABASE_URL`
4. **Run Migrations**: `npx prisma migrate deploy`

## 🔗 API Endpoints

### Authentication
- `POST /login` - User login
- `POST /register` - User registration
- `POST /logout` - User logout

### Products (Admin)
- `GET /admin/products` - List products
- `POST /admin/products` - Create product
- `PUT /admin/products/:id` - Update product
- `DELETE /admin/products/:id` - Delete product

### Orders
- `GET /dashboard/orders` - User orders
- `POST /dashboard/orders` - Create order
- `GET /admin/orders` - All orders (admin)
- `PUT /admin/orders/:id` - Update order status (admin)

## 🧪 Testing

```bash
# Run development server
npm run dev

# Test with demo accounts:
# Admin: admin@example.com / Admin123@
# User: user@example.com / User123@
```

## 📝 Database Schema

### Core Tables
- **User**: Authentication and user profiles
- **Product**: Product catalog with pricing and inventory
- **Order**: Order management with status tracking
- **OrderItem**: Individual items within orders

### Key Features
- **Precision Decimals**: All monetary values use `DECIMAL(20,8)`
- **Unit Conversions**: Automatic conversion between metric units
- **Audit Trails**: Created/updated timestamps on all records

## 🔮 Future Enhancements

- [ ] **Multi-tenant Support**: Support multiple organizations
- [ ] **Advanced Reporting**: Excel/PDF export capabilities
- [ ] **Email Notifications**: Order status updates
- [ ] **Inventory Alerts**: Low stock warnings
- [ ] **API Rate Limiting**: Implement request throttling
- [ ] **Advanced Search**: Full-text search with filters
- [ ] **Mobile App**: React Native companion app

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Manish Singh**
- GitHub: [@Manishsingh863788](https://github.com/Manishsingh863788)
- Project: [Inventory Management System](https://github.com/Manishsingh863788/Inventoryproject)

---

⭐ **Star this repository if you found it helpful!**