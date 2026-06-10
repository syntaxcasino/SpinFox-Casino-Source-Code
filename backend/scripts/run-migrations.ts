import { createConnection } from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

// Load environment variables
config();

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');
  
  const connection = await createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'spinfox',
    multipleStatements: true,
  });

  try {
    // Migration 1: Add testBalance column
    console.log('📝 Running migration: add-testBalance-column.sql');
    const migration1 = fs.readFileSync(
      path.join(__dirname, '../migrations/add-testBalance-column.sql'),
      'utf8'
    );
    
    try {
      await connection.query(migration1);
      console.log('✅ testBalance column added successfully\n');
    } catch (error: any) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  testBalance column already exists, skipping\n');
      } else {
        throw error;
      }
    }

    // Migration 2: Optimize chain_state table
    console.log('📝 Running migration: optimize-chain-state.sql');
    const migration2 = fs.readFileSync(
      path.join(__dirname, '../migrations/optimize-chain-state.sql'),
      'utf8'
    );
    
    try {
      await connection.query(migration2);
      console.log('✅ chain_state table optimized successfully\n');
    } catch (error: any) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('ℹ️  Index already exists, continuing with optimization\n');
        // Still run OPTIMIZE and ANALYZE
        await connection.query('OPTIMIZE TABLE `chain_state`');
        await connection.query('ANALYZE TABLE `chain_state`');
        console.log('✅ chain_state table analyzed and optimized\n');
      } else {
        throw error;
      }
    }

    // Verify testBalance column exists
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM `user` LIKE 'testBalance'"
    );
    
    if (Array.isArray(columns) && columns.length > 0) {
      console.log('✅ Verified: testBalance column exists');
    } else {
      console.log('❌ Warning: testBalance column not found');
    }

    // Verify chain_state indexes
    const [indexes] = await connection.query(
      "SHOW INDEX FROM `chain_state`"
    );
    
    console.log(`✅ chain_state has ${Array.isArray(indexes) ? indexes.length : 0} indexes\n`);

    console.log('🎉 All migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run migrations
runMigrations()
  .then(() => {
    console.log('\n✨ Migration process finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration process failed:', error);
    process.exit(1);
  });

