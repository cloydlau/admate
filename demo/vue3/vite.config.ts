import type { UserConfigExport, ConfigEnv } from 'vite'
//import { loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
//import { createVuePlugin } from 'vite-plugin-vue2'
//import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import { viteMockServe } from 'vite-plugin-mock'
import Unocss from 'unocss/vite'
import { presetUno, presetAttributify } from 'unocss'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import { visualizer } from 'rollup-plugin-visualizer'

export function configMockPlugin (isBuild: boolean) {
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
    server: {
      port: 3003
    },
    plugins: [
      {
        name: 'html-transform',
        transformIndexHtml (html: string) {
          return html.replace(/{{.*}}/, '/main.ts')
        },
      },
      //command.endsWith(':2') ?
      //createVuePlugin() :
      vue({
        template: { transformAssetUrls }
      }),
      visualizer(),
      quasar({
        sassVariables: 'src/quasar-variables.sass'
      }),
      //peerDepsExternal(),
      ...command === 'build' ? [] : [
        Unocss({
          presets: [
            presetAttributify({}),
            presetUno(),
          ]
        }),
        configMockPlugin(false)
      ],
    ],
  }
}
