export default [
  {
    path: '/element-plus',
    component: () =>
      import('../Page.vue'),
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
