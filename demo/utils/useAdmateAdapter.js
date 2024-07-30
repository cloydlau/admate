import { computed, getCurrentInstance, onMounted, reactive, ref, toRefs, watch } from 'vue'

/* import type { Form, FormStatus, GetListTrigger } from "admate";
import type {
  FormInstance,
  FormItemInstance,
  FormValidationResult
} from "element-plus"; */
import { FaMessageBox } from 'faim'
import { cloneDeep, merge, mergeWith } from 'lodash-es'
import qs from 'qs'
import useAdmate from '../../src'

import http from '@/utils/http'

// Vue@2.6 or earlier only
/* import Vue from "vue";
import VueCompositionAPI from "@vue/composition-api";
Vue.use(VueCompositionAPI); */

const formTitleMapDefault = {
  c: '新增',
  r: '查看',
  u: '编辑',
}

export default (
  admateConfig,
  {
    // 表单标题
    formTitleMap = formTitleMapDefault,

    // 是否在初始化时读取列表
    getListInitially = true,

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

    // 重置列表筛选项
    // 可访问 this（组件实例）
    resetListFilter = function () {
      return getElFormRefOfListFilter().resetFields()
    },

    // 获取详情的表单 ref
    // 可访问 this（组件实例）
    // this 判空原因：只有表单没有列表时，openForm 会在 setup 时执行
    getElFormRefOfFormData = function () {
      return this?.$refs.formRef
    },

    // 清除详情表单校验
    // 可访问 this（组件实例）
    clearValidateOfFormData = function () {
      return getElFormRefOfFormData()?.clearValidate()
    },

    // 校验详情表单
    // 可访问 this（组件实例）
    validateFormData = function () {
      return getElFormRefOfFormData().validate()
    },

    // 自定义钩子函数 - 读取列表后
    // 参数1为接口返回值，参数2为触发动机
    // 可访问 this（组件实例）
    afterGetList = function () {},

    // 自定义钩子函数 - 读取表单后（新增时不触发）
    // 参数为接口返回值
    // 可访问 this（组件实例）
    afterRetrieve = function () {},

    // 自定义钩子函数 - 打开表单后
    // 参数为接口返回值（新增时为空）
    // 可访问 this（组件实例）
    afterOpenForm = function () {},

    // 自定义钩子函数 - 提交表单前
    // 参数为 form
    // 可访问 this（组件实例）
    // 返回 false 以阻止提交
    beforeSubmit = function () {},

    // 自定义钩子函数 - 提交表单后
    // 参数为接口返回值
    // 可访问 this（组件实例）
    afterSubmit = function () {},

    // 是否为复制新增
    checkCopy = function () {
      return false
    },
  }
  /* : {
    formTitleMap?: Record<FormStatus, string>;
    getListInitially?: boolean;
    initialListFilter?: (...args: any) => Record<keyof any, any> | void;
    getElFormRefOfListFilter?: () => FormInstance;
    validateListFilter?: () => FormValidationResult | void;
    resetListFilter?: () => void;
    getElFormRefOfFormData?: () => FormInstance;
    clearValidateOfFormData?: () => void;
    validateFormData?: () => FormValidationResult;
    afterGetList?: (res: any, trigger: GetListTrigger) => unknown;
    afterRetrieve?: (res: any) => void;
    afterOpenForm?: (res: any) => void;
    beforeSubmit?: (form: Form) => Promise<unknown> | boolean | void;
    afterSubmit?: (form: Form | void) => void;
  } */
  = {},
) => {
  // 获取当前 Vue 实例
  const currentInstance = ref()
  // 列表筛选项的 ref
  const listFilterRef = ref()
  // 详情的 ref
  const formRef = ref()

  // 初始化 admate
  const {
    list,
    getList,
    form,
    openForm,
    submitForm,
    d,
    enable,
    disable,
    updateStatus,
  } = useAdmate(
    merge(
      {
        axios: http,
        axiosConfig: {
          c: {
            method: 'POST',
          },
          r: {
            method: 'GET',
          },
          u: {
            method: 'POST',
          },
          d: {
            method: 'POST',
          },
          getList: {
            url: 'list',
            method: 'POST',
          },
          enable: {
            url: 'enable',
            method: 'POST',
          },
          disable: {
            url: 'disable',
            method: 'POST',
          },
          updateStatus: {
            url: 'status',
            method: 'POST',
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
        },
        getListProxy(getList, trigger) {
          if (!getListInitially && trigger === 'init') {
            return
          }

          function GetList() {
            getList().then((data) => {
              afterGetList(data, trigger)
            })
          }

          if (trigger === 'filterChange') {
            const promise = validateListFilter()
            if (promise) {
              promise.then(() => {
                GetList()
              })
            }
            else {
              GetList()
            }
          }
          else {
            GetList()
            if (
              ['c', 'u', 'd', 'updateStatus', 'enable', 'disable'].includes(
                trigger,
              )
            ) {
              FaMessageBox.success('操作成功')
            }
          }
        },
        openFormProxy(openForm) {
          // 打开表单后的回调
          // function callback(res?) {
          function callback(res) {
            let endState = afterOpenForm(res)
            if (form.status !== 'c') {
              endState = afterRetrieve(res)
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
        submitFormProxy(submitForm) {
          return new Promise((resolve, reject) => {
            const proceed = () => {
              submitForm()
                .then((res) => {
                  // 返回值用于设置 form 的终态
                  resolve(afterSubmit(res))
                })
                .catch((e) => {
                  console.error(e)
                  // 返回值用于设置 form 的终态
                  reject(afterSubmit(e))
                })
            }
            validateFormData().then(async () => {
              const result = await beforeSubmit(form)
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

    afterGetList = afterGetList.bind(currentInstance.value)
    afterRetrieve = afterRetrieve.bind(currentInstance.value)
    afterOpenForm = afterOpenForm.bind(currentInstance.value)
    beforeSubmit = beforeSubmit.bind(currentInstance.value)
    afterSubmit = afterSubmit.bind(currentInstance.value)

    initializeListFilter.call(currentInstance.value)
  })

  return toRefs(
    reactive({
      list,
      getList,
      form,
      openForm,
      submitForm,
      enable,
      disable,
      updateStatus,
      c: (...args) => {
        form.status = 'c'
        // 复制新增需要传参，常规新增不需要
        return openForm(...(checkCopy() ? args : []))
      },
      r: (...args) => {
        form.status = 'r'
        return openForm(...args)
      },
      u: (...args) => {
        form.status = 'u'
        return openForm(...args)
      },
      d,
      formTitle: computed(() => formTitleMap[form.status]),
      formTitleMap,
      // 重置筛选条件
      reset: () => {
        resetListFilter()
        if (initialListFilter) {
          list.filter = {
            ...list.filter,
            ...initialListFilter(),
          }
        }
        if (!list.watchFilter) {
          getList()
        }
      },
      // 读取列表（监听筛选条件时不需要）
      queryList: async () => {
        await validateListFilter()
        list.filter.page.pageNo = 1
        getList()
      },
      // 当前 Vue 实例
      currentInstance,
      // 列表筛选项表单的 ref
      listFilterRef,
      // 详情的 ref
      formRef,
      // 校验列表筛选项
      validateListFilter,
      // 重置列表筛选项
      resetListFilter,
      // 清除详情表单校验
      clearValidateOfFormData,
      // 校验详情表单
      validateFormData,
      // 给筛选项赋初值，使得重置功能能够正常工作
      initializeListFilter,
    }),
  )
}
