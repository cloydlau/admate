<template>
  <el-dialog
    v-model="props.modelValue"
    v-bind="ElDialogProps"
    ref="elDialogRef"
    @closed="onClosed"
  >
    <template slot="title">
      <!-- 接收slot -->
      <slot name="title"/>
    </template>
    <div v-loading="loading" class="overflow-y-auto flex flex-col">
      <!-- 传slot -->
      <overlay-scrollbars
        ref="overlayScrollbar"
        class="pl-40px pr-50px pb-30px pt-25px"
        style="max-height:calc(100vh - 100px);"
      >
        <slot/>

        <el-form
          v-if="$scopedSlots['el-form']"
          v-bind="ElFormProps"
        >
          <slot name="el-form"/>
        </el-form>
      </overlay-scrollbars>

      <slot name="footer">
        <div
          slot="footer"
          class="z-1 absolute bottom-0 right-0 py-10px px-15px box-border absolute text-right"
          style="backdrop-filter: blur(4px)"
        >
          <el-button
            @click="closeDialog"
            :disabled="closing"
          >
            {{ showConfirmBtn ? '取 消' : '关 闭' }}
          </el-button>
          <!--<el-button
            v-if="showConfirmBtn && $scopedSlots['el-form']"
            type="info"
            @click="reset"
            :disabled="submitting||closing"
          >
            重 置
          </el-button>-->
          <el-button
            type="primary"
            @click="confirm"
            :disabled="closing"
            :loading="submitting"
            v-if="showConfirmBtn"
          >
            确 定
          </el-button>
        </div>
      </slot>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from '@vue/composition-api'
import globalConfig from './config'
import { loadStyle, getFinalProp, getGlobalAttrs } from 'kayran'
import highlightError from './highlightErrorViaOverlayScrollbars'
import { cloneDeep } from 'lodash-es'
//import Scrollbar from 'smooth-scrollbar'
import 'overlayscrollbars/css/OverlayScrollbars.min.css'
import OverlayScrollbars from 'overlayscrollbars'

const name = 'KiFormDialog'

const props = defineProps({
  modelValue: {
    type: Boolean,
  },
  modal: {
    default: () => ({}),
  },
  elFormProps: {},
  retrieve: {},
  submit: {},
  readonly: {},
})

const emits = defineEmits(['update:modelValue'])

const loading = ref(true)
const submitting = ref(false)
const closing = ref(false)
const initiated = ref(false)
const disabledStyle = ref(null)
const scrollbar = ref(null)
// 作用是防止在关闭但关闭动画未结束时隐藏的确认按钮暴露出来
const showConfirmBtn = ref(false)
const beforeCloseIsPassed = ref(false)

const elDialogRef = ref(null)

const Retrieve = computed(() => getFinalProp([this.retrieve, globalConfig.retrieve], {
  name: 'retrieve',
  type: ['function', 'asyncfunction']
}))

const Readonly = computed(() => getFinalProp([
  [true, ''].includes(this.readonly) ? true : this.readonly,
  globalConfig.readonly,
  false
], {
  name: 'readonly',
  type: 'boolean'
}))

const Submit = computed(() => getFinalProp([this.submit, globalConfig.submit], {
  name: 'submit',
  type: ['function', 'asyncfunction']
}))

const ElDialogProps = computed(() => getFinalProp([
  this.$attrs,
  getGlobalAttrs(globalConfig, this.$props)
], {
  dynamicDefault: userProp => {
    this.beforeCloseIsPassed = Boolean(userProp.beforeClose)
    return {
      closeOnClickModal: false,
      ...!this.beforeCloseIsPassed && {
        beforeClose: () => {
          this.$emit('update:modelValue', false)
        }
      },
    }
  }
}))

const ElFormProps = computed(() => getFinalProp([
  this.elFormProps, globalConfig.elFormProps, {
    disabled: this.readonly,
    labelWidth: 'auto',
    model: this.value,
    ref: 'elForm',
  }
], {
  name: 'elFormProps',
  type: 'object'
}))

this.value__ = cloneDeep(this.value)

watch(props.modelValue, async n => {
  if (n) {
    /*if (this.$scopedSlots['el-form'] && !this.labelWidthSettled) {
      this.labelWidth = await this.getLabelWidth()
      this.labelWidthSettled = true
    }*/
    if (this.Retrieve) {
      const result = this.Retrieve()
      if (result instanceof Promise) {
        result.catch(e => {
          console.error(import.meta.env.VITE_APP_CONSOLE_PREFIX, e)
          this.closeDialog()
        }).finally(e => {
          this.loading = false
        })
      } else {
        this.loading = false
      }
    } else {
      this.loading = false
    }
  }
  // 首次不执行
  else if (this.initiated) {
    this.closing = true
  }
  this.initiated = true
}, {
  // 针对默认打开的情况 默认打开时 依然执行retrieve
  immediate: true,
})

