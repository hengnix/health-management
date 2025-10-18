<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { DateValue } from '@internationalized/date'

const UButton = resolveComponent('UButton')
const UIcon = resolveComponent('UIcon')

interface PageInfo {
  current: number
  size: number
  total: number
}

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const toast = useToast()

const bodyDataList = ref<BodyData[]>([])
const loading = ref(false)
const showDialog = ref(false)
const isEditing = ref(false)
const currentItem = ref<Partial<BodyData> | null>(null)

const pageInfo = reactive<PageInfo>({
  current: 1,
  size: 10,
  total: 0
})

// 日期配置
const todayDate = getTodayDateValue()
const minValue = shallowRef<DateValue>(createCalendarDate(1900, 1, 1))
const maxValue = shallowRef<DateValue>(createCalendarDate(2050, 12, 31))

const recordDateCalendar = shallowRef<DateValue>(todayDate)
const recordDatePlaceholder = shallowRef<DateValue>(todayDate)
const showRecordDatePicker = ref(false)

const startDateCalendar = shallowRef<DateValue | null>(null)
const startDatePlaceholder = shallowRef<DateValue>(todayDate)
const showStartDatePicker = ref(false)

const endDateCalendar = shallowRef<DateValue | null>(null)
const endDatePlaceholder = shallowRef<DateValue>(todayDate)
const showEndDatePicker = ref(false)

const latestBodyData = computed(() => {
  return bodyDataList.value.length > 0 ? bodyDataList.value[0] : null
})

const latestWeight = computed(() => {
  return latestBodyData.value?.weightKG?.toFixed(1) || '--'
})

const latestHeight = computed(() => {
  return latestBodyData.value?.heightCM?.toFixed(0) || '--'
})

const latestBMI = computed(() => {
  const bmi = calcBMI({
    weightKG: latestBodyData.value?.weightKG ?? 0,
    heightCM: latestBodyData.value?.heightCM ?? 0
  })
  return bmi == null ? '--' : bmi.toFixed(1)
})

const _latestBMIValue = computed(() =>
  calcBMI({
    weightKG: latestBodyData.value?.weightKG ?? 0,
    heightCM: latestBodyData.value?.heightCM ?? 0
  })
)

const bmiStatus = computed(() => getBMIStatus(_latestBMIValue.value).status)
const bmiStatusColor = computed(() => getBMIStatus(_latestBMIValue.value).color)

const healthGoals = reactive({ targetWeight: null as number | null })

const loadHealthGoals = () => {
  if (!import.meta.client) return
  const savedGoals = localStorage.getItem('healthGoals')
  if (savedGoals) {
    const parsed = JSON.parse(savedGoals)
    healthGoals.targetWeight = parsed.targetWeight
  }
}

const columns: TableColumn<BodyData>[] = [
  {
    accessorKey: 'recordDate',
    header: '记录日期'
  },
  {
    accessorKey: 'weightKG',
    header: '体重 (kg)',
    cell: ({ row }) => {
      return `${row.getValue<number>('weightKG').toFixed(1)} kg`
    }
  },
  {
    accessorKey: 'heightCM',
    header: '身高 (cm)',
    cell: ({ row }) => {
      return `${row.getValue<number>('heightCM').toFixed(0)} cm`
    }
  },
  {
    id: 'bmi',
    header: 'BMI',
    cell: ({ row }) => {
      return formatBMI(row.original)
    }
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row }) => {
      return h('div', { class: 'flex gap-2' }, [
        h(
          UButton,
          {
            size: 'xs',
            color: 'primary',
            variant: 'soft',
            onClick: () => openEditDialog(row.original)
          },
          {
            leading: () => h(UIcon, { name: 'i-heroicons-pencil' }),
            default: () => '编辑'
          }
        ),
        h(
          UButton,
          {
            size: 'xs',
            color: 'error',
            variant: 'soft',
            onClick: () => deleteItem(row.original)
          },
          {
            leading: () => h(UIcon, { name: 'i-heroicons-trash' }),
            default: () => '删除'
          }
        )
      ])
    }
  }
]

const formatDate = (date: DateValue | null, placeholder: string): string => {
  return date ? dateValueToString(date) : placeholder
}

