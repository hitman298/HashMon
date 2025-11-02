@echo off
echo 🎮 HashMon Setup Script
echo ======================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js detected
node --version

REM Install root dependencies
echo 📦 Installing root dependencies...
npm install

REM Install contract dependencies
echo 📦 Installing contract dependencies...
cd contracts
npm install
cd ..

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
npm install
cd ..

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend
npm install
cd ..

echo.
echo 🎉 Setup complete!
echo.
echo 📋 Next steps:
echo 1. Set up your environment variables:
echo    - Copy backend/config.env.example to backend/.env
echo    - Copy frontend/.env.example to frontend/.env
echo    - Fill in your API keys and wallet details
echo.
echo 2. Set up Supabase database:
echo    - Create a new Supabase project
echo    - Run the SQL from backend/supabase/schema.sql
echo    - Get your project URL and API keys
echo.
echo 3. Deploy smart contracts:
echo    cd contracts
echo    npx hardhat vars set PRIVATE_KEY
echo    npm run deploy:pharos
echo.
echo 4. Start development servers:
echo    npm run dev
echo.
echo 🚀 Happy gaming on Pharos Network!
pause

