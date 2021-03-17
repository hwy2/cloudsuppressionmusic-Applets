import Vue from 'vue'
import App from './App'
// 引入vuex
import store from './store'
Vue.prototype.$store = store;
Vue.config.productionTip = false

import "public.js"

App.mpType = 'app'
const app = new Vue({
	...App,
	store
})
app.$mount()
