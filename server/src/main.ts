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
