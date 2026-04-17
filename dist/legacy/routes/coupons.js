"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
function formatCoupon(c) {
    return {
        id: String(c.id),
        code: c.code,
        discountType: c.discountType,
        discountValue: Number(c.discountValue),
        minOrderValue: c.minOrderValue ? Number(c.minOrderValue) : undefined,
        maxDiscount: c.maxDiscountAmount ? Number(c.maxDiscountAmount) : undefined,
        expiryDate: c.endDate,
        usageLimit: c.totalUsageLimit,
        usedCount: c.usedCount ?? 0,
        isActive: c.isActive,
        businessId: String(c.businessId),
    };
}
router.get("/coupons", async (req, res) => {
    const { businessId, active } = req.query;
    let query = db_1.db.select().from(db_1.couponsTable);
    const conditions = [];
    if (businessId)
        conditions.push((0, drizzle_orm_1.eq)(db_1.couponsTable.businessId, businessId));
    if (active !== undefined)
        conditions.push((0, drizzle_orm_1.eq)(db_1.couponsTable.isActive, active === "true"));
    if (conditions.length > 0)
        query = query.where((0, drizzle_orm_1.and)(...conditions));
    const coupons = await query;
    res.json(coupons.map(formatCoupon));
});
router.post("/coupons", async (req, res) => {
    const { code, discountType, discountValue, minOrderValue, maxDiscount, expiryDate, usageLimit, businessId } = req.body;
    if (!code || !discountType || discountValue === undefined || !businessId) {
        res.status(400).json({ error: "Missing required fields" });
        return;
    }
    const insertResult = await db_1.db.insert(db_1.couponsTable).values({
        code,
        discountType,
        discountValue: String(discountValue),
        minOrderValue: minOrderValue ? String(minOrderValue) : undefined,
        maxDiscountAmount: maxDiscount ? String(maxDiscount) : undefined,
        endDate: expiryDate,
        totalUsageLimit: usageLimit,
        businessId: String(businessId),
    }).returning();
    const coupon = insertResult[0];
    res.status(201).json(formatCoupon(coupon));
});
router.post("/coupons/validate", async (req, res) => {
    const { code, orderValue } = req.body;
    const [coupon] = await db_1.db.select().from(db_1.couponsTable).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.couponsTable.code, code), (0, drizzle_orm_1.eq)(db_1.couponsTable.isActive, true)));
    if (!coupon) {
        res.json({ valid: false, discount: 0, message: "Invalid coupon code" });
        return;
    }
    const minOrder = Number(coupon.minOrderValue ?? 0);
    if (orderValue < minOrder) {
        res.json({ valid: false, discount: 0, message: `Minimum order value is ₹${minOrder}` });
        return;
    }
    let discount = 0;
    if (coupon.discountType === "flat") {
        discount = Number(coupon.discountValue);
    }
    else {
        discount = (orderValue * Number(coupon.discountValue)) / 100;
        if (coupon.maxDiscountAmount) {
            discount = Math.min(discount, Number(coupon.maxDiscountAmount));
        }
    }
    res.json({ valid: true, discount, message: `Coupon applied! You save ₹${discount}` });
});
exports.default = router;
//# sourceMappingURL=coupons.js.map