import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationError } from 'class-validator';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './logging.interceptor';
import fastifyStatic from '@fastify/static';
import fastifyCookie from '@fastify/cookie';
import Config from './utils/config';
import * as fs from 'fs';
import Logging from './utils/logging';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// 実行コマンドは node dist/main.js [portNo] を想定
const portNo = Number.isNaN(Number(process.argv[2]))
  ? 30001
  : Number(process.argv[2]);

async function bootstrap() {
  const fastifyadapter = new FastifyAdapter();
  console.log('起動しました', `HTTP:${portNo}`);

  // NestJSアプリケーションの作成
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyadapter,
  );
  // 静的ファイルの提供設定
  const imageConfig = Config.getImageSetting();
  app.register(fastifyStatic, {
    root: __dirname + imageConfig.path,
    prefix: imageConfig.prefix,
  });

  // Cookie関連のapiを有効化
  app.register(fastifyCookie);

  // swagger
  // 仕様書のタイトルや説明文を設定
  const config = new DocumentBuilder()
    .setTitle('ミニWMS API仕様書')
    .setDescription('')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // 第一引数の 'doc' が、URLの末尾になる
  // 例: http://localhost:30001/doc
  SwaggerModule.setup('doc', app, document);

  // 同一オリジンでの通信ではCORSの設定をしなくてもOK
  // app.enableCors({
  //   origin: true,
  //   credentials: true,
  // });

  //pipe, interceptorの設定
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: true,
      exceptionFactory: (error: ValidationError[]) => {
        error.forEach((e) => console.dir(e, { depth: null }));
        // Pipeの例外処理はフレームワーク内部で処理してくれる
        return new BadRequestException();
      },
    }),
  );
  await app.listen(portNo, '0.0.0.0');
  // ログの定期削除開始
  Logging.startRotate();
}
bootstrap();
