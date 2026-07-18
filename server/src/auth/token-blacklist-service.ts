import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
/**
 * ワンタイムトークンの再利用防止のブラックリストと、そのクリーンアップを行うサービス
 */
export class TokenBlacklistService implements OnModuleInit {
  constructor(private readonly schedulerRegistry: SchedulerRegistry) {}
  blackList: { sub: string; expriredTime: number }[] = [];
  removeExpired = () => {
    try {
      const currentTime = Math.floor(Date.now() / 1000);
      this.blackList = this.blackList.filter(
        (entry) => entry.expriredTime > currentTime,
      );
    } catch (error) {
      console.error(error);
    }
  };

  add(sub: string, expriredTime: number) {
    this.blackList.push({ sub, expriredTime });
  }

  // @CronではDI前にスケジュールが設定されてしまうため、onModuleInitでスケジュールの設定を行う
  onModuleInit() {
    // 1分間隔で実行
    // cronTimeの書式は、秒 分 時 日 月 曜日 年の順で指定する
    const cronTime = `0 */1 * * * *`;

    const job = new CronJob(cronTime, () => {
      this.removeExpired();
    });
    this.schedulerRegistry.addCronJob('token-cleanup-job', job);
    job.start();
  }
}
