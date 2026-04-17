"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/healthz", (_req, res) => {
    const data = { status: "ok", timestamp: new Date().toISOString() };
    res.json(data);
});
exports.default = router;
//# sourceMappingURL=health.js.map