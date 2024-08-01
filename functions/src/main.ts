import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as express from 'express';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as functions from '@google-cloud/functions-framework';

const server = express();
let isApplicationReady = false;

const createNestServer = async (expressInstance) => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
  );

  app.use(helmet());
  app.enableCors({
    origin: ['*'],
  });
  app.useGlobalPipes(new ValidationPipe());

  // Documentation
  const config = new DocumentBuilder()
    .setTitle('Nest.js Cloud Function Starter')
    .setDescription('A Minimal Nest.js Cloud Function Starter')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  console.log('the server is starting @ Cloud Functions');
  return app.init();
};

const applicationReady = async () => {
  try {
    await createNestServer(server);
    isApplicationReady = true;
  } catch {
    (err) => console.error('Nest broken', err);
  }
};

functions.http('nestjs-cloud-function-starter', async (...args) => {
  if (!isApplicationReady) {
    await applicationReady();
  }
  server(...args);
});
