import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  try {
    dotenv.config();
    
    const app = await NestFactory.create(AppModule);
    
    app.enableCors();
    await app.listen(process.env.PORT ?? 3001);
    
    Logger.log(`🚀 Application is running on: http://localhost:${process.env.PORT ?? 3001}`, 'Bootstrap');
  } catch (error) {
    console.error('❌ Failed to start application:');
    console.error(error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('❌ Unhandled error in bootstrap:');
  console.error(error);
  process.exit(1);
});
