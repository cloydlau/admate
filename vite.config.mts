import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'
import { parse } from 'semver'
import { presetAttributify, presetUno } from 'unocss'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import UnpluginUnused from 'unplugin-unused/vite'
import Components from 'unplugin-vue-components/vite'
import dts from 'vite-plugin-dts'
import { viteMockServe } from 'vite-plugin-mock'
import { version } from 'vue'
import type { SemVer } from 'semver'
import { name, PascalCasedName } from './package.json'

const { major, minor } = parse(version) as SemVer

/** 路径查找 */
function pathResolve(dir: string): string {
  return resolve(__dirname, '.', dir)
}

/** 设置别名 */
const alias: Record<string, string> = {
  '@': pathResolve('demo'),
}

export default {
  resolve: {
    alias,
  },
  optimizeDeps: {
    include: ['faim > qrcode', 'faim > sweetalert2', 'faim > upng-js'],
    exclude: ['vue-demi'],
  },
  build: {
    lib: {
      name,
      entry: 'src/index.js',
    },
    sourcemap: true,
    rollupOptions: {
      external: [
        'vue-demi',
      ],
      output: {
        globals: {
          [name]: PascalCasedName,
          'vue-demi': 'VueDemi',
        },
      },
    },
  },
  plugins: [
    {
      name: 'html-transform',
      transformIndexHtml(html: string) {
        return html.replace(/\{\{ NAME \}\}/, name).replace(/\{\{ VUE_VERSION \}\}/g, String(major === 3 ? major : `${major}.${minor}`))
      },
    },
    UnpluginUnused(),
    dts({ rollupTypes: true }),
    AutoImport({
      // targets to transform
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/,
        /\.vue\?vue/, // .vue
        /\.md$/, // .md
      ],
      // global imports to register
      imports: [
        // presets
        (major === 3 || (major === 2 && minor >= 7)) ? 'vue' : '@vue/composition-api',
      ],
    }),
    UnoCSS({
      presets: [
        presetAttributify(),
        presetUno(),
      ],
    }),
    Components(),
    viteMockServe(),
    { ...visualizer(), apply: 'build' },
    vue(),
  ],
}
