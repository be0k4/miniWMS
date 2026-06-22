import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class TokenBlacklistService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}
  blackList: { sub: string; expriredTime: number }[] = [];
  removeExpired = () => {
    try {
      const currentTime = Math.floor(Date.now() / 1000);
      // 期限切れのデータを削除
      while (
        this.blackList[0] &&
        this.blackList[0].expriredTime <= currentTime
      ) {
        this.blackList.shift();
      }
    } catch (error) {
      console.error(error);
    }
  };

  add(sub: string, expriredTime: number) {
    this.blackList.push({ sub, expriredTime });
  }

  // @CronではDI前にスケジュールが設定されてしまうため、onModuleInitでスケジュールの設定を行う
  onModuleInit() {
    // .envからワンタイムトークンの有効期限を取得して、Cronのスケジュールを動的に設定する
    const expiresIn =
      this.configService.get<string>('jwt.oneTimeTokenOptions.expiresIn') ??
      '1m';
    const cronTime = `0 */${expiresIn.replace('m', '')} * * * *`;

    const job = new CronJob(cronTime, () => {
      this.removeExpired();
    });
    this.schedulerRegistry.addCronJob('token-cleanup-job', job);
    job.start();
  }
}
