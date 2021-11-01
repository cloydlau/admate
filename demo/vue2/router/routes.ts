// 2. 定义一些路由
// 每个路由都需要映射到一个组件。
// 我们后面再讨论嵌套路由。
export default [
  {
    path: '/ant-design-vue-1', component: () =>
      import('../UseUIFramework/AntDesignVue1.vue')
  },
  {
    path: '/element-ui', component: () =>
      import('../UseUIFramework/ElementUI.vue')
  },
  {
    path: '/vuetify-2', component: () =>
      import('../UseUIFramework/Vuetify2.vue')
  },
  /*{
    path: '/quasar-1', component: () =>
      import('./UseUIFramework/Quasar1.vue')
  },*/
])
