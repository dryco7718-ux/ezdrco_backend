"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const logger_1 = require("./lib/logger");
const rawPort = process.env["PORT"] ?? "8080";
const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
}
const server = app_1.default.listen(port, () => {
    logger_1.logger.info({ port }, "Server listening");
});
server.on('error', (err) => {
    logger_1.logger.error({ err }, "Error listening on port");
    process.exit(1);
});
//# sourceMappingURL=index.js.map