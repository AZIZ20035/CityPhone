@echo off
cls
echo.
echo 🚀 Starting CityPhone Development Environment...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    echo.
)

REM Generate Prisma client
echo 🔨 Generating Prisma client...
call npx prisma generate
echo.

REM Start dev server
echo 🌐 Starting Next.js dev server...
echo 📍 App will be available at http://localhost:3000
echo.
call npm run dev
