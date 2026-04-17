"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
function getStatusTimestampUpdate(status) {
    switch (status) {
        case "accepted":
            return { acceptedAt: new Date() };
        case "pickup_scheduled":
            return { pickupScheduledAt: new Date() };
        case "picked_up":
            return { pickedUpAt: new Date() };
        case "reached_store":
            return { reachedStoreAt: new Date() };
        case "processing":
            return { processingStartedAt: new Date() };
        case "ready":
            return { readyAt: new Date() };
        case "out_for_delivery":
            return { outForDeliveryAt: new Date() };
        case "delivered":
            return { deliveredAt: new Date(), paymentStatus: "paid", paidAt: new Date() };
        case "cancelled":
            return { cancelledAt: new Date() };
        default:
            return {};
    }
}
function serializeOrderItem(item) {
    return {
        id: String(item.id),
        itemName: item.itemName,
        itemCategory: item.itemCategory,
        serviceType: item.serviceType,
        quantity: Number(item.quantity ?? 0),
        unitPrice: Number(item.unitPrice ?? 0),
        totalPrice: Number(item.totalPrice ?? 0),
        isExpress: item.isExpress,
    };
}
function formatOrder(order, items = [], customer, rider) {
    return {
        id: String(order.id),
        customerId: String(order.customerId),
        businessId: String(order.businessId),
        status: order.status,
        items,
        subtotal: Number(order.subtotal ?? 0),
        deliveryCharge: Number(order.deliveryCharge ?? 0),
        discount: Number(order.discountAmount ?? 0),
        total: Number(order.totalAmount ?? 0),
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        pickupDate: order.pickupDate,
        pickupSlot: order.pickupSlot,
        deliveryDate: order.deliveryDate,
        addressId: order.pickupAddressId ? String(order.pickupAddressId) : undefined,
        riderId: order.riderId ? String(order.riderId) : undefined,
        couponCode: order.couponCode,
        notes: order.customerNotes,
        isExpress: order.isExpress,
        createdAt: order.createdAt?.toISOString(),
        customer: customer ? {
            id: String(customer.id),
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            role: customer.role,
        } : undefined,
        rider: rider ? {
            id: String(rider.id),
            name: rider.name,
            phone: rider.phone,
            businessId: rider.businessId ? String(rider.businessId) : undefined,
            isAvailable: rider.isAvailable,
            totalDeliveries: rider.totalDeliveries,
            rating: rider.rating ? Number(rider.rating) : undefined,
        } : undefined,
    };
}
async function getOrderItemsMap(orderIds) {
    const itemRows = orderIds.length > 0
        ? await db_1.db.select().from(db_1.orderItems).where((0, drizzle_orm_1.sql) `${db_1.orderItems.orderId} = ANY(${orderIds})`)
        : [];
    return itemRows.reduce((acc, item) => {
        const key = String(item.orderId);
        acc[key] ??= [];
        acc[key].push(serializeOrderItem(item));
        return acc;
    }, {});
}
router.get("/orders", async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { status, customerId, businessId } = req.query;
    let query = db_1.db.select().from(db_1.ordersTable);
    const conditions = [];
    if (status)
        conditions.push((0, drizzle_orm_1.eq)(db_1.ordersTable.status, status));
    if (customerId)
        conditions.push((0, drizzle_orm_1.eq)(db_1.ordersTable.customerId, customerId));
    if (businessId)
        conditions.push((0, drizzle_orm_1.eq)(db_1.ordersTable.businessId, businessId));
    if (conditions.length > 0)
        query = query.where((0, drizzle_orm_1.and)(...conditions));
    const orders = await query.limit(limit).offset(offset).orderBy((0, drizzle_orm_1.desc)(db_1.ordersTable.createdAt));
    const [{ count }] = await db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(db_1.ordersTable);
    const orderIds = orders.map((order) => String(order.id));
    const itemsByOrderId = await getOrderItemsMap(orderIds);
    const customerIds = [...new Set(orders.map((order) => order.customerId))];
    const customers = customerIds.length > 0
        ? await db_1.db.select().from(db_1.users).where((0, drizzle_orm_1.sql) `${db_1.users.id} = ANY(${customerIds})`)
        : [];
    const customerMap = Object.fromEntries(customers.map((customer) => [customer.id, customer]));
    res.json({
        orders: orders.map((order) => formatOrder(order, itemsByOrderId[String(order.id)] ?? [], customerMap[order.customerId])),
        total: Number(count),
        page,
        limit,
    });
});
router.post("/orders", async (req, res) => {
    const { customerId, businessId, items, pickupDate, pickupSlot, addressId, paymentMethod, couponCode, isExpress, notes } = req.body;
    if (!customerId || !businessId || !Array.isArray(items) || items.length === 0 || !pickupDate || !pickupSlot || !paymentMethod) {
        res.status(400).json({ error: "Missing required fields" });
        return;
    }
    const subtotal = items.reduce((sum, item) => {
        const quantity = Number(item.quantity ?? 1);
        const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
        return sum + unitPrice * quantity;
    }, 0);
    const deliveryCharge = 40;
    const discount = 0;
    const commissionRate = 12;
    const total = subtotal + deliveryCharge - discount;
    const commissionAmount = Number(((subtotal * commissionRate) / 100).toFixed(2));
    const businessEarnings = Number((subtotal - commissionAmount).toFixed(2));
    const orderNumber = `WF${Date.now()}`;
    const insertResult = await db_1.db.insert(db_1.ordersTable).values({
        orderNumber,
        customerId: String(customerId),
        businessId: String(businessId),
        subtotal: String(subtotal),
        deliveryCharge: String(deliveryCharge),
        discountAmount: String(discount),
        totalAmount: String(total),
        platformCommissionRate: String(commissionRate),
        platformCommissionAmount: String(commissionAmount),
        businessEarnings: String(businessEarnings),
        paymentMethod,
        paymentStatus: "pending",
        pickupDate,
        pickupSlot,
        pickupAddressId: addressId ? String(addressId) : undefined,
        deliveryAddressId: addressId ? String(addressId) : undefined,
        couponCode: couponCode ? String(couponCode) : undefined,
        isExpress: isExpress ?? false,
        customerNotes: notes,
        status: "requested",
    }).returning();
    const order = insertResult[0];
    await db_1.db.insert(db_1.orderStatusHistory).values({
        orderId: order.id,
        fromStatus: null,
        toStatus: order.status,
        changedBy: String(customerId),
        changedByType: "customer",
        notes: "Order placed by customer",
        metadata: {
            paymentMethod,
            couponCode: couponCode ?? null,
        },
    });
    await db_1.db.insert(db_1.orderItems).values(items.map((item) => {
        const quantity = Number(item.quantity ?? 1);
        const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
        return {
            orderId: order.id,
            serviceId: item.serviceId ? String(item.serviceId) : undefined,
            itemName: item.itemName ?? item.name ?? "Laundry Item",
            itemCategory: item.itemCategory ?? item.category ?? undefined,
            serviceType: item.serviceType ?? "wash",
            quantity: String(quantity),
            unit: item.unit ?? "piece",
            unitPrice: String(unitPrice),
            totalPrice: String(Number(item.totalPrice ?? unitPrice * quantity)),
            isExpress: item.isExpress ?? Boolean(isExpress),
            expressMultiplier: String(item.expressMultiplier ?? 1),
            specialInstructions: item.specialInstructions ?? undefined,
        };
    }));
    res.status(201).json(formatOrder(order, items.map((item, index) => ({
        id: `new-${index}`,
        itemName: item.itemName ?? item.name,
        itemCategory: item.itemCategory ?? item.category,
        serviceType: item.serviceType ?? "wash",
        quantity: Number(item.quantity ?? 1),
        unitPrice: Number(item.unitPrice ?? item.price ?? 0),
        totalPrice: Number(item.totalPrice ?? (Number(item.unitPrice ?? item.price ?? 0) * Number(item.quantity ?? 1))),
        isExpress: item.isExpress ?? Boolean(isExpress),
    }))));
});
router.get("/orders/:id", async (req, res) => {
    const id = req.params.id;
    const [order] = await db_1.db.select().from(db_1.ordersTable).where((0, drizzle_orm_1.eq)(db_1.ordersTable.id, id));
    if (!order) {
        res.status(404).json({ error: "Order not found" });
        return;
    }
    const [customer] = await db_1.db.select().from(db_1.users).where((0, drizzle_orm_1.eq)(db_1.users.id, order.customerId));
    const [rider] = order.riderId
        ? await db_1.db.select().from(db_1.ridersTable).where((0, drizzle_orm_1.eq)(db_1.ridersTable.id, order.riderId))
        : [undefined];
    const items = await db_1.db.select().from(db_1.orderItems).where((0, drizzle_orm_1.eq)(db_1.orderItems.orderId, order.id));
    res.json(formatOrder(order, items.map(serializeOrderItem), customer, rider));
});
router.patch("/orders/:id", async (req, res) => {
    const id = req.params.id;
    const { status, notes, deliveryDate } = req.body;
    const [existingOrder] = await db_1.db.select().from(db_1.ordersTable).where((0, drizzle_orm_1.eq)(db_1.ordersTable.id, id));
    if (!existingOrder) {
        res.status(404).json({ error: "Order not found" });
        return;
    }
    const updates = {};
    if (status) {
        updates.status = status;
        Object.assign(updates, getStatusTimestampUpdate(status));
    }
    if (notes != null)
        updates.customerNotes = notes;
    if (deliveryDate)
        updates.deliveryDate = deliveryDate;
    const updateResult = await db_1.db.update(db_1.ordersTable).set(updates).where((0, drizzle_orm_1.eq)(db_1.ordersTable.id, id)).returning();
    const order = updateResult[0];
    if (status && status !== existingOrder.status) {
        await db_1.db.insert(db_1.orderStatusHistory).values({
            orderId: order.id,
            fromStatus: existingOrder.status,
            toStatus: status,
            notes: notes ?? undefined,
            changedByType: "business",
        });
    }
    const items = await db_1.db.select().from(db_1.orderItems).where((0, drizzle_orm_1.eq)(db_1.orderItems.orderId, order.id));
    res.json(formatOrder(order, items.map(serializeOrderItem)));
});
router.post("/orders/:id/assign-rider", async (req, res) => {
    const id = req.params.id;
    const { riderId } = req.body;
    const updateResult = await db_1.db.update(db_1.ordersTable).set({ riderId }).where((0, drizzle_orm_1.eq)(db_1.ordersTable.id, id)).returning();
    const order = updateResult[0];
    if (!order) {
        res.status(404).json({ error: "Order not found" });
        return;
    }
    const [rider] = await db_1.db.select().from(db_1.ridersTable).where((0, drizzle_orm_1.eq)(db_1.ridersTable.id, riderId));
    const items = await db_1.db.select().from(db_1.orderItems).where((0, drizzle_orm_1.eq)(db_1.orderItems.orderId, order.id));
    res.json(formatOrder(order, items.map(serializeOrderItem), undefined, rider));
});
exports.default = router;
//# sourceMappingURL=orders.js.map