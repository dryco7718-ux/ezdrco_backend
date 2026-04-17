import { Router, type IRouter } from "express";

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp?: string;
}

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data: HealthCheckResponse = { status: "ok", timestamp: new Date().toISOString() };
  res.json(data);
});

export default router;
