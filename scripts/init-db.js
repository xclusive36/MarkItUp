#!/usr/bin/env node

/**
 * Database initialization script
 * Run this to sync your markdown files with the SQLite database
 *
 * Usage: npm run db:init
 */

import { getSyncService } from '../src/lib/db/sync.js';

async function main() {
  console.log('🔄 Initializing MarkItUp database...\n');

  try {
    const syncService = getSyncService();
    await syncService.initialize();

    const stats = await syncService.getStats();

    console.log('\n✅ Database initialization complete!');
    console.log(`📊 Statistics:`);
    console.log(`   - Notes indexed: ${stats.notes}`);
    console.log(`   - Links indexed: ${stats.links}`);
    console.log(`\n💾 Database file: markitup.db`);
  } catch (error) {
    console.error('\n❌ Database initialization failed:');
    console.error(error);
    process.exit(1);
  }
}

main();
