import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GuardResponse, JwtAuthGuard } from './jwt-auth.guard';
import type { FastifyReply } from 'fastify';
import {
  REFRESH_TOKEN_COOKIE_NAME,
  refreshTokenCookieOptions,
} from './refresh-token-cookie';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('refresh-token')
  async refreshToken(
    // レスポンスを操作可能にするpsassthroughオプションを有効化
    @Res({ passthrough: true }) reply: FastifyReply,
    @GuardResponse()
    user: { user_id: string; whs_cd: string; agent_cd: string },
  ) {
    const token = await this.authService.refreshToken(
      user.user_id,
      user.agent_cd,
      user.whs_cd,
    );

    // リフレッシュトークンはクッキーで返却する
    reply.setCookie(
      REFRESH_TOKEN_COOKIE_NAME,
      token.refreshToken,
      refreshTokenCookieOptions,
    );

    // アクセストークンはそのまま返却し、ブラウザのメモリに保持させる
    return {
      accessToken: token.accessToken,
    };
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
