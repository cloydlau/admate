import type { UserConfigExport, ConfigEnv } from 'vite'
//import { loadEnv } from 'vite'
//import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import { name } from './package.json'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default ({ command }: ConfigEnv): UserConfigExport => {
  //const env = loadEnv(mode, 'env')

  return {
    optimizeDeps: {
      exclude: ['vue-demi']
    },
    plugins: [
      //command.endsWith(':2') ?
      //createVuePlugin() :
      visualizer(),
      //peerDepsExternal(),
    ],
    build: {
      lib: {
        name,
        entry: 'src/main.ts'
      },
      rollupOptions: {
        external: [
          'vue',
          'vue-demi',
        ],
        output: {
          // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
          globals: {
            'vue': 'Vue',
            'vue-demi': 'VueDemi',
          }
        },
      }
    }
  }
}
