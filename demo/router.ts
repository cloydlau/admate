import { isVue2 } from 'vue-demi'
import { createRouter, createWebHashHistory } from 'vue-router'
import Router from 'vue2-router'

// 2. 定义一些路由
// 每个路由都需要映射到一个组件。
// 我们后面再讨论嵌套路由。
export const routes = [
  /*{ path: '/quasar-2', component: () =>
   import('./UseUIFramework/Quasar2.vue') },
  { path: '/quasar-1', component: () =>
   import('./UseUIFramework/Quasar1.vue') },
  { path: '/vuetify-3', component: () =>
      import('./UseUIFramework/Vuetify.vue') },
  { path: '/vuetify-2', component: () =>
      import('./UseUIFramework/Vuetify2.vue') },*/
  ...isVue2 ? [
    {
      path: '/ant-design-vue-2', component: () =>
        import('./UseUIFramework/AntDesignVue2.vue')
    },
    {
      path: '/element-ui', component: () =>
        import('./UseUIFramework/ElementUI.vue')
    },] : [
    {
      path: '/ant-design-vue', component: () =>
        import('./UseUIFramework/AntDesignVue.vue')
    },
    {
      path: '/element-plus', component: () =>
        import('./UseUIFramework/ElementPlus.vue')
    },
  ],
]

// 3. 创建路由实例并传递 `routes` 配置
// 你可以在这里输入更多的配置，但我们在这里
// 暂时保持简单
export default isVue2 ? new Router({
  routes
}) : createRouter({
  // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
  history: createWebHashHistory(),
  routes, // `routes: routes` 的缩写
})
