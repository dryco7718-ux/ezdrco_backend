import { Router, type ErrorRequestHandler, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import analyticsRouter from "./analytics";
import customersRouter from "./customers";
import ordersRouter from "./orders";
import itemsRouter from "./items";
import businessesRouter from "./businesses";
import couponsRouter from "./coupons";
import notificationsRouter from "./notifications";
import paymentsRouter from "./payments";
import reviewsRouter from "./reviews";
import ridersRouter from "./riders";
import subscriptionsRouter from "./subscriptions";
import mockRouter from "./mock";
import { pool } from "../db";
import { logger } from "../lib/logger";
import { asyncHandler } from "../lib/async-handler";

const router: IRouter = Router();
let schemaReady: Promise<boolean> | null = null;

async function hasDatabaseSchema() {
  if (!pool) return false;

  try {
    const result = await pool.query("select to_regclass('public.orders') as orders");
    return Boolean(result.rows[0]?.orders);
  } catch {
    return false;
  }
}

function getSchemaReady() {
  schemaReady ??= hasDatabaseSchema();
  return schemaReady;
}

router.use(healthRouter);
router.use(asyncHandler(async (req, res, next) => {
  const ready = await getSchemaReady();
  if (!ready) {
    mockRouter(req, res, next);
    return;
  }
  next();
}));
router.use(authRouter);
router.use(analyticsRouter);
router.use(customersRouter);
router.use(ordersRouter);
router.use(itemsRouter);
router.use(businessesRouter);
router.use(couponsRouter);
router.use(notificationsRouter);
router.use(paymentsRouter);
router.use(reviewsRouter);
router.use(ridersRouter);
router.use(subscriptionsRouter);

const legacyErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  logger.error(
    {
      err: error,
      method: req.method,
      path: req.originalUrl,
    },
    "Legacy API request failed",
  );

  if (res.headersSent) {
    next(error);
    return;
  }

  res.status(500).json({ error: "Internal server error" });
};

router.use(legacyErrorHandler);

export default router;
