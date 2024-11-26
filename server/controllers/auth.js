const puppeteer = require('puppeteer');
const Account = require('../models/Account');
const ProxyManager = require('./proxy-manager');
const { getNextProxy } = require('../config/proxy-list');
const tiktokConfig = require('../config/tiktok');

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
    
    // Construct TikTok OAuth URL with proper encoding
    const authUrl = new URL('https://www.tiktok.com/auth/authorize');
    const params = {
      client_key: process.env.TIKTOK_CLIENT_ID,
      scope: 'user.info.basic,video.list,video.upload',
      response_type: 'code',
      redirect_uri: `${process.env.SERVER_URL}/api/auth/tiktok/callback`,
      state: accountNumber
    };

    // Add parameters to URL
    Object.keys(params).forEach(key => 
      authUrl.searchParams.append(key, params[key])
    );

    // Redirect to TikTok login
    res.redirect(authUrl.toString());
  },

  async handleTikTokCallback(req, res) {
    const { code, state } = req.query;
    const accountNumber = state;

    try {
      // Exchange code for access token
      const tokenResponse = await fetch('https://open-api.tiktok.com/oauth/access_token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_key: tiktokConfig.clientId,
          client_secret: tiktokConfig.clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: tiktokConfig.redirectUri
        })
      });

      const tokenData = await tokenResponse.json();

      if (!tokenData.access_token) {
        throw new Error('Failed to get access token');
      }

      // Save the account info to database
      await Account.create({
        platform: 'tiktok',
        accountNumber: parseInt(accountNumber),
        accessToken: tokenData.access_token,
        username: tokenData.open_id, // or get username from TikTok API
        userId: tokenData.open_id
      });

      // Send success message back to opener window
      res.send(`
        <script>
          window.opener.postMessage({
            type: 'AUTH_SUCCESS',
            platform: 'tiktok',
            accountNumber: ${accountNumber},
            username: '${tokenData.open_id}'
          }, '${process.env.CLIENT_URL}');
          window.close();
        </script>
      `);

    } catch (error) {
      console.error('TikTok auth error:', error);
      res.status(500).send(`
        <script>
          window.opener.postMessage({
            type: 'AUTH_ERROR',
            error: '${error.message}'
          }, '${process.env.CLIENT_URL}');
          window.close();
        </script>
      `);
    }
  }
};

module.exports = AuthController;
