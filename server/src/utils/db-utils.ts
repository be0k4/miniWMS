import Logging from './logging';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DBConfig } from './db.config';
import { Pool, PoolClient, types } from 'pg';
import { toJapaneseString } from './date-utils';
import { WmsRequest } from 'src/type/wms-request';

type storedReturnCommon = {
  po_return_sts: 0;
  po_return_errcd: '';
  po_return_sqlcd: 0;
  po_return_msg: '';
};

type RLSClient = PoolClient & {
  releaseRLS: () => Promise<void>;
};
/**
 * DB共通クラス
 * このアーキテクチャは複数荷主・複数拠点を考慮した設計です
 * 各荷主はDB単位で分離し、各拠点はRLSでアクセス制御を行います
 */
@Injectable()
export default class DBUtils implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  private static instance: DBUtils;
  private static pools: Map<string, Pool> = new Map();
  /**
   * 動的生成画面からDBUtilsのインスタンスを取得する用
   * @param req WmsRequest
   * @returns DBUtilsのインスタンス
   */
  public static getInstance(req: WmsRequest): DBUtils {
    if (!DBUtils.instance) {
      const errMsg =
        'DBUtils instance is not initialized. Please call onModuleInit first.';
      void Logging.errorLog(req, errMsg);
      throw new Error(errMsg);
    }
    return DBUtils.instance;
  }

  onModuleInit() {
    DBUtils.instance = this;
    const databaseConfig = this.configService.getOrThrow<DBConfig>('database');

    // モジュール起動時に各荷主の Pool を作成して再利用する
    try {
      const agentOnDb = databaseConfig.databases;
      Object.keys(agentOnDb).forEach((agentName) => {
        const agentDB = agentOnDb[agentName];
        if (!DBUtils.pools.has(agentName.toUpperCase())) {
          // 開発環境
          if (process.env.NODE_ENV !== 'production') {
            const pool = new Pool({
              host: databaseConfig.host,
              database: agentDB,
              user: databaseConfig.user,
              port: databaseConfig.port,
              password: databaseConfig.password,
              application_name: 'miniWMS_api',
              query_timeout: 3 * 60 * 1000, // パフォーマンスが悪いSQLは3分でタイムアウト
              statement_timeout: 3 * 60 * 1000,
              ssl: false,
              max: 5,
            });
            DBUtils.pools.set(agentName.toUpperCase(), pool);
          } else {
            // 本番環境
            const pool = new Pool({
              // hostにはロードバランサーのホスト名を指定してSSL通信を行う
              host: databaseConfig.host,
              database: agentDB,
              user: databaseConfig.user,
              port: databaseConfig.port,
              password: databaseConfig.password,
              application_name: 'miniWMS_api',
              query_timeout: 3 * 60 * 1000, // パフォーマンスが悪いSQLは3分でタイムアウト
              statement_timeout: 3 * 60 * 1000,
              ssl: {
                rejectUnauthorized: true,
              },
              max: 3,
            });
            DBUtils.pools.set(agentName.toUpperCase(), pool);
          }
        }
      });
    } catch (e) {
      console.error('DBUtils onModuleInit pool creation failed', e);
      throw e;
    }
  }

  /**
   * RLSを有効化した状態のコネクションを取得する
   * SQL実行後は必ずreleaseRLS()を呼び出してコネクションをプールに返却すること
   * @param agent
   * @param whs_cd
   * @param options
   * @returns
   */
  private async getClientWithRLS(
    agent: string,
    whs_cd: string,
    options: {
      user: string;
      onError: (e: Error) => Promise<void>;
      disabledRLS?: boolean; // 明示的にtrueにするとRLSを無効化し、標準でRLSを有効化する
    },
  ): Promise<RLSClient> {
    const databaseConfig = this.configService.getOrThrow<DBConfig>('database');
    const client = (await DBUtils.pools.get(agent)!.connect()) as RLSClient;
    if (!options.disabledRLS) {
      await client.query(`SET role = '${databaseConfig.role}'`);
      await client.query(`SET "wms.whs_cd" = '${whs_cd}'`);
      await client.query(`SET "wms.agent_cd" = '${agent}'`);
    }
    client.releaseRLS = async () => {
      await client.query(`SET role = '${databaseConfig.user}'`);
      await client.query(`SET "wms.whs_cd" = ''`);
      await client.query(`SET "wms.agent_cd" = ''`);
      client.removeAllListeners('error');
      client.release();
    };
    client.on('error', (e: Error) => {
      void options.onError(e);
    });
    return client;
  }

  /**
   * リクエストからユーザー情報を取得する
   * リクエストのuserInfoにユーザー情報が格納されていることを前提とする
   * 例: { user_id: 'user1', whs_cd: 'WH001', agent_cd: 'AG001' }
   * @param req
   * @returns ユーザー情報オブジェクト
   */
  private getRequestParams = (
    req: WmsRequest,
  ): { user_id: string; whs_cd: string; agent_cd: string } => {
    // JWTAuthGuard経由でリクエストが来ることを前提としている
    // userInfoが存在しない場合は、リクエストが認証されていない可能性がある
    if (!req.userInfo) {
      const errMsg =
        'Request does not contain userInfo. Please ensure that the request is authenticated.';
      void Logging.errorLog(req, errMsg);
      throw new Error(errMsg);
    }
    const request = req.userInfo;
    return {
      user_id: request['user_id'],
      whs_cd: request['whs_cd'],
      agent_cd: request['agent_cd'],
    };
  };

  /**
   * pgのqueryをラップしてRLS対応
   * @param req WMSリクエスト
   * @param sql 実行するSQL文 ($1, $2のようにプレースホルダを使用する)
   * @param whereQuery $1, $2に埋め込むパラメータの配列
   * @returns SQL実行結果
   */
  async query(req: WmsRequest, sql: string, whereQuery: any) {
    try {
      const where = Object.values(whereQuery);
      // SQL実行のたびにコネクションをプールから取得する
      const errorListenr = async (e: Error) => {
        try {
          await Logging.errorLog(
            req,
            e.stack ?? e.message ?? JSON.stringify(e),
          );
        } catch {
          console.error(e.stack ?? e.message ?? JSON.stringify(e));
        }
      };
      const { user_id, whs_cd, agent_cd } = this.getRequestParams(req);
      const client = await this.getClientWithRLS(agent_cd, whs_cd, {
        onError: errorListenr,
        user: user_id,
      });

      // SQL実行
      try {
        const result = await client.query(sql, where);
        return result;
      } catch (e: any) {
        void Logging.errorLog(req, e.message);
        throw new Error(e.message);
      } finally {
        // RLSを無効化してコネクションをプールに返却する
        await client.releaseRLS();
      }
    } catch (error: any) {
      void Logging.errorLog(
        req,
        // バックエンドのエラーを記録する際にstackが追跡に有効なため、stackを優先して取得する
        error?.stack ?? error?.message ?? JSON.stringify(error),
      );
      // エラーをフロントに返すときは、内部のエラー内容を返さずにInternal Server Errorとする
      throw new Error('Internal Server Error');
    }
  }

  /**
   * プレースホルダを使用してSQLを実行
   * 例: execQuery<{ id: number; name: string; created_at: Date }>(req, sql, whereQuery, user)
   * @param req WMSリクエスト
   * @param sql 実行するSQL文 ($1, $2のようにプレースホルダを使用する)
   * @param whereQuery $1, $2に埋め込むパラメータの配列
   * @returns SQL実行結果の配列
   */
  async execQuery<
    T extends {
      [key: string]: number | boolean | string | string[] | Date | null;
    } = any,
  >(req: WmsRequest, sql: string, whereQuery: any) {
    await Logging.debugLog(req, sql);
    await Logging.debugLog(req, whereQuery);
    return (await this.query(req, sql, whereQuery)).rows as T[];
  }

  async execQueryNoLog(req: WmsRequest, sql: string, whereQuery: any) {
    return (await this.query(req, sql, whereQuery)).rows;
  }

  /**
   * ストアドプロシージャを呼び出す
   * 内部でトランザクションを開始し、ストアドプロシージャの戻り値に応じてコミットまたはロールバックする
   * @param req WMSリクエスト
   * @param spId ストアドプロシージャID
   * @param spParam 順不同でオブジェクト形式で引数指定。ユーザー情報は自動で付与されるので指定不要
   * @returns ストアドプロシージャの実行結果
   */
  async execStoredProcedure(req: WmsRequest, spId: string, spParam: unknown) {
    try {
      const errorListenr = async (e: Error) => {
        try {
          await Logging.errorLog(
            req,
            e.stack ?? e.message ?? JSON.stringify(e),
          );
        } catch {
          console.error(e.stack ?? e.message ?? JSON.stringify(e));
        }
      };
      const { user_id, agent_cd, whs_cd } = this.getRequestParams(req);
      const client = await this.getClientWithRLS(agent_cd, whs_cd, {
        onError: errorListenr,
        user: user_id,
      });
      // トランザクション開始
      try {
        await client.query('BEGIN');
        const params = await buildArgs(client, spId, spParam, {
          user_id,
          agent_cd,
          whs_cd,
        });
        // CALL spId($1, $2, ...) の形式でSQLを生成する
        const sql = `CALL ${spId}(${params.map((e, i) => `$${i + 1}`).join(',')})`;
        await Logging.debugLog(req, sql);
        await Logging.debugLog(req, params as any);
        //SQL実行
        const result = await client.query<storedReturnCommon>(sql, params);

        if (Number(result.rows[0].po_return_sts) === 0) {
          await client.query('COMMIT');
          return { result: result.rows[0], success: true };
        } else {
          await client.query('ROLLBACK');
          return { result: result.rows[0], success: false };
        }
      } catch (err: any) {
        await client.query('ROLLBACK');
        await Logging.errorLog(
          req,
          err.stack ?? err.message ?? JSON.stringify(err),
        );
        throw new Error(err.message);
      } finally {
        await client.releaseRLS();
      }
    } catch (err: any) {
      await Logging.errorLog(
        req,
        err.stack ?? err.message ?? JSON.stringify(err),
      );
      throw err;
    }
  }

  getSysdate(): string {
    const d = new Date();
    return toJapaneseString(d, false);
  }

  async transaction(
    req: WmsRequest,
    f: (
      connection: PoolClient,
    ) => Promise<boolean | { result: boolean; value: any }>,
  ) {
    const errorListenr = async (e: Error) => {
      try {
        await Logging.errorLog(req, e.stack ?? e.message ?? JSON.stringify(e));
      } catch {
        console.error(e.stack ?? e.message ?? JSON.stringify(e));
      }
    };
    const userInfo = this.getRequestParams(req);
    const { user_id, agent_cd, whs_cd } = userInfo;

    const connection = await this.getClientWithRLS(agent_cd, whs_cd, {
      onError: errorListenr,
      user: user_id,
    });

    try {
      await connection.query('BEGIN');
      const result = await f(connection);
      if (
        (typeof result === 'boolean' && result) ||
        (typeof result === 'object' && result.result)
      ) {
        await connection.query('COMMIT');
      } else {
        await connection.query('ROLLBACK');
      }
      return typeof result !== 'boolean' ? result.value : null;
    } catch (e: any) {
      console.error(e);
      await connection.query('ROLLBACK');
    } finally {
      delete (connection as any).dbfunc;
      await connection.releaseRLS();
    }
  }
}

