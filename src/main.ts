import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const appName = configService.get<string>('APP_NAME', 'API');
  const appPort = configService.get<number>('APP_PORT', 3000);
  const appVersion = configService.get<string>('APP_VERSION', '');
  const allowedOrigins = configService
  .get<string>('ALLOWED_ORIGINS', 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim());

  // Project description
  app.setGlobalPrefix(`api/${appVersion}`);

  // Set Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Enable Swagger docs
  const config = new DocumentBuilder()
    .setTitle(`${appName} Documentation`)
    .setDescription('API documentation for the application')
    .setVersion('1.0')
    .addTag('auth', 'Authentication related endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Access-JWT',
        description: 'Enter access JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Refresh-JWT',
        description: 'Enter refresh JWT token',
        in: 'header',
      },
      'JWT-refresh',
    )
    .addServer('http://localhost:3000', 'Development server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: `${appName} Documentation`
  });

  await app.listen(appPort ?? 3000);
  Logger.log(`Application is running on: http://localhost:${appPort}`);
  Logger.log(`Swagger documentation: http://localhost:${appPort}/api/docs`);
}
bootstrap().catch((error) => {
  Logger.error('Error starting server', error.stack || error);
  process.exit(1);
});
