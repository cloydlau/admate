import { isVue2 } from 'vue-demi'

// 2. 定义一些路由
// 每个路由都需要映射到一个组件。
// 我们后面再讨论嵌套路由。
export default [].concat(isVue2 ? [
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
] : [
  {
    path: '/ant-design-vue', component: () =>
      import('../UseUIFramework/AntDesignVue.vue')
  },
  {
    path: '/element-plus', component: () =>
      import('../UseUIFramework/ElementPlus.vue')
  },
  {
    path: '/element-plus-without-row-form', component: () =>
      import('../UseUIFramework/ElementPlusWithoutRowForm.vue')
  },
  {
    path: '/row-form',
    hidden: true,
    props: true,
    component: () =>
      import('../UseUIFramework/RowForm.vue')
  },
  /*{
    path: '/vuetify', component: () =>
      import('./UseUIFramework/Vuetify.vue')
  },*/
])
