import { createApp } from 'vue'

import 'uno.css'

import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'

import AntD from 'ant-design-vue'

import 'quasar/src/css/index.sass'
import { Quasar } from 'quasar'

import Aura from '@primevue/themes/aura'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import App from './index.vue'
import router from './router/vue-router'

const app = createApp(App)
  .use(router)
  .use(ElementPlus)
  .use(AntD)
  .use(Quasar, {
    plugins: {},
  })
  .use(PrimeVue, {
    theme: {
      preset: Aura,
    },
  })
  .use(ToastService)
  .use(createVuetify({
    components,
    directives,
  }))

app.mount('#app')
