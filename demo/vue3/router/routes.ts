export default [
  {
    path: '/vuetify',
    component: () =>
      import('../UseUIFramework/Vuetify.vue'),
  },
  {
    path: '/ant-design-vue',
    component: () =>
      import('../UseUIFramework/AntDesignVue.vue'),
  },
  {
    path: '/element-plus',
    component: () =>
      import('../UseUIFramework/ElementPlus.vue'),
  },
  {
    path: '/quasar',
    component: () =>
      import('../UseUIFramework/Quasar.vue'),
  },
  {
    path: '/prime-vue',
    component: () =>
      import('../UseUIFramework/PrimeVue.vue'),
  },
  {
    path: '/form-externalized',
    component: () =>
      import('../examples/FormExternalized.vue'),
  },
  {
    path: '/form-decoupled',
    component: () =>
      import('../examples/FormDecoupled.vue'),
  },
  {
    path: '/form-page',
    hidden: true,
    props: true,
    component: () =>
      import('../examples/FormPage.vue'),
  },
  {
    path: '/nested',
    component: () =>
      import('../examples/Nested.vue'),
  },
  {
    path: '/form-only',
    component: () =>
      import('../examples/FormOnly.vue'),
  },
]
