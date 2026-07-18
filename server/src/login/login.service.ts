import { Inject, Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { LoginRepository, LoginUserInfo } from './login.repository';
import { LoginPostRequestParameter } from './login.controller';

@Injectable()
export class LoginService {
  historyRepository: any;

  constructor(
    private readonly authService: AuthService,
    private readonly loginRepository: LoginRepository,
  ) {}

  /**
   * argon2でハッシュ化されたパスワードを取得し、入力されたパスワードと比較してログイン可能か判定する
   * @returns 成功時はアクセス/リフレッシュトークンを返す。
   */
  async tryLogin(
    req: any,
    body: LoginPostRequestParameter,
  ): Promise<
    | {
        result: true;
        user: { user_id: string };
        token: { accessToken: string; refreshToken: string };
      }
    | { result: false }
  > {
    const stored = await this.loginRepository.getHashedPassword(
      req,
      body.user_id,
      body.whs_cd,
      body.agent_cd,
    );
    const canLogin = await this.loginRepository.verifyPassword(
      stored.password,
      body.password,
    );

    if (!canLogin) {
      return { result: false };
    }
    const user = await this.loginRepository.getUser(
      req,
      stored.user_id,
      body.whs_cd,
      body.agent_cd,
    );
    const token = await this.authService.generateAccessToken(
      stored.user_id,
      user.agent_cd,
      user.whs_cd,
    );
    return {
      result: true,
      user,
      token,
    };
  }
  catch(e: any) {
    throw e;
  }
}
