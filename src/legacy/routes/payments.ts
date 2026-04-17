import { Router } from "express";
import { db, doesTableExist, paymentsTable } from "../db";
import { eq, and } from "drizzle-orm";

const router = Router();

function formatPayment(p: any) {
  return {
    id: String(p.id),
    orderId: String(p.orderId),
    customerId: String(p.customerId),
    businessId: String(p.businessId),
    amount: Number(p.amount),
    method: p.method,
    status: p.status,
    transactionId: p.transactionId,
    createdAt: p.createdAt?.toISOString(),
  };
}

router.get("/payments", async (req, res): Promise<void> => {
  if (!(await doesTableExist("payments"))) {
    res.json([]);
    return;
  }

  const { customerId, businessId } = req.query;
  let query = db.select().from(paymentsTable);
  const conditions = [];
  if (customerId) conditions.push(eq(paymentsTable.customerId, customerId as string));
  if (businessId) conditions.push(eq(paymentsTable.businessId, businessId as string));
  if (conditions.length > 0) query = query.where(and(...conditions)) as typeof query;
  const payments = await query;
  res.json(payments.map(formatPayment));
});

router.post("/payments", async (req, res): Promise<void> => {
  if (!(await doesTableExist("payments"))) {
    res.status(503).json({ error: "Payments feature is not enabled in the current database schema" });
    return;
  }

  const { orderId, customerId, businessId, amount, method, transactionId } = req.body;
  if (!orderId || !customerId || !businessId || amount === undefined || !method) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  const insertResult = await db.insert(paymentsTable).values({
    orderId: String(orderId),
    customerId: String(customerId),
    businessId: String(businessId),
    amount: String(amount),
    method,
    status: "completed",
    transactionId,
  }).returning();
  const payment = insertResult[0];
  res.status(201).json(formatPayment(payment));
});

export default router;
