const puppeteer = require('puppeteer');
const Account = require('../models/Account');
const ProxyManager = require('./proxy-manager');
const path = require('path');
const fs = require('fs').promises;

class PostController {
  async initBrowserForPosting(cookies, proxy) {
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
    
    // Set proxy authentication
    await page.authenticate({
      username: proxy.username,
      password: proxy.password
    });

    // Set cookies
    await page.setCookie(...cookies);

    // Set realistic user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );

    return { browser, page };
  }

  async postToTikTok(page, videoPath, description) {
    try {
      await page.goto('https://www.tiktok.com/upload', {
        waitUntil: 'networkidle0',
        timeout: 60000
      });

      // Random delay to simulate human behavior
      await page.waitForTimeout(2000 + Math.random() * 2000);

      // Upload video
      const [fileChooser] = await Promise.all([
        page.waitForFileChooser(),
        page.click('.upload-btn-input')
      ]);
      await fileChooser.accept([videoPath]);

      // Wait for video to upload
      await page.waitForSelector('.video-preview-container', {
        timeout: 120000
      });

      // Add description with random typing delays
      await page.type('.public-DraftEditor-content', description, {
        delay: 100 + Math.random() * 200
      });

      // Wait for upload button to be enabled
      await page.waitForSelector('button[data-e2e="upload-button"]:not([disabled])', {
        timeout: 60000
      });

      // Random delay before posting
      await page.waitForTimeout(1000 + Math.random() * 2000);

      // Click post
      await page.click('button[data-e2e="upload-button"]');

      // Wait for success message
      await page.waitForSelector('.success-modal', {
        timeout: 120000
      });

      return true;
    } catch (error) {
      throw new Error(`TikTok posting failed: ${error.message}`);
    }
  }

  async postToInstagram(page, videoPath, description) {
    try {
      await page.goto('https://www.instagram.com', {
        waitUntil: 'networkidle0',
        timeout: 60000
      });

      // Click create post button
      await page.click('svg[aria-label="New post"]');
      await page.waitForTimeout(2000 + Math.random() * 1000);

      // Upload video
      const [fileChooser] = await Promise.all([
        page.waitForFileChooser(),
        page.click('button:has-text("Select from computer")')
      ]);
      await fileChooser.accept([videoPath]);

      // Wait for upload and click through steps
      await page.waitForSelector('button:has-text("Next")', { timeout: 60000 });
      await page.click('button:has-text("Next")');
      
      await page.waitForTimeout(1000 + Math.random() * 1000);
      
      await page.waitForSelector('button:has-text("Next")');
      await page.click('button:has-text("Next")');

      // Add caption with random typing delays
      await page.waitForSelector('textarea[aria-label="Write a caption..."]');
      await page.type('textarea[aria-label="Write a caption..."]', description, {
        delay: 100 + Math.random() * 200
      });

      // Random delay before sharing
      await page.waitForTimeout(1000 + Math.random() * 2000);

      // Share post
      await page.click('button:has-text("Share")');

      // Wait for success (post appears in feed)
      await page.waitForSelector('div[role="dialog"]', {
        hidden: true,
        timeout: 60000
      });

      return true;
    } catch (error) {
      throw new Error(`Instagram posting failed: ${error.message}`);
    }
  }

  async handlePost(req, res) {
    const { file, body } = req;
    const { description } = body;
    const results = [];

    try {
      // Validate video file
      if (!file) {
        throw new Error('No video file provided');
      }

      // Get all connected accounts
      const accounts = await Account.find({});

      for (const account of accounts) {
        try {
          // Get best available proxy
          const proxy = await ProxyManager.getBestProxy();
          if (!proxy) {
            throw new Error('No working proxies available');
          }

          // Initialize browser
          const { browser, page } = await this.initBrowserForPosting(account.cookies, proxy);

          try {
            if (account.platform === 'tiktok') {
              await this.postToTikTok(page, file.path, description);
            } else if (account.platform === 'instagram') {
              await this.postToInstagram(page, file.path, description);
            }

            results.push({
              platform: account.platform,
              accountNumber: account.accountNumber,
              username: account.username,
              status: 'success'
            });

          } catch (error) {
            results.push({
              platform: account.platform,
              accountNumber: account.accountNumber,
              username: account.username,
              status: 'failed',
              error: error.message
            });
          } finally {
            await browser.close();
          }

          // Random delay between accounts
          await new Promise(resolve => 
            setTimeout(resolve, 5000 + Math.random() * 5000)
          );

        } catch (error) {
          results.push({
            platform: account.platform,
            accountNumber: account.accountNumber,
            username: account.username,
            status: 'failed',
            error: error.message
          });
        }
      }

      // Clean up uploaded file
      await fs.unlink(file.path);

      res.json({
        success: true,
        results,
        summary: {
          total: results.length,
          successful: results.filter(r => r.status === 'success').length,
          failed: results.filter(r => r.status === 'failed').length
        }
      });

    } catch (error) {
      // Clean up uploaded file if exists
      if (file && file.path) {
        await fs.unlink(file.path).catch(() => {});
      }

      res.status(500).json({
        success: false,
        error: error.message,
        results
      });
    }
  }
}

module.exports = new PostController(); 