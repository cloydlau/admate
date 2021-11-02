import type { UserConfigExport, ConfigEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
//import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import { name } from './package.json'
import { viteMockServe } from 'vite-plugin-mock'
import Unocss from 'unocss/vite'

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

const transformIndexHtml = (code, command) => {
  console.log(1, command.server.config.command)
  return code.replace(/__ENTRY__/, command.server.config.command.endsWith(':2') ?
    '/demo/vue3/main.ts' : '/demo/vue2/main.ts')
}

// https://vitejs.dev/config/
export default ({ command }: ConfigEnv): UserConfigExport => {
  console.log('command', command)
  return {
    optimizeDeps: {
      exclude: ['vue-demi', '__ENTRY__']
    },
    plugins: [
      {
        name: 'set-entry',
        enforce: 'pre',
        transform (code, id) {
          if (id.endsWith('index.html')) {
            console.log('id', id)
            return { code: transformIndexHtml(code, command), map: null }
          }
        },
        // production时不会触发
        transformIndexHtml,
      },
      vue(),
      //peerDepsExternal(),
      ...command === 'build' ? [] : [
        Unocss({ /* options */ }),
        configMockPlugin(false)
      ]
    ],
    build: {
      lib: {
        name,
        entry: 'src/main.ts'
      },
      rollupOptions: {
        external: [
          'axios',
          'vue',
          'vue-demi',
        ],
        output: {
          // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
          globals: {
            'axios': 'axios',
            'vue': 'Vue',
            'vue-demi': 'VueDemi',
          }
        },
      }
    }
  }
}
