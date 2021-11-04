import Vue2 from 'vue'
import router from './router'
import App from './index.vue'

//install()

import 'uno.css'

import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'
Vue2.use(ElementUI)

import 'ant-design-vue/dist/antd.css'
import Antd from 'ant-design-vue'
Vue2.use(Antd)

import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/dist/vuetify.min.css'
import Vuetify from 'vuetify'
Vue2.use(Vuetify)

new Vue2({
  render: h => h(App),
  router,
  vuetify: new Vuetify({}),
}).$mount('#app')
