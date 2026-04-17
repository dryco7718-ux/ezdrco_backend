"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
router.get("/notifications", async (req, res) => {
    const { userId, unread } = req.query;
    let query = db_1.db.select().from(db_1.notificationsTable);
    const conditions = [];
    if (userId)
        conditions.push((0, drizzle_orm_1.eq)(db_1.notificationsTable.userId, userId));
    if (unread === "true")
        conditions.push((0, drizzle_orm_1.eq)(db_1.notificationsTable.isRead, false));
    if (conditions.length > 0)
        query = query.where((0, drizzle_orm_1.and)(...conditions));
    const notifs = await query;
    res.json(notifs.map(n => ({
        id: String(n.id),
        userId: String(n.userId),
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: n.isRead,
        createdAt: n.createdAt?.toISOString(),
    })));
});
router.post("/notifications", async (req, res) => {
    const { title, message, type, targetAudience, businessId } = req.body;
    if (!title || !message || !type || !targetAudience) {
        res.status(400).json({ error: "Missing required fields" });
        return;
    }
    const recipients = await db_1.db.select().from(db_1.users);
    const customers = targetAudience === "all"
        ? recipients
        : recipients.filter((user) => user.role === "customer");
    let sent = 0;
    for (const customer of customers) {
        await db_1.db.insert(db_1.notificationsTable).values({
            userId: customer.id,
            title,
            message,
            type,
        });
        sent++;
    }
    res.json({ sent, message: `Notification sent to ${sent} users` });
});
exports.default = router;
//# sourceMappingURL=notifications.js.map