# Automated Setup & Seed Script for upay FinCoach
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Setting up upay FinCoach Database & Seed..." -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

Set-Location -Path "$PSScriptRoot\..\backend"
Write-Host "Syncing Prisma Schema..." -ForegroundColor Yellow
npx prisma db push

Write-Host "Seeding Multi-Month Demo Data..." -ForegroundColor Yellow
npm run db:seed

Write-Host "Setup Completed! You can now run 'npm run dev' from the root." -ForegroundColor Green
