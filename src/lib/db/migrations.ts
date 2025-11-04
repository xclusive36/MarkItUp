import { getDatabase } from './index';
import { sql } from 'drizzle-orm';
import { dbLogger } from '../logger';
import { withRetry } from './retry';

/**
 * Migration interface
 */
export interface Migration {
  version: number;
  name: string;
  up: (db: ReturnType<typeof getDatabase>) => Promise<void>;
  down: (db: ReturnType<typeof getDatabase>) => Promise<void>;
}

/**
 * Migration history table schema
 */
const createMigrationsTable = async (db: ReturnType<typeof getDatabase>) => {
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS __migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version INTEGER NOT NULL UNIQUE,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
};

/**
 * Get applied migrations
 */
const getAppliedMigrations = async (db: ReturnType<typeof getDatabase>): Promise<number[]> => {
  const results = await db.all<{ version: number }>(sql`
    SELECT version FROM __migrations ORDER BY version ASC
  `);
  return results.map(r => r.version);
};

/**
 * Record a migration as applied
 */
const recordMigration = async (
  db: ReturnType<typeof getDatabase>,
  version: number,
  name: string
) => {
  await db.run(sql`
    INSERT INTO __migrations (version, name) VALUES (${version}, ${name})
  `);
};

/**
 * Remove a migration record
 */
const removeMigration = async (db: ReturnType<typeof getDatabase>, version: number) => {
  await db.run(sql`
    DELETE FROM __migrations WHERE version = ${version}
  `);
};

/**
 * Migration Manager
 * Handles database schema migrations with version tracking
 */
export class MigrationManager {
  private db: ReturnType<typeof getDatabase>;
  private migrations: Migration[] = [];

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Register a migration
   */
  register(migration: Migration): void {
    this.migrations.push(migration);
    this.migrations.sort((a, b) => a.version - b.version);
  }

  /**
   * Register multiple migrations
   */
  registerAll(migrations: Migration[]): void {
    migrations.forEach(m => this.register(m));
  }

  /**
   * Get pending migrations
   */
  async getPendingMigrations(): Promise<Migration[]> {
    await createMigrationsTable(this.db);
    const applied = await getAppliedMigrations(this.db);
    return this.migrations.filter(m => !applied.includes(m.version));
  }

  /**
   * Run all pending migrations
   */
  async migrate(): Promise<{ applied: Migration[]; skipped: number }> {
    dbLogger.info('Starting database migrations');

    await createMigrationsTable(this.db);
    const pending = await this.getPendingMigrations();

    if (pending.length === 0) {
      dbLogger.info('No pending migrations');
      return { applied: [], skipped: 0 };
    }

    const applied: Migration[] = [];

    for (const migration of pending) {
      try {
        dbLogger.info('Applying migration', {
          version: migration.version,
          name: migration.name,
        });

        await withRetry(
          async () => {
            await migration.up(this.db);
            await recordMigration(this.db, migration.version, migration.name);
          },
          `migration:${migration.version}`,
          { maxAttempts: 3 }
        );

        applied.push(migration);

        dbLogger.info('Migration applied successfully', {
          version: migration.version,
          name: migration.name,
        });
      } catch (error) {
        dbLogger.error(
          'Migration failed',
          {
            version: migration.version,
            name: migration.name,
            appliedSoFar: applied.length,
          },
          error as Error
        );
        throw new Error(
          `Migration ${migration.version} (${migration.name}) failed: ${(error as Error).message}`
        );
      }
    }

    dbLogger.info('All migrations completed', {
      applied: applied.length,
      skipped: this.migrations.length - pending.length,
    });

    return {
      applied,
      skipped: this.migrations.length - pending.length,
    };
  }

  /**
   * Rollback the last migration
   */
  async rollback(): Promise<Migration | null> {
    await createMigrationsTable(this.db);
    const applied = await getAppliedMigrations(this.db);

    if (applied.length === 0) {
      dbLogger.warn('No migrations to rollback');
      return null;
    }

    const lastVersion = applied[applied.length - 1];
    const migration = this.migrations.find(m => m.version === lastVersion);

    if (!migration) {
      throw new Error(`Migration ${lastVersion} not found in registered migrations`);
    }

    try {
      dbLogger.info('Rolling back migration', {
        version: migration.version,
        name: migration.name,
      });

      await withRetry(
        async () => {
          await migration.down(this.db);
          await removeMigration(this.db, migration.version);
        },
        `rollback:${migration.version}`,
        { maxAttempts: 3 }
      );

      dbLogger.info('Migration rolled back successfully', {
        version: migration.version,
        name: migration.name,
      });

      return migration;
    } catch (error) {
      dbLogger.error(
        'Rollback failed',
        { version: migration.version, name: migration.name },
        error as Error
      );
      throw new Error(
        `Rollback of migration ${migration.version} (${migration.name}) failed: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get migration status
   */
  async getStatus(): Promise<{
    applied: number[];
    pending: Migration[];
    total: number;
  }> {
    await createMigrationsTable(this.db);
    const applied = await getAppliedMigrations(this.db);
    const pending = await this.getPendingMigrations();

    return {
      applied,
      pending,
      total: this.migrations.length,
    };
  }
}

/**
 * Global migration manager instance
 */
export const migrationManager = new MigrationManager();

/**
 * Example migration template
 */
export const exampleMigration: Migration = {
  version: 1,
  name: 'add_example_column',
  up: async db => {
    await db.run(sql`
      ALTER TABLE notes ADD COLUMN example_field TEXT
    `);
  },
  down: async db => {
    // SQLite doesn't support DROP COLUMN easily, so we'd need to recreate table
    dbLogger.warn('Rollback not implemented for this migration');
  },
};
