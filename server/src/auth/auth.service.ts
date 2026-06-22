import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { StringValue } from 'ms';
import type { IJwtRepository } from 'src/interface/jwt-repository.interface';
import type { IOneTimeTokenRepository } from 'src/interface/one-time-token-repository.interface';

@Injectable()
export class AuthService {
  constructor(
    // カスタプロバイダを使用しているため、@Injectでトークンを指定してDIする
    @Inject('oneTimeTokenRepository')
    private readonly oneTimeTokenRepository: IOneTimeTokenRepository,
    @Inject('jwtRepository')
    private readonly jwtRepository: IJwtRepository,

    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  validateUser(username: string, pass: string): Promise<boolean> {
    return Promise.resolve(username === 'SS' && pass === '1');
  }

  /**
   * ログイン時に使用するワンタイムトークンを生成する
   * @returns ワンタイムトークン
   */
  async generateOneTimeToken(): Promise<{ token: string }> {
    const payload = this.oneTimeTokenRepository.generatePayload();
    const options = this.configService.get('jwt.oneTimeTokenOptions');
    return { token: await this.jwtService.signAsync(payload, { ...options }) };
  }

  /**
   * APIのアクセストークン/リフレッシュトークンを生成する
   * @param userId ログイン時のユーザーID
   * @returns APIのアクセストークン/リフレッシュトークン
   */
  async generateAccessToken(
    userId: string,
    agentCd: string,
    whsCd: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessTokenPayload = this.jwtRepository.generatePayload(
      userId,
      agentCd,
      whsCd,
      'access',
    );
    const refreshTokenPayload = this.jwtRepository.generatePayload(
      userId,
      agentCd,
      whsCd,
      'refresh',
    );
    const accessTokenOptions = this.configService.get('jwt.accessTokenOptions');
    const refreshTokenOptions = this.configService.get(
      'jwt.refreshTokenOptions',
    );
    const token = {
      accessToken: await this.jwtService.signAsync(accessTokenPayload, {
        ...accessTokenOptions,
      }),
      refreshToken: await this.jwtService.signAsync(refreshTokenPayload, {
        ...refreshTokenOptions,
      }),
    };
    return token;
  }

  /**
   * APIのアクセストークンを更新する
   * @param userId ログイン時のユーザーID
   * @param refreshToken ユーザーのリフレッシュトークン
   * @returns 新たなAPIのアクセストークン/リフレッシュトークン
   */
  async refreshToken(
    userId: string,
    agentCd: string,
    whsCd: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return await this.generateAccessToken(userId, agentCd, whsCd);
  }
}
