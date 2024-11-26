module.exports = {
    clientId: process.env.TIKTOK_CLIENT_ID,
    clientSecret: process.env.TIKTOK_CLIENT_SECRET,
    redirectUri: `${process.env.SERVER_URL}/api/auth/tiktok/callback`,
    scope: 'user.info.basic,video.list,video.upload'
}; 