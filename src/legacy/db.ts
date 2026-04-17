import { drizzle } from 'drizzle-orm/node-postgres';
import { sql, and, eq } from 'drizzle-orm';
import pg from 'pg';
import * as schema from '../common/database/schema';

const { Pool } = pg;

const missingDatabaseMessage =
  'DATABASE_URL is not set. Add your Supabase/PostgreSQL connection string in backend .env before using database routes.';

export const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;

export const db = pool
  ? drizzle(pool, { schema })
  : (new Proxy(
      {},
      {
        get() {
          throw new Error(missingDatabaseMessage);
        },
      },
    ) as ReturnType<typeof drizzle<typeof schema>>);

const tableExistsCache = new Map<string, boolean>();

export async function doesTableExist(tableName: string): Promise<boolean> {
  if (!pool) return false;
  if (tableExistsCache.has(tableName)) {
    return tableExistsCache.get(tableName) ?? false;
  }

  try {
    const result = await pool.query("select to_regclass($1) as table_name", [`public.${tableName}`]);
    const exists = Boolean(result.rows[0]?.table_name);
    tableExistsCache.set(tableName, exists);
    return exists;
  } catch {
    return false;
  }
}

export * from '../common/database/schema';

// Explicit re-exports for legacy route imports (keeps old names stable)
export const {
  users,
  ordersTable,
  orders,
  orderItems,
  orderStatusHistory,
  ridersTable,
  riderAssignments,
  businessesTable,
  businesses,
  businessRequests,
  itemsTable,
  services,
  serviceCategories,
  subscriptionsTable,
  couponsTable,
  notificationsTable,
  paymentsTable,
  reviewsTable,
  wallets,
  walletTransactions,
  addressesTable,
  userAddresses,
  commissionSettingsTable,
} = schema as any;

// Export drizzle operators for legacy routes
export { sql, and, eq };
