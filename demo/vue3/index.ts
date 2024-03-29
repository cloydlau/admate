import { createApp } from 'vue'
import router from './router/vue-router'

// install()

import 'uno.css'

import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'

import AntD from 'ant-design-vue'

import 'quasar/src/css/index.sass'
import { Quasar } from 'quasar'

import 'primeicons/primeicons.css'
import 'primevue/resources/themes/lara-light-indigo/theme.css'
import 'primevue/resources/primevue.min.css'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import App from './index.vue'

const app = createApp(App)
  .use(router)
  .use(ElementPlus)
  .use(AntD)
  .use(Quasar, {
    plugins: {},
  })
  .use(PrimeVue)
  .use(ToastService)
  .use(createVuetify({
    components,
    directives,
  }))

app.mount('#app')
