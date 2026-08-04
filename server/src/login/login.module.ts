import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { LoginRepository } from './login.repository';
import DButils from 'src/utils/db-utils.service';
@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('jwt.secret'),
      }),
    }),
    AuthModule,
  ],
  controllers: [LoginController],
  providers: [LoginService, LoginRepository, DButils],
})
export class LoginModule {}
