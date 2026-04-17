import { Router } from "express";
import { db, reviewsTable, users } from "../db";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/reviews", async (req, res): Promise<void> => {
  const { businessId, orderId } = req.query;
  let query = db.select().from(reviewsTable);
  const conditions = [];
  if (businessId) conditions.push(eq(reviewsTable.businessId, businessId as string));
  if (orderId) conditions.push(eq(reviewsTable.orderId, orderId as string));
  if (conditions.length > 0) query = query.where(and(...conditions)) as typeof query;
  const reviews = await query;

  // Fetch customer names
  const customerIds = [...new Set(reviews.map(r => r.customerId))];
  const customers = customerIds.length > 0
    ? await Promise.all(customerIds.map(id => db.select().from(users).where(eq(users.id, id)).then(r => r[0])))
    : [];
  const customerMap = Object.fromEntries(customers.filter(Boolean).map(c => [c!.id, c!]));

  res.json(reviews.map(r => ({
    id: String(r.id),
    orderId: String(r.orderId),
    customerId: String(r.customerId),
    businessId: String(r.businessId),
    rating: r.overallRating,
    comment: r.comment,
    createdAt: r.createdAt?.toISOString(),
    customerName: customerMap[r.customerId]?.name ?? "Customer",
  })));
});

router.post("/reviews", async (req, res): Promise<void> => {
  const { orderId, customerId, businessId, rating, comment } = req.body;
  if (!orderId || !customerId || !businessId || !rating) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  const insertResult = await db.insert(reviewsTable).values({
    orderId: String(orderId),
    customerId: String(customerId),
    businessId: String(businessId),
    overallRating: rating,
    comment,
  }).returning();
  const review = insertResult[0];
  res.status(201).json({
    id: String(review.id),
    orderId: String(review.orderId),
    customerId: String(review.customerId),
    businessId: String(review.businessId),
    rating: review.overallRating,
    comment: review.comment,
    createdAt: review.createdAt?.toISOString(),
  });
});

export default router;
