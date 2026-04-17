"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const trend = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return {
        date: date.toISOString(),
        revenue: [3200, 4100, 4500, 6100, 5400, 5100, 5800][index],
        orders: [8, 12, 10, 20, 13, 14, 18][index],
    };
});
const orders = [
    {
        id: "ORD-1001",
        customerId: "1",
        businessId: "1",
        status: "requested",
        items: [{ itemName: "Wash & Fold", quantity: 4 }, { itemName: "Steam Iron", quantity: 3 }],
        total: 320,
        pickupAddress: "Narnaul, Haryana",
        pickupSlot: "Today, 5 PM - 7 PM",
        createdAt: new Date().toISOString(),
    },
    {
        id: "ORD-1002",
        customerId: "1",
        businessId: "1",
        status: "cleaning",
        items: [{ itemName: "Dry Cleaning", quantity: 2 }],
        total: 480,
        pickupAddress: "Narnaul, Haryana",
        pickupSlot: "Tomorrow, 10 AM - 12 PM",
        createdAt: new Date().toISOString(),
    },
    {
        id: "ORD-1003",
        customerId: "2",
        businessId: "1",
        status: "out_for_delivery",
        items: [{ itemName: "Bedding & Linen", quantity: 1 }],
        total: 650,
        pickupAddress: "Narnaul, Haryana",
        pickupSlot: "Yesterday, 4 PM - 6 PM",
        createdAt: new Date().toISOString(),
    },
];
router.get("/orders", (req, res) => {
    const limit = Number(req.query.limit ?? orders.length);
    res.json({
        orders: orders.slice(0, limit),
        total: orders.length,
        page: Number(req.query.page ?? 1),
        limit,
    });
});
router.get("/businesses/:id/stats", (_req, res) => {
    res.json({
        totalOrders: 342,
        ordersToday: 18,
        revenueToday: 4280,
        revenueThisMonth: 124500,
        pendingPickups: 7,
        activeRiders: 4,
        averageRating: 4.8,
        totalCustomers: 128,
    });
});
router.get("/analytics/revenue-trend", (_req, res) => {
    res.json(trend);
});
router.get("/analytics/business/:businessId", (_req, res) => {
    res.json({
        totalOrders: 342,
        revenueToday: 4280,
        revenueThisMonth: 124500,
        pendingPickups: 7,
        activeRiders: 4,
        ordersThisWeek: 95,
        averageOrderValue: 365,
        topItems: [
            { name: "Wash & Fold", count: 52 },
            { name: "Steam Iron", count: 31 },
            { name: "Dry Cleaning", count: 18 },
        ],
    });
});
router.get("/items", (_req, res) => {
    res.json({
        items: [
            { id: "1", name: "Shirt", category: "Wash & Fold", price: 25, unit: "item", isActive: true },
            { id: "2", name: "Suit", category: "Dry Cleaning", price: 120, unit: "item", isActive: true },
            { id: "3", name: "Bedsheet", category: "Bedding & Linen", price: 80, unit: "piece", isActive: true },
        ],
        total: 3,
        page: 1,
        limit: 20,
    });
});
router.get("/coupons", (_req, res) => {
    res.json({
        coupons: [
            { id: "1", code: "FIRST50", discountType: "percentage", discountValue: 50, isActive: true, businessId: "1" },
        ],
        total: 1,
        page: 1,
        limit: 20,
    });
});
router.get("/subscriptions", (_req, res) => {
    res.json({
        subscriptions: [
            { id: "1", name: "Monthly Fresh", price: 999, duration: 30, businessId: "1", isActive: true },
        ],
        total: 1,
        page: 1,
        limit: 20,
    });
});
router.get("/notifications", (_req, res) => {
    res.json({
        notifications: [
            { id: "1", title: "Welcome", message: "Demo mode is running without database.", type: "system", isRead: false, createdAt: new Date().toISOString() },
        ],
        total: 1,
        page: 1,
        limit: 20,
    });
});
router.use((_req, res) => {
    res.status(503).json({
        error: "Database not configured",
        message: "Add DATABASE_URL in backend .env to enable live data for this route.",
    });
});
exports.default = router;
//# sourceMappingURL=mock.js.map