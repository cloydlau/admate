import type { UserConfigExport, ConfigEnv } from 'vite'
//import { loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteMockServe } from 'vite-plugin-mock'
import Unocss from 'unocss/vite'
import { presetUno, presetAttributify } from 'unocss'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

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
  //const env = loadEnv(mode, 'env')

  return {
    optimizeDeps: {
      exclude: ['vue-demi']
    },
    server: {
      port: 3003
    },
    plugins: [
      Unocss({
        presets: [
          presetAttributify({}),
          presetUno(),
        ]
      }),
      configMockPlugin(false),
      {
        name: 'html-transform',
        transformIndexHtml(html: string) {
          return html.replace(/{{.*}}/, '/demo/vue3/index.ts')
        },
      },
      //command.endsWith(':2') ?
      //createVuePlugin() :
      vue({
        template: { transformAssetUrls }
      }),
      quasar({
        sassVariables: 'src/quasar-variables.sass'
      }),
    ],
  }
}
