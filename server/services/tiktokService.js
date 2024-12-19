const axios = require('axios');
const config = require('../config/tiktokAuth');

class TikTokService {
  constructor() {
    this.config = config;
  }

  getAuthUrl(state) {
    const params = new URLSearchParams({
      client_key: this.config.clientKey,
      response_type: 'code',
      scope: this.config.scope,
      redirect_uri: this.config.redirectUri,
      state: state
    });

    return `${this.config.endpoints.auth}?${params.toString()}`;
  }

  async getAccessToken(code) {
    try {
      const response = await axios.post(this.config.endpoints.token, null, {
        params: {
          client_key: this.config.clientKey,
          client_secret: this.config.clientSecret,
          code: code,
          grant_type: 'authorization_code'
        }
      });

      return response.data.data;
    } catch (error) {
      console.error('TikTok token error:', error.response?.data || error.message);
      throw new Error('Failed to get access token');
    }
  }

  async getUserInfo(accessToken) {
    try {
      const response = await axios.get(this.config.endpoints.userInfo, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      return response.data.data;
    } catch (error) {
      console.error('TikTok user info error:', error.response?.data || error.message);
      throw new Error('Failed to get user info');
    }
  }

  async uploadVideo(accessToken, videoBuffer, description) {
    try {
      // First, upload the video
      const uploadResponse = await axios.post(
        this.config.endpoints.videoUpload,
        videoBuffer,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'video/mp4'
          }
        }
      );

      // Then, publish the video
      if (uploadResponse.data.data.video_id) {
        const publishResponse = await axios.post(
          `${this.config.endpoints.videoUpload}/publish`,
          {
            video_id: uploadResponse.data.data.video_id,
            title: description,
            privacy_level: 'PUBLIC'
          },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );

        return publishResponse.data;
      }
    } catch (error) {
      console.error('TikTok video upload error:', error.response?.data || error.message);
      throw new Error('Failed to upload video');
    }
  }
}

module.exports = new TikTokService(); 