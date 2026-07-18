const dbException = {
  noDataFound: 'no data found',
} as const;

const authException = {
  refreshRequired: 'refresh token required',
  tokenExpired: 'Token expired',
  subscriptionExpired: 'Subscription Expired',
};
export { dbException, authException };
