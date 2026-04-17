import { Router } from "express";
import { db, doesTableExist, subscriptionsTable } from "../db";
import { eq } from "drizzle-orm";

const router = Router();

function formatSubscription(s: any) {
  return {
    id: String(s.id),
    name: s.name,
    price: Number(s.price),
    duration: s.duration,
    itemsPerMonth: s.itemsPerMonth,
    services: s.services,
    freePickups: s.freePickups ?? 0,
    discountPercent: s.discountPercent ? Number(s.discountPercent) : undefined,
    businessId: String(s.businessId),
    isActive: s.isActive,
  };
}

router.get("/subscriptions", async (req, res): Promise<void> => {
  if (!(await doesTableExist("subscriptions"))) {
    res.json([]);
    return;
  }

  const { businessId } = req.query;
  let query = db.select().from(subscriptionsTable);
  if (businessId) query = query.where(eq(subscriptionsTable.businessId, businessId as string)) as typeof query;
  const subs = await query;
  res.json(subs.map(formatSubscription));
});

router.post("/subscriptions", async (req, res): Promise<void> => {
  if (!(await doesTableExist("subscriptions"))) {
    res.status(503).json({ error: "Subscriptions feature is not enabled in the current database schema" });
    return;
  }

  const { name, price, duration, itemsPerMonth, services, freePickups, discountPercent, businessId } = req.body;
  if (!name || price === undefined || !duration || !businessId) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  const insertResult = await db.insert(subscriptionsTable).values({
    name,
    price: String(price),
    duration,
    itemsPerMonth,
    services,
    freePickups: freePickups ?? 0,
    discountPercent: discountPercent ? String(discountPercent) : undefined,
    businessId,
  }).returning();
  const sub = insertResult[0];
  res.status(201).json(formatSubscription(sub));
});

export default router;
