import Vue from 'vue'
import router from './router'

import 'uno.css'

import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'

import 'kikimore/dist/style.css'
import Kikimore from 'kikimore'

import 'ant-design-vue1/dist/antd.css'
import Antd from 'ant-design-vue1'

import '@mdi/font/css/materialdesignicons.css'
import 'vuetify2/dist/vuetify.min.css'
import Vuetify from 'vuetify2'
import App from './index.vue'
Vue.use(ElementUI)
Vue.use(Kikimore)
Vue.use(Antd)
Vue.use(Vuetify)

/* import 'primeicons/primeicons.css'
import 'primevue/resources/themes/lara-light-indigo/theme.css'
import 'primevue/resources/primevue.min.css'
import PrimeVue from 'primevue/config'
Vue.use(PrimeVue) */

new Vue({
  render: h => h(App),
  router,
  vuetify: new Vuetify({}),
}).$mount('#app')
