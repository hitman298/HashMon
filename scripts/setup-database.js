#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  console.log('🗄️ Setting up HashMon Database Schema...');
  
  // Load environment variables
  require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in backend/.env');
    process.exit(1);
  }
  
  console.log('📋 Supabase URL:', supabaseUrl);
  console.log('🔑 Using service role key for setup...');
  
  // Read the schema file
  const schemaPath = path.join(__dirname, '..', 'backend', 'supabase', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  console.log('📝 Schema file loaded, size:', schema.length, 'characters');
  
  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    console.log('🚀 Executing database schema...');
    
    // Execute the schema
    const { data, error } = await supabase.rpc('exec_sql', { sql: schema });
    
    if (error) {
      console.error('❌ Error executing schema:', error.message);
      
      // Try alternative approach - execute in parts
      console.log('🔄 Trying alternative approach...');
      await executeSchemaInParts(supabase, schema);
    } else {
      console.log('✅ Database schema executed successfully!');
    }
    
    // Verify tables were created
    await verifyTables(supabase);
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n📋 Manual Setup Required:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Click on "SQL Editor"');
    console.log('3. Click "New query"');
    console.log('4. Copy ALL content from backend/supabase/schema.sql');
    console.log('5. Paste and run the SQL script');
    console.log('6. Verify tables are created in "Table Editor"');
  }
}

async function executeSchemaInParts(supabase, schema) {
  // Split schema into individual statements
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  console.log(`📝 Executing ${statements.length} SQL statements...`);
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    console.log(`📝 Executing statement ${i + 1}/${statements.length}...`);
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      if (error) {
        console.log(`⚠️ Statement ${i + 1} failed:`, error.message);
        // Continue with next statement
      }
    } catch (error) {
      console.log(`⚠️ Statement ${i + 1} error:`, error.message);
    }
  }
}

async function verifyTables(supabase) {
  console.log('\n🔍 Verifying database tables...');
  
  const expectedTables = ['players', 'hashmons', 'player_hashmons', 'battle_history', 'player_achievements', 'nft_minting_history'];
  
  for (const tableName of expectedTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Table ${tableName}: ${error.message}`);
      } else {
        console.log(`✅ Table ${tableName}: Ready`);
      }
    } catch (error) {
      console.log(`❌ Table ${tableName}: ${error.message}`);
    }
  }
  
  console.log('\n🎉 Database setup complete!');
  console.log('🚀 Ready to start the HashMon application!');
}

setupDatabase().catch(console.error);

