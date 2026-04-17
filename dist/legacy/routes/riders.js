"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
function formatRider(r) {
    return {
        id: String(r.id),
        name: r.name,
        phone: r.phone,
        businessId: String(r.businessId),
        isAvailable: r.isAvailable,
        activeOrders: r.activeOrders ?? 0,
        totalDeliveries: r.totalDeliveries ?? 0,
        rating: r.rating ? Number(r.rating) : undefined,
    };
}
router.get("/riders", async (req, res) => {
    const { businessId, available } = req.query;
    let query = db_1.db.select().from(db_1.ridersTable);
    const conditions = [];
    if (businessId)
        conditions.push((0, drizzle_orm_1.eq)(db_1.ridersTable.businessId, businessId));
    if (available !== undefined)
        conditions.push((0, drizzle_orm_1.eq)(db_1.ridersTable.isAvailable, available === "true"));
    if (conditions.length > 0)
        query = query.where((0, drizzle_orm_1.and)(...conditions));
    const riders = await query;
    res.json(riders.map(formatRider));
});
router.post("/riders", async (req, res) => {
    const { name, phone, businessId } = req.body;
    if (!name || !phone || !businessId) {
        res.status(400).json({ error: "Missing required fields" });
        return;
    }
    const insertResult = await db_1.db.insert(db_1.ridersTable).values({ name, phone, businessId: String(businessId) }).returning();
    const rider = insertResult[0];
    res.status(201).json(formatRider(rider));
});
exports.default = router;
//# sourceMappingURL=riders.js.map