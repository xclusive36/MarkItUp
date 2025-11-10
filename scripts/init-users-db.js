#!/usr/bin/env node

/**
 * Initialize or reset the user database
 * Usage: node scripts/init-users-db.js [--reset]
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
const shouldReset = args.includes('--reset');

const dbPath = path.join(process.cwd(), 'markitup.db');

console.log('Database path:', dbPath);

if (shouldReset && fs.existsSync(dbPath)) {
  console.log('⚠️  Resetting database...');
  fs.unlinkSync(dbPath);
  console.log('✅ Database deleted');
}

// Create new database
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

console.log('📊 Initializing schema...');

// Create users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    email_verified INTEGER,
    name TEXT,
    image TEXT,
    password_hash TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    is_email_verified INTEGER NOT NULL DEFAULT 0,
    plan TEXT NOT NULL DEFAULT 'free',
    plan_expiry INTEGER,
    storage_quota INTEGER NOT NULL DEFAULT ${100 * 1024 * 1024},
    storage_used INTEGER NOT NULL DEFAULT 0,
    notes_quota INTEGER NOT NULL DEFAULT 100,
    ai_requests_quota INTEGER NOT NULL DEFAULT 20,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    last_login_at INTEGER
  );
`);

// List all users
const users = db.prepare('SELECT id, email, name, created_at FROM users').all();

console.log('\n📝 Current users:');
if (users.length === 0) {
  console.log('  (none)');
} else {
  users.forEach(user => {
    const date = new Date(user.created_at);
    console.log(
      `  - ${user.email} (${user.name || 'No name'}) - Created: ${date.toLocaleString()}`
    );
  });
}

db.close();

console.log('\n✅ Database initialized successfully!');
console.log('\nTo delete specific users, run:');
console.log('  sqlite3 markitup.db "DELETE FROM users WHERE email = \'user@example.com\';"');
console.log('\nTo reset the entire database, run:');
console.log('  node scripts/init-users-db.js --reset');
