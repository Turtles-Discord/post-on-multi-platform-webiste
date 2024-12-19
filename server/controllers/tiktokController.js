const TikTokService = require('../services/tiktokService');
const User = require('../models/User');

class TikTokController {
  async initiateAuth(req, res) {
    try {
      const { userId } = req;
      const state = Buffer.from(JSON.stringify({ userId })).toString('base64');
      const authUrl = TikTokService.getAuthUrl(state);
      res.json({ authUrl });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async handleCallback(req, res) {
    try {
      const { code, state } = req.query;
      const { userId } = JSON.parse(Buffer.from(state, 'base64').toString());

      // Get access token
      const tokenData = await TikTokService.getAccessToken(code);
      
      // Get user info
      const userInfo = await TikTokService.getUserInfo(tokenData.access_token);

      // Update user with TikTok info
      await User.findByIdAndUpdate(userId, {
        'tiktok.accessToken': tokenData.access_token,
        'tiktok.refreshToken': tokenData.refresh_token,
        'tiktok.expiresIn': tokenData.expires_in,
        'tiktok.userId': userInfo.user_id,
        'tiktok.username': userInfo.username
      });

      // Close popup and send message to parent window
      res.send(`
        <script>
          window.opener.postMessage({ 
            type: 'TIKTOK_AUTH_SUCCESS',
            data: ${JSON.stringify(userInfo)}
          }, '*');
          window.close();
        </script>
      `);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async uploadVideo(req, res) {
    try {
      const { userId } = req;
      const { description } = req.body;
      const videoBuffer = req.file.buffer;

      const user = await User.findById(userId);
      if (!user.tiktok?.accessToken) {
        throw new Error('TikTok account not connected');
      }

      const result = await TikTokService.uploadVideo(
        user.tiktok.accessToken,
        videoBuffer,
        description
      );

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new TikTokController(); 