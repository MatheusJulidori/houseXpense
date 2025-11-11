import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { LoggingMiddleware } from './middleware/logging.middleware';
import { ConfigService, ConfigType } from '@nestjs/config';
import appConfig from './config/app.config';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Use Winston logger
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  app.use(cookieParser());

  // Add logging middleware
  app.use(new LoggingMiddleware().use.bind(new LoggingMiddleware()));

  const configService = app.get(ConfigService);
  const applicationConfig = configService.get<ConfigType<typeof appConfig>>(
    'app',
  ) ?? {
    nodeEnv: 'development',
    port: 3000,
    logLevel: 'info',
    corsOrigins: ['http://localhost:5173', 'http://localhost:3000'],
  };

  app.enableCors({
    origin: applicationConfig.corsOrigins?.length
      ? applicationConfig.corsOrigins
      : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Accept',
      'Authorization',
      'Content-Type',
      'X-Requested-With',
      'Origin',
      'X-CSRF-Token',
    ],
    exposedHeaders: ['Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api');

  if (applicationConfig.nodeEnv !== 'production') {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('HouseXpense API')
        .setDescription('API for the HouseXpense project')
        .setVersion('1.0')
        .addBearerAuth()
        .build(),
    );
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = applicationConfig.port ?? 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`Server is running on port ${port}`);
}
void bootstrap();
