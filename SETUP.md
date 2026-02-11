# 🚀 Running CityPhone Project

## Quick Start - Option 1: Using Scripts (Recommended)

### Windows PowerShell
```powershell
.\run-dev.ps1
```

### Windows Command Prompt
```cmd
run-dev.bat
```

## Quick Start - Option 2: Using npm Commands

```bash
npm run dev
```

This will:
- Generate Prisma client
- Start the Next.js development server
- Available at http://localhost:3000

## All Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (with Prisma generation) |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run prisma:generate` | Generate Prisma client only |
| `npm run prisma:migrate` | Create a migration and apply it |
| `npm run prisma:seed` | Seed the database with initial data |

## Database Setup

The SQLite database is already configured at:
```
prisma/dev.sqlite
```

If you need to reset the database, delete `prisma/dev.sqlite` and run:
```bash
npx prisma db push
```

## First Time Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables (already done - check `.env`)

3. Start the development server:
   ```bash
   npm run dev
   ```

4. (Optional) Seed the database:
   ```bash
   npm run prisma:seed
   ```

## Project URL

- Development: http://localhost:3000
- API: http://localhost:3000/api
