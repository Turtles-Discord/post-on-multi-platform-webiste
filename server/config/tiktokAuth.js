const config = {
  clientKey: process.env.TIKTOK_CLIENT_KEY,
  clientSecret: process.env.TIKTOK_CLIENT_SECRET,
  redirectUri: `${process.env.SERVER_URL}/api/auth/tiktok/callback`,
  scope: [
    'user.info.basic',
    'user.info.profile',
    'user.info.stats',
    'video.list',
    'video.upload',
    'video.publish'
  ].join(','),
  endpoints: {
    auth: 'https://www.tiktok.com/auth/authorize/',
    token: 'https://open-api.tiktok.com/oauth/access_token/',
    refresh: 'https://open-api.tiktok.com/oauth/refresh_token/',
    userInfo: 'https://open-api.tiktok.com/user/info/',
    videoUpload: 'https://open-api.tiktok.com/share/video/upload/',
    videoList: 'https://open-api.tiktok.com/video/list/'
  }
};

module.exports = config; 