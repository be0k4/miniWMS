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
import Config from './utils/config';
import * as fs from 'fs';
import Logging from './utils/logging';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// 実行コマンドは node dist/main.js [portNo] [enableSSL]を想定
const portNo = Number.isNaN(Number(process.argv[2]))
  ? 30001
  : Number(process.argv[2]);
const enableSSL =
  process.argv[3] === undefined || process.argv[3] === 'false' ? false : true;

async function bootstrap() {
  let fastifyadapter;
  if (enableSSL) {
    const httpsOptions = {
      key: fs.readFileSync('./server.key'),
      cert: fs.readFileSync('./server.crt'),
    };
    fastifyadapter = new FastifyAdapter({ https: httpsOptions });
    console.log('起動しました', `HTTPS:${portNo}`);
  } else {
    fastifyadapter = new FastifyAdapter();
    console.log('起動しました', `HTTP:${portNo}`);
  }

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

  //pipe, interceptorの設定
  app.enableCors();
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
