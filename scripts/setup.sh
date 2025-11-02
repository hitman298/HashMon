#!/bin/bash

# HashMon Setup Script
# This script sets up the complete HashMon project

echo "🎮 HashMon Setup Script"
echo "======================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install contract dependencies
echo "📦 Installing contract dependencies..."
cd contracts
npm install
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set up your environment variables:"
echo "   - Copy backend/config.env.example to backend/.env"
echo "   - Copy frontend/.env.example to frontend/.env"
echo "   - Fill in your API keys and wallet details"
echo ""
echo "2. Set up Supabase database:"
echo "   - Create a new Supabase project"
echo "   - Run the SQL from backend/supabase/schema.sql"
echo "   - Get your project URL and API keys"
echo ""
echo "3. Deploy smart contracts:"
echo "   cd contracts"
echo "   npx hardhat vars set PRIVATE_KEY"
echo "   npm run deploy:pharos"
echo ""
echo "4. Start development servers:"
echo "   npm run dev"
echo ""
echo "🚀 Happy gaming on Pharos Network!"

