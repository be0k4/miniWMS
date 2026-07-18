import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import {
  IOneTimeTokenRepository,
  OneTimeTokenPayload,
} from 'src/interface/one-time-token-repository.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
class OneTimeTokenRepository implements IOneTimeTokenRepository {
  constructor(private readonly configService: ConfigService) {}

  generatePayload(): OneTimeTokenPayload {
    const sub = randomUUID();
    const payload: OneTimeTokenPayload = {
      sub,
      iss: this.configService.get('jwt.iss') || 'be0k4',
      type: 'ott',
    };
    return payload;
  }
}

export { OneTimeTokenRepository };
