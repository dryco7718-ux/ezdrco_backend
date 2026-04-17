import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import type { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import express from 'express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

function isPortInUseError(error: unknown): error is NodeJS.ErrnoException {
  return Boolean(error && typeof error === 'object' && 'code' in error && (error as NodeJS.ErrnoException).code === 'EADDRINUSE');
}

function registerShutdownHandlers(app: INestApplication) {
  let shuttingDown = false;

  const shutdown = async (signal: NodeJS.Signals) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;

    try {
      console.log(`Received ${signal}. Shutting down Ezdryco backend...`);
      await app.close();
      process.exit(0);
    } catch (error) {
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
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // Enable CORS
  const corsOrigins = configService.get<string>('CORS_ORIGINS') || 'http://localhost:5173';
  app.enableCors({
    origin: corsOrigins.split(',').map(origin => origin.trim()),
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Cookie parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
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
      return new BadRequestException(messages.join('; '));
    },
  }));

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // API prefix for Nest-native routes such as Swagger docs.
  app.setGlobalPrefix('api');

  // ---------------------------------------------------------------------------
  // Legacy API routes (Express)
  // ---------------------------------------------------------------------------
  // Preserve existing API logic and paths by mounting the legacy Express router
  // under /api for generated clients, and also at the root for existing custom
  // auth calls until the frontend is fully normalized.
  const { default: legacyRouter } = await import('./legacy/routes');
  app.use('/api', legacyRouter);
  app.use(legacyRouter);

  // Swagger documentation
  const swaggerConfig = new DocumentBuilder()
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

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('PORT') || 3000;

  registerShutdownHandlers(app);

  try {
    await app.listen(port);
  } catch (error) {
    if (isPortInUseError(error)) {
      console.warn(`Ezdryco backend is already running on http://localhost:${port}. Reuse the existing process instead of starting a second one.`);
      await app.close();
      return;
    }

    throw error;
  }

  console.log(`🚀 Ezdryco Backend running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap().catch((error) => {
  console.error('Failed to start Ezdryco backend.', error);
  process.exit(1);
});
