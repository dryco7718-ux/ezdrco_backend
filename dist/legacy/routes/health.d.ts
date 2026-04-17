import { type IRouter } from "express";
export interface HealthCheckResponse {
    status: 'ok' | 'error';
    timestamp?: string;
}
declare const router: IRouter;
export default router;
