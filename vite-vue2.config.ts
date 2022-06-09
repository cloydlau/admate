import type { UserConfigExport, ConfigEnv } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
import { viteMockServe } from 'vite-plugin-mock'
import Unocss from 'unocss/vite'
import { presetUno, presetAttributify } from 'unocss'

export function configMockPlugin(isBuild: boolean) {
  return viteMockServe({
    ignore: /^\_/,
    mockPath: 'mock',
    localEnabled: !isBuild,
    prodEnabled: isBuild,
    injectCode: `
      import { setupProdMockServer } from './mock/_createProductionServer';

      setupProdMockServer();
      `,
  })
}

// https://vitejs.dev/config/
export default ({ command }: ConfigEnv): UserConfigExport => {
  return {
    optimizeDeps: {
      exclude: ['vue-demi']
    },
    server: {
      port: 3002
    },
    plugins: [
      {
        name: 'html-transform',
        transformIndexHtml(html: string) {
          return html.replace(/{{.*}}/, '/demo/vue2/index.ts')
        },
      },
      createVuePlugin(),
      Unocss({
        presets: [
          presetAttributify({}),
          presetUno(),
        ]
      }),
      configMockPlugin(false)
    ],
  }
}
