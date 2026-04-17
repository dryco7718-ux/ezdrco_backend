"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
function formatPayment(p) {
    return {
        id: String(p.id),
        orderId: String(p.orderId),
        customerId: String(p.customerId),
        businessId: String(p.businessId),
        amount: Number(p.amount),
        method: p.method,
        status: p.status,
        transactionId: p.transactionId,
        createdAt: p.createdAt?.toISOString(),
    };
}
router.get("/payments", async (req, res) => {
    if (!(await (0, db_1.doesTableExist)("payments"))) {
        res.json([]);
        return;
    }
    const { customerId, businessId } = req.query;
    let query = db_1.db.select().from(db_1.paymentsTable);
    const conditions = [];
    if (customerId)
        conditions.push((0, drizzle_orm_1.eq)(db_1.paymentsTable.customerId, customerId));
    if (businessId)
        conditions.push((0, drizzle_orm_1.eq)(db_1.paymentsTable.businessId, businessId));
    if (conditions.length > 0)
        query = query.where((0, drizzle_orm_1.and)(...conditions));
    const payments = await query;
    res.json(payments.map(formatPayment));
});
router.post("/payments", async (req, res) => {
    if (!(await (0, db_1.doesTableExist)("payments"))) {
        res.status(503).json({ error: "Payments feature is not enabled in the current database schema" });
        return;
    }
    const { orderId, customerId, businessId, amount, method, transactionId } = req.body;
    if (!orderId || !customerId || !businessId || amount === undefined || !method) {
        res.status(400).json({ error: "Missing required fields" });
        return;
    }
    const insertResult = await db_1.db.insert(db_1.paymentsTable).values({
        orderId: String(orderId),
        customerId: String(customerId),
        businessId: String(businessId),
        amount: String(amount),
        method,
        status: "completed",
        transactionId,
    }).returning();
    const payment = insertResult[0];
    res.status(201).json(formatPayment(payment));
});
exports.default = router;
//# sourceMappingURL=payments.js.map