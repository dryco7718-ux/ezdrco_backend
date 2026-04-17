import { Router } from "express";
import { db, users, ordersTable, addressesTable } from "../db";
import { desc, eq } from "drizzle-orm";

const router = Router();

function formatAddress(address: any) {
  return {
    id: String(address.id),
    customerId: String(address.userId),
    label: address.label,
    line1: address.line1,
    line2: address.line2,
    landmark: address.landmark,
    city: address.city,
    pincode: address.pincode,
    lat: address.lat ? Number(address.lat) : undefined,
    lng: address.lng ? Number(address.lng) : undefined,
    isDefault: address.isDefault,
  };
}

router.get("/customers", async (req, res): Promise<void> => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const search = (req.query.search as string | undefined)?.trim().toLowerCase();
  const offset = (page - 1) * limit;

  const allCustomers = (await db.select().from(users).where(eq(users.role, "customer")).orderBy(desc(users.createdAt)))
    .filter((customer) => !search || customer.name.toLowerCase().includes(search) || customer.phone.includes(search));

  res.json({
    customers: allCustomers.slice(offset, offset + limit).map((customer) => ({
      id: String(customer.id),
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      role: customer.role,
      isActive: customer.isActive,
      createdAt: customer.createdAt?.toISOString(),
    })),
    total: allCustomers.length,
    page,
    limit,
  });
});

router.get("/customers/:id", async (req, res): Promise<void> => {
  const id = req.params.id;
  const [customer] = await db.select().from(users).where(eq(users.id, id));
  if (!customer || customer.role !== "customer") {
    res.status(404).json({ error: "Customer not found" });
    return;
  }

  res.json({
    id: String(customer.id),
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    city: customer.city,
    pincode: customer.pincode,
    lat: customer.lat ? Number(customer.lat) : undefined,
    lng: customer.lng ? Number(customer.lng) : undefined,
    role: customer.role,
    isActive: customer.isActive,
    createdAt: customer.createdAt?.toISOString(),
  });
});

router.patch("/customers/:id", async (req, res): Promise<void> => {
  const id = req.params.id;
  const { name, email, address, city, pincode, lat, lng } = req.body;

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = String(name).trim();
  if (email !== undefined) updates.email = email ? String(email).trim() : null;
  if (address !== undefined) updates.address = address ? String(address).trim() : null;
  if (city !== undefined) updates.city = city ? String(city).trim() : null;
  if (pincode !== undefined) updates.pincode = pincode ? String(pincode).trim() : null;
  if (lat !== undefined) updates.lat = lat !== null && lat !== "" ? String(lat) : null;
  if (lng !== undefined) updates.lng = lng !== null && lng !== "" ? String(lng) : null;

  const updateResult = await db.update(users).set(updates).where(eq(users.id, id)).returning();
  const customer = updateResult[0];
  if (!customer || customer.role !== "customer") {
    res.status(404).json({ error: "Customer not found" });
    return;
  }

  res.json({
    id: String(customer.id),
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    city: customer.city,
    pincode: customer.pincode,
    lat: customer.lat ? Number(customer.lat) : undefined,
    lng: customer.lng ? Number(customer.lng) : undefined,
    role: customer.role,
    isActive: customer.isActive,
    createdAt: customer.createdAt?.toISOString(),
  });
});

router.get("/customers/:id/stats", async (req, res): Promise<void> => {
  const id = req.params.id;
  const orders = await db.select().from(ordersTable).where(eq(ordersTable.customerId, id));

  const totalOrders = orders.length;
  const totalSpend = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
  const lastOrder = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  res.json({
    totalOrders,
    totalSpend,
    lifetimeValue: totalSpend,
    averageOrderValue: totalOrders > 0 ? totalSpend / totalOrders : 0,
    lastOrderDate: lastOrder?.createdAt?.toISOString(),
  });
});

router.get("/customers/:customerId/addresses", async (req, res): Promise<void> => {
  const customerId = req.params.customerId;
  const addresses = await db.select().from(addressesTable).where(eq(addressesTable.userId, customerId));

  res.json(addresses.map(formatAddress));
});

router.post("/customers/:customerId/addresses", async (req, res): Promise<void> => {
  const customerId = req.params.customerId;
  const { label, line1, line2, city, pincode, lat, lng, isDefault, landmark } = req.body;

  if (!label || !line1 || !city || !pincode) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  if (isDefault) {
    await db.update(addressesTable).set({ isDefault: false }).where(eq(addressesTable.userId, customerId));
  }

  const insertResult = await db.insert(addressesTable).values({
    userId: customerId,
    label,
    line1,
    line2,
    landmark,
    city,
    pincode,
    lat: lat ? String(lat) : undefined,
    lng: lng ? String(lng) : undefined,
    isDefault: isDefault ?? false,
  }).returning();
  const address = insertResult[0];

  res.status(201).json(formatAddress(address));
});

router.patch("/customers/:customerId/addresses/:addressId", async (req, res): Promise<void> => {
  const { customerId, addressId } = req.params;
  const { label, line1, line2, city, pincode, lat, lng, isDefault, landmark } = req.body;
  const updates: Record<string, unknown> = {};

  if (label !== undefined) updates.label = label;
  if (line1 !== undefined) updates.line1 = line1;
  if (line2 !== undefined) updates.line2 = line2;
  if (city !== undefined) updates.city = city;
  if (pincode !== undefined) updates.pincode = pincode;
  if (landmark !== undefined) updates.landmark = landmark;
  if (lat !== undefined) updates.lat = lat !== null && lat !== "" ? String(lat) : null;
  if (lng !== undefined) updates.lng = lng !== null && lng !== "" ? String(lng) : null;
  if (isDefault !== undefined) updates.isDefault = Boolean(isDefault);

  if (isDefault) {
    await db.update(addressesTable).set({ isDefault: false }).where(eq(addressesTable.userId, customerId));
  }

  const updateResult = await db.update(addressesTable)
    .set(updates)
    .where(eq(addressesTable.id, addressId))
    .returning();
  const address = updateResult[0];
  if (!address || String(address.userId) !== customerId) {
    res.status(404).json({ error: "Address not found" });
    return;
  }

  res.json(formatAddress(address));
});

export default router;
