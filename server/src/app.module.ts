import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { LoginModule } from './login/login.module';
import { ScheduleModule } from '@nestjs/schedule';
import jwtConfig from './auth/jwt.config';
import dbConfig from './utils/db.config';

// ルートモジュール
// ここからモジュールを読み込んでいくため、すべてのモジュールをここでインポートしておく
@Module({
  imports: [
    // スケジュール機能をアプリケーション全体に提供する
    ScheduleModule.forRoot(),
    // 環境変数をアプリケーション全体に提供する(NEST経由でprocess.envにアクセス可能)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../.env'],
      // ConfigService.get('~')でアクセス可能
      load: [jwtConfig, dbConfig],
    }),
    AuthModule,
    LoginModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
