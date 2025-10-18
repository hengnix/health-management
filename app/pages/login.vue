<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import type { FormSubmitEvent } from '#ui/types'
import MD5 from 'crypto-js/md5'
import { z } from 'zod'

definePageMeta({
  layout: 'blank'
})

const toast = useToast()
const isRegister = ref(false)

// 登录表单 Schema
const loginSchema = z.object({
  email: z.email('请输入正确的邮箱格式'),
  password: z.string().min(1, '请输入密码').min(6, '密码长度至少 6 个字符')
})

// 注册表单 Schema
const registerSchema = z.object({
  nickname: z.string().min(1, '请输入昵称').min(2, '昵称长度至少 2 个字符').max(20, '昵称长度最多 20 个字符'),
  email: z.email('请输入正确的邮箱格式'),
  password: z.string().min(1, '请输入密码').min(6, '密码长度至少 6 个字符'),
  confirmPassword: z.string().min(1, '请确认密码'),
  gender: z.enum(['男', '女'], { message: '请选择性别' })
}).refine(data => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword']
})

type LoginSchema = z.output<typeof loginSchema>
type RegisterSchema = z.output<typeof registerSchema>

// 登录表单状态
const loginState = reactive<LoginSchema>({
  email: '',
  password: ''
})

// 注册表单状态
const registerState = reactive<RegisterSchema>({
  nickname: '',
  email: '',
  password: '',
  confirmPassword: '',
  gender: '男'
})

// 使用 DateValue 类型，默认设置为今天
const todayDate = getTodayDateValue()
const calendarPlaceholder = shallowRef<DateValue>(todayDate)
const calendarValue = shallowRef<DateValue>(todayDate)
const minValue = shallowRef<DateValue>(createCalendarDate(1900, 1, 1))
const maxValue = shallowRef<DateValue>(createCalendarDate(2050, 12, 31))
const showDatePicker = ref(false)
const dateOfBirthError = ref('')

function validateDateOfBirth(): boolean {
  if (!calendarValue.value) {
    dateOfBirthError.value = '请选择出生日期'
    return false
  }
  dateOfBirthError.value = ''
  return true
}

function toggleMode() {
  isRegister.value = !isRegister.value
  resetForm()
}

function resetForm() {
  // 重置登录表单
  loginState.email = ''
  loginState.password = ''

  // 重置注册表单
  registerState.nickname = ''
  registerState.email = ''
  registerState.password = ''
  registerState.confirmPassword = ''
  registerState.gender = '男'

  // 重置日期选择器
  calendarValue.value = getTodayDateValue()
  dateOfBirthError.value = ''
}

function formatDateOfBirth(): string {
  if (!calendarValue.value) return '请选择出生日期'
  return dateValueToString(calendarValue.value)
}

async function onLoginSubmit(event: FormSubmitEvent<LoginSchema>) {
  try {
    console.log('登录:', {
      email: event.data.email,
      passwordHash: MD5(event.data.password).toString()
    })

    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.add({ title: '登录成功', color: 'success' })
    navigateTo('/dashboard')
  } catch {
    toast.add({ title: '登录失败', color: 'error' })
  }
}

