// 告诉 Rollup 如何查找外部模块
import resolve from '@rollup/plugin-node-resolve'
// 目前， npm 中的大多数包都是以 CommonJS 模块的形式出现的。 在它们更改之前，我们需要将 CommonJS 模块转换为 ES2015 供 Rollup 处理。
import commonjs from '@rollup/plugin-commonjs'
import pkg, { name } from './package.json'
import babel from '@rollup/plugin-babel'
import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'
import serve from 'rollup-plugin-serve'
import json from '@rollup/plugin-json'
import livereload from 'rollup-plugin-livereload'

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        name,
        file: pkg.main,
        format: 'umd',
        sourcemap: true,
      },
    ],
    plugins: [
      resolve(),
      commonjs(), // 应该用在其他插件转换你的模块之前 - 这是为了防止其他插件的改变破坏 CommonJS 的检测
      typescript(),
      json(),
      ...process.env.NODE_ENV === 'development' ? [
        serve({
          open: true,
          openPage: '/public/index.html',
        }),
        livereload(),
      ] : [
        babel({ babelHelpers: 'bundled', exclude: 'node_modules/**' }),
        terser()
      ],
    ]
  },
]
