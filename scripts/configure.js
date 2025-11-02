#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function configure() {
  console.log('🎮 HashMon Configuration Assistant');
  console.log('==================================\n');

  // Check if environment files exist
  const backendEnvPath = 'backend/.env';
  const frontendEnvPath = 'frontend/.env';

  if (!fs.existsSync(backendEnvPath)) {
    console.log('❌ Backend .env file not found. Please run setup first.');
    process.exit(1);
  }

  if (!fs.existsSync(frontendEnvPath)) {
    console.log('❌ Frontend .env file not found. Please run setup first.');
    process.exit(1);
  }

  console.log('📋 Let\'s configure your HashMon application!\n');

  // Collect configuration
  const config = {};

  console.log('🗄️ Supabase Configuration:');
  config.supabaseUrl = await question('Supabase Project URL: ');
  config.supabaseAnonKey = await question('Supabase Anon Key: ');
  config.supabaseServiceKey = await question('Supabase Service Role Key: ');

  console.log('\n🔗 Blockchain Configuration:');
  config.contractAddress = await question('HashMon Contract Address (from deployment): ');
  config.backendPrivateKey = await question('Backend Wallet Private Key (for signing): ');

  console.log('\n🎨 Frontend Configuration:');
  const useCustomApi = await question('Use custom API URL? (y/n, default: http://localhost:3001/api): ');
  config.apiUrl = useCustomApi.toLowerCase() === 'y' 
    ? await question('API URL: ') 
    : 'http://localhost:3001/api';

  // Update backend .env
  console.log('\n⚙️ Updating backend configuration...');
  let backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
  
  backendEnv = backendEnv.replace('your_supabase_project_url', config.supabaseUrl);
  backendEnv = backendEnv.replace('your_supabase_anon_key', config.supabaseAnonKey);
  backendEnv = backendEnv.replace('your_supabase_service_role_key', config.supabaseServiceKey);
  backendEnv = backendEnv.replace('deployed_contract_address_will_be_set_here', config.contractAddress);
  backendEnv = backendEnv.replace('your_backend_wallet_private_key_here', config.backendPrivateKey);

  fs.writeFileSync(backendEnvPath, backendEnv);
  console.log('✅ Backend configuration updated');

  // Update frontend .env
  console.log('🎨 Updating frontend configuration...');
  let frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
  
  frontendEnv = frontendEnv.replace('http://localhost:3001/api', config.apiUrl);
  frontendEnv = frontendEnv.replace('deployed_contract_address_will_be_set_here', config.contractAddress);

  fs.writeFileSync(frontendEnvPath, frontendEnv);
  console.log('✅ Frontend configuration updated');

  console.log('\n🎉 Configuration complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Make sure you have deployed the smart contract');
  console.log('2. Set up your Supabase database schema');
  console.log('3. Start the application:');
  console.log('   Backend:  cd backend && npm run dev');
  console.log('   Frontend: cd frontend && npm run dev');
  console.log('\n🚀 Ready to play HashMon!');

  rl.close();
}

configure().catch(console.error);

