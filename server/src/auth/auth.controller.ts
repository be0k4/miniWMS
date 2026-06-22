import {
  Controller,
  Get,
  Head,
  Header,
  Headers,
  Post,
  UseGuards,
} from '@nestjs/common';
// javascriptには存在しない型情報をインポートするため、import typeを使用している
import type { JwtPayload } from 'src/interface/jwt-repository.interface';
import { AuthService } from './auth.service';
import { GuardResponse, JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('refresh-token')
  async refreshToken(
    @Headers('Authorization') auth: string,
    @GuardResponse() user: JwtPayload,
  ) {
    return await this.authService.refreshToken(
      user.userId,
      user.agentCd,
      user.whsCd,
    );
  }

  // @UseGuards(JwtAuthGuard)
  // @Post('refresh-token')
  // async receivedRefreshToken(
  //   @Headers('Authorization') auth: string,
  //   @GuardResponse() user: JwtPayload,
  // ) {
  //   return await this.authService.receivedRefreshToken('', user.jti);
  // }
}
