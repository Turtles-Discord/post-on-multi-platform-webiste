<template>
  <div id="app">
    <router-view></router-view>
    <TikTokAccounts />
  </div>
</template>

<script>
import TikTokAccounts from './components/TikTokAccounts.vue'

export default {
  name: 'App',
  components: {
    TikTokAccounts
  }
}
</script> 