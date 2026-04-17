"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
function formatSubscription(s) {
    return {
        id: String(s.id),
        name: s.name,
        price: Number(s.price),
        duration: s.duration,
        itemsPerMonth: s.itemsPerMonth,
        services: s.services,
        freePickups: s.freePickups ?? 0,
        discountPercent: s.discountPercent ? Number(s.discountPercent) : undefined,
        businessId: String(s.businessId),
        isActive: s.isActive,
    };
}
router.get("/subscriptions", async (req, res) => {
    if (!(await (0, db_1.doesTableExist)("subscriptions"))) {
        res.json([]);
        return;
    }
    const { businessId } = req.query;
    let query = db_1.db.select().from(db_1.subscriptionsTable);
    if (businessId)
        query = query.where((0, drizzle_orm_1.eq)(db_1.subscriptionsTable.businessId, businessId));
    const subs = await query;
    res.json(subs.map(formatSubscription));
});
router.post("/subscriptions", async (req, res) => {
    if (!(await (0, db_1.doesTableExist)("subscriptions"))) {
        res.status(503).json({ error: "Subscriptions feature is not enabled in the current database schema" });
        return;
    }
    const { name, price, duration, itemsPerMonth, services, freePickups, discountPercent, businessId } = req.body;
    if (!name || price === undefined || !duration || !businessId) {
        res.status(400).json({ error: "Missing required fields" });
        return;
    }
    const insertResult = await db_1.db.insert(db_1.subscriptionsTable).values({
        name,
        price: String(price),
        duration,
        itemsPerMonth,
        services,
        freePickups: freePickups ?? 0,
        discountPercent: discountPercent ? String(discountPercent) : undefined,
        businessId,
    }).returning();
    const sub = insertResult[0];
    res.status(201).json(formatSubscription(sub));
});
exports.default = router;
//# sourceMappingURL=subscriptions.js.map