import { promises } from 'fs';
import { schedule } from 'node-cron';
import { join } from 'path';
import Config from './config';
import { toJapaneseString } from './dateUtils';
import { WmsRequest } from 'src/type/wms-request';
Error.stackTraceLimit = 30;

/**
 * ログ共通クラス
 */
export default class Logging {
  protected _source = '';
  protected _method = '';
  protected _section = '';

  // ログの書き込み
  private static async writeLog(
    req: WmsRequest,
    message: string,
    level: 'DEBUG' | 'ERROR',
  ): Promise<void> {
    const env = process.env.NODE_ENV || 'development';
    if (env === 'production') {
      // do nothing
      return;
    }
    const now = new Date();
    const text = `${toJapaneseString(now, true)}\t${level}\t${req.ip}\t${JSON.stringify(message).replace(/\n/g, ' ')}\n`;

    try {
      const setting = Config.getLogSetting();
      const dir = setting.path;
      await promises.mkdir(dir, { recursive: true });

      const fileName = `miniWMS_${now.getFullYear()}${(now.getMonth() + 1)
        .toString()
        .padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}.log`;
      const filePath = join(dir, fileName);

      await promises.appendFile(filePath, text);
    } catch (e: any) {
      console.error(e);
    }
  }
  /**
   * デバックログを出力する
   * @param message 出力するログ
   */
  static async debugLog(req: WmsRequest, message: string): Promise<void> {
    await Logging.writeLog(req, message, 'DEBUG');
  }
  /**
   * エラーログを出力する
   * @param message 発生した例外
   */
  static async errorLog(req: WmsRequest, message: string): Promise<void> {
    await Logging.writeLog(req, message, 'ERROR');
  }

  // ログの定期削除
  static startRotate() {
    // 秒分時日月曜日の順で指定。毎日0時5分に実行
    schedule('0 5 0 * * *', async () => {
      const setting = Config.getLogSetting();

      try {
        const files = await promises.readdir(setting.path);
        const deleteFiles = files
          .sort((a, b) => {
            if (a > b) return -1;
            else return 1;
          })
          .splice(setting.rotatePeriod);
        deleteFiles.forEach((df) => {
          void promises.unlink(join(setting.path, df));
        });
      } catch (e: any) {
        console.error(e);
      }
    });
  }
}
