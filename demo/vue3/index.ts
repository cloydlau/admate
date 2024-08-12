import { createApp } from 'vue'

import 'uno.css'

import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'

import App from './index.vue'
import router from './router/vue-router'

const app = createApp(App)
  .use(router)
  .use(ElementPlus)

app.config.globalProperties.console = console

app.mount('#app')
