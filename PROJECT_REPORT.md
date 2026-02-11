# CityPhone - Telecom Repair Management System
## Comprehensive Project Report

**Project Name:** CityPhone (Telecom Repair Intake & Tracking)  
**Version:** 0.1.0  
**Framework:** Next.js 14.2.5  
**Database:** SQLite  
**Language:** TypeScript + React  
**Status:** Development

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [Pages & Routes](#pages--routes)
6. [API Endpoints](#api-endpoints)
7. [Components](#components)
8. [Libraries & Utilities](#libraries--utilities)
9. [Authentication & Security](#authentication--security)
10. [Configuration Files](#configuration-files)
11. [Scripts & Commands](#scripts--commands)
12. [Setup & Installation](#setup--installation)

---

## 🎯 Project Overview

CityPhone is an Arabic mobile-first web application for managing telecom device repair services. It provides:
- **Quick invoice creation** for repair services
- **Customer tracking** with mobile number validation (Saudi Arabia focused)
- **WhatsApp & SMS integration** for customer notifications
- **Administrative dashboard** for managing repairs and statistics
- **Role-based access control** (ADMIN, STAFF, VIEWER)
- **Repair status management** with multiple workflow stages

### Key Features
✅ Arabic localization (RTL support)  
✅ Quick invoice generation with auto-incrementing numbers  
✅ Mobile phone validation (KSA format: +9665XXXXXXXX)  
✅ WhatsApp and SMS notification integration  
✅ Real-time repair status tracking  
✅ Statistical dashboard  
✅ Settings management (shop name, phone)  
✅ Session-based authentication with NextAuth  

---

## 🛠 Tech Stack

### Frontend
- **React 18.3.1** - UI framework
- **Next.js 14.2.5** - Server-side rendering & API routes
- **TypeScript 5.5.4** - Type safety
- **Tailwind CSS 3.4.7** - Styling with utility classes
- **PostCSS 8.4.38** - CSS processing
- **AutoPrefixer** - CSS vendor prefixes

### Backend & Database
- **Node.js 18+** - Runtime
- **Prisma 5.22.0** - ORM for database management
- **SQLite** - Lightweight local database
- **NextAuth 4.24.7** - Authentication middleware

### Authentication & Security
- **next-auth 4.24.7** - Session management
- **@next-auth/prisma-adapter 1.0.7** - Prisma adapter for NextAuth
- **bcryptjs 2.4.3** - Password hashing

### Utilities
- **dayjs 1.11.10** - Date manipulation
- **zod 3.23.8** - Data validation
- **bcryptjs 2.4.3** - Cryptography

### Development Tools
- **ESLint 8.57.0** - Code linting
- **ts-node 10.9.2** - TypeScript execution

---

## 📁 Project Structure

```
CityPhone/
├── prisma/                      # Database configuration
│   ├── schema.prisma           # Database schema definition
│   ├── seed.js                 # Database seeding script
│   ├── seed.ts                 # TypeScript seed version
│   └── dev.sqlite              # SQLite database file
│
├── src/
│   ├── components/             # Reusable React components
│   │   ├── Badge.tsx          # Status badge component
│   │   ├── Input.tsx          # Text input component
│   │   ├── Layout.tsx         # Main layout wrapper
│   │   ├── Select.tsx         # Dropdown select component
│   │   └── TextArea.tsx       # Text area component
│   │
│   ├── lib/                    # Utility functions & helpers
│   │   ├── api.ts             # API handler wrapper with error handling
│   │   ├── apiClient.ts       # Client-side API fetch utilities
│   │   ├── auth.ts            # NextAuth authentication utilities
│   │   ├── constants.ts       # Roles, statuses, message channels
│   │   ├── db.ts              # Prisma client initialization
│   │   ├── invoice.ts         # Invoice number formatting
│   │   ├── phone.ts           # Mobile number validation (KSA)
│   │   └── templates.ts       # Message templates
│   │
│   ├── pages/                  # Next.js pages & API routes
│   │   ├── _app.tsx           # NextAuth provider wrapper
│   │   ├── _document.tsx      # HTML document structure
│   │   ├── index.tsx          # Home page (invoice creation)
│   │   ├── login.tsx          # Login page
│   │   ├── control.tsx        # Control/management page
│   │   ├── stats.tsx          # Statistics dashboard
│   │   │
│   │   ├── invoices/          # Invoice pages
│   │   │   ├── [id].tsx       # Invoice detail page
│   │   │   └── [id]/
│   │   │       └── print.tsx  # Invoice print view
│   │   │
│   │   ├── repairs/           # Repair pages
│   │   │   ├── index.tsx      # Repair list page
│   │   │   ├── new.tsx        # Create new repair
│   │   │   └── [id].tsx       # Repair detail page
│   │   │
│   │   ├── settings/          # Settings pages
│   │   │   └── index.tsx      # Shop settings page
│   │   │
│   │   └── api/               # API routes
│   │       ├── health.ts      # Health check endpoint
│   │       ├── version.ts     # API version endpoint
│   │       │
│   │       ├── auth/          # Authentication endpoints
│   │       │   ├── [...nextauth].ts  # NextAuth handler
│   │       │   └── logout.ts         # Logout endpoint
│   │       │
│   │       ├── customers/     # Customer endpoints
│   │       │   └── index.ts
│   │       │
│   │       ├── health/        # Health check endpoints
│   │       │   └── auth.ts
│   │       │
│   │       ├── invoices/      # Invoice endpoints
│   │       │   ├── index.ts   # Create/list invoices
│   │       │   └── [id].ts    # Get invoice by ID
│   │       │
│   │       ├── messages/      # Messaging endpoints
│   │       │   └── send.ts    # Send WhatsApp/SMS
│   │       │
│   │       ├── repairs/       # Repair endpoints
│   │       │   ├── index.ts   # Create/list repairs
│   │       │   └── [id].ts    # Get repair by ID
│   │       │
│   │       ├── settings/      # Settings endpoints
│   │       │   └── index.ts   # Get/update settings
│   │       │
│   │       └── templates/     # Template endpoints
│   │           └── index.ts
│   │
│   ├── styles/                 # Global styles
│   │   └── globals.css        # Tailwind imports & global styles
│   │
│   └── types/                  # TypeScript type definitions
│       └── next-auth.d.ts     # NextAuth type extensions
│
├── scripts/                     # Utility scripts
│   └── verify-invoice-save.mjs # Invoice verification script
│
├── .env                         # Environment variables (git-ignored)
├── .env.local                   # Local environment overrides
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript configuration
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
├── README.md                     # Project documentation
├── SETUP.md                      # Setup instructions
├── debug-notes.md               # Development notes
└── next-env.d.ts                # Next.js type definitions
```

---

## 🗄 Database Schema

### Models

#### **User Model**
```prisma
model User {
  id            String        @id @default(cuid())
  email         String        @unique
  name          String?
  passwordHash  String?
  role          String        @default("ADMIN")
  invoices      Invoice[]
}
```
- **Fields:**
  - `id`: Unique user identifier
  - `email`: Unique email for login
  - `name`: User's display name
  - `passwordHash`: Hashed password for authentication
  - `role`: User role (ADMIN, STAFF, VIEWER)
  - `invoices`: One-to-many relationship with invoices

#### **Invoice Model**
```prisma
model Invoice {
  id              String        @id @default(cuid())
  invoiceNo       String        @unique
  customerName    String?
  mobile          String?
  totalAmount     Float?
  createdAt       DateTime      @default(now())
  createdByUserId String?
  user            User?         @relation(fields: [createdByUserId], references: [id])
}
```
- **Fields:**
  - `id`: Unique invoice identifier
  - `invoiceNo`: Unique invoice number (SRV-YYYYMMDD-0001 format)
  - `customerName`: Customer's name
  - `mobile`: Customer's phone number
  - `totalAmount`: Repair/service cost
  - `createdAt`: Invoice creation timestamp
  - `createdByUserId`: Foreign key to User
  - `user`: Relationship to creator user

#### **Settings Model**
```prisma
model Settings {
  id        Int       @id @default(1)
  shopName  String    @default("سيتي فون")
  shopPhone String    @default("0000000000")
}
```
- **Fields:**
  - `id`: Singleton ID (always 1)
  - `shopName`: Shop/business name (Arabic default)
  - `shopPhone`: Business contact phone

#### **InvoiceCounter Model**
```prisma
model InvoiceCounter {
  id      String    @id @default("GLOBAL")
  counter Int       @default(10498)
}
```
- **Fields:**
  - `id`: Singleton ID (always "GLOBAL")
  - `counter`: Current invoice number sequence

---

## 📄 Pages & Routes

### Public Pages
| Page | Route | Purpose |
|------|-------|---------|
| Login | `/login` | User authentication |

### Protected Pages (Require Authentication)
| Page | Route | Purpose |
|------|-------|---------|
| Home/Invoice Creation | `/` | Create new invoices quickly |
| Control/Management | `/control` | Manage repairs & statuses |
| Statistics | `/stats` | View dashboard & analytics |
| Invoice Details | `/invoices/[id]` | View invoice details |
| Invoice Print | `/invoices/[id]/print` | Print-friendly invoice view |
| Repairs List | `/repairs` | All repairs list |
| New Repair | `/repairs/new` | Create new repair |
| Repair Details | `/repairs/[id]` | Repair details & status |
| Settings | `/settings` | Configure shop settings |

---

## 🔌 API Endpoints

### Authentication Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/[...nextauth]` | NextAuth handler (signin/callback) |
| POST | `/api/auth/logout` | User logout |

### Invoice Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/invoices` | List invoices |
| POST | `/api/invoices` | Create new invoice |
| GET | `/api/invoices/[id]` | Get invoice details |

### Repair Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/repairs` | List repairs |
| POST | `/api/repairs` | Create new repair |
| GET | `/api/repairs/[id]` | Get repair details |

### Messaging Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/messages/send` | Send WhatsApp/SMS |

### Settings Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/settings` | Get shop settings |
| POST | `/api/settings` | Update shop settings |

### Customer Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/customers` | List customers |

### Template Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/templates` | Get message templates |

### Health Check Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/health` | API health status |
| GET | `/api/health/auth` | Auth service health |
| GET | `/api/version` | API version info |

---

## 🧩 Components

### Layout Component
- **File:** `src/components/Layout.tsx`
- **Purpose:** Main application layout wrapper
- **Features:**
  - RTL header with navigation
  - User session display
  - Navigation links
  - Sign out functionality

### Input Component
- **File:** `src/components/Input.tsx`
- **Purpose:** Reusable text input field
- **Features:**
  - Arabic label support
  - Type support (text, email, password, number)
  - Placeholder text
  - Change handlers

### Select Component
- **File:** `src/components/Select.tsx`
- **Purpose:** Dropdown selection input
- **Features:**
  - Dynamic options
  - Arabic labels
  - Default value support
  - Change handlers

### TextArea Component
- **File:** `src/components/TextArea.tsx`
- **Purpose:** Multi-line text input
- **Features:**
  - Arabic label support
  - Placeholder text
  - Row configuration
  - Change handlers

### Badge Component
- **File:** `src/components/Badge.tsx`
- **Purpose:** Status visual indicator
- **Features:**
  - Color coding for different statuses
  - Text display
  - Tailwind styling

---

## 📚 Libraries & Utilities

### Authentication Module (`src/lib/auth.ts`)
**Functions:**
- `getSessionUser(req, res)` - Extract current user from session
- `requireRole(user, roles)` - Check user has required role

**Types:**
- `SessionUser` - User data from session

### API Handler Module (`src/lib/api.ts`)
**Functions:**
- `withApiHandler(handler)` - Wrapper for API routes with error handling
  - Adds request ID tracking
  - Centralized error handling
  - Logging support

### Phone Utilities (`src/lib/phone.ts`)
**Functions:**
- `normalizeMobile(raw)` - Convert phone numbers to +966 format
  - Handles 00966, 0, 966, and +966 prefixes
- `isValidKsaMobile(raw)` - Validate Saudi Arabia mobile numbers
  - Pattern: +9665XXXXXXXX (10 digits)

### Invoice Utilities (`src/lib/invoice.ts`)
**Functions:**
- `getRiyadhDateKey()` - Get current date in Riyadh timezone
- `formatInvoiceNo(dateKey, counter)` - Format: SRV-YYYYMMDD-0001
- `formatSimpleInvoice(counter)` - Format counter with padding

### Client API (`src/lib/apiClient.ts`)
**Functions:**
- `safeFetchJson<T>()` - Type-safe fetch wrapper with error handling

### Database (`src/lib/db.ts`)
**Exports:**
- `prisma` - Prisma client instance (singleton pattern)

### Constants (`src/lib/constants.ts`)
**Enums:**
- `Roles` - ADMIN, STAFF, VIEWER
- `RepairStatuses` - NEW, RECEIVED, DIAGNOSED, WAITING_PART, IN_REPAIR, READY, DELIVERED, CANCELED
- `PartStatuses` - NOT_NEEDED, ORDERED, ARRIVED, DELAYED
- `MessageChannels` - WHATSAPP, SMS
- `MessageStatuses` - PENDING, SENT, FAILED, DELIVERED

### Message Templates (`src/lib/templates.ts`)
- SMS templates
- WhatsApp templates
- Arabic message formatting

---

## 🔐 Authentication & Security

### NextAuth Configuration (`src/pages/api/auth/[...nextauth].ts`)
**Features:**
- Credentials provider (email + password)
- JWT strategy
- Prisma adapter
- Admin bypass in development mode
- Automatic password hashing with bcryptjs

**Environment Variables:**
- `NEXTAUTH_SECRET` - Session encryption key
- `NEXTAUTH_URL` - Application base URL
- `ADMIN_EMAIL` - Admin account email
- `ADMIN_PASSWORD` - Admin account password
- `ADMIN_ID` - Optional admin user ID
- `AUTH_BYPASS` - Enable auth bypass in development (for testing)

### Login Page (`src/pages/login.tsx`)
- Email & password input fields
- Arabic UI
- Error messaging
- Redirect to home on success
- Auto-redirect authenticated users

### Session Types (`src/types/next-auth.d.ts`)
- Extended session with user role
- User email, name, ID in session

---

## ⚙️ Configuration Files

### TypeScript Config (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "strict": true,
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./src/*"]
    },
    "jsx": "preserve"
  }
}
```
- **Paths:** `@/` alias for `src/`
- **Strict Mode:** Enabled
- **JSX:** Preserve (used by Next.js)

### Next.js Config (`next.config.js`)
```javascript
{
  reactStrictMode: true,
  swcMinify: true
}
```
- **SWC:** Minimization enabled
- **Strict Mode:** React strict checking

### Tailwind Config (`tailwind.config.ts`)
- Default Tailwind utilities
- Custom color schemes (if any)
- RTL support for Arabic UI

### PostCSS Config (`postcss.config.js`)
- Tailwind CSS plugin
- AutoPrefixer for browser compatibility

### Prisma Config (`prisma/schema.prisma`)
- **Provider:** SQLite
- **Database:** `file:./prisma/dev.sqlite`
- **Client Generator:** @prisma/client

---

## 📜 Scripts & Commands

### Package.json Scripts
```bash
# Development
npm run dev                # Start dev server with Prisma generation

# Production
npm run build             # Build for production
npm start                 # Start production server

# Database
npm run prisma:generate   # Generate Prisma client only
npm run prisma:migrate    # Create migration and apply
npm run prisma:deploy     # Deploy existing migrations
npm run prisma:seed       # Run seed script

# Code Quality
npm run lint              # Run ESLint
npm run postinstall       # Auto-run on npm install (Prisma generation)
```

### Custom Scripts
- **`scripts/verify-invoice-save.mjs`** - Verify invoice creation functionality

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Windows/Linux/macOS

### Initial Setup

1. **Install Dependencies:**
```bash
npm install
```

2. **Environment Setup:**
Create `.env` file:
```env
# Database
DATABASE_URL="file:./prisma/dev.sqlite"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Admin Configuration
ADMIN_EMAIL="admin@cityphone.local"
ADMIN_PASSWORD="Admin@123456"

# Shop Settings
SHOP_NAME="سيتي فون"
SHOP_PHONE="0555555555"

# Development
AUTH_BYPASS="true"
NODE_ENV="development"
```

3. **Database Setup:**
```bash
# Generate Prisma client
npx prisma generate

# Apply schema (create database)
npx prisma db push

# Seed admin user & initial data
npm run prisma:seed
```

4. **Start Development Server:**
```bash
npm run dev
```
Visit: `http://localhost:3000`

### Default Admin Account
- **Email:** `admin@cityphone.local`
- **Password:** `Admin@123456`

---

## 📊 Key Features Explained

### Invoice Creation Flow
1. User enters customer details (name, phone)
2. System captures device info and problem description
3. Invoice generated with auto-incremented serial number
4. Option to send invoice via WhatsApp/SMS
5. Invoice stored in SQLite database

### Mobile Number Validation
- Supports multiple input formats
- Normalizes to +9665XXXXXXXX format
- Validates against Saudi Arabia format
- Used for WhatsApp/SMS routing

### Repair Status Workflow
- NEW → RECEIVED → DIAGNOSED → WAITING_PART/IN_REPAIR → READY → DELIVERED
- Can be CANCELED at any stage
- Admin updates status from control panel

### Message Channels
- **WhatsApp:** Uses normalized mobile number
- **SMS:** Validates against KSA format
- **Templates:** Customizable message formats with invoice details

---

## 🔧 Developer Notes

### Directory Aliases
- `@/` resolves to `src/`
- Used throughout codebase for clean imports

### Database Singleton Pattern
- Prisma client initialized once and reused
- Prevents connection pooling issues in development

### Error Handling
- API routes wrapped with `withApiHandler`
- Centralized error logging with request IDs
- User-friendly Arabic error messages

### Type Safety
- Full TypeScript strict mode
- Zod validation for runtime type checking
- NextAuth custom types

### Styling Approach
- Tailwind CSS utility-first
- RTL support for Arabic text
- Responsive design considerations

---

## 📝 Additional Notes

### Code Quality
- ESLint configured for code standards
- TypeScript strict mode enforced
- Consistent naming conventions

### Performance
- SWC minification enabled
- Next.js optimizations built-in
- Efficient database queries with Prisma

### Internationalization
- Arabic (RTL) primary language
- Date formatting for Riyadh timezone
- Phone number validation for KSA

### Security Considerations
- Password hashing with bcryptjs
- Session management via NextAuth
- Role-based access control (RBAC)
- CSRF protection built-in with NextAuth

---

## 📚 File Summary

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema definition |
| `prisma/seed.js` | Initial data seeding |
| `src/pages/_app.tsx` | NextAuth & app wrapper |
| `src/pages/login.tsx` | Authentication UI |
| `src/pages/index.tsx` | Invoice creation page |
| `src/lib/db.ts` | Prisma client |
| `src/lib/auth.ts` | Auth utilities |
| `src/lib/phone.ts` | Phone validation |
| `src/components/Layout.tsx` | Main layout |
| `.env` | Environment variables |
| `package.json` | Dependencies & scripts |

---

**Last Updated:** February 10, 2026  
**Project Status:** Active Development  
**Database:** SQLite Local (dev.sqlite)  
**Framework:** Next.js 14.2.5 + TypeScript 5.5.4
