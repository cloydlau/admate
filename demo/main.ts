import { install, createApp } from 'vue-demi'
import router from './router/vue-router'
import App from './index.vue'
import mitt from 'mitt'

install()

import 'virtual:windi.css'

import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'

import 'ant-design-vue/dist/antd.css'
import Antd from 'ant-design-vue'

//import 'vuetify/styles'
//import { createVuetify } from 'vuetify'

const app = createApp(App)
.use(router)
.use(ElementPlus)
.use(Antd)
//.use(createVuetify())

app.config.globalProperties.$eventBus = mitt()
app.mount('#app')