const loadData = async () => {
  loading.value = true
  try {
    const params: Record<string, string | number> = {
      current: pageInfo.current,
      size: pageInfo.size
    }

    if (startDateCalendar.value) {
      params.startDate = dateValueToString(startDateCalendar.value)
    }
    if (endDateCalendar.value) {
      params.endDate = dateValueToString(endDateCalendar.value)
    }

    const response = await $fetch<{
      code: number
      data: { records: BodyData[]; total: number }
    }>('/api/bodyData/page', {
      method: 'GET',
      params
    })

    if (response.code === 200 && response.data) {
      bodyDataList.value = response.data.records
      pageInfo.total = response.data.total
    } else {
      throw new Error('数据格式错误')
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    toast.add({ title: '加载数据失败', color: 'error' })

    if (import.meta.dev) {
      bodyDataList.value = [
        {
          bodyMetricID: 1,
          userID: 'test-user',
          recordDate: '2025-10-18',
          weightKG: 68.5,
          heightCM: 175,
          bmi: 22.4
        },
        {
          bodyMetricID: 2,
          userID: 'test-user',
          recordDate: '2025-10-17',
          weightKG: 68.8,
          heightCM: 175,
          bmi: 22.5
        },
        {
          bodyMetricID: 3,
          userID: 'test-user',
          recordDate: '2025-10-16',
          weightKG: 69.0,
          heightCM: 175,
          bmi: 22.6
        }
      ]
      pageInfo.total = 3
    }
  } finally {
    loading.value = false
  }
}

const openAddDialog = () => {
  isEditing.value = false
  recordDateCalendar.value = todayDate
  currentItem.value = {
    userID: 'test-user',
    recordDate: dateValueToString(todayDate)
  }
  showDialog.value = true
}

const openEditDialog = (item: BodyData) => {
  isEditing.value = true
  currentItem.value = { ...item }
  if (item.recordDate) {
    const dateParts = item.recordDate.split('-')
    if (dateParts.length === 3) {
      recordDateCalendar.value = createCalendarDate(
        parseInt(dateParts[0]!),
        parseInt(dateParts[1]!),
        parseInt(dateParts[2]!)
      )
    }
  }
  showDialog.value = true
}

const deleteItem = async (item: BodyData) => {
  try {
    const response = await $fetch<{ code: number }>(`/api/bodyData/${item.bodyMetricID}`, {
      method: 'DELETE'
    })

    if (response.code === 200) {
      toast.add({ title: '删除成功', color: 'success' })
      await loadData()
    } else {
      throw new Error('删除失败')
    }
  } catch (error) {
    console.error('删除失败:', error)
    toast.add({ title: '删除失败', color: 'error' })

    if (import.meta.dev) {
      bodyDataList.value = bodyDataList.value.filter((d) => d.bodyMetricID !== item.bodyMetricID)
      pageInfo.total--
      toast.add({ title: '删除成功（模拟）', color: 'success' })
    }
  }
}

const saveItem = async () => {
  if (!currentItem.value) return

  currentItem.value.recordDate = dateValueToString(recordDateCalendar.value)

  const { recordDate, weightKG, heightCM } = currentItem.value
  if (!recordDate || !weightKG || !heightCM) {
    toast.add({ title: '请填写完整信息', color: 'warning' })
    return
  }

  const action = isEditing.value ? '更新' : '添加'

  try {
    const url = isEditing.value
      ? `/api/bodyData/${currentItem.value.bodyMetricID}`
      : '/api/bodyData'
    const response = await $fetch<{ code: number }>(url, {
      method: isEditing.value ? 'PUT' : 'POST',
      body: currentItem.value
    })

    if (response.code === 200) {
      toast.add({ title: `${action}成功`, color: 'success' })
      showDialog.value = false
      await loadData()
    } else {
      throw new Error(`${action}失败`)
    }
  } catch (error) {
    console.error(`${action}失败:`, error)
    toast.add({ title: `${action}失败`, color: 'error' })

    // 开发环境模拟保存
    if (import.meta.dev) {
      if (isEditing.value && currentItem.value.bodyMetricID) {
        const index = bodyDataList.value.findIndex(
          (d) => d.bodyMetricID === currentItem.value!.bodyMetricID
        )
        if (index !== -1) bodyDataList.value[index] = currentItem.value as BodyData
      } else {
        bodyDataList.value.unshift({
          bodyMetricID: Date.now(),
          userID: 'test-user',
          recordDate: currentItem.value.recordDate!,
          weightKG: currentItem.value.weightKG!,
          heightCM: currentItem.value.heightCM!
        })
        pageInfo.total++
      }
      toast.add({ title: `${action}成功（模拟）`, color: 'success' })
      showDialog.value = false
    }
  }
}

const resetFilter = () => {
  startDateCalendar.value = null
  endDateCalendar.value = null
  pageInfo.current = 1
  loadData()
}

const handlePageChange = (page: number) => {
  pageInfo.current = page
  loadData()
}
// 生命周期
onMounted(() => {
  loadHealthGoals()
  loadData()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
    <!-- 页面头部 -->
    <div
      class="mb-8 rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white shadow-2xl"
    >
      <div class="flex items-center justify-between">
        <div>
          <h1 class="mb-2 flex items-center gap-3 text-3xl font-bold">
            <UIcon name="i-heroicons-scale" class="text-4xl" />
            身体数据
          </h1>
          <p class="text-blue-100">记录并追踪您的身体健康指标</p>
        </div>
        <UButton size="lg" color="neutral" variant="solid" @click="openAddDialog">
          <template #leading>
            <UIcon name="i-heroicons-plus" />
          </template>
          添加身体数据
        </UButton>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
      <!-- 体重卡片 -->
      <UCard>
        <div class="flex items-center gap-4">
          <div class="rounded-full bg-purple-100 p-4">
            <UIcon name="i-heroicons-scale" class="text-3xl text-purple-600" />
          </div>
          <div class="flex-1">
            <div class="text-3xl font-bold text-gray-900">{{ latestWeight }}</div>
            <div class="text-sm text-gray-500">当前体重（kg）</div>
            <div v-if="healthGoals.targetWeight" class="text-xs text-gray-400">
              目标: {{ healthGoals.targetWeight }} kg
            </div>
            <div v-else class="text-xs text-gray-400">目标: 未设置</div>
          </div>
        </div>
      </UCard>

      <!-- 身高卡片 -->
      <UCard>
        <div class="flex items-center gap-4">
          <div class="rounded-full bg-green-100 p-4">
            <UIcon name="i-heroicons-arrow-trending-up" class="text-3xl text-green-600" />
          </div>
          <div class="flex-1">
            <div class="text-3xl font-bold text-gray-900">{{ latestHeight }}</div>
            <div class="text-sm text-gray-500">当前身高（cm）</div>
          </div>
        </div>
      </UCard>

      <!-- BMI 卡片 -->
      <UCard>
        <div class="flex items-center gap-4">
          <div class="rounded-full bg-blue-100 p-4">
            <UIcon name="i-heroicons-chart-bar" class="text-3xl text-blue-600" />
          </div>
          <div class="flex-1">
            <div class="text-3xl font-bold text-gray-900">{{ latestBMI }}</div>
            <div class="text-sm text-gray-500">BMI 指数</div>
            <div :class="['text-sm font-medium', bmiStatusColor]">{{ bmiStatus }}</div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- 筛选器 -->
    <UCard class="mb-8">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="flex items-center gap-2 text-lg font-semibold">
            <UIcon name="i-heroicons-funnel" />
            数据筛选
          </h3>
        </div>
      </template>

      <div class="flex flex-wrap gap-4">
        <!-- 开始日期 -->
        <div class="min-w-[200px] flex-1">
          <label class="mb-1.5 block text-sm font-medium text-gray-700">开始日期</label>
          <UPopover v-model:open="showStartDatePicker">
            <UButton block variant="outline" color="neutral" class="justify-start">
              <template #leading>
                <UIcon name="i-heroicons-calendar" />
              </template>
              {{ formatDate(startDateCalendar, '选择开始日期') }}
            </UButton>

            <template #content>
              <UCalendar
                v-model="startDateCalendar"
                v-model:placeholder="startDatePlaceholder"
                :min-value="minValue"
                :max-value="maxValue"
                @update:model-value="
                  () => {
                    showStartDatePicker = false
                    loadData()
                  }
                "
              >
                <template #heading="{ value }">
                  <CalendarYearMonthSelect
                    v-model:placeholder="startDatePlaceholder"
                    :min-value="minValue"
                    :max-value="maxValue"
                  >
                    {{ value }}
                  </CalendarYearMonthSelect>
                </template>
              </UCalendar>
            </template>
          </UPopover>
        </div>

        <!-- 结束日期 -->
        <div class="min-w-[200px] flex-1">
          <label class="mb-1.5 block text-sm font-medium text-gray-700">结束日期</label>
          <UPopover v-model:open="showEndDatePicker">
            <UButton block variant="outline" color="neutral" class="justify-start">
              <template #leading>
                <UIcon name="i-heroicons-calendar" />
              </template>
              {{ formatDate(endDateCalendar, '选择结束日期') }}
            </UButton>

            <template #content>
              <UCalendar
                v-model="endDateCalendar"
                v-model:placeholder="endDatePlaceholder"
                :min-value="minValue"
                :max-value="maxValue"
                @update:model-value="
                  () => {
                    showEndDatePicker = false
                    loadData()
                  }
                "
              >
                <template #heading="{ value }">
                  <CalendarYearMonthSelect
                    v-model:placeholder="endDatePlaceholder"
                    :min-value="minValue"
                    :max-value="maxValue"
                  >
                    {{ value }}
                  </CalendarYearMonthSelect>
                </template>
              </UCalendar>
            </template>
          </UPopover>
        </div>

        <!-- 重置按钮 -->
        <div class="flex items-end">
          <UButton color="neutral" variant="outline" @click="resetFilter">
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" />
            </template>
            重置筛选
          </UButton>
        </div>
      </div>
    </UCard>

    <!-- 数据表格 -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="flex items-center gap-2 text-lg font-semibold">
            <UIcon name="i-heroicons-list-bullet" />
            数据记录
          </h3>
          <span class="text-sm text-gray-500">共 {{ pageInfo.total }} 条记录</span>
        </div>
      </template>

      <UTable :columns="columns" :rows="bodyDataList" :loading="loading">
        <template #empty>
          <div class="py-12 text-center text-gray-500">没有数据</div>
        </template>
      </UTable>

      <!-- 分页 - 始终显示 -->
      <template #footer>
        <div class="flex justify-center border-t pt-4">
          <UPagination
            v-model="pageInfo.current"
            :total="pageInfo.total"
            :page-size="pageInfo.size"
            @update:model-value="handlePageChange"
          />
        </div>
      </template>
    </UCard>

    <!-- 添加/编辑对话框 -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showDialog"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          @click.self="showDialog = false"
        >
          <div class="w-full max-w-lg rounded-lg bg-white shadow-xl dark:bg-gray-800" @click.stop>
            <!-- Header -->
            <div class="border-b border-gray-200 p-4 sm:px-6 dark:border-gray-700">
              <h3 class="text-lg font-semibold">{{ isEditing ? '编辑' : '添加' }}身体数据</h3>
            </div>

            <!-- Body -->
            <div v-if="currentItem" class="space-y-4 p-4 sm:px-6">
              <!-- 记录日期 -->
              <div class="space-y-1.5">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >记录日期</label
                >
                <UPopover v-model:open="showRecordDatePicker">
                  <UButton block variant="outline" color="neutral" class="justify-start">
                    <template #leading>
                      <UIcon name="i-heroicons-calendar" />
                    </template>
                    {{ formatDate(recordDateCalendar, '请选择记录日期') }}
                  </UButton>

                  <template #content>
                    <UCalendar
                      v-model="recordDateCalendar"
                      v-model:placeholder="recordDatePlaceholder"
                      :min-value="minValue"
                      :max-value="maxValue"
                      @update:model-value="showRecordDatePicker = false"
                    >
                      <template #heading="{ value }">
                        <CalendarYearMonthSelect
                          v-model:placeholder="recordDatePlaceholder"
                          :min-value="minValue"
                          :max-value="maxValue"
                        >
                          {{ value }}
                        </CalendarYearMonthSelect>
                      </template>
                    </UCalendar>
                  </template>
                </UPopover>
              </div>

              <!-- 体重 -->
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >体重（kg）</label
                >
                <input
                  v-model.number="currentItem.weightKG"
                  type="number"
                  step="0.1"
                  placeholder="请输入体重"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700"
                />
              </div>

              <!-- 身高 -->
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >身高（cm）</label
                >
                <input
                  v-model.number="currentItem.heightCM"
                  type="number"
                  step="0.1"
                  placeholder="请输入身高"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700"
                />
              </div>
            </div>

            <!-- Footer -->
            <div
              class="flex justify-end gap-3 border-t border-gray-200 p-4 sm:px-6 dark:border-gray-700"
            >
              <UButton color="neutral" variant="ghost" @click="showDialog = false"> 取消 </UButton>
              <UButton color="primary" @click="saveItem"> 保存 </UButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* Modal transition animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .max-w-lg,
.modal-leave-active .max-w-lg {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.modal-enter-from .max-w-lg {
  transform: scale(0.95);
  opacity: 0;
}

.modal-leave-to .max-w-lg {
  transform: scale(0.95);
  opacity: 0;
}
</style>
