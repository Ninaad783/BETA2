import fs from 'fs';
import path from 'path';
import { pool } from './db';

async function runMigration() {
  console.log('🚀 Starting MedEasy Pharmacy Database Migration...');
  try {
    const schemaPath = path.resolve(__dirname, '../database/schema.sql');
    const seedPath = path.resolve(__dirname, '../database/seed_master_medicines_1000.sql');

    console.log('📄 Executing database schema (tables, constraints, triggers)...');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schemaSql);
    console.log('✅ Schema migration completed successfully.');

    console.log('📦 Seeding 1,000 Master Indian Medicines Catalog...');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await pool.query(seedSql);
    console.log('✅ Master medicines catalog seeded successfully (1,000 items).');

    console.log('🎉 Migration finished successfully!');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
