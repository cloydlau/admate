import type { ConfigEnv, UserConfigExport } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
import { viteMockServe } from 'vite-plugin-mock'
import Unocss from 'unocss/vite'
import { presetAttributify, presetUno } from 'unocss'

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
    optimizeDeps: {
      exclude: ['vue-demi'],
    },
    plugins: [
      createVuePlugin(),
      {
        name: 'html-transform',
        transformIndexHtml(html: string) {
          return html.replace(/\{\{VUE_VERSION\}\}/g, '2')
        },
      },
      Unocss({
        presets: [
          presetAttributify({}),
          presetUno(),
        ],
      }),
      configMockPlugin(false),
    ],
  }
}
