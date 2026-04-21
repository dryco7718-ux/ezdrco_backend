"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
function asUuid(value) {
    if (typeof value !== "string")
        return undefined;
    const trimmed = value.trim();
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(trimmed)
        ? trimmed
        : undefined;
}
function formatItem(item) {
    return {
        id: String(item.id),
        name: item.name,
        category: item.categoryId ? String(item.categoryId) : undefined,
        priceWash: item.priceWash ? Number(item.priceWash) : undefined,
        priceDryClean: item.priceDryClean ? Number(item.priceDryClean) : undefined,
        priceIron: item.priceIron ? Number(item.priceIron) : undefined,
        expressPriceWash: item.expressPriceWash ? Number(item.expressPriceWash) : undefined,
        expressPriceDryClean: item.expressPriceDryClean ? Number(item.expressPriceDryClean) : undefined,
        expressPriceIron: item.expressPriceIron ? Number(item.expressPriceIron) : undefined,
        businessId: String(item.businessId),
    };
}
router.get("/items", async (req, res) => {
    const { category, businessId } = req.query;
    let query = db_1.db.select().from(db_1.itemsTable);
    const conditions = [];
    const categoryId = asUuid(category);
    const ownerBusinessId = asUuid(businessId);
    if (categoryId)
        conditions.push((0, drizzle_orm_1.eq)(db_1.itemsTable.categoryId, categoryId));
    if (ownerBusinessId)
        conditions.push((0, drizzle_orm_1.eq)(db_1.itemsTable.businessId, ownerBusinessId));
    if (conditions.length > 0)
        query = query.where((0, drizzle_orm_1.and)(...conditions));
    const items = await query;
    res.json(items.map(formatItem));
});
router.post("/items", async (req, res) => {
    const { name, category, priceWash, priceDryClean, priceIron, expressPriceWash, expressPriceDryClean, expressPriceIron, businessId } = req.body;
    const ownerBusinessId = asUuid(businessId);
    if (!name || !category || !ownerBusinessId) {
        res.status(400).json({ error: "Missing required fields" });
        return;
    }
    const insertResult = await db_1.db.insert(db_1.itemsTable).values({
        name,
        categoryId: asUuid(category),
        priceWash: priceWash ? String(priceWash) : undefined,
        priceDryClean: priceDryClean ? String(priceDryClean) : undefined,
        priceIron: priceIron ? String(priceIron) : undefined,
        expressPriceWash: expressPriceWash ? String(expressPriceWash) : undefined,
        expressPriceDryClean: expressPriceDryClean ? String(expressPriceDryClean) : undefined,
        expressPriceIron: expressPriceIron ? String(expressPriceIron) : undefined,
        businessId: ownerBusinessId,
    }).returning();
    const item = insertResult[0];
    res.status(201).json(formatItem(item));
});
router.patch("/items/:id", async (req, res) => {
    const id = req.params.id;
    const { name, priceWash, priceDryClean, priceIron, expressPriceWash, expressPriceDryClean, expressPriceIron } = req.body;
    const updates = {};
    if (name)
        updates.name = name;
    if (priceWash !== undefined)
        updates.priceWash = String(priceWash);
    if (priceDryClean !== undefined)
        updates.priceDryClean = String(priceDryClean);
    if (priceIron !== undefined)
        updates.priceIron = String(priceIron);
    if (expressPriceWash !== undefined)
        updates.expressPriceWash = String(expressPriceWash);
    if (expressPriceDryClean !== undefined)
        updates.expressPriceDryClean = String(expressPriceDryClean);
    if (expressPriceIron !== undefined)
        updates.expressPriceIron = String(expressPriceIron);
    const updateResult = await db_1.db.update(db_1.itemsTable).set(updates).where((0, drizzle_orm_1.eq)(db_1.itemsTable.id, id)).returning();
    const item = updateResult[0];
    if (!item) {
        res.status(404).json({ error: "Item not found" });
        return;
    }
    res.json(formatItem(item));
});
router.delete("/items/:id", async (req, res) => {
    const id = req.params.id;
    const deleteResult = await db_1.db.delete(db_1.itemsTable).where((0, drizzle_orm_1.eq)(db_1.itemsTable.id, id)).returning();
    const item = deleteResult[0];
    if (!item) {
        res.status(404).json({ error: "Item not found" });
        return;
    }
    res.sendStatus(204);
});
exports.default = router;
//# sourceMappingURL=items.js.map