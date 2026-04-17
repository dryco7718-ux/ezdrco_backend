import { Router } from "express";
import { db, notificationsTable, users } from "../db";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/notifications", async (req, res): Promise<void> => {
  const { userId, unread } = req.query;
  let query = db.select().from(notificationsTable);
  const conditions = [];
  if (userId) conditions.push(eq(notificationsTable.userId, userId as string));
  if (unread === "true") conditions.push(eq(notificationsTable.isRead, false));
  if (conditions.length > 0) query = query.where(and(...conditions)) as typeof query;
  const notifs = await query;
  res.json(notifs.map(n => ({
    id: String(n.id),
    userId: String(n.userId),
    title: n.title,
    message: n.message,
    type: n.type,
    isRead: n.isRead,
    createdAt: n.createdAt?.toISOString(),
  })));
});

router.post("/notifications", async (req, res): Promise<void> => {
  const { title, message, type, targetAudience, businessId } = req.body;
  if (!title || !message || !type || !targetAudience) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const recipients = await db.select().from(users);
  const customers = targetAudience === "all"
    ? recipients
    : recipients.filter((user) => user.role === "customer");
  let sent = 0;
  for (const customer of customers) {
    await db.insert(notificationsTable).values({
      userId: customer.id,
      title,
      message,
      type,
    });
    sent++;
  }

  res.json({ sent, message: `Notification sent to ${sent} users` });
});

export default router;
