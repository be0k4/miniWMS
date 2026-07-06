import { Injectable } from '@nestjs/common';
import { toJapaneseString } from './utils/date-utils';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: toJapaneseString(new Date(), true),
    };
  }
}
