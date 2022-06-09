/*const fs = require('fs')
const path = require('path')

const Vue2 = path.join(__dirname, '../node_modules/vue2')
const DefaultVue = path.join(__dirname, '../node_modules/vue')
const Vue3 = path.join(__dirname, '../node_modules/vue3')*/

const execa = require('execa')
const run = (bin, args, opts = {}) =>
  execa(bin, args, { stdio: 'inherit', ...opts })
const { dependencies, devDependencies } = require('../package.json')
const { prompt } = require('enquirer')

const vue3Deps = [
  '@vitejs/plugin-vue',
  '@vue/compiler-sfc',
  'vue-router',
  'element-plus',
  '@quasar/extras',
  '@quasar/vite-plugin',
  'ant-design-vue',
  'primevue',
  'quasar',
  'vuetify@^3.0.0-beta.3',
], vue2Deps = [
  '@vue/composition-api',
  'vue-router@3',
  'element-ui',
  'vite-plugin-vue2',
  'vue-template-compiler',
  '@mdi/font',
  'ant-design-vue@1',
  'primevue@2',
  'vuetify@2',
]

const targetVersion = Number(process.argv[2]) || 3
let currentVersion
try {
  currentVersion = require('vue').version
} catch { }

useVueVersion(targetVersion)

async function removeDeps(deps) {
  const depsInstalled = deps.filter(dep => dep in devDependencies || dep in dependencies)
  if (depsInstalled.length) {
    await run('pnpm', ['remove', ...depsInstalled, '-D'])
  }
}

async function useVueVersion(targetVersion) {
  if (
    (
      !currentVersion ||
      (currentVersion.startsWith('2') || currentVersion.substring(1).startsWith('2'))
    ) &&
    targetVersion === 3
  ) {
    const { yes } = await prompt({
      type: 'confirm',
      name: 'yes',
      message: `是否切换至 Vue 3？`
    })
    if (!yes) {
      return
    }

    await removeDeps(vue2Deps)
    await run('pnpm', ['add', ...vue3Deps, '-D'])
    await run('pnpm', ['add', 'vue@latest', '@vue/test-utils@latest', '-D'])
    await run('npx', ['vue-demi-switch', '3'])
    console.warn('Vue 版本已切换至 3')
  } else if (
    (
      !currentVersion ||
      (currentVersion === 'latest' || currentVersion.startsWith('3') || currentVersion.substring(1).startsWith('3'))
    ) &&
    targetVersion === 2
  ) {
    const { yes } = await prompt({
      type: 'confirm',
      name: 'yes',
      message: `是否切换至 Vue 2？`
    })
    if (!yes) {
      return
    }

    await removeDeps(vue3Deps)
    await run('pnpm', ['add', ...vue2Deps, '-D'])
    await run('pnpm', ['add', 'vue@2', '@vue/test-utils@1', '-D'])
    await run('npx', ['vue-demi-switch', '2'])
    console.warn('Vue 版本已切换至 2')
  } else {
    console.warn('Vue 版本未切换')
  }
  /*if (!fs.existsSync(DefaultVue)) {
    console.log('There is no default Vue version, finding it')
    if (targetVersion === 2 && fs.existsSync(Vue3)) {
      rename(Vue3, DefaultVue)
      console.log('Renamed "vue3" to "vue"')
    } else {
      rename(Vue2, DefaultVue)
      console.log('Renamed "vue2" to "vue"')
    }
  }

  if (targetVersion === 3 && fs.existsSync(Vue3)) {
    rename(DefaultVue, Vue2)
    rename(Vue3, DefaultVue)
  } else if (targetVersion === 2 && fs.existsSync(Vue2)) {
    rename(DefaultVue, Vue3)
    rename(Vue2, DefaultVue)
  } else {
    console.log(`Vue ${targetVersion} is already in use`)
  }*/
}

/*function rename (fromPath, toPath) {
  if (!fs.existsSync(fromPath)) return
  fs.rename(fromPath, toPath, function (err) {
    if (err) {
      console.log(err)
    } else {
      console.log(`Successfully renamed ${fromPath} to ${toPath}.`)
    }
  })
}*/
