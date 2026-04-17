"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_crypto_1 = require("node:crypto");
const express_1 = require("express");
const db_1 = require("../db");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
function hashPassword(password) {
    const salt = (0, node_crypto_1.randomBytes)(16).toString("hex");
    const derivedKey = (0, node_crypto_1.scryptSync)(password, salt, 64).toString("hex");
    return `${salt}:${derivedKey}`;
}
function verifyPassword(password, storedHash) {
    const [salt, storedKey] = storedHash.split(":");
    if (!salt || !storedKey)
        return false;
    const derivedKey = (0, node_crypto_1.scryptSync)(password, salt, 64);
    const storedBuffer = Buffer.from(storedKey, "hex");
    if (storedBuffer.length !== derivedKey.length)
        return false;
    return (0, node_crypto_1.timingSafeEqual)(storedBuffer, derivedKey);
}
router.post("/auth/send-otp", async (req, res) => {
    const { phone } = (req.body ?? {});
    if (!phone) {
        res.status(400).json({ error: "Phone is required" });
        return;
    }
    res.json({ success: true, message: `OTP sent to ${phone}` });
});
router.post("/auth/verify-otp", async (req, res) => {
    const { phone, otp } = (req.body ?? {});
    if (!phone || !otp) {
        res.status(400).json({ error: "Phone and OTP are required" });
        return;
    }
    const [existingUser] = await db_1.db.select().from(db_1.users).where((0, drizzle_orm_1.eq)(db_1.users.phone, phone));
    let user = existingUser;
    if (!user) {
        const insertResult = await db_1.db.insert(db_1.users).values({
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
router.post("/auth/customers/register", async (req, res) => {
    const { name, phone, password, address, city, pincode } = (req.body ?? {});
    if (!name || !phone || !password) {
        res.status(400).json({ error: "Name, phone and password are required" });
        return;
    }
    const [existingUser] = await db_1.db.select().from(db_1.users).where((0, drizzle_orm_1.eq)(db_1.users.phone, phone));
    if (existingUser) {
        res.status(409).json({ error: "Phone number already registered" });
        return;
    }
    const insertResult = await db_1.db.insert(db_1.users).values({
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
router.post("/auth/customers/login", async (req, res) => {
    const { phone, password } = (req.body ?? {});
    if (!phone || !password) {
        res.status(400).json({ error: "Phone and password are required" });
        return;
    }
    const [user] = await db_1.db.select().from(db_1.users).where((0, drizzle_orm_1.eq)(db_1.users.phone, phone));
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
router.post("/auth/businesses/register", async (req, res) => {
    const { shopName, ownerName, email, phone, address, city, password, gstNumber } = (req.body ?? {});
    if (!shopName || !ownerName || !phone || !address || !city || !password) {
        res.status(400).json({ error: "Missing required business registration fields" });
        return;
    }
    const [existingUser] = await db_1.db.select().from(db_1.users).where((0, drizzle_orm_1.eq)(db_1.users.phone, phone));
    const [existingRequest] = await db_1.db.select().from(db_1.businessRequests).where((0, drizzle_orm_1.eq)(db_1.businessRequests.ownerPhone, phone));
    if (existingUser || existingRequest) {
        res.status(409).json({ error: "Phone number already registered" });
        return;
    }
    const requestResult = await db_1.db.insert(db_1.businessRequests).values({
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
router.post("/auth/businesses/login", async (req, res) => {
    const { phone, password } = (req.body ?? {});
    if (!phone || !password) {
        res.status(400).json({ error: "Phone and password are required" });
        return;
    }
    const [user] = await db_1.db.select().from(db_1.users).where((0, drizzle_orm_1.eq)(db_1.users.phone, phone));
    if (!user || user.role !== "business") {
        const [request] = await db_1.db.select().from(db_1.businessRequests).where((0, drizzle_orm_1.eq)(db_1.businessRequests.ownerPhone, phone));
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
    const [business] = await db_1.db.select().from(db_1.businessesTable).where((0, drizzle_orm_1.eq)(db_1.businessesTable.userId, user.id));
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
exports.default = router;
//# sourceMappingURL=auth.js.map