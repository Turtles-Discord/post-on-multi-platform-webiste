const Account = require('../models/Account');
const TikTokService = require('../services/tiktokService');

class AnalyticsController {
  async getAnalytics(req, res) {
    try {
      const { timeframe, account } = req.query;
      const accounts = await Account.find({ 
        platform: 'tiktok',
        ...(account !== 'all' && { _id: account })
      });

      const analytics = {
        views: [],
        likes: [],
        shares: [],
        comments: [],
        followers: [],
        topVideos: []
      };

      for (const account of accounts) {
        const stats = await TikTokService.getVideoStats(account.accessToken);
        // Aggregate stats
        analytics.views.push(...stats.views);
        analytics.likes.push(...stats.likes);
        analytics.shares.push(...stats.shares);
        analytics.comments.push(...stats.comments);
        analytics.followers.push(...stats.followers);
        analytics.topVideos.push(...stats.topVideos);
      }

      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new AnalyticsController(); 