import { FastifyRequest } from 'fastify';

// プロジェクト全体で使用するリクエストの型定義
export type WmsRequest = FastifyRequest<
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  { params: { apiId: string }; query; headers; body: any }
>;
