import Vue from 'vue'
import App from './App.vue'
import '../public/icons/style.css'

Vue.config.silent = false

new Vue({
  render: h => h(App),
}).$mount('#app')