watch(Readonly, (n, o) => {
  if (!this.closing) {
    this.showConfirmBtn = !n
  }
}, {
  immediate: true,
})

watch(showConfirmBtn, (n, o) => {
  if (!n) {
    loadStyle(this.disabledStyle || `
.el-form [disabled="disabled"],
.el-form .is-disabled,
.el-form .is-disabled *,
.el-form .disabled {
  color: unset !important;
  cursor: initial !important;
}
          `).then(disabledStyle => {
      this.disabledStyle = disabledStyle
    })
  } else if (this.disabledStyle) {
    this.disabledStyle.remove()
    this.disabledStyle = null
  }
}, {
  immediate: true,
})

function onClosed () {
  // 重置表单
  this.$emit('change', cloneDeep(this.value__))
  if (this.$scopedSlots['el-form']) {
    setTimeout(() => {
      this.$refs.elForm.clearValidate()
    }, 0)
  }
  this.closing = false
  this.showConfirmBtn = !this.Readonly
}

function closeDialog () {
  if (this.beforeCloseIsPassed) {
    this.$refs.elDialogRef.beforeClose()
  } else {
    this.$emit('update:modelValue', false)
  }
}

function confirm () {
  const exec = () => {
    if (typeof this.Submit === 'function') {
      this.submitting = true
      const result = this.Submit()
      if (result instanceof Promise) {
        result.then(data => {
          if (data?.close !== false) {
            this.closeDialog()
          }
        }).finally(e => {
          this.submitting = false
        })
      } else {
        this.submitting = false
        if (result?.close !== false) {
          this.closeDialog()
        }
      }
    } else {
      this.closeDialog()
    }
  }

  if (this.$scopedSlots['el-form']) {
    this.$refs.elForm.validate(valid => {
      if (valid) {
        exec()
      } else {
        highlightError(undefined, this.$refs.overlayScrollbar.osInstance())
      }
    })
  } else {
    exec()
  }
}
</script>

<!--动画-->
<style lang="scss" scoped>
@keyframes open {
  0% {
    opacity: 0;
    transform: scale3d(0, 0, 1);
  }
  100% {
    opacity: 1;
    transform: scale3d(1, 1, 1);
  }
}

@keyframes close {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: scale3d(0.5, 0.5, 1);
  }
}

:deep(.el-dialog__wrapper) {
  transition-duration: 0.3s;
}

:deep(.dialog-fade-enter-active) {
  animation: none !important;
}

:deep(.dialog-fade-leave-active) {
  transition-duration: 0.15s !important;
  animation: none !important;
}

:deep(.dialog-fade-enter-active .el-dialog),
:deep(.dialog-fade-leave-active .el-dialog) {
  animation-fill-mode: forwards;
}

:deep(.dialog-fade-enter-active .el-dialog) {
  animation-duration: 0.3s;
  animation-name: open;
  animation-timing-function: cubic-bezier(0.6, 0, 0.4, 1);
}

:deep(.dialog-fade-leave-active .el-dialog) {
  animation-duration: 0.3s;
  animation-name: close;
}
</style>

<style lang="scss" scoped>
.el-dialog__wrapper {
  display: flex;
}

:deep(.el-dialog) {
  min-width: 800px;

  &:not(.is-fullscreen) {
    margin: auto !important;

    .os-host {
      max-height: calc(100vh - 100px);
      padding-bottom: 85px;
    }
  }

  .el-dialog__header {
    padding: 10px 15px;
    display: flex;
    justify-content: space-between;

    & > .el-dialog__headerbtn {
      position: unset;

      & > .el-dialog__close {
        font-size: 24px;
        font-weight: bolder;
      }
    }
  }

  .el-dialog__body {
    max-height: calc(100vh - 100px);
    overflow-y: auto;
    padding: 0;
    display: flex;
    flex-direction: column;

    /* 去掉输入框的上下箭头 */
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
    }

    input[type="number"] {
      -moz-appearance: textfield;
    }

    .el-form-item__label {
      font-size: 14px !important; //会影响getCharLen算法
    }

    .el-form-item__content {
      .el-input,
      .el-input-number,
      .el-select,
      .el-time-select,
      .el-time-picker,
      .el-date-picker,
      .el-date-editor,
      .el-cascader {
        width: 100%;
      }
    }

    .el-form-item:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
