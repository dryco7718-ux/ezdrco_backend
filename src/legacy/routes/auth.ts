import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { Router } from "express";
import { db, businessRequests, businessesTable, users } from "../db";
import { eq } from "drizzle-orm";

const router = Router();

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

function verifyPassword(password: string, storedHash: string) {
  const [salt, storedKey] = storedHash.split(":");
  if (!salt || !storedKey) return false;

  const derivedKey = scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(storedKey, "hex");
  if (storedBuffer.length !== derivedKey.length) return false;
  return timingSafeEqual(storedBuffer, derivedKey);
}

router.post("/auth/send-otp", async (req, res): Promise<void> => {
  const { phone } = (req.body ?? {}) as { phone?: string };
  if (!phone) {
    res.status(400).json({ error: "Phone is required" });
    return;
  }

  res.json({ success: true, message: `OTP sent to ${phone}` });
});

router.post("/auth/verify-otp", async (req, res): Promise<void> => {
  const { phone, otp } = (req.body ?? {}) as { phone?: string; otp?: string };
  if (!phone || !otp) {
    res.status(400).json({ error: "Phone and OTP are required" });
    return;
  }

  const [existingUser] = await db.select().from(users).where(eq(users.phone, phone));

  let user = existingUser;
  if (!user) {
    const insertResult = await db.insert(users).values({
      name: `User ${phone.slice(-4)}`,
      phone,
      passwordHash: hashPassword(`washify-${phone}`),
      role: "customer",
      isVerified: true,
    }).returning();
    user = insertResult[0];
  }

  res.json({
    token: `mock-token-${user.id}`,
    user: {
      id: String(user.id),
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt?.toISOString(),
    },
    role: user.role,
  });
});

router.post("/auth/customers/register", async (req, res): Promise<void> => {
  const { name, phone, password, address, city, pincode } = (req.body ?? {}) as {
    name?: string;
    phone?: string;
    password?: string;
    address?: string;
    city?: string;
    pincode?: string;
  };
  if (!name || !phone || !password) {
    res.status(400).json({ error: "Name, phone and password are required" });
    return;
  }

  const [existingUser] = await db.select().from(users).where(eq(users.phone, phone));
  if (existingUser) {
    res.status(409).json({ error: "Phone number already registered" });
    return;
  }

  const insertResult = await db.insert(users).values({
    name,
    phone,
    passwordHash: hashPassword(password),
    role: "customer",
    address,
    city,
    pincode,
    isVerified: true,
  }).returning();
  const user = insertResult[0];

  res.status(201).json({
    token: `session-${user.id}`,
    user: {
      id: String(user.id),
      name: user.name,
      phone: user.phone,
      address: user.address,
      city: user.city,
      pincode: user.pincode,
      role: user.role,
    },
  });
});

router.post("/auth/customers/login", async (req, res): Promise<void> => {
  const { phone, password } = (req.body ?? {}) as { phone?: string; password?: string };
  if (!phone || !password) {
    res.status(400).json({ error: "Phone and password are required" });
    return;
  }

  const [user] = await db.select().from(users).where(eq(users.phone, phone));
  if (!user || user.role !== "customer" || !verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ error: "Invalid phone number or password" });
    return;
  }

  res.json({
    token: `session-${user.id}`,
    user: {
      id: String(user.id),
      name: user.name,
      phone: user.phone,
      address: user.address,
      city: user.city,
      pincode: user.pincode,
      role: user.role,
    },
  });
});

router.post("/auth/businesses/register", async (req, res): Promise<void> => {
  const { shopName, ownerName, email, phone, address, city, password, gstNumber } = (req.body ?? {}) as {
    shopName?: string;
    ownerName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    password?: string;
    gstNumber?: string;
  };
  if (!shopName || !ownerName || !phone || !address || !city || !password) {
    res.status(400).json({ error: "Missing required business registration fields" });
    return;
  }

  const [existingUser] = await db.select().from(users).where(eq(users.phone, phone));
  const [existingRequest] = await db.select().from(businessRequests).where(eq(businessRequests.ownerPhone, phone));
  if (existingUser || existingRequest) {
    res.status(409).json({ error: "Phone number already registered" });
    return;
  }

  const requestResult = await db.insert(businessRequests).values({
    ownerName,
    ownerPhone: phone,
    ownerEmail: email,
    passwordHash: hashPassword(password),
    shopName,
    shopPhone: phone,
    shopEmail: email,
    shopAddress: address,
    shopCity: city,
    gstNumber,
    status: "pending",
  }).returning();
  const request = requestResult[0];

  res.status(201).json({
    request: {
      id: String(request.id),
      shopName: request.shopName,
      ownerName: request.ownerName,
      phone: request.ownerPhone,
      email: request.ownerEmail,
      status: request.status,
      createdAt: request.createdAt?.toISOString(),
    },
    message: "Business registration request submitted successfully. Please wait for admin approval.",
  });
});

router.post("/auth/businesses/login", async (req, res): Promise<void> => {
  const { phone, password } = (req.body ?? {}) as { phone?: string; password?: string };
  if (!phone || !password) {
    res.status(400).json({ error: "Phone and password are required" });
    return;
  }

  const [user] = await db.select().from(users).where(eq(users.phone, phone));
  if (!user || user.role !== "business") {
    const [request] = await db.select().from(businessRequests).where(eq(businessRequests.ownerPhone, phone));
    if (request && verifyPassword(password, request.passwordHash)) {
      if (request.status === "pending" || request.status === "under_review") {
        res.status(403).json({ error: "Your registration is pending admin approval." });
        return;
      }
      if (request.status === "rejected") {
        res.status(403).json({ error: request.rejectionReason || "Your registration request was rejected." });
        return;
      }
    }

    res.status(401).json({ error: "Invalid phone number or password" });
    return;
  }

  if (!verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ error: "Invalid phone number or password" });
    return;
  }

  const [business] = await db.select().from(businessesTable).where(eq(businessesTable.userId, user.id));
  if (!business) {
    res.status(404).json({ error: "Business profile not found" });
    return;
  }

  res.json({
    token: `session-${user.id}`,
    user: {
      id: String(user.id),
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
    },
    business: {
      id: String(business.id),
      userId: String(business.userId),
      shopName: business.shopName,
      phone: business.shopPhone,
      email: business.shopEmail,
      address: business.shopAddress,
      city: business.shopCity,
      status: business.isActive ? "active" : "inactive",
    },
  });
});

export default router;
