// import { NestFactory } from '@nestjs/core';
// import { ValidationPipe } from '@nestjs/common';
// import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// import { AppModule } from './app.module';
// import { HttpExceptionFilter } from './common/filters/http-exception.filter';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   // Global validation pipe — strips unknown fields, transforms types
//   app.useGlobalPipes(
//     new ValidationPipe({
//       whitelist: true,
//       forbidNonWhitelisted: true,
//       transform: true,
//       transformOptions: { enableImplicitConversion: true },
//     }),
//   );

//   // Global exception filter for consistent error responses
//   app.useGlobalFilters(new HttpExceptionFilter());

//   // CORS for frontend
//   app.enableCors({
//     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//     credentials: true,
//   });

//   // Swagger / OpenAPI documentation (Bonus)
//   const config = new DocumentBuilder()
//     .setTitle('CheckMe API')
//     .setDescription('Patient Symptom Logger & Insights Dashboard API')
//     .setVersion('1.0')
//     .addBearerAuth(
//       { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
//       'access-token',
//     )
//     .addTag('Auth', 'Authentication endpoints')
//     .addTag('Patients', 'Patient management')
//     .addTag('Symptoms', 'Symptom logging and retrieval')
//     .addTag('Insights', 'Computed clinical insights')
//     .build();`

// const document = SwaggerModule.createDocument(app, config);
//   SwaggerModule.setup('api/docs', app, document, {
//     swaggerOptions: { persistAuthorization: true },
//   });

//   const port = process.env.PORT || 3001;
//   await app.listen(port);

//   console.log(`🚀 CheckMe API running on http://localhost:${port}`);
//   console.log(`📖 Swagger docs: http://localhost:${port}/api/docs`);
// }

// bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.enableShutdownHooks();
  const config = new DocumentBuilder()
    .setTitle('CheckMe API')
    .setDescription('Patient Symptom Logger & Insights Dashboard API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  const PORT = process.env.APP_PORT || 4000;
  await app.listen(PORT);
}
bootstrap();