/**
 * SP実行用の引数配列を生成する
 * @param client
 * @param spId
 * @param spParam オブジェクト形式で順不同で引数を指定する。ユーザー情報は自動で付与されるので指定不要
 * @param user
 * @returns
 */
const buildArgs = async (
  client: PoolClient,
  spId: string,
  spParam: any,
  user?: { user_id?: string; agent_cd?: string; whs_cd?: string },
): Promise<any[]> => {
  // .argsで取得できる引数の形式は以下の通り
  // IN pi_proc_psn character varying, INOUT po_return_sts integer,
  const args: string = (
    await client.query(
      `select pg_catalog.pg_get_function_arguments(oid) as args from pg_catalog.pg_proc where proname = '${spId.toLowerCase()}' order by oid desc`,
    )
  ).rows[0].args;
  // postgresの引数モード一覧
  const modes = ['IN', 'OUT', 'INOUT', 'VARIADIC'];
  const params: any[] = [];
  args.split(', ').forEach((e) => {
    const tmp = e.split(' ');

    // 先頭の単語が引数モード（IN/OUT等）ならそれを除外して、次の単語を引数名として受け取る
    const key = modes.includes(tmp[0].toUpperCase()) ? tmp[1] : tmp[0];
    if (spParam[key]) {
      params.push(spParam[key]);
    } else if (user && key === 'pi_user_id') {
      params.push(user.user_id);
    } else if (user && key === 'pi_agent_cd') {
      params.push(user.agent_cd);
    } else if (user && key === 'pi_whs_cd') {
      params.push(user.whs_cd);
    } else {
      params.push(null);
    }
  });
  return params;
};
