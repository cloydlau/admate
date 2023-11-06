import Vue from 'vue'
import router from './router'

import 'uno.css'

import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'

import { FaFormDialog, FaSelect } from 'faim'

import 'ant-design-vue/dist/antd.css'
import AntD from 'ant-design-vue'

import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/dist/vuetify.min.css'
import Vuetify from 'vuetify'
import App from './index.vue'

Vue.use(ElementUI)
Vue.use(FaFormDialog)
Vue.use(FaSelect)
Vue.use(AntD)
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
