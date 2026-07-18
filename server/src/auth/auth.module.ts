import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtRepository } from './jwt-repository';
import { OneTimeTokenRepository } from './one-time-token.repository';
import { AuthService } from './auth.service';
import { TokenBlacklistService } from './token-blacklist-service';
import { JwtStrategy, OneTimeTokenStrategy } from './jwt.strategy';
import { JwtAuthGuard, OneTimeTokenAuthGuard } from './jwt-auth.guard';
import { AuthController } from './auth.controller';
@Module({
  imports: [
    // 認証機能を提供するためのモジュール
    // PasssportStarategy()
    // AuthGuard()などの機能を提供
    PassportModule,

    // JWT発行、検証を行うためのモジュール
    JwtModule.registerAsync({
      inject: [ConfigService],
      // 動的に設定を生成するための関数
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('jwt.secret'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: 'oneTimeTokenRepository',
      useClass: OneTimeTokenRepository,
    },
    OneTimeTokenStrategy,
    OneTimeTokenAuthGuard,
    {
      provide: 'jwtRepository',
      useClass: JwtRepository,
    },
    JwtStrategy,
    JwtAuthGuard,
    TokenBlacklistService,
  ],

  // exportsにより別のmoduleからでも、関連する機能をすべて利用可能にする
  exports: [
    AuthService,
    'oneTimeTokenRepository',
    OneTimeTokenStrategy,
    OneTimeTokenAuthGuard,
    'jwtRepository',
    JwtStrategy,
    JwtAuthGuard,
    TokenBlacklistService,
  ],
})
export class AuthModule {}
