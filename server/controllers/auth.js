const puppeteer = require('puppeteer');
const Account = require('../models/Account');
const ProxyManager = require('./proxy-manager');
const { getNextProxy } = require('../config/proxy-list');
const tiktokConfig = require('../config/tiktok');
const axios = require('axios');

const AuthController = {
  async initiateBrowser(platform, accountNumber) {
    const proxy = await getNextProxy();
    const browser = await puppeteer.launch({
      headless: false,
      args: [
        '--incognito',
        `--proxy-server=${proxy.host}:${proxy.port}`,
        '--disable-web-security',
        '--window-size=1280,800'
      ]
    });

    const page = await browser.newPage();
    
    // Set proxy authentication if required
    await page.authenticate({
      username: proxy.username,
      password: proxy.password
    });

    // Set realistic user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );

    return { browser, page, proxy };
  },

  async loginTikTok(accountNumber, page) {
    try {
      await page.goto('https://www.tiktok.com/login', {
        waitUntil: 'networkidle0',
        timeout: 60000
      });

      // Wait for user to manually login
      await page.waitForSelector('.user-account-info', {
        timeout: 300000 // 5 minutes timeout for manual login
      });

      // Get username after successful login
      const username = await page.$eval('.user-account-info', el => el.textContent.trim());

      // Get cookies
      const cookies = await page.cookies();

      // Save account to database
      await Account.create({
        platform: 'tiktok',
        accountNumber,
        cookies,
        username,
        lastLogin: new Date()
      });

      return { success: true, username };
    } catch (error) {
      throw new Error(`TikTok login failed: ${error.message}`);
    }
  },

  async loginInstagram(accountNumber, page) {
    try {
      await page.goto('https://www.instagram.com/login', {
        waitUntil: 'networkidle0',
        timeout: 60000
      });

      // Wait for user to manually login
      await page.waitForSelector('nav[role="navigation"]', {
        timeout: 300000 // 5 minutes timeout for manual login
      });

      // Get username after successful login
      await page.goto('https://www.instagram.com/accounts/edit/');
      const username = await page.$eval('input[name="username"]', el => el.value);

      // Get cookies
      const cookies = await page.cookies();

      // Save account to database
      await Account.create({
        platform: 'instagram',
        accountNumber,
        cookies,
        username,
        lastLogin: new Date()
      });

      return { success: true, username };
    } catch (error) {
      throw new Error(`Instagram login failed: ${error.message}`);
    }
  },

  async handleAuth(req, res) {
    const { platform } = req.params;
    const { accountNumber } = req.query;
    let browser;

    try {
      const { browser: newBrowser, page } = await this.initiateBrowser(platform, accountNumber);
      browser = newBrowser;

      let result;
      if (platform === 'tiktok') {
        result = await this.loginTikTok(accountNumber, page);
      } else if (platform === 'instagram') {
        result = await this.loginInstagram(accountNumber, page);
      } else {
        throw new Error('Invalid platform');
      }

      await browser.close();
      
      res.send(`
        <script>
          window.opener.postMessage({
            type: 'AUTH_SUCCESS',
            platform: '${platform}',
            accountNumber: ${accountNumber},
            username: '${result.username}'
          }, '*');
          window.close();
        </script>
      `);
    } catch (error) {
      if (browser) await browser.close();
      res.status(500).send(`
        <script>
          alert('Authentication failed: ${error.message}');
          window.close();
        </script>
      `);
    }
  },

  async initiateTikTokAuth(req, res) {
    const { accountNumber } = req.query;
    
    const authUrl = new URL('https://www.tiktok.com/login');
    authUrl.searchParams.set('lang', 'en');
    authUrl.searchParams.set('enter_method', 'web');
    authUrl.searchParams.set('enter_from', `dev_${process.env.TIKTOK_CLIENT_ID}`);
    
    // Create the redirect URL with all necessary permissions
    const redirectUrl = new URL('https://www.tiktok.com/v2/auth/authorize');
    redirectUrl.searchParams.set('client_key', process.env.TIKTOK_CLIENT_ID);
    redirectUrl.searchParams.set('state', accountNumber);
    redirectUrl.searchParams.set('scope', [
      'user.info.basic',
      'user.info.username',
      'user.info.stats',
      'user.account.type',
      'user.insights',
      'video.list',
      'video.insights',
      'comment.list',
      'comment.list.manage',
      'video.publish',
      'biz.brand.insights'
    ].join(','));
    redirectUrl.searchParams.set('response_type', 'code');
    redirectUrl.searchParams.set('redirect_uri', process.env.TIKTOK_REDIRECT_URI);
    
    // Add the encoded redirect URL to the login URL
    authUrl.searchParams.set('redirect_url', encodeURIComponent(redirectUrl.toString()));
    authUrl.searchParams.set('hide_left_icon', '0');
    authUrl.searchParams.set('type', '');
    authUrl.searchParams.set('no_cta_popup', '1');
    
    res.redirect(authUrl.toString());
  },

  async handleTikTokCallback(req, res) {
    const { code, state } = req.query;
    const accountNumber = parseInt(state);

    try {
      // Check if account already exists
      const existingAccount = await Account.findOne({
        platform: 'tiktok',
        accountNumber
      });

      if (existingAccount) {
        throw new Error('Account number already connected');
      }

      // Exchange code for access token
      const tokenResponse = await axios.post(tiktokConfig.endpoints.token, {
        client_key: tiktokConfig.clientId,
        client_secret: tiktokConfig.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: tiktokConfig.redirectUri
      });

      const tokenData = tokenResponse.data;

      if (!tokenData.data.access_token) {
        throw new Error('Failed to get access token');
      }

      // Get user info from TikTok
      const userResponse = await axios.get(tiktokConfig.endpoints.userInfo, {
        headers: {
          'Authorization': `Bearer ${tokenData.data.access_token}`
        }
      });

      const username = userResponse.data.data.display_name;

      // Save the account with both OAuth and cookie data
      await Account.create({
        platform: 'tiktok',
        accountNumber,
        accessToken: tokenData.data.access_token,
        username,
        userId: tokenData.data.open_id,
        cookies: [], // Initialize empty cookies array
        status: 'active',
        lastLogin: new Date()
      });

      res.send(`
        <script>
          window.opener.postMessage({
            type: 'AUTH_SUCCESS',
            platform: 'tiktok',
            accountNumber: ${accountNumber},
            username: '${username}'
          }, '*');
          window.close();
        </script>
      `);

    } catch (error) {
      console.error('TikTok auth error:', error);
      res.status(500).send(`
        <script>
          alert('Authentication failed: ${error.message}');
          window.close();
        </script>
      `);
    }
  }
};

module.exports = AuthController;
