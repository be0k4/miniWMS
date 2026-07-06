import { FastifyRequest, RouteGenericInterface } from 'fastify';
// FastifyRequest RequestTypeを上書きしてプロジェクト全体で使用するリクエストの型を定義する
interface WmsRequestType extends RouteGenericInterface {
  params: {
    apiId: string;
  };
  query: unknown;
  headers: unknown;
  body: any;
}
export type WmsRequest = FastifyRequest<WmsRequestType> & {
  userInfo: { user_id: string; whs_cd: string; agent_cd: string };
};
