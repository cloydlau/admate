import { computed, getCurrentInstance, onMounted, reactive, ref, toRefs, watch } from 'vue'
import { FaMessageBox } from 'faim'
import { cloneDeep, merge, mergeWith } from 'lodash-es'
import qs from 'qs'
import useAdmate from '../../src'
import http from '@/utils/http'

export default (
  admateConfig,
  {
    // 列表筛选参数的初始值，用于动态获取的参数，比如时间
    // 时间类的参数，如果直接绑定在 list.filter 中，在重置时，时间不会更新
    // 所以需要调方法动态获取
    // 可访问 this（组件实例）
    initialListFilter = function () {},

    // 获取列表筛选项的表单 ref
    // 可访问 this（组件实例）
    getElFormRefOfListFilter = function () {
      return this.$refs.listFilterRef
    },

    // 校验列表筛选项
    // 可访问 this（组件实例）
    validateListFilter = function () {
      return getElFormRefOfListFilter()?.validate()
    },

    // 清除列表筛选项校验
    // 可访问 this（组件实例）
    clearValidateOfListFilter = function () {
      return getElFormRefOfListFilter()?.clearValidate()
    },

    // 重置列表筛选项
    // 可访问 this（组件实例）
    resetListFilter = function () {
      return getElFormRefOfListFilter().resetFields()
    },

    // 是否在初始化时读取列表
    readListImmediately = true,

    // 表单标题
    formTitleMap = {
      create: '新增',
      read: '查看',
      update: '编辑',
    },

    // 获取详情的表单 ref
    // 可访问 this（组件实例）
    // this 判空原因：只有表单没有列表时，openForm 会在 setup 时执行
    getElFormRefOfFormData = function () {
      return this?.$refs.formRef
    },

    // 校验详情表单
    // 可访问 this（组件实例）
    validateFormData = function () {
      return getElFormRefOfFormData().validate()
    },

    // 清除详情表单校验
    // 可访问 this（组件实例）
    clearValidateOfFormData = function () {
      return getElFormRefOfFormData()?.clearValidate()
    },

    // 自定义钩子函数 - 读取列表后
    // 参数1为接口返回值，参数2为触发动机
    // 可访问 this（组件实例）
    onListRead = function () {},

    // 自定义钩子函数 - 读取表单后（新增时不触发）
    // 参数为接口返回值
    // 可访问 this（组件实例）
    onFormRead = function () {},

    // 自定义钩子函数 - 打开表单后
    // 参数为接口返回值（新增时为空）
    // 可访问 this（组件实例）
    onFormOpened = function () {},

    // 自定义钩子函数 - 提交表单前
    // 参数为 form
    // 可访问 this（组件实例）
    // 返回 false 以阻止提交
    onFormSubmit = function () {},

    // 自定义钩子函数 - 提交表单后
    // 参数为接口返回值
    // 可访问 this（组件实例）
    onFormSubmitted = function () {},
  }
  = {},
) => {
  // 获取当前 Vue 实例
  const currentInstance = ref()
  // 列表筛选项的 ref
  const listFilterRef = ref()
  // 详情的 ref
  const formRef = ref()

  // 初始化 admate
  const { list, form } = useAdmate(
    merge(
      {
        axios: http,
        axiosConfig: {
          list: {
            read: {
              url: 'list',
              method: 'POST',
            },
          },
          form: {
            create: {
              method: 'POST',
            },
            read: {
              method: 'GET',
            },
            update: {
              method: 'POST',
            },
            delete: {
              method: 'POST',
            },
            switch: {
              url: 'status',
              method: 'POST',
            },
          },
        },
        list: {
          // 读取列表接口的默认参数
          filter: {
            // 页容量
            // 注意：如果修改了默认值，需要同步修改 el-pagination 组件 pageSize 参数的值
            page: {
              pageSize: 10,
            },

            // 动态的默认参数
            ...initialListFilter(),

            // 支持路由传参
            // 因为 qs 支持数组，所以没有使用 vue-router
            // 跳转方式：
            // this.$router.push('path' + qs.stringify(query, { addQueryPrefix: true }))
            ...qs.parse(window.location.hash.split('?')[1]),
          },
          dataAt: 'records',
          totalAt: data => Number(data.total),
          pageNumberAt: 'page.pageNo',
          watchFilter: false,
          proxy: {
            read(readList, trigger) {
              if (!readListImmediately && trigger === 'immediate') {
                return
              }

              function readListWithHook() {
                return readList().then((data) => {
                  onListRead(data, trigger)
                  return data
                })
              }

              if (trigger === 'filterChange') {
                const promise = validateListFilter()
                if (promise) {
                  promise.then(() => {
                    return readListWithHook()
                  })
                }
                else {
                  return readListWithHook()
                }
              }
              else {
                if (['create', 'update', 'delete', 'switch'].includes(trigger)) {
                  FaMessageBox.success('操作成功')
                }
                return readListWithHook()
              }
            },
          },
        },
        form: {
          // dataAt: "data",
          // 接口返回值中嵌套的对象可能为 null，会覆盖默认值中的空对象/空数组
          mergeData(newFormData) {
            form.data = mergeWith(
              cloneDeep(form.data),
              newFormData,
              (oldObj, newObj) =>
                [undefined, null].includes(newObj) ? oldObj : undefined,
            )
          },
          proxy: {
            open(openForm) {
              // 打开表单后的回调
              // function callback(res?) {
              function callback(res) {
                let endState = onFormOpened(res)
                if (form.status !== 'create') {
                  endState = onFormRead(res)
                }

                // 回显表单后，清除校验
                setTimeout(() => {
                  clearValidateOfFormData()
                }, 0)

                return endState
              }

              const promise = openForm()
              if (promise) {
                return new Promise((resolve, reject) => {
                  promise
                    .then((res) => {
                      // 返回值用于设置 form 的终态
                      resolve(callback(res))
                    })
                    .catch((e) => {
                      console.error(e)
                      // 返回值用于设置 form 的终态
                      reject(callback(e))
                    })
                })
              }
              else {
                // 新增、复用列表数据时 openForm 没有返回值
                return callback()
              }
            },
            submit(submitForm) {
              return new Promise((resolve, reject) => {
                const proceed = () => {
                  submitForm()
                    .then((res) => {
                      // 返回值用于设置 form 的终态
                      resolve(onFormSubmitted(res))
                    })
                    .catch((e) => {
                      console.error(e)
                      // 返回值用于设置 form 的终态
                      reject(onFormSubmitted(e))
                    })
                }
                validateFormData().then(async () => {
                  const result = await onFormSubmit(form)
                  if (result instanceof Promise) {
                    result
                      .then(() => {
                        proceed()
                      })
                      .catch((e) => {
                        console.error(e)
                        reject(new Error(e))
                      })
                  }
                  else if (result === false) {
                    reject(new Error('validate Data Error'))
                  }
                  else {
                    proceed()
                  }
                })
              })
            },
          },
        },
      },
      admateConfig,
    ),
  )

  // 关闭表单时，清除校验
  watch(
    () => form.show,
    (n) => {
      if (!n) {
        setTimeout(() => {
          clearValidateOfFormData()
        }, 150)
      }
    },
  )

  function initializeListFilter() {
    const elFormRefOfListFilter = getElFormRefOfListFilter()
    if (elFormRefOfListFilter) {
      // Object.defineProperty 对不存在的属性无法拦截
      list.filter = reactive({
        ...Object.fromEntries(
          Array.from(elFormRefOfListFilter.fields || [], v => [
            // (v as FormItemInstance).labelFor,
            v.labelFor,
            undefined,
          ]),
        ),
        ...list.filter,
      })
    }
  }

  onMounted(() => {
    currentInstance.value = getCurrentInstance().proxy

    initialListFilter = initialListFilter.bind(currentInstance.value)
    getElFormRefOfListFilter = getElFormRefOfListFilter.bind(
      currentInstance.value,
    )
    validateListFilter = validateListFilter.bind(currentInstance.value)
    resetListFilter = resetListFilter.bind(currentInstance.value)

    getElFormRefOfFormData = getElFormRefOfFormData.bind(currentInstance.value)
    clearValidateOfFormData = clearValidateOfFormData.bind(
      currentInstance.value,
    )
    validateFormData = validateFormData.bind(currentInstance.value)

    onListRead = onListRead.bind(currentInstance.value)
    onFormRead = onFormRead.bind(currentInstance.value)
    onFormOpened = onFormOpened.bind(currentInstance.value)
    onFormSubmit = onFormSubmit.bind(currentInstance.value)
    onFormSubmitted = onFormSubmitted.bind(currentInstance.value)

    initializeListFilter.call(currentInstance.value)
  })

  return toRefs(
    reactive({
      // 列表
      list,
      // 列表筛选项表单的 ref
      listFilterRef,
      // 给筛选项赋初值，使得重置功能能够正常工作
      initializeListFilter,
      // 校验列表筛选项
      validateListFilter,
      // 清除列表筛选项校验
      clearValidateOfListFilter,
      // 重置列表
      resetList: () => {
        resetListFilter()
        if (initialListFilter) {
          list.filter = {
            ...list.filter,
            ...initialListFilter(),
          }
        }
        if (!list.watchFilter) {
          list.read()
        }
      },
      // 校验筛选项并读取列表首页
      queryList: async (...args) => {
        await validateListFilter()
        list.filter.page.pageNo = 1
        list.read(...args)
      },
      // 表单
      form,
      // 详情的 ref
      formRef,
      // 表单标题
      formTitle: computed(() => formTitleMap[form.status]),
      // 表单标题字典
      formTitleMap,
    }),
  )
}
