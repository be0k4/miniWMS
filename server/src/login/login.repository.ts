import { Injectable } from '@nestjs/common';
import DBUtils from 'src/utils/db-utils';
import argon2 from 'argon2';

export type LoginUserInfo = {
  user_id: string;
  user_nm: string;
  agent_cd: string;
  agent_nm: string;
  whs_cd: string;
  whs_nm: string;
  menu_grp_cd: string[];
  user_grp_cd: string;
};

@Injectable()
export class LoginRepository {
  constructor(private readonly db: DBUtils) {}

  /**
   * argon2でハッシュ化されたパスワードを取得する
   */
  async getHashedPassword(
    req: any,
    user_id: string,
    whs_cd: string,
    agent_cd: string,
  ): Promise<{ user_id: string; password: string }> {
    const sql = `
        SELECT  user_id
            ,   password
        FROM    users
        WHERE   user_id = $1
        AND    is_enabled = 'Y'
        `;
    // RLS用にuserInfoを設定
    // ログイン時にはJWTAuthGuardがまだ実行されていないため
    req.userInfo = { user_id, whs_cd, agent_cd };
    const res = await this.db.execQuery<{
      user_id: string;
      password: string;
    }>(req, sql, [user_id]);
    if (res.length === 0) return { user_id: '', password: '' };
    return {
      user_id: res[0].user_id,
      password: res[0].password,
    };
  }

  async getUser(
    req: any,
    user_id: string,
    whs_cd: string,
    agent_cd: string,
  ): Promise<LoginUserInfo> {
    const sql = `
        SELECT  u.user_id
            ,   u.user_nm
            ,   u.agent_cd
            ,   a.agent_nm
            ,   u.whs_cd
            ,   u.whs_nm
        FROM users u
        JOIN agent a ON a.agent_cd = u.agent_cd
        WHERE u.user_id = $1
        AND u.is_enabled = 'Y'
        AND a.is_enabled = 'Y'
        `;
    // RLS用にuserInfoを設定
    // ログイン時にはJWTAuthGuardがまだ実行されていないため
    if (!req.userInfo) req.userInfo = { user_id, whs_cd, agent_cd };
    const res = await this.db.execQuery<LoginUserInfo>(req, sql, [user_id]);
    return res[0];
  }

  hashPassword = async (password: string): Promise<string> => {
    return await argon2.hash(password, { type: argon2.argon2id });
  };

  verifyPassword = async (
    storedHash: string,
    password: string,
  ): Promise<boolean> => {
    return await argon2.verify(storedHash, password);
  };
}
