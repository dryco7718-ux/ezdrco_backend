"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
function getBusinessStatus(business) {
    if (!business.isApproved)
        return "pending";
    return business.isActive ? "active" : "inactive";
}
function formatBusiness(business, owner) {
    return {
        id: String(business.id),
        userId: String(business.userId),
        name: business.shopName,
        ownerName: owner?.name ?? "Business Owner",
        phone: business.shopPhone,
        email: business.shopEmail,
        address: business.shopAddress,
        city: business.shopCity,
        status: getBusinessStatus(business),
        plan: business.plan,
        commissionRate: business.commissionRate ? Number(business.commissionRate) : undefined,
        rating: business.rating ? Number(business.rating) : undefined,
        totalOrders: business.totalOrders ?? 0,
        joinedAt: business.createdAt?.toISOString(),
    };
}
function formatBusinessRequest(request) {
    return {
        id: String(request.id),
        requestId: String(request.id),
        name: request.shopName,
        ownerName: request.ownerName,
        phone: request.ownerPhone,
        email: request.ownerEmail,
        address: request.shopAddress,
        city: request.shopCity,
        status: request.status === "approved" ? "active" : request.status === "rejected" ? "inactive" : "pending",
        joinedAt: request.createdAt?.toISOString(),
    };
}
function slugifyShopName(name, suffix) {
    const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "business";
    return `${base}-${suffix.slice(0, 8)}`;
}
router.get("/businesses", async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status;
    const allBusinesses = await db_1.db.select().from(db_1.businessesTable).orderBy((0, drizzle_orm_1.desc)(db_1.businessesTable.createdAt));
    const allRequests = await db_1.db.select().from(db_1.businessRequests).orderBy((0, drizzle_orm_1.desc)(db_1.businessRequests.createdAt));
    const ownerIds = [...new Set(allBusinesses.map((business) => business.userId))];
    const owners = ownerIds.length > 0
        ? await db_1.db.select().from(db_1.users).where((0, drizzle_orm_1.inArray)(db_1.users.id, ownerIds))
        : [];
    const ownerMap = Object.fromEntries(owners.map((owner) => [owner.id, owner]));
    const businessEntries = allBusinesses.map((business) => formatBusiness(business, ownerMap[business.userId]));
    const pendingEntries = allRequests
        .filter((request) => request.status !== "approved")
        .map(formatBusinessRequest);
    const combined = [...pendingEntries, ...businessEntries].sort((a, b) => {
        const left = new Date(a.joinedAt ?? 0).getTime();
        const right = new Date(b.joinedAt ?? 0).getTime();
        return right - left;
    });
    const filteredBusinesses = status ? combined.filter((business) => business.status === status) : combined;
    res.json({
        businesses: filteredBusinesses.slice(offset, offset + limit),
        total: filteredBusinesses.length,
        page,
        limit,
    });
});
router.post("/businesses", async (req, res) => {
    const { userId, shopName, contactPhone, contactEmail, shopAddress, shopCity, plan, commissionRate, isActive, isApproved } = req.body;
    if (!userId || !shopName || !contactPhone || !shopAddress || !shopCity) {
        res.status(400).json({ error: "Missing required fields" });
        return;
    }
    const insertResult = await db_1.db.insert(db_1.businessesTable).values({
        userId: String(userId),
        shopName,
        shopPhone: contactPhone,
        shopEmail: contactEmail,
        shopAddress,
        shopCity,
        plan: plan ?? "basic",
        commissionRate: commissionRate != null ? String(commissionRate) : undefined,
        isActive: isActive ?? true,
        isApproved: isApproved ?? true,
        approvedAt: isApproved === false ? undefined : new Date(),
    }).returning();
    const business = insertResult[0];
    const [owner] = await db_1.db.select().from(db_1.users).where((0, drizzle_orm_1.eq)(db_1.users.id, business.userId));
    res.status(201).json(formatBusiness(business, owner));
});
router.get("/businesses/:id", async (req, res) => {
    const id = req.params.id;
    const [business] = await db_1.db.select().from(db_1.businessesTable).where((0, drizzle_orm_1.eq)(db_1.businessesTable.id, id));
    if (!business) {
        const [request] = await db_1.db.select().from(db_1.businessRequests).where((0, drizzle_orm_1.eq)(db_1.businessRequests.id, id));
        if (!request) {
            res.status(404).json({ error: "Business not found" });
            return;
        }
        res.json(formatBusinessRequest(request));
        return;
    }
    const [owner] = await db_1.db.select().from(db_1.users).where((0, drizzle_orm_1.eq)(db_1.users.id, business.userId));
    res.json(formatBusiness(business, owner));
});
router.patch("/businesses/:id", async (req, res) => {
    const id = req.params.id;
    const { shopName, status, plan, commissionRate, isActive, isApproved } = req.body;
    const updates = {};
    if (shopName)
        updates.shopName = shopName;
    if (plan)
        updates.plan = plan;
    if (commissionRate !== undefined)
        updates.commissionRate = String(commissionRate);
    if (isActive !== undefined)
        updates.isActive = Boolean(isActive);
    if (isApproved !== undefined)
        updates.isApproved = Boolean(isApproved);
    if (status === "active") {
        updates.isActive = true;
        updates.isApproved = true;
        updates.approvedAt = new Date();
    }
    else if (status === "pending") {
        updates.isActive = false;
        updates.isApproved = false;
    }
    else if (status === "inactive" || status === "suspended") {
        updates.isActive = false;
    }
    const updateResult = await db_1.db.update(db_1.businessesTable).set(updates).where((0, drizzle_orm_1.eq)(db_1.businessesTable.id, id)).returning();
    const business = updateResult[0];
    if (!business) {
        const [request] = await db_1.db.select().from(db_1.businessRequests).where((0, drizzle_orm_1.eq)(db_1.businessRequests.id, id));
        if (!request) {
            res.status(404).json({ error: "Business not found" });
            return;
        }
        if (status === "active") {
            const [existingUser] = await db_1.db.select().from(db_1.users).where((0, drizzle_orm_1.eq)(db_1.users.phone, request.ownerPhone));
            let user = existingUser;
            if (!user) {
                const createdUsers = await db_1.db.insert(db_1.users).values({
                    name: request.ownerName,
                    phone: request.ownerPhone,
                    email: request.ownerEmail,
                    passwordHash: request.passwordHash,
                    role: "business",
                    address: request.shopAddress,
                    city: request.shopCity,
                    pincode: request.shopPincode,
                    isActive: true,
                    isVerified: true,
                }).returning();
                user = createdUsers[0];
            }
            const createdBusinesses = await db_1.db.insert(db_1.businessesTable).values({
                userId: user.id,
                requestId: request.id,
                shopName: request.shopName,
                shopSlug: slugifyShopName(request.shopName, String(user.id)),
                shopPhone: request.shopPhone ?? request.ownerPhone,
                shopEmail: request.shopEmail ?? request.ownerEmail,
                shopAddress: request.shopAddress,
                shopCity: request.shopCity,
                shopPincode: request.shopPincode,
                shopLat: request.shopLat,
                shopLng: request.shopLng,
                businessType: request.businessType,
                plan: "basic",
                commissionRate: "12",
                isActive: true,
                isApproved: true,
                approvedAt: new Date(),
            }).returning();
            const createdBusiness = createdBusinesses[0];
            await db_1.db.update(db_1.businessRequests).set({
                status: "approved",
                reviewedAt: new Date(),
            }).where((0, drizzle_orm_1.eq)(db_1.businessRequests.id, request.id));
            res.json(formatBusiness(createdBusiness, user));
            return;
        }
        await db_1.db.update(db_1.businessRequests).set({
            status: status === "pending" ? "under_review" : "rejected",
            reviewedAt: new Date(),
            rejectionReason: status === "inactive" ? "Rejected by admin" : undefined,
        }).where((0, drizzle_orm_1.eq)(db_1.businessRequests.id, request.id));
        const [updatedRequest] = await db_1.db.select().from(db_1.businessRequests).where((0, drizzle_orm_1.eq)(db_1.businessRequests.id, request.id));
        res.json(formatBusinessRequest(updatedRequest));
        return;
    }
    const [owner] = await db_1.db.select().from(db_1.users).where((0, drizzle_orm_1.eq)(db_1.users.id, business.userId));
    res.json(formatBusiness(business, owner));
});
router.get("/businesses/:id/stats", async (req, res) => {
    const id = req.params.id;
    const today = new Date().toISOString().split("T")[0];
    const orders = await db_1.db.select().from(db_1.ordersTable).where((0, drizzle_orm_1.eq)(db_1.ordersTable.businessId, id));
    const todayOrders = orders.filter((order) => order.createdAt.toISOString().startsWith(today));
    const pendingPickups = orders.filter((order) => ["accepted", "requested"].includes(order.status)).length;
    const riders = await db_1.db.select().from(db_1.ridersTable).where((0, drizzle_orm_1.eq)(db_1.ridersTable.businessId, id));
    const activeRiders = riders.filter((rider) => rider.isAvailable).length;
    const revenueToday = todayOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const revenueThisMonth = orders
        .filter((order) => new Date(order.createdAt).getMonth() === new Date().getMonth())
        .reduce((sum, order) => sum + Number(order.totalAmount), 0);
    res.json({
        totalOrders: orders.length,
        ordersToday: todayOrders.length,
        revenueToday,
        revenueThisMonth,
        pendingPickups,
        activeRiders,
        averageRating: 4.5,
        totalCustomers: new Set(orders.map((order) => order.customerId)).size,
    });
});
exports.default = router;
//# sourceMappingURL=businesses.js.map