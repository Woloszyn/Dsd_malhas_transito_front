import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
// import VueSocketIOExt from 'vue-socket.io-extended';
// import { io } from 'socket.io-client';

// const socket = io('http://localhost:8075');

Vue.config.productionTip = false

// Vue.use(VueSocketIOExt, socket);

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
