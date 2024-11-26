const axios = require('axios');
const ProxyChecker = require('proxy-checker');

class ProxyManager {
  constructor() {
    this.workingProxies = new Map();
    this.failedAttempts = new Map();
    this.proxyCheckInterval = 5 * 60 * 1000; // 5 minutes
  }

  async checkProxyHealth(proxy) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      ProxyChecker.checkProxy({
        proxy: {
          ipAddress: proxy.host,
          port: proxy.port,
          protocol: 'http'
        },
        timeout: 5000,
        websites: ['https://www.tiktok.com', 'https://www.instagram.com']
      }, (err, result) => {
        if (!err && result.isWorking) {
          const latency = Date.now() - startTime;
          this.workingProxies.set(proxy, latency);
          resolve(true);
        } else {
          this.recordFailedAttempt(proxy);
          resolve(false);
        }
      });
    });
  }

  async validateProxy(proxy) {
    try {
      const response = await axios.get('https://api.ipify.org?format=json', {
        proxy: {
          host: proxy.host,
          port: proxy.port,
          auth: {
            username: proxy.username,
            password: proxy.password
          }
        },
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  getProxyUrl(proxy) {
    return `http://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`;
  }

  async getBestProxy() {
    // Get proxy with lowest latency and least failed attempts
    const sortedProxies = Array.from(this.workingProxies.entries())
      .sort(([proxyA, speedA], [proxyB, speedB]) => {
        const failsA = this.failedAttempts.get(proxyA) || 0;
        const failsB = this.failedAttempts.get(proxyB) || 0;
        return (speedA + failsA * 1000) - (speedB + failsB * 1000);
      });

    if (sortedProxies.length === 0) {
      return null;
    }

    const bestProxy = sortedProxies[0][0];
    
    // Verify proxy is still working
    if (await this.validateProxy(bestProxy)) {
      return bestProxy;
    } else {
      this.workingProxies.delete(bestProxy);
      return this.getBestProxy();
    }
  }

  recordFailedAttempt(proxy) {
    const currentFails = this.failedAttempts.get(proxy) || 0;
    this.failedAttempts.set(proxy, currentFails + 1);

    if (currentFails >= 3) {
      this.workingProxies.delete(proxy);
      this.failedAttempts.delete(proxy);
    }
  }

  async startProxyHealthCheck() {
    setInterval(async () => {
      for (const [proxy] of this.workingProxies) {
        await this.checkProxyHealth(proxy);
      }
    }, this.proxyCheckInterval);
  }
}

module.exports = new ProxyManager(); 