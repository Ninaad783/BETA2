import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
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

    console.log('👤 Ensuring Admin User (admin / admin123)...');
    const hash = await bcrypt.hash('admin123', 10);
    await pool.query(
      `INSERT INTO users (store_id, username, password_hash, full_name, mobile, role, preferred_language)
       VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin', $1, 'Administrator', '9999999999', 'ADMIN', 'en')
       ON CONFLICT (store_id, username) DO UPDATE SET password_hash = $1`,
      [hash]
    );
    console.log('✅ Default Admin user verified (admin / admin123).');

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
