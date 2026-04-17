import { Router } from "express";
import { db, ridersTable, users, riderAssignments } from "../db";
import { eq, and, desc, sql } from "drizzle-orm";

const router = Router();

function formatRider(r: any) {
  return {
    id: String(r.id),
    name: r.name,
    phone: r.phone,
    businessId: String(r.businessId),
    isAvailable: r.isAvailable,
    activeOrders: r.activeOrders ?? 0,
    totalDeliveries: r.totalDeliveries ?? 0,
    rating: r.rating ? Number(r.rating) : undefined,
  };
}

router.get("/riders", async (req, res): Promise<void> => {
  const { businessId, available } = req.query;
  let query = db.select().from(ridersTable);
  const conditions = [];
  if (businessId) conditions.push(eq(ridersTable.businessId, businessId as string));
  if (available !== undefined) conditions.push(eq(ridersTable.isAvailable, available === "true"));
  if (conditions.length > 0) query = query.where(and(...conditions)) as typeof query;
  const riders = await query;
  res.json(riders.map(formatRider));
});

router.post("/riders", async (req, res): Promise<void> => {
  const { name, phone, businessId } = req.body;
  if (!name || !phone || !businessId) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  const insertResult = await db.insert(ridersTable).values({ name, phone, businessId: String(businessId) }).returning();
  const rider = insertResult[0];
  res.status(201).json(formatRider(rider));
});

export default router;
