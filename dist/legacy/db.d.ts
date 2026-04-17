import { sql, and, eq } from 'drizzle-orm';
import pg from 'pg';
import * as schema from '../common/database/schema';
export declare const pool: pg.Pool;
export declare const db: import("drizzle-orm/node-postgres").NodePgDatabase<typeof schema>;
export declare function doesTableExist(tableName: string): Promise<boolean>;
export * from '../common/database/schema';
export declare const users: any, ordersTable: any, orders: any, orderItems: any, orderStatusHistory: any, ridersTable: any, riderAssignments: any, businessesTable: any, businesses: any, businessRequests: any, itemsTable: any, services: any, serviceCategories: any, subscriptionsTable: any, couponsTable: any, notificationsTable: any, paymentsTable: any, reviewsTable: any, wallets: any, walletTransactions: any, addressesTable: any, userAddresses: any, commissionSettingsTable: any;
export { sql, and, eq };
