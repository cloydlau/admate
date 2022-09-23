import path from 'path'
import type { ConfigEnv, UserConfigExport } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
import { viteMockServe } from 'vite-plugin-mock'
import UnoCSS from 'unocss/vite'
import { presetAttributify, presetUno } from 'unocss'
import AutoImport from 'unplugin-auto-import/vite'

export function configMockPlugin(isBuild: boolean) {
  return viteMockServe({
    ignore: /^\_/,
    mockPath: 'mock',
    localEnabled: !isBuild,
    prodEnabled: isBuild,
    injectCode: `
      import { setupProdMockServer } from '../../../mock/_createProductionServer';

      setupProdMockServer();
    `,
  })
}

// https://vitejs.dev/config/
export default ({ command }: ConfigEnv): UserConfigExport => {
  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    optimizeDeps: {
      exclude: ['vue-demi'],
    },
    plugins: [
      AutoImport({
        // targets to transform
        include: [
          /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
          /\.vue$/, /\.vue\?vue/, // .vue
          /\.md$/, // .md
        ],
        // global imports to register
        imports: [
          // presets
          '@vue/composition-api',
          // 'vue-router/composables',
        ],
      }),
      createVuePlugin(),
      {
        name: 'html-transform',
        transformIndexHtml(html: string) {
          return html.replace(/\{\{VUE_VERSION\}\}/g, '2.6')
        },
      },
      UnoCSS({
        presets: [
          presetAttributify({}),
          presetUno(),
        ],
      }),
      configMockPlugin(false),
    ],
  }
}
