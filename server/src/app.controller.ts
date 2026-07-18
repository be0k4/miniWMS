import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';

// LBのヘルスチェック用API
@Controller('healthcheck')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @HttpCode(HttpStatus.OK) // 200 OK を強制する
  getHealth() {
    return this.appService.getHealth();
  }
}
