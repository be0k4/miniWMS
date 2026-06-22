import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { LoginModule } from './login/login.module';
import { ScheduleModule } from '@nestjs/schedule';

// ルートモジュール
// ここからモジュールを読み込んでいくため、すべてのモジュールをここでインポートしておく
@Module({
  imports: [
    // スケジュール機能をアプリケーション全体に提供する
    ScheduleModule.forRoot(),
    // .envを読み込むためのモジュール
    ConfigModule.forRoot({
      isGlobal: true, // ConfigModuleをグローバルに設定することで、他モジュール内で.envファイルの環境変数をアプリケーション全体で使用可能にする(インポート不要で使用可能)
      envFilePath: ['../.env'],
    }),
    AuthModule,
    LoginModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
