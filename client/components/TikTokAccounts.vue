<template>
  <div class="tiktok-accounts-grid">
    <div v-for="account in accounts" :key="account.number" class="account-card">
      <div class="account-number">Account #{{ account.number }}</div>
      <div class="account-status">
        <div v-if="account.username" class="connected">
          Connected: @{{ account.username }}
        </div>
        <button 
          v-else 
          @click="connectAccount(account.number)"
          class="connect-btn"
        >
          Connect Account
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      accounts: Array.from({ length: 100 }, (_, i) => ({
        number: i + 1,
        username: null
      }))
    }
  },
  
  methods: {
    async connectAccount(accountNumber) {
      const width = 600;
      const height = 800;
      const left = (window.innerWidth - width) / 2;
      const top = (window.innerHeight - height) / 2;
      
      const authWindow = window.open(
        `/api/auth/tiktok/initiate?accountNumber=${accountNumber}`,
        'TikTok Auth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      window.addEventListener('message', (event) => {
        if (event.data.type === 'AUTH_SUCCESS' && 
            event.data.platform === 'tiktok') {
          const accountIndex = this.accounts.findIndex(
            acc => acc.number === event.data.accountNumber
          );
          if (accountIndex !== -1) {
            this.accounts[accountIndex].username = event.data.username;
          }
        }
      });
    }
  },

  async created() {
    try {
      // Load existing connected accounts from backend
      const response = await fetch('/api/accounts/tiktok');
      const connectedAccounts = await response.json();
      
      connectedAccounts.forEach(account => {
        const index = this.accounts.findIndex(
          acc => acc.number === account.accountNumber
        );
        if (index !== -1) {
          this.accounts[index].username = account.username;
        }
      });
    } catch (error) {
      console.error('Failed to load connected accounts:', error);
    }
  }
}
</script>

<style scoped>
.tiktok-accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  padding: 20px;
}

.account-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
}

.account-number {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.connect-btn {
  background-color: #fe2c55;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
}

.connected {
  color: #00c853;
  font-weight: 500;
}
</style> 