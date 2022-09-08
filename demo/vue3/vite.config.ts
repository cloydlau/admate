import type { ConfigEnv, UserConfigExport } from 'vite'
// import { loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteMockServe } from 'vite-plugin-mock'
import UnoCSS from 'unocss/vite'
import { presetAttributify, presetUno } from 'unocss'
import { transformAssetUrls } from '@quasar/vite-plugin'
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
  // const env = loadEnv(mode, 'env')

  return {
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
          'vue',
          'vue-router',
        ],
      }),
      vue({
        template: { transformAssetUrls },
      }),
      UnoCSS({
        presets: [
          presetAttributify({}),
          presetUno(),
        ],
      }),
      configMockPlugin(false),
      {
        name: 'html-transform',
        transformIndexHtml(html: string) {
          return html.replace(/\{\{VUE_VERSION\}\}/g, '3')
        },
      },
    ],
  }
}
