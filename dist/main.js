"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_1 = __importDefault(require("express"));
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
function isPortInUseError(error) {
    return Boolean(error && typeof error === 'object' && 'code' in error && error.code === 'EADDRINUSE');
}
function registerShutdownHandlers(app) {
    let shuttingDown = false;
    const shutdown = async (signal) => {
        if (shuttingDown) {
            return;
        }
        shuttingDown = true;
        try {
            console.log(`Received ${signal}. Shutting down Ezdryco backend...`);
            await app.close();
            process.exit(0);
        }
        catch (error) {
            console.error('Failed to shut down backend cleanly.', error);
            process.exit(1);
        }
    };
    process.once('SIGINT', () => {
        void shutdown('SIGINT');
    });
    process.once('SIGTERM', () => {
        void shutdown('SIGTERM');
    });
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    const configService = app.get(config_1.ConfigService);
    const corsOrigins = configService.get('CORS_ORIGINS') || 'http://localhost:5173';
    app.enableCors({
        origin: corsOrigins.split(',').map(origin => origin.trim()),
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Accept, Authorization',
    });
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use((0, cookie_parser_1.default)());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
        exceptionFactory: (errors) => {
            const messages = errors.map(error => {
                const constraints = error.constraints;
                return constraints ? Object.values(constraints).join(', ') : 'Validation error';
            });
            return new common_1.BadRequestException(messages.join('; '));
        },
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.setGlobalPrefix('api');
    const { default: legacyRouter } = await Promise.resolve().then(() => __importStar(require('./legacy/routes')));
    app.use('/api', legacyRouter);
    app.use(legacyRouter);
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('Ezdryco API')
        .setDescription('Laundry & Dry Cleaning Platform API')
        .setVersion('1.0.0')
        .addBearerAuth()
        .addTag('Auth', 'Authentication endpoints')
        .addTag('Orders', 'Order management')
        .addTag('Customers', 'Customer management')
        .addTag('Businesses', 'Business management')
        .addTag('Items', 'Laundry items')
        .addTag('Riders', 'Rider management')
        .addTag('Analytics', 'Analytics & reporting')
        .addTag('Notifications', 'Notifications')
        .addTag('Coupons', 'Coupon management')
        .addTag('Subscriptions', 'Subscription plans')
        .addTag('Payments', 'Payment processing')
        .addTag('Reviews', 'Reviews & ratings')
        .addTag('Health', 'Health checks')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = configService.get('PORT') || 3000;
    const host = configService.get('HOST') || '0.0.0.0';
    const railwayPublicDomain = process.env.RAILWAY_PUBLIC_DOMAIN || process.env.RAILWAY_STATIC_URL;
    const localBaseUrl = `http://localhost:${port}`;
    const publicBaseUrl = railwayPublicDomain
        ? `https://${railwayPublicDomain.replace(/^https?:\/\//, '')}`
        : localBaseUrl;
    registerShutdownHandlers(app);
    try {
        await app.listen(port, host);
    }
    catch (error) {
        if (isPortInUseError(error)) {
            console.warn(`Ezdryco backend is already running on ${localBaseUrl}. Reuse the existing process instead of starting a second one.`);
            await app.close();
            return;
        }
        throw error;
    }
    console.log(`🚀 Ezdryco Backend listening on: ${host}:${port}`);
    console.log(`🌐 Public URL: ${publicBaseUrl}`);
    console.log(`📚 API Documentation: ${publicBaseUrl}/api/docs`);
}
bootstrap().catch((error) => {
    console.error('Failed to start Ezdryco backend.', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map