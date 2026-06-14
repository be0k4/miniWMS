import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import Logging from './utils/Logging';
import { FastifyRequest } from 'fastify';

@Injectable()
// APIのリクエストからレスポンスまでの時間を計測するインターセプター
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    // ヘルスチェックのときはスキップ
    if (request.url === '/healthcheck') return next.handle();
    // const userInfo = request.userInfo;
    const info = this.createMessage(request);
    const api = request.url.split('?')[0];
    const startTime = process.hrtime();
    // 以下のAPIはスキップ
    if (
      api === '/login' ||
      api === '/printer' ||
      api === '/auth/refresh-token' ||
      (api.split('/')[1] ?? '') === 'nologapi'
    ) {
      return next.handle();
    }

    // ここからControllerの処理
    return next.handle().pipe(
      catchError(async (err) => {
        const endTime = process.hrtime(startTime);
        const nanoSeconds = endTime[0] * 1_000_000_000 + endTime[1];
        const seconds = nanoSeconds / 1_000_000_000;
        await Logging.debugLog(
          request,
          `[Timer Error][${seconds.toFixed(3)}s] ${info}`,
        );
        throw err;
      }),
      tap(() => {
        const endTime = process.hrtime(startTime);
        const nanoSeconds = endTime[0] * 1_000_000_000 + endTime[1];
        const seconds = nanoSeconds / 1_000_000_000;
        // 成功時はログ出力を待たずにレスポンスを返すためvoidで呼び出す
        void Logging.debugLog(
          request,
          `[Timer Finish][${seconds.toFixed(3)}s] ${info}`,
        );
      }),
    );
  }

  createMessage = (req: FastifyRequest) => {
    const { body } = req;
    const msg = `api request [url=${req.url}, method=${
      req.method
    }, body=${JSON.stringify(body)}, ip=${req.ip}]`;
    return msg;
  };
}
