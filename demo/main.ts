import { createApp, install } from 'vue-demi'
import router from './router'
import App from './index.vue'

install()

import 'virtual:windi.css'

import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'

import 'ant-design-vue/dist/antd.css'
import Antd from 'ant-design-vue'

//import 'vuetify/styles'
//import { createVuetify } from 'vuetify'

createApp(App)
.use(router)
.use(ElementPlus)
.use(Antd)
//.use(createVuetify())
.mount('#app')