import Vue from 'vue'
import router from './router'
import App from './index.vue'

//install()

import 'uno.css'

import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'
Vue.use(ElementUI)

import 'ant-design-vue/dist/antd.css'
import Antd from 'ant-design-vue'
Vue.use(Antd)

import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/dist/vuetify.min.css'
import Vuetify from 'vuetify'
Vue.use(Vuetify)

/*import 'primeicons/primeicons.css'
import 'primevue/resources/themes/lara-light-indigo/theme.css'
import 'primevue/resources/primevue.min.css'
import PrimeVue from 'primevue/config'
Vue.use(PrimeVue)*/

new Vue({
  render: h => h(App),
  router,
  vuetify: new Vuetify({}),
}).$mount('#app')
