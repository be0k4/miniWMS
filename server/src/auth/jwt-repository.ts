import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import {
  JwtPayload,
  IJwtRepository,
  JwtType,
} from 'src/interface/jwt-repository.interface';
import { randomUUID } from 'crypto';

@Injectable()
class JwtRepository implements IJwtRepository {
  constructor(private readonly configService: ConfigService) {}

  generatePayload(
    type: JwtType,
    userId: string,
    agentCd: string,
    whsCd: string,
    jti: string = randomUUID(),
  ): JwtPayload {
    const payload: JwtPayload = {
      jti,
      sub: userId,
      iss: this.configService.get('jwt.iss') || 'be0k4',
      type,
      userId,
      agentCd,
      whsCd,
    };
    return payload;
  }
}

export { JwtRepository };
