import { install, Vue2 } from 'vue-demi'
import router from './vue2-router'
import App from './index.vue'

install()

import 'virtual:windi.css'

import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'
Vue2.use(ElementUI)

import 'ant-design-vue2/dist/antd.css'
import Antd from 'ant-design-vue2'
Vue2.use(Antd)

import 'vuetify2/dist/vuetify.min.css'
import Vuetify from 'vuetify2'
Vue2.use(Vuetify)

new Vue2({
  render: h => h(App),
  router,
}).$mount('#app')
