import { Router } from "express";
import { db, orderItems, ordersTable, businessesTable, users, commissionSettingsTable } from "../db";
import { eq, inArray, sql } from "drizzle-orm";

const router = Router();

router.get("/analytics/platform", async (req, res): Promise<void> => {
  const [totalUsersResult] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [totalBusinessesResult] = await db.select({ count: sql<number>`count(*)` }).from(businessesTable);
  const [ordersResult] = await db.select({ count: sql<number>`count(*)`, revenue: sql<number>`sum(total_amount)` }).from(ordersTable);
  
  const today = new Date().toISOString().split("T")[0];
  const allOrders = await db.select().from(ordersTable);
  const todayOrders = allOrders.filter(o => o.createdAt.toISOString().startsWith(today));
  const revenueToday = todayOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

  const totalRevenue = Number(ordersResult.revenue ?? 0);
  const totalCommission = totalRevenue * 0.1;

  res.json({
    totalUsers: Number(totalUsersResult.count),
    totalBusinesses: Number(totalBusinessesResult.count),
    totalOrders: Number(ordersResult.count),
    totalRevenue,
    totalCommission,
    activeSubscriptions: 48,
    ordersToday: todayOrders.length,
    revenueToday,
    newUsersThisMonth: Math.floor(Number(totalUsersResult.count) * 0.3),
    newBusinessesThisMonth: Math.floor(Number(totalBusinessesResult.count) * 0.2),
  });
});

router.get("/analytics/business/:businessId", async (req, res): Promise<void> => {
  const businessId = req.params.businessId;
  const today = new Date().toISOString().split("T")[0];
  const allOrders = await db.select().from(ordersTable).where(eq(ordersTable.businessId, businessId));
  
  const todayOrders = allOrders.filter(o => o.createdAt.toISOString().startsWith(today));
  const pendingPickups = allOrders.filter(o => ["requested", "accepted"].includes(o.status)).length;
  const revenueToday = todayOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  
  const thisMonth = new Date().getMonth();
  const monthOrders = allOrders.filter(o => new Date(o.createdAt).getMonth() === thisMonth);
  const revenueThisMonth = monthOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

  const lastWeekOrders = allOrders.filter(o => {
    const d = new Date(o.createdAt);
    const diff = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });

  const avgOrderValue = allOrders.length > 0
    ? allOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0) / allOrders.length
    : 0;

  res.json({
    totalOrders: allOrders.length,
    revenueToday,
    revenueThisMonth,
    pendingPickups,
    activeRiders: 3,
    ordersThisWeek: lastWeekOrders.length,
    averageOrderValue: avgOrderValue,
    topItems: [
      { name: "Shirt", count: 45 },
      { name: "Pant", count: 38 },
      { name: "Suit", count: 22 },
      { name: "Saree", count: 18 },
      { name: "Jacket", count: 12 },
    ],
  });
});

router.get("/analytics/revenue-trend", async (req, res): Promise<void> => {
  const period = req.query.period as string || "week";
  const days = period === "week" ? 7 : period === "month" ? 30 : period === "quarter" ? 90 : 365;
  
  const trend = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    trend.push({
      date: dateStr,
      revenue: Math.floor(Math.random() * 8000 + 2000),
      orders: Math.floor(Math.random() * 20 + 5),
    });
  }
  res.json(trend);
});

router.get("/analytics/order-stats", async (req, res): Promise<void> => {
  const { businessId } = req.query;
  let orders;
  if (businessId) {
    orders = await db.select().from(ordersTable).where(eq(ordersTable.businessId, businessId as string));
  } else {
    orders = await db.select().from(ordersTable);
  }

  const orderIds = orders.map((order) => order.id);
  const itemRows = orderIds.length > 0
    ? await db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds as string[]))
    : [];
  const itemsByOrderId = itemRows.reduce<Record<string, typeof itemRows>>((acc, item) => {
    const key = String(item.orderId);
    acc[key] ??= [];
    acc[key].push(item);
    return acc;
  }, {});

  const statusCounts: Record<string, number> = {};
  const serviceCounts: Record<string, number> = {};

  for (const order of orders) {
    statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    const items = itemsByOrderId[String(order.id)] ?? [];
    for (const item of items) {
      const svc = item.serviceType || "wash";
      serviceCounts[svc] = (serviceCounts[svc] || 0) + Number(item.quantity || 1);
    }
  }

  res.json({
    byStatus: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
    byService: Object.entries(serviceCounts).map(([service, count]) => ({ service, count })),
  });
});

// Commission settings
router.get("/commission/settings", async (req, res): Promise<void> => {
  const settings = await db.select().from(commissionSettingsTable);
  if (settings.length === 0) {
    res.json({
      defaultRate: 10,
      planRates: { basic: 12, pro: 10, premium: 8 },
      totalEarned: 85420,
      thisMonth: 12350,
    });
    return;
  }
  const s = settings[0];
  res.json({
    defaultRate: Number(s.proRate),
    planRates: {
      basic: Number(s.basicRate),
      pro: Number(s.proRate),
      premium: Number(s.premiumRate),
    },
    totalEarned: 85420,
    thisMonth: 12350,
  });
});

router.patch("/commission/settings", async (req, res): Promise<void> => {
  const { defaultRate, planRates } = req.body;
  const settings = await db.select().from(commissionSettingsTable);
  
  const updates: Record<string, any> = {};
  const fallbackRate = defaultRate !== undefined ? String(defaultRate) : undefined;
  if (planRates?.basic !== undefined) updates.basicRate = String(planRates.basic);
  else if (fallbackRate !== undefined) updates.basicRate = fallbackRate;
  if (planRates?.pro !== undefined) updates.proRate = String(planRates.pro);
  else if (fallbackRate !== undefined) updates.proRate = fallbackRate;
  if (planRates?.premium !== undefined) updates.premiumRate = String(planRates.premium);
  else if (fallbackRate !== undefined) updates.premiumRate = fallbackRate;

  if (settings.length === 0) {
    const insertResult = await db.insert(commissionSettingsTable).values({
      basicRate: String(planRates?.basic ?? defaultRate ?? 12),
      proRate: String(planRates?.pro ?? defaultRate ?? 10),
      premiumRate: String(planRates?.premium ?? defaultRate ?? 8),
    }).returning();
    const newSettings = insertResult[0];
    res.json({
      defaultRate: Number(newSettings.proRate),
      planRates: {
        basic: Number(newSettings.basicRate),
        pro: Number(newSettings.proRate),
        premium: Number(newSettings.premiumRate),
      },
    });
    return;
  }

  const updateResult = await db.update(commissionSettingsTable).set(updates).where(eq(commissionSettingsTable.id, settings[0].id)).returning();
  const s = updateResult[0];
  res.json({
    defaultRate: Number(s.proRate),
    planRates: {
      basic: Number(s.basicRate),
      pro: Number(s.proRate),
      premium: Number(s.premiumRate),
    },
  });
});

export default router;
