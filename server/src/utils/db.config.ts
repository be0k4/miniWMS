import { registerAs } from '@nestjs/config';

// 取得時はConfigService.get('database.~')でアクセス可能
export default registerAs<DBConfig>('database', () => {
  // サポートする形式: DB_NAME_<荷主名> = <DB名>という形式で複数定義可能（例: DB_NAME_HOGE=XX)
  // database[荷主名] = DB名 でMapに格納される
  const databases: { [key: string]: string } = {};
  Object.keys(process.env).forEach((e) => {
    if (!e.startsWith('DB_NAME_')) return;
    const suffix = e.substring('DB_NAME_'.length);
    if (!suffix) return;
    const key = suffix.toUpperCase();
    databases[key] = process.env[e] ?? '';
  });

  return {
    host: process.env.DB_HOST ?? '',
    user: process.env.DB_USER ?? '',
    password: process.env.DB_PASSWORD ?? '',
    role: process.env.DB_ROLE ?? '',
    databases,
    port: Number(process.env.DB_PORT ?? 5433),
  };
});

export type DBConfig = {
  host: string;
  user: string;
  password: string;
  role: string;
  databases: { [key: string]: string };
  port: number;
};
