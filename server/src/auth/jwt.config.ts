import { registerAs } from '@nestjs/config';

// 取得時はConfigService.get('jwt')でアクセス可能
export default registerAs('jwt', () => ({
  // 機密情報はセキュリティの観点から、コードベースに記述しない
  secret: process.env.JWT_SECRET,
  iss: process.env.JWT_ISS ?? 'be0k4',
  oneTimeTokenOptions: {
    expiresIn: '5m',
  },
  accessTokenOptions: {
    expiresIn: '1h',
  },
  refreshTokenOptions: {
    expiresIn: '24h',
  },
}));
