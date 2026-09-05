import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import express from "express";
import { join } from "node:path";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use("/uploads", express.static(join(process.cwd(), "uploads")));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
