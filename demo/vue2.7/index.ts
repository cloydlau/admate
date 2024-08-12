import Vue from 'vue'

import 'uno.css'

import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'
import { FaFormDialog, FaSelect } from 'faim'

import App from './index.vue'
import router from './router'

Vue.use(ElementUI)
Vue.use(FaFormDialog)
Vue.use(FaSelect)

new Vue({
  render: h => h(App),
  router,
}).$mount('#app')
