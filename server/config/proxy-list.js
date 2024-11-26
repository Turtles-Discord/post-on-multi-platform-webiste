const axios = require('axios');

class ProxyList {
  constructor() {
    this.proxies = [];
    this.currentIndex = 0;
    this.lastFetch = null;
    this.fetchInterval = 30 * 60 * 1000; // 30 minutes
  }

  async loadProxies() {
    // If using a proxy provider API
    if (process.env.PROXY_PROVIDER_API_KEY) {
      try {
        const response = await axios.get(process.env.PROXY_PROVIDER_API_URL, {
          headers: {
            'Authorization': `Bearer ${process.env.PROXY_PROVIDER_API_KEY}`
          }
        });
        this.proxies = response.data.proxies;
      } catch (error) {
        console.error('Failed to fetch proxies from API:', error);
        // Fall back to static list
        this.loadStaticProxies();
      }
    } else {
      this.loadStaticProxies();
    }
    
    this.lastFetch = Date.now();
  }

  loadStaticProxies() {
    // Fallback static proxy list
    this.proxies = [
      {
        host: 'proxy1.example.com',
        port: '8080',
        username: 'user1',
        password: 'pass1',
        country: 'US'
      },
      {
        host: 'proxy2.example.com',
        port: '8080',
        username: 'user2',
        password: 'pass2',
        country: 'UK'
      }
      // Add more proxies here
    ];
  }

  async getNextProxy() {
    // Refresh proxy list if needed
    if (!this.lastFetch || Date.now() - this.lastFetch > this.fetchInterval) {
      await this.loadProxies();
    }

    if (this.proxies.length === 0) {
      throw new Error('No proxies available');
    }

    const proxy = this.proxies[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
    return proxy;
  }

  async getProxyByCountry(country) {
    const proxy = this.proxies.find(p => p.country.toLowerCase() === country.toLowerCase());
    return proxy || await this.getNextProxy();
  }
}

module.exports = new ProxyList(); 