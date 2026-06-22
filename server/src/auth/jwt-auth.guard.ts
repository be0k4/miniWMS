import {
  createParamDecorator,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { JwtPayload } from 'src/interface/jwt-repository.interface';
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
    // user情報（JWTペイロード）をリクエストオブジェクトに付与
    request.userInfo = user;
    return request;
  }
}

@Injectable()
class OneTimeTokenAuthGuard extends AuthGuard('ott') {}

/*
    ガード内で検証したユーザー情報をリクエストから取得する
*/
const GuardResponse = createParamDecorator(
  (property: string, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const data = request.userInfo;

    return property ? data?.[property] : data;
  },
);

export { JwtAuthGuard, OneTimeTokenAuthGuard, GuardResponse };
