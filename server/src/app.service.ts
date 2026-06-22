import { Injectable } from '@nestjs/common';
import { toJapaneseString } from './utils/dateUtils';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: toJapaneseString(new Date(), true),
    };
  }
}
