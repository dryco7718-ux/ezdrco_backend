"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.eq = exports.and = exports.sql = exports.commissionSettingsTable = exports.userAddresses = exports.addressesTable = exports.walletTransactions = exports.wallets = exports.reviewsTable = exports.paymentsTable = exports.notificationsTable = exports.couponsTable = exports.subscriptionsTable = exports.serviceCategories = exports.services = exports.itemsTable = exports.businessRequests = exports.businesses = exports.businessesTable = exports.riderAssignments = exports.ridersTable = exports.orderStatusHistory = exports.orderItems = exports.orders = exports.ordersTable = exports.users = exports.db = exports.pool = void 0;
exports.doesTableExist = doesTableExist;
const node_postgres_1 = require("drizzle-orm/node-postgres");
const drizzle_orm_1 = require("drizzle-orm");
Object.defineProperty(exports, "sql", { enumerable: true, get: function () { return drizzle_orm_1.sql; } });
Object.defineProperty(exports, "and", { enumerable: true, get: function () { return drizzle_orm_1.and; } });
Object.defineProperty(exports, "eq", { enumerable: true, get: function () { return drizzle_orm_1.eq; } });
const pg_1 = __importDefault(require("pg"));
const schema = __importStar(require("../common/database/schema"));
const { Pool } = pg_1.default;
const missingDatabaseMessage = 'DATABASE_URL is not set. Add your Supabase/PostgreSQL connection string in backend .env before using database routes.';
exports.pool = process.env.DATABASE_URL
    ? new Pool({ connectionString: process.env.DATABASE_URL })
    : null;
exports.db = exports.pool
    ? (0, node_postgres_1.drizzle)(exports.pool, { schema })
    : new Proxy({}, {
        get() {
            throw new Error(missingDatabaseMessage);
        },
    });
const tableExistsCache = new Map();
async function doesTableExist(tableName) {
    if (!exports.pool)
        return false;
    if (tableExistsCache.has(tableName)) {
        return tableExistsCache.get(tableName) ?? false;
    }
    try {
        const result = await exports.pool.query("select to_regclass($1) as table_name", [`public.${tableName}`]);
        const exists = Boolean(result.rows[0]?.table_name);
        tableExistsCache.set(tableName, exists);
        return exists;
    }
    catch {
        return false;
    }
}
__exportStar(require("../common/database/schema"), exports);
_a = schema, exports.users = _a.users, exports.ordersTable = _a.ordersTable, exports.orders = _a.orders, exports.orderItems = _a.orderItems, exports.orderStatusHistory = _a.orderStatusHistory, exports.ridersTable = _a.ridersTable, exports.riderAssignments = _a.riderAssignments, exports.businessesTable = _a.businessesTable, exports.businesses = _a.businesses, exports.businessRequests = _a.businessRequests, exports.itemsTable = _a.itemsTable, exports.services = _a.services, exports.serviceCategories = _a.serviceCategories, exports.subscriptionsTable = _a.subscriptionsTable, exports.couponsTable = _a.couponsTable, exports.notificationsTable = _a.notificationsTable, exports.paymentsTable = _a.paymentsTable, exports.reviewsTable = _a.reviewsTable, exports.wallets = _a.wallets, exports.walletTransactions = _a.walletTransactions, exports.addressesTable = _a.addressesTable, exports.userAddresses = _a.userAddresses, exports.commissionSettingsTable = _a.commissionSettingsTable;
//# sourceMappingURL=db.js.map