import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from 'src/interface/jwt-repository.interface';
import { OneTimeTokenPayload } from 'src/interface/one-time-token-repository.interface';
import { authException } from 'src/type/exception';
import { TokenBlacklistService } from './token-blacklist-service';

// PassportStrategyの第2引数は、デフォルトの戦略名を指定する。
@Injectable()
class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 期限切れのトークンでもvalidateを通すようにし、リクレッシュトークンでの更新を促す
      ignoreExpiration: true,
      secretOrKey: configService.getOrThrow<string>('jwt.secret'),
    });
  }

  // 検証内容
  validate(payload: JwtPayload & { ias: number; exp: number }) {
    if (
      payload.iss !== this.configService.getOrThrow<string>('jwt.iss') ||
      (payload.type !== 'access' && payload.type !== 'refresh')
    ) {
      console.error();
      throw new UnauthorizedException();
    }
    const exp = payload.exp;
    // JWTのexpは秒単位で返却されるため、現在時刻も秒単位に変換
    const currentTime = Math.floor(Date.now() / 1000);
    if (exp < currentTime) {
      throw new UnauthorizedException(
        // アクセストークンの期限切れの場合は、リフレッシュトークンで更新するように促す
        payload.type === 'access'
          ? authException.refreshRequired
          : authException.tokenExpired,
      );
    }
    return payload;
  }
}

@Injectable()
class OneTimeTokenStrategy extends PassportStrategy(Strategy, 'ott') {
  constructor(
    private readonly configService: ConfigService,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('jwt.secret'),
    });
  }

  // 検証内容
  validate(payload: OneTimeTokenPayload & { iat: number; exp: number }) {
    if (
      payload.iss !== this.configService.getOrThrow<string>('jwt.iss') ||
      payload.type !== 'ott'
    ) {
      console.error();
      throw new UnauthorizedException();
    }

    if (
      // トークンの再利用を防止
      this.tokenBlacklistService.blackList.find((bl) => bl.sub === payload.sub)
    ) {
      throw new UnauthorizedException();
    }
    this.tokenBlacklistService.add(payload.sub, payload.exp);
    return payload;
  }
}
export { JwtStrategy, OneTimeTokenStrategy };
