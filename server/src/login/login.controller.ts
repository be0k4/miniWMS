import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Req } from '@nestjs/common/decorators';
import { ApiOkResponse } from '@nestjs/swagger';
import { AuthService } from 'src/auth/auth.service';
import { OneTimeTokenAuthGuard } from 'src/auth/jwt-auth.guard';
import { LoginService } from './login.service';
import { IsNotEmpty } from 'class-validator';

class LoginPostResponseParameter {
  result: boolean = false;
  user?: any;
  token?: any;
}
export class LoginPostRequestParameter {
  @IsNotEmpty()
  user_id: string = '';
  @IsNotEmpty()
  password: string = '';
  @IsNotEmpty()
  whs_cd: string = '';
  @IsNotEmpty()
  agent_cd: string = '';
}

@Controller('login')
export class LoginController {
  constructor(
    private readonly loginService: LoginService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  async getOneTimeToken(): Promise<{ token: string }> {
    return await this.authService.generateOneTimeToken();
  }

  @UseGuards(OneTimeTokenAuthGuard)
  @Post()
  @HttpCode(200) // 標準は201 Createdを返してしまう
  @ApiOkResponse({
    description: 'ログイン成功時のレスポンス',
    type: LoginPostResponseParameter,
  })
  async tryLogin(
    @Req() req,
    @Body()
    body: LoginPostRequestParameter,
  ) {
    return await this.loginService.tryLogin(req, body);
  }
}
