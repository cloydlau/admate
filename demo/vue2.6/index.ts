import Vue from 'vue'

import 'uno.css'

import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'
import { FaFormDialog, FaSelect } from 'faim'
import FaimLocale from 'faim/dist/locale/zh-cn.mjs'

import App from './index.vue'
import router from './router'

Vue.use(ElementUI)
Vue.use(FaFormDialog, { locale: FaimLocale.FaFormDialog, width: `${window.outerWidth / 2}px` })
Vue.use(FaSelect, { locale: FaimLocale.FaSelect })

new Vue({
  render: h => h(App),
  router,
}).$mount('#app')
