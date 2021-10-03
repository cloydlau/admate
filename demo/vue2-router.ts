import VueRouter from 'vue2-router'
import { Vue2 } from 'vue-demi'
Vue2.use(VueRouter)

export const routes = [
  {
    path: '/ant-design-vue-1', component: () =>
      import('./UseUIFramework/AntDesignVue1.vue')
  },
  {
    path: '/element-ui', component: () =>
      import('./UseUIFramework/ElementUI.vue')
  },
  {
    path: '/vuetify-2', component: () =>
      import('./UseUIFramework/Vuetify2.vue')
  },
  /*{
    path: '/quasar-1', component: () =>
      import('./UseUIFramework/Quasar1.vue')
  },*/
]

// 3. 创建路由实例并传递 `routes` 配置
// 你可以在这里输入更多的配置，但我们在这里
// 暂时保持简单
export default new VueRouter({
  routes
})
