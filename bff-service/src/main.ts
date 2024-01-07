import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import helmet from 'helmet';

const port = process.env.PORT || 8000;
async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  app.enableCors({
                   origin: (req, callback) => callback(null, true),
                 });
  app.use(helmet());
  
  await app.listen(port,'0.0.0.0');
}
bootstrap();
