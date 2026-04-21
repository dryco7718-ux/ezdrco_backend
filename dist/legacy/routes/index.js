"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const health_1 = __importDefault(require("./health"));
const auth_1 = __importDefault(require("./auth"));
const analytics_1 = __importDefault(require("./analytics"));
const customers_1 = __importDefault(require("./customers"));
const orders_1 = __importDefault(require("./orders"));
const items_1 = __importDefault(require("./items"));
const businesses_1 = __importDefault(require("./businesses"));
const coupons_1 = __importDefault(require("./coupons"));
const notifications_1 = __importDefault(require("./notifications"));
const payments_1 = __importDefault(require("./payments"));
const reviews_1 = __importDefault(require("./reviews"));
const riders_1 = __importDefault(require("./riders"));
const subscriptions_1 = __importDefault(require("./subscriptions"));
const mock_1 = __importDefault(require("./mock"));
const db_1 = require("../db");
const logger_1 = require("../lib/logger");
const async_handler_1 = require("../lib/async-handler");
const router = (0, express_1.Router)();
let schemaReady = null;
async function hasDatabaseSchema() {
    if (!db_1.pool)
        return false;
    try {
        const result = await db_1.pool.query("select to_regclass('public.orders') as orders");
        return Boolean(result.rows[0]?.orders);
    }
    catch {
        return false;
    }
}
function getSchemaReady() {
    schemaReady ??= hasDatabaseSchema();
    return schemaReady;
}
router.use(health_1.default);
router.use((0, async_handler_1.asyncHandler)(async (req, res, next) => {
    const ready = await getSchemaReady();
    if (!ready) {
        (0, mock_1.default)(req, res, next);
        return;
    }
    next();
}));
router.use(auth_1.default);
router.use(analytics_1.default);
router.use(customers_1.default);
router.use(orders_1.default);
router.use(items_1.default);
router.use(businesses_1.default);
router.use(coupons_1.default);
router.use(notifications_1.default);
router.use(payments_1.default);
router.use(reviews_1.default);
router.use(riders_1.default);
router.use(subscriptions_1.default);
const legacyErrorHandler = (error, req, res, next) => {
    logger_1.logger.error({
        err: error,
        method: req.method,
        path: req.originalUrl,
    }, "Legacy API request failed");
    if (res.headersSent) {
        next(error);
        return;
    }
    res.status(500).json({ error: "Internal server error" });
};
router.use(legacyErrorHandler);
exports.default = router;
//# sourceMappingURL=index.js.map