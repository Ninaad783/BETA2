"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("./db");
async function seedAdmin() {
    const hash = await bcryptjs_1.default.hash('admin123', 10);
    await db_1.pool.query(`INSERT INTO users (store_id, username, password_hash, full_name, mobile, role, preferred_language)
     VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin', $1, 'Administrator', '9999999999', 'ADMIN', 'en')
     ON CONFLICT (store_id, username) DO UPDATE SET password_hash = $1`, [hash]);
    console.log('✅ Admin user (username: admin, password: admin123) is ready!');
    const res = await db_1.pool.query('SELECT username, role, full_name FROM users');
    console.log('Current users:', res.rows);
    await db_1.pool.end();
}
seedAdmin().catch(console.error);
