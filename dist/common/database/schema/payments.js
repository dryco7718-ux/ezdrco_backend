"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentsTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.paymentsTable = (0, pg_core_1.pgTable)('payments', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    orderId: (0, pg_core_1.integer)('order_id').notNull(),
    customerId: (0, pg_core_1.integer)('customer_id').notNull(),
    businessId: (0, pg_core_1.integer)('business_id').notNull(),
    amount: (0, pg_core_1.numeric)('amount', { precision: 10, scale: 2 }).notNull(),
    method: (0, pg_core_1.text)('method').notNull().default('cod'),
    status: (0, pg_core_1.text)('status').notNull().default('pending'),
    transactionId: (0, pg_core_1.text)('transaction_id'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
//# sourceMappingURL=payments.js.map