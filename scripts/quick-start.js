#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎮 HashMon Quick Start Setup');
console.log('============================\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
    console.error('❌ Please run this script from the HashMon root directory');
    process.exit(1);
}

// Step 1: Install all dependencies
console.log('📦 Installing dependencies...');
try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Root dependencies installed');
    
    execSync('cd contracts && npm install', { stdio: 'inherit' });
    console.log('✅ Contract dependencies installed');
    
    execSync('cd backend && npm install', { stdio: 'inherit' });
    console.log('✅ Backend dependencies installed');
    
    execSync('cd frontend && npm install', { stdio: 'inherit' });
    console.log('✅ Frontend dependencies installed');
} catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
}

// Step 2: Create environment files if they don't exist
console.log('\n🔧 Setting up environment files...');

const backendEnvPath = 'backend/.env';
const frontendEnvPath = 'frontend/.env';

if (!fs.existsSync(backendEnvPath)) {
    fs.copyFileSync('backend/env.example', backendEnvPath);
    console.log('✅ Created backend/.env (please configure it)');
} else {
    console.log('✅ backend/.env already exists');
}

if (!fs.existsSync(frontendEnvPath)) {
    fs.copyFileSync('frontend/env.example', frontendEnvPath);
    console.log('✅ Created frontend/.env (please configure it)');
} else {
    console.log('✅ frontend/.env already exists');
}

// Step 3: Display next steps
console.log('\n🎉 Setup Complete!');
console.log('\n📋 Next Steps:');
console.log('1. Get Pharos testnet tokens from faucet');
console.log('2. Set up Supabase database (see SETUP_GUIDE.md)');
console.log('3. Deploy smart contracts:');
console.log('   cd contracts');
console.log('   npx hardhat vars set PRIVATE_KEY');
console.log('   npm run deploy:pharos');
console.log('4. Configure environment files with your credentials');
console.log('5. Start the application:');
console.log('   npm run dev');
console.log('\n📖 See SETUP_GUIDE.md for detailed instructions');
console.log('\n🚀 Ready to build on Pharos Network!');

