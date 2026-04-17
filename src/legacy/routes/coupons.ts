import { Router } from "express";
import { db, couponsTable } from "../db";
import { eq, and } from "drizzle-orm";

const router = Router();

function formatCoupon(c: any) {
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

router.get("/coupons", async (req, res): Promise<void> => {
  const { businessId, active } = req.query;
  let query = db.select().from(couponsTable);
  const conditions = [];
  if (businessId) conditions.push(eq(couponsTable.businessId, businessId as string));
  if (active !== undefined) conditions.push(eq(couponsTable.isActive, active === "true"));
  if (conditions.length > 0) query = query.where(and(...conditions)) as typeof query;
  const coupons = await query;
  res.json(coupons.map(formatCoupon));
});

router.post("/coupons", async (req, res): Promise<void> => {
  const { code, discountType, discountValue, minOrderValue, maxDiscount, expiryDate, usageLimit, businessId } = req.body;
  if (!code || !discountType || discountValue === undefined || !businessId) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  const insertResult = await db.insert(couponsTable).values({
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

router.post("/coupons/validate", async (req, res): Promise<void> => {
  const { code, orderValue } = req.body;
  const [coupon] = await db.select().from(couponsTable).where(and(
    eq(couponsTable.code, code),
    eq(couponsTable.isActive, true),
  ));

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
  } else {
    discount = (orderValue * Number(coupon.discountValue)) / 100;
    if (coupon.maxDiscountAmount) {
      discount = Math.min(discount, Number(coupon.maxDiscountAmount));
    }
  }

  res.json({ valid: true, discount, message: `Coupon applied! You save ₹${discount}` });
});

export default router;
