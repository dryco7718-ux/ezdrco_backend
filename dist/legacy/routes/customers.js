"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
router.get("/customers", async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = req.query.search?.trim().toLowerCase();
    const offset = (page - 1) * limit;
    const allCustomers = (await db_1.db.select().from(db_1.users).where((0, drizzle_orm_1.eq)(db_1.users.role, "customer")).orderBy((0, drizzle_orm_1.desc)(db_1.users.createdAt)))
        .filter((customer) => !search || customer.name.toLowerCase().includes(search) || customer.phone.includes(search));
    res.json({
        customers: allCustomers.slice(offset, offset + limit).map((customer) => ({
            id: String(customer.id),
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            role: customer.role,
            isActive: customer.isActive,
            createdAt: customer.createdAt?.toISOString(),
        })),
        total: allCustomers.length,
        page,
        limit,
    });
});
router.get("/customers/:id", async (req, res) => {
    const id = req.params.id;
    const [customer] = await db_1.db.select().from(db_1.users).where((0, drizzle_orm_1.eq)(db_1.users.id, id));
    if (!customer || customer.role !== "customer") {
        res.status(404).json({ error: "Customer not found" });
        return;
    }
    res.json({
        id: String(customer.id),
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        role: customer.role,
        isActive: customer.isActive,
        createdAt: customer.createdAt?.toISOString(),
    });
});
router.get("/customers/:id/stats", async (req, res) => {
    const id = req.params.id;
    const orders = await db_1.db.select().from(db_1.ordersTable).where((0, drizzle_orm_1.eq)(db_1.ordersTable.customerId, id));
    const totalOrders = orders.length;
    const totalSpend = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const lastOrder = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    res.json({
        totalOrders,
        totalSpend,
        lifetimeValue: totalSpend,
        averageOrderValue: totalOrders > 0 ? totalSpend / totalOrders : 0,
        lastOrderDate: lastOrder?.createdAt?.toISOString(),
    });
});
router.get("/customers/:customerId/addresses", async (req, res) => {
    const customerId = req.params.customerId;
    const addresses = await db_1.db.select().from(db_1.addressesTable).where((0, drizzle_orm_1.eq)(db_1.addressesTable.userId, customerId));
    res.json(addresses.map((address) => ({
        id: String(address.id),
        customerId: String(address.userId),
        label: address.label,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        pincode: address.pincode,
        lat: address.lat ? Number(address.lat) : undefined,
        lng: address.lng ? Number(address.lng) : undefined,
        isDefault: address.isDefault,
    })));
});
router.post("/customers/:customerId/addresses", async (req, res) => {
    const customerId = req.params.customerId;
    const { label, line1, line2, city, pincode, lat, lng, isDefault, landmark } = req.body;
    if (!label || !line1 || !city || !pincode) {
        res.status(400).json({ error: "Missing required fields" });
        return;
    }
    const insertResult = await db_1.db.insert(db_1.addressesTable).values({
        userId: customerId,
        label,
        line1,
        line2,
        landmark,
        city,
        pincode,
        lat: lat ? String(lat) : undefined,
        lng: lng ? String(lng) : undefined,
        isDefault: isDefault ?? false,
    }).returning();
    const address = insertResult[0];
    res.status(201).json({
        id: String(address.id),
        customerId: String(address.userId),
        label: address.label,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        pincode: address.pincode,
        lat: address.lat ? Number(address.lat) : undefined,
        lng: address.lng ? Number(address.lng) : undefined,
        isDefault: address.isDefault,
    });
});
exports.default = router;
//# sourceMappingURL=customers.js.map