async function onRegisterSubmit(event: FormSubmitEvent<RegisterSchema>) {
  // 验证出生日期
  if (!validateDateOfBirth()) {
    return
  }

  try {
    const dateOfBirth = calendarValue.value ? dateValueToString(calendarValue.value) : ''

    console.log('注册:', {
      email: event.data.email,
      passwordHash: MD5(event.data.password).toString(),
      nickname: event.data.nickname,
      gender: event.data.gender,
      dateOfBirth
    })

    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.add({ title: '注册成功', color: 'success' })
    isRegister.value = false
    resetForm()
  } catch {
    toast.add({ title: '注册失败', color: 'error' })
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-6 bg-white">
    <UCard class="w-full max-w-md">
      <template #header>
        <h2 class="text-2xl font-bold text-center text-gray-900">
          {{ isRegister ? '注册' : '登录' }}健康生活管理系统
        </h2>
      </template>

      <!-- 登录表单 -->
      <UForm
        v-if="!isRegister"
        :schema="loginSchema"
        :state="loginState"
        class="space-y-4"
        @submit="onLoginSubmit"
      >
        <UFormField
          label="邮箱"
          name="email"
        >
          <UInput
            v-model="loginState.email"
            type="email"
            placeholder="请输入邮箱"
            size="lg"
          >
            <template #leading>
              <UIcon name="i-heroicons-envelope" />
            </template>
          </UInput>
        </UFormField>

        <UFormField
          label="密码"
          name="password"
        >
          <UInput
            v-model="loginState.password"
            type="password"
            placeholder="请输入密码"
            size="lg"
          >
            <template #leading>
              <UIcon name="i-heroicons-lock-closed" />
            </template>
          </UInput>
        </UFormField>

        <div class="pt-2">
          <UButton
            type="submit"
            block
            size="lg"
            color="primary"
          >
            <template #leading>
              <UIcon name="i-heroicons-check" />
            </template>
            立即登录
          </UButton>
        </div>

        <UButton
          variant="ghost"
          block
          color="neutral"
          @click="toggleMode"
        >
          没有账户？点击注册
        </UButton>
      </UForm>

      <!-- 注册表单 -->
      <UForm
        v-else
        :schema="registerSchema"
        :state="registerState"
        class="space-y-4"
        @submit="onRegisterSubmit"
      >
        <UFormField
          label="昵称"
          name="nickname"
        >
          <UInput
            v-model="registerState.nickname"
            placeholder="请输入昵称"
            size="lg"
          >
            <template #leading>
              <UIcon name="i-heroicons-user" />
            </template>
          </UInput>
        </UFormField>

        <UFormField
          label="邮箱"
          name="email"
        >
          <UInput
            v-model="registerState.email"
            type="email"
            placeholder="请输入邮箱"
            size="lg"
          >
            <template #leading>
              <UIcon name="i-heroicons-envelope" />
            </template>
          </UInput>
        </UFormField>

        <UFormField
          label="密码"
          name="password"
        >
          <UInput
            v-model="registerState.password"
            type="password"
            placeholder="请输入密码"
            size="lg"
          >
            <template #leading>
              <UIcon name="i-heroicons-lock-closed" />
            </template>
          </UInput>
        </UFormField>

        <UFormField
          label="确认密码"
          name="confirmPassword"
        >
          <UInput
            v-model="registerState.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            size="lg"
          >
            <template #leading>
              <UIcon name="i-heroicons-lock-closed" />
            </template>
          </UInput>
        </UFormField>

        <UFormField
          label="性别"
          name="gender"
        >
          <div class="flex gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="registerState.gender"
                type="radio"
                value="男"
                class="w-4 h-4 text-primary-600 focus:ring-primary-500"
              >
              <span class="text-sm text-gray-700">男</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="registerState.gender"
                type="radio"
                value="女"
                class="w-4 h-4 text-primary-600 focus:ring-primary-500"
              >
              <span class="text-sm text-gray-700">女</span>
            </label>
          </div>
        </UFormField>

        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-gray-700">出生日期</label>
          <UPopover v-model:open="showDatePicker">
            <UButton
              block
              variant="outline"
              color="neutral"
              size="lg"
              class="justify-start"
            >
              <template #leading>
                <UIcon name="i-heroicons-calendar" />
              </template>
              {{ formatDateOfBirth() }}
            </UButton>

            <template #content>
              <UCalendar
                v-model="calendarValue"
                v-model:placeholder="calendarPlaceholder"
                :min-value="minValue"
                :max-value="maxValue"
                @update:model-value="showDatePicker = false"
              >
                <template #heading="{ value }">
                  <CalendarYearMonthSelect
                    v-model:placeholder="calendarPlaceholder"
                    :min-value="minValue"
                    :max-value="maxValue"
                  >
                    {{ value }}
                  </CalendarYearMonthSelect>
                </template>
              </UCalendar>
            </template>
          </UPopover>
          <p
            v-if="dateOfBirthError"
            class="text-sm text-red-600"
          >
            {{ dateOfBirthError }}
          </p>
        </div>

        <div class="pt-2">
          <UButton
            type="submit"
            block
            size="lg"
            color="primary"
          >
            <template #leading>
              <UIcon name="i-heroicons-check" />
            </template>
            注册账户
          </UButton>
        </div>

        <UButton
          variant="ghost"
          block
          color="neutral"
          @click="toggleMode"
        >
          已有账户？点击登录
        </UButton>
      </UForm>
    </UCard>
  </div>
</template>
