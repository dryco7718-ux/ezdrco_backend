"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
router.get("/reviews", async (req, res) => {
    const { businessId, orderId } = req.query;
    let query = db_1.db.select().from(db_1.reviewsTable);
    const conditions = [];
    if (businessId)
        conditions.push((0, drizzle_orm_1.eq)(db_1.reviewsTable.businessId, businessId));
    if (orderId)
        conditions.push((0, drizzle_orm_1.eq)(db_1.reviewsTable.orderId, orderId));
    if (conditions.length > 0)
        query = query.where((0, drizzle_orm_1.and)(...conditions));
    const reviews = await query;
    const customerIds = [...new Set(reviews.map(r => r.customerId))];
    const customers = customerIds.length > 0
        ? await Promise.all(customerIds.map(id => db_1.db.select().from(db_1.users).where((0, drizzle_orm_1.eq)(db_1.users.id, id)).then(r => r[0])))
        : [];
    const customerMap = Object.fromEntries(customers.filter(Boolean).map(c => [c.id, c]));
    res.json(reviews.map(r => ({
        id: String(r.id),
        orderId: String(r.orderId),
        customerId: String(r.customerId),
        businessId: String(r.businessId),
        rating: r.overallRating,
        comment: r.comment,
        createdAt: r.createdAt?.toISOString(),
        customerName: customerMap[r.customerId]?.name ?? "Customer",
    })));
});
router.post("/reviews", async (req, res) => {
    const { orderId, customerId, businessId, rating, comment } = req.body;
    if (!orderId || !customerId || !businessId || !rating) {
        res.status(400).json({ error: "Missing required fields" });
        return;
    }
    const insertResult = await db_1.db.insert(db_1.reviewsTable).values({
        orderId: String(orderId),
        customerId: String(customerId),
        businessId: String(businessId),
        overallRating: rating,
        comment,
    }).returning();
    const review = insertResult[0];
    res.status(201).json({
        id: String(review.id),
        orderId: String(review.orderId),
        customerId: String(review.customerId),
        businessId: String(review.businessId),
        rating: review.overallRating,
        comment: review.comment,
        createdAt: review.createdAt?.toISOString(),
    });
});
exports.default = router;
//# sourceMappingURL=reviews.js.map