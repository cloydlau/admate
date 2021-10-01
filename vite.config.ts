import type { UserConfigExport, ConfigEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import { name } from './package.json'
import { viteMockServe } from 'vite-plugin-mock'
import WindiCSS from 'vite-plugin-windicss'

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
  return {
    plugins: [
      vue(),
      peerDepsExternal(),
      WindiCSS(),
      command !== 'build' && configMockPlugin(command === 'build')
    ],
    build: {
      lib: {
        name,
        entry: 'src/main.ts'
      },
      rollupOptions: {
        output: {
          // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
          globals: {
            axios: 'axios'
          }
        },
      }
    }
  }
}
