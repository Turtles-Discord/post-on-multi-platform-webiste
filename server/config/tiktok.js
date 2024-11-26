module.exports = {
    clientId: process.env.TIKTOK_CLIENT_ID,
    clientSecret: process.env.TIKTOK_CLIENT_SECRET,
    redirectUri: `${process.env.SERVER_URL}/api/auth/tiktok/callback`,
    scope: 'user.info.basic,video.list,video.upload,video.publish',
    products: {
        loginKit: true,
        contentPostingAPI: true
    },
    endpoints: {
        auth: 'https://www.tiktok.com/auth/authorize/',
        token: 'https://open-api.tiktok.com/oauth/access_token/',
        videoUpload: 'https://open-api.tiktok.com/share/video/upload/',
        userInfo: 'https://open-api.tiktok.com/user/info/'
    }
}; 