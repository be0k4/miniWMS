import {
  createParamDecorator,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { JwtPayload } from 'src/interface/jwt-repository.interface';
import { OneTimeTokenPayload } from 'src/interface/one-time-token-repository.interface';
@Injectable()
class JwtAuthGuard extends AuthGuard('jwt') {
  // Guardの実行前の処理を追加したい場合は、canActivateをオーバーライドする
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }
  // 認証成功後の処理を追加したい場合は、handleRequestをオーバーライドする
  handleRequest<TUser = any>(
    err: any,
    // userにはstrategyで返却した値が入る。失敗した場合はfalseが入る
    user: (JwtPayload & { iat: number; exp: number }) | false,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    if (err || user === false) {
      throw err || new UnauthorizedException();
    }
    const request = context.switchToHttp().getRequest();
    const api = request.raw.url.split('?')[0];

    // リフレッシュトークンでトークン更新以外のAPIを呼べないようにする
    if (api !== '/auth/refresh-token' && user.type === 'refresh') {
      console.log('reject');
      throw new UnauthorizedException();
    }

    // user情報(RLS認証用)をリクエストオブジェクトに付与
    const userInfo = {
      user_id: user.userId,
      whs_cd: user.whsCd,
      agent_cd: user.agentCd,
    };
    request.userInfo = userInfo;
    return request;
  }
}
// OneTimeToken（ログイン要求）時にRLS用のuserInfoを設定する
@Injectable()
class OneTimeTokenAuthGuard extends AuthGuard('ott') {
  handleRequest<TUser = any>(
    err: any,
    user: OneTimeTokenPayload | false,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    if (err || user === false) {
      throw err || new UnauthorizedException();
    }
    const request = context.switchToHttp().getRequest();
    // ログイン時はLoginPostRequestParameterで定義しているため、userInfoをリクエストボディから取得する
    const body = request.body || {};
    const userInfo = {
      user_id: body?.user_id,
      whs_cd: body?.whs_cd,
      agent_cd: body?.agent_cd,
    };
    request.userInfo = userInfo;
    return request;
  }
}

/**
 * リクエストのuserInfoを取得するためのデコレーター
 * @param property 取得したいプロパティ名（省略可）
 * @param context ExecutionContext
 * @returns userInfoオブジェクトまたは指定したプロパティの値
 */
const GuardResponse = createParamDecorator(
  (property: string, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const data = request.userInfo;

    return property ? data?.[property] : data;
  },
);

export { JwtAuthGuard, OneTimeTokenAuthGuard, GuardResponse };
