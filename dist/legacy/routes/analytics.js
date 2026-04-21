"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
router.get("/analytics/platform", async (req, res) => {
    const [totalUsersResult] = await db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(db_1.users);
    const [totalBusinessesResult] = await db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(db_1.businessesTable);
    const [ordersResult] = await db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)`, revenue: (0, drizzle_orm_1.sql) `sum(total_amount)` }).from(db_1.ordersTable);
    const today = new Date().toISOString().split("T")[0];
    const allOrders = await db_1.db.select().from(db_1.ordersTable);
    const todayOrders = allOrders.filter(o => o.createdAt.toISOString().startsWith(today));
    const revenueToday = todayOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const totalRevenue = Number(ordersResult.revenue ?? 0);
    const totalCommission = totalRevenue * 0.1;
    res.json({
        totalUsers: Number(totalUsersResult.count),
        totalBusinesses: Number(totalBusinessesResult.count),
        totalOrders: Number(ordersResult.count),
        totalRevenue,
        totalCommission,
        activeSubscriptions: 48,
        ordersToday: todayOrders.length,
        revenueToday,
        newUsersThisMonth: Math.floor(Number(totalUsersResult.count) * 0.3),
        newBusinessesThisMonth: Math.floor(Number(totalBusinessesResult.count) * 0.2),
    });
});
router.get("/analytics/business/:businessId", async (req, res) => {
    const businessId = req.params.businessId;
    const today = new Date().toISOString().split("T")[0];
    const allOrders = await db_1.db.select().from(db_1.ordersTable).where((0, drizzle_orm_1.eq)(db_1.ordersTable.businessId, businessId));
    const todayOrders = allOrders.filter(o => o.createdAt.toISOString().startsWith(today));
    const pendingPickups = allOrders.filter(o => ["requested", "accepted"].includes(o.status)).length;
    const revenueToday = todayOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const thisMonth = new Date().getMonth();
    const monthOrders = allOrders.filter(o => new Date(o.createdAt).getMonth() === thisMonth);
    const revenueThisMonth = monthOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const lastWeekOrders = allOrders.filter(o => {
        const d = new Date(o.createdAt);
        const diff = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
        return diff <= 7;
    });
    const avgOrderValue = allOrders.length > 0
        ? allOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0) / allOrders.length
        : 0;
    res.json({
        totalOrders: allOrders.length,
        revenueToday,
        revenueThisMonth,
        pendingPickups,
        activeRiders: 3,
        ordersThisWeek: lastWeekOrders.length,
        averageOrderValue: avgOrderValue,
        topItems: [
            { name: "Shirt", count: 45 },
            { name: "Pant", count: 38 },
            { name: "Suit", count: 22 },
            { name: "Saree", count: 18 },
            { name: "Jacket", count: 12 },
        ],
    });
});
router.get("/analytics/revenue-trend", async (req, res) => {
    const period = req.query.period || "week";
    const days = period === "week" ? 7 : period === "month" ? 30 : period === "quarter" ? 90 : 365;
    const trend = [];
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        trend.push({
            date: dateStr,
            revenue: Math.floor(Math.random() * 8000 + 2000),
            orders: Math.floor(Math.random() * 20 + 5),
        });
    }
    res.json(trend);
});
router.get("/analytics/order-stats", async (req, res) => {
    const { businessId } = req.query;
    let orders;
    if (businessId) {
        orders = await db_1.db.select().from(db_1.ordersTable).where((0, drizzle_orm_1.eq)(db_1.ordersTable.businessId, businessId));
    }
    else {
        orders = await db_1.db.select().from(db_1.ordersTable);
    }
    const orderIds = orders.map((order) => order.id);
    const itemRows = orderIds.length > 0
        ? await db_1.db.select().from(db_1.orderItems).where((0, drizzle_orm_1.inArray)(db_1.orderItems.orderId, orderIds))
        : [];
    const itemsByOrderId = itemRows.reduce((acc, item) => {
        const key = String(item.orderId);
        acc[key] ??= [];
        acc[key].push(item);
        return acc;
    }, {});
    const statusCounts = {};
    const serviceCounts = {};
    for (const order of orders) {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
        const items = itemsByOrderId[String(order.id)] ?? [];
        for (const item of items) {
            const svc = item.serviceType || "wash";
            serviceCounts[svc] = (serviceCounts[svc] || 0) + Number(item.quantity || 1);
        }
    }
    res.json({
        byStatus: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
        byService: Object.entries(serviceCounts).map(([service, count]) => ({ service, count })),
    });
});
router.get("/commission/settings", async (req, res) => {
    const settings = await db_1.db.select().from(db_1.commissionSettingsTable);
    if (settings.length === 0) {
        res.json({
            defaultRate: 10,
            planRates: { basic: 12, pro: 10, premium: 8 },
            totalEarned: 85420,
            thisMonth: 12350,
        });
        return;
    }
    const s = settings[0];
    res.json({
        defaultRate: Number(s.proRate),
        planRates: {
            basic: Number(s.basicRate),
            pro: Number(s.proRate),
            premium: Number(s.premiumRate),
        },
        totalEarned: 85420,
        thisMonth: 12350,
    });
});
router.patch("/commission/settings", async (req, res) => {
    const { defaultRate, planRates } = req.body;
    const settings = await db_1.db.select().from(db_1.commissionSettingsTable);
    const updates = {};
    const fallbackRate = defaultRate !== undefined ? String(defaultRate) : undefined;
    if (planRates?.basic !== undefined)
        updates.basicRate = String(planRates.basic);
    else if (fallbackRate !== undefined)
        updates.basicRate = fallbackRate;
    if (planRates?.pro !== undefined)
        updates.proRate = String(planRates.pro);
    else if (fallbackRate !== undefined)
        updates.proRate = fallbackRate;
    if (planRates?.premium !== undefined)
        updates.premiumRate = String(planRates.premium);
    else if (fallbackRate !== undefined)
        updates.premiumRate = fallbackRate;
    if (settings.length === 0) {
        const insertResult = await db_1.db.insert(db_1.commissionSettingsTable).values({
            basicRate: String(planRates?.basic ?? defaultRate ?? 12),
            proRate: String(planRates?.pro ?? defaultRate ?? 10),
            premiumRate: String(planRates?.premium ?? defaultRate ?? 8),
        }).returning();
        const newSettings = insertResult[0];
        res.json({
            defaultRate: Number(newSettings.proRate),
            planRates: {
                basic: Number(newSettings.basicRate),
                pro: Number(newSettings.proRate),
                premium: Number(newSettings.premiumRate),
            },
        });
        return;
    }
    const updateResult = await db_1.db.update(db_1.commissionSettingsTable).set(updates).where((0, drizzle_orm_1.eq)(db_1.commissionSettingsTable.id, settings[0].id)).returning();
    const s = updateResult[0];
    res.json({
        defaultRate: Number(s.proRate),
        planRates: {
            basic: Number(s.basicRate),
            pro: Number(s.proRate),
            premium: Number(s.premiumRate),
        },
    });
});
exports.default = router;
//# sourceMappingURL=analytics.js.map