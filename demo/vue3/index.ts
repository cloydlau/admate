import ElementPlus from 'element-plus'

import { FaFormDialog, FaSelect } from 'faim'

import FaimLocale from 'faim/dist/locale/zh-cn.mjs'
import { createApp } from 'vue'
import App from './index.vue'
import router from './router/vue-router'

import 'uno.css'
import 'element-plus/dist/index.css'

const app = createApp(App)
  .use(router)
  .use(ElementPlus)
  .use(FaFormDialog, { locale: FaimLocale.FaFormDialog, width: `${window.outerWidth / 2}px` })
  .use(FaSelect, { locale: FaimLocale.FaSelect })

app.config.globalProperties.console = console

app.mount('#app')
