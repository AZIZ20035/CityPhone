#!/usr/bin/env pwsh

Write-Host "🚀 Starting CityPhone Development Environment..." -ForegroundColor Green
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Generate Prisma client
Write-Host "🔨 Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate
Write-Host ""

# Start dev server
Write-Host "🌐 Starting Next.js dev server..." -ForegroundColor Green
Write-Host "📍 App will be available at http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
npm run dev
