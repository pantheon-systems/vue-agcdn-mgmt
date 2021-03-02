import Vue from 'vue'
import App from './App.vue'

import axios from 'axios';
Vue.prototype.$api = axios.create({
  baseURL: 'https://us-central1-pantheon-psapps.cloudfunctions.net/advcdn/client_management',
  // baseURL: 'https://8911e4411299.ngrok.io/client_management',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
}).$mount('#app');
