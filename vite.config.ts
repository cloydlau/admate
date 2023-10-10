import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { viteMockServe } from 'vite-plugin-mock'
import { parse } from 'semver'
import type { SemVer } from 'semver'
import { version } from 'vue'
import UnoCSS from 'unocss/vite'
import { presetAttributify, presetUno } from 'unocss'
import { PascalCasedName, name } from './package.json'

const { major, minor } = parse(version) as SemVer

export default {
  optimizeDeps: {
    exclude: ['vue-demi'],
  },
  build: {
    lib: {
      name,
      entry: 'src/index.ts',
    },
    sourcemap: true,
    rollupOptions: {
      external: [
        'vue',
        'vue-demi',
      ],
      output: {
        globals: {
          [name]: PascalCasedName,
          'vue': 'Vue',
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
    dts({ rollupTypes: true }),
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
        (major === 3 || (major === 2 && minor >= 7)) ? 'vue' : '@vue/composition-api',
      ],
    }),
    UnoCSS({
      presets: [
        presetAttributify({}),
        presetUno(),
      ],
    }),
    Components(),
    viteMockServe({
      ignore: /^\_/,
      mockPath: 'mock',
      localEnabled: true,
      prodEnabled: false,
      injectCode: `
        import { setupProdMockServer } from './mock/_createProductionServer'
        setupProdMockServer()
      `,
    }),
    vue(),
  ],
}
