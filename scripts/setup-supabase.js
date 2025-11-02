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

async function setupSupabase() {
  console.log('🗄️ HashMon Supabase Setup Assistant');
  console.log('====================================\n');

  console.log('📋 Follow these steps:');
  console.log('1. Go to https://supabase.com');
  console.log('2. Create a new project named "HashMon"');
  console.log('3. Wait for project to be ready (2-3 minutes)');
  console.log('4. Go to Settings > API');
  console.log('5. Copy your Project URL, anon key, and service_role key\n');

  const supabaseUrl = await question('📝 Enter your Supabase Project URL: ');
  const supabaseAnonKey = await question('🔑 Enter your Supabase anon key: ');
  const supabaseServiceKey = await question('🔐 Enter your Supabase service_role key: ');

  console.log('\n⚙️ Updating backend configuration...');

  // Update backend .env file
  const backendEnvPath = 'backend/.env';
  let backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
  
  backendEnv = backendEnv.replace('your_supabase_project_url', supabaseUrl);
  backendEnv = backendEnv.replace('your_supabase_anon_key', supabaseAnonKey);
  backendEnv = backendEnv.replace('your_supabase_service_role_key', supabaseServiceKey);

  fs.writeFileSync(backendEnvPath, backendEnv);
  console.log('✅ Backend configuration updated');

  console.log('\n📋 Next Steps:');
  console.log('1. Go to your Supabase project dashboard');
  console.log('2. Click on "SQL Editor"');
  console.log('3. Click "New query"');
  console.log('4. Copy ALL content from backend/supabase/schema.sql');
  console.log('5. Paste and run the SQL script');
  console.log('6. Verify tables are created in "Table Editor"');

  console.log('\n🎉 Supabase configuration complete!');
  console.log('\n🚀 Ready to start the website:');
  console.log('   Backend:  cd backend && npm run dev');
  console.log('   Frontend: cd frontend && npm run dev');

  rl.close();
}

setupSupabase().catch(console.error);

