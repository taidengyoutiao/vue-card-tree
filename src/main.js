import Vue from 'vue'
import App from './App.vue'

Vue.config.silent = false

new Vue({
  render: h => h(App),
}).$mount('#app')
