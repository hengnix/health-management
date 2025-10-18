<script setup lang="ts">
import * as echarts from 'echarts'

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const toast = useToast()

// [TODO] 考虑迁移到更轻量的图表库，如 vue-chartjs 或 Chart.js
// 目前保留 ECharts 因为功能较多，迁移成本高

// 对话框状态
const showBodyDataDialog = ref(false)
const showDietDialog = ref(false)
const showExerciseDialog = ref(false)

// 图表相关
const caloriesChartRef = ref<HTMLDivElement>()
const weightChartRef = ref<HTMLDivElement>()
const caloriesTimePeriod = ref<string>('7d')
const weightTimePeriod = ref<string>('7d')

// 图表实例
let weightChart: echarts.ECharts | null = null
let caloriesChart: echarts.ECharts | null = null

// 数据
const weightData = ref<{ date: string; weight: number }[]>([])
const caloriesData = ref<{ date: string; intake: number; burn: number; net: number }[]>([])

// 统计数据
const statistics = reactive({
  totalCaloriesConsumed: 0,
  totalCaloriesBurned: 0,
  averageWeight: 0
})

// 健康目标数据
const healthGoals = reactive({
  targetWeight: null as number | null,
  dailyCaloriesIntake: null as number | null,
  dailyCaloriesBurn: null as number | null
})

// 计算平均值
const averageCaloriesIntake = computed(() => {
  if (caloriesData.value.length === 0) return 0
  const totalIntake = caloriesData.value.reduce((sum, item) => sum + item.intake, 0)
  return totalIntake / caloriesData.value.length
})

const averageCaloriesBurn = computed(() => {
  if (caloriesData.value.length === 0) return 0
  const totalBurn = caloriesData.value.reduce((sum, item) => sum + item.burn, 0)
  return totalBurn / caloriesData.value.length
})

const averageNetCalories = computed(() => {
  if (caloriesData.value.length === 0) return 0
  const totalNet = caloriesData.value.reduce((sum, item) => sum + item.net, 0)
  return totalNet / caloriesData.value.length
})

// 快速记录下拉菜单
const quickRecordItems = [
  [
    {
      label: '记录体重',
      icon: 'i-heroicons-scale',
      click: () => {
        showBodyDataDialog.value = true
      }
    }
  ],
  [
    {
      label: '记录饮食',
      icon: 'i-heroicons-cake',
      click: () => {
        showDietDialog.value = true
      }
    }
  ],
  [
    {
      label: '记录运动',
      icon: 'i-heroicons-bolt',
      click: () => {
        showExerciseDialog.value = true
      }
    }
  ]
]

// 时间段按钮
const timePeriodButtons = [
  { label: '7 天', value: '7d' },
  { label: '30 天', value: '30d' },
  { label: '90 天', value: '90d' }
]

// 初始化体重图表
const initWeightChart = async () => {
  if (!weightChartRef.value) return

  // 销毁现有图表
  if (weightChart) {
    weightChart.dispose()
  }

  // 创建新图表
  weightChart = echarts.init(weightChartRef.value)

  const hasData = weightData.value.length > 0

  const option = {
    title: {
      show: !hasData,
      text: '暂无体重数据',
      textStyle: {
        color: '#999',
        fontSize: 16,
        fontWeight: 'normal'
      },
      left: 'center',
      top: 'middle'
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#667eea',
      borderWidth: 1,
      textStyle: {
        color: '#333'
      },
      formatter: (params: echarts.TooltipComponentFormatterCallbackParams) => {
        const paramsArray = Array.isArray(params) ? params : [params]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = paramsArray[0] as any
        if (!data) return ''
        return `
          <div style="padding: 8px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${data.axisValueLabel || ''}</div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; width: 10px; height: 10px; background: ${data.color || '#667eea'}; border-radius: 50%;"></span>
              <span>体重: ${data.value || 0} kg</span>
            </div>
          </div>
        `
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '5%',
      containLabel: true,
      show: hasData
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: weightData.value.map((item) => item.date),
      show: hasData,
      axisLine: {
        lineStyle: {
          color: '#e0e6ed'
        }
      },
      axisLabel: {
        color: '#64748b',
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      show: hasData,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#64748b',
        fontSize: 12,
        formatter: '{value} kg'
      },
      splitLine: {
        lineStyle: {
          color: '#f1f5f9',
          type: 'dashed'
        }
      }
    },
    series: hasData
      ? [
          {
            name: '体重',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              width: 3,
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#667eea' },
                { offset: 1, color: '#764ba2' }
              ])
            },
            itemStyle: {
              color: '#667eea',
              borderColor: '#fff',
              borderWidth: 2
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
                { offset: 1, color: 'rgba(102, 126, 234, 0.05)' }
              ])
            },
            data: weightData.value.map((item) => item.weight)
          }
        ]
      : []
  }

  weightChart.setOption(option)

  // 响应式调整
  const handleResize = () => {
    weightChart?.resize()
  }
  window.addEventListener('resize', handleResize)
}

// 初始化卡路里图表
const initCaloriesChart = async () => {
  if (!caloriesChartRef.value) return

  // 销毁现有图表
  if (caloriesChart) {
    caloriesChart.dispose()
  }

  // 创建新图表
  caloriesChart = echarts.init(caloriesChartRef.value)

  const hasData = caloriesData.value.length > 0

  const option = {
    title: {
      show: !hasData,
      text: '暂无卡路里数据',
      textStyle: {
        color: '#999',
        fontSize: 16,
        fontWeight: 'normal'
      },
      left: 'center',
      top: 'middle'
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#667eea',
      borderWidth: 1,
      textStyle: {
        color: '#333'
      },
      formatter: (params: echarts.TooltipComponentFormatterCallbackParams) => {
        const paramsArray = Array.isArray(params) ? params : [params]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const firstItem = paramsArray[0] as any
        if (!firstItem) return ''
        const date = firstItem.axisValueLabel || ''
        let html = `<div style="padding: 8px;"><div style="font-weight: 600; margin-bottom: 4px;">${date}</div>`
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        paramsArray.forEach((item: any) => {
          html += `
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
              <span style="display: inline-block; width: 10px; height: 10px; background: ${item.color || '#667eea'}; border-radius: 50%;"></span>
              <span>${item.seriesName || ''}: ${item.value || 0} kcal</span>
            </div>
          `
        })
        html += '</div>'
        return html
      }
    },
    legend: {
      show: hasData,
      data: ['摄入', '消耗', '净摄入'],
      top: 0,
      textStyle: {
        color: '#64748b'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '12%',
      containLabel: true,
      show: hasData
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: caloriesData.value.map((item) => item.date),
      show: hasData,
      axisLine: {
        lineStyle: {
          color: '#e0e6ed'
        }
      },
      axisLabel: {
        color: '#64748b',
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      show: hasData,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#64748b',
        fontSize: 12,
        formatter: '{value} kcal'
      },
      splitLine: {
        lineStyle: {
          color: '#f1f5f9',
          type: 'dashed'
        }
      }
    },
    series: hasData
      ? [
          {
            name: '摄入',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              width: 3,
              color: '#10b981'
            },
            itemStyle: {
              color: '#10b981',
              borderColor: '#fff',
              borderWidth: 2
            },
            data: caloriesData.value.map((item) => item.intake)
          },
          {
            name: '消耗',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              width: 3,
              color: '#ef4444'
            },
            itemStyle: {
              color: '#ef4444',
              borderColor: '#fff',
              borderWidth: 2
            },
            data: caloriesData.value.map((item) => item.burn)
          },
          {
            name: '净摄入',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              width: 3,
              color: '#f59e0b'
            },
            itemStyle: {
              color: '#f59e0b',
              borderColor: '#fff',
              borderWidth: 2
            },
            data: caloriesData.value.map((item) => item.net)
          }
        ]
      : []
  }

  caloriesChart.setOption(option)

  // 响应式调整
  const handleResize = () => {
    caloriesChart?.resize()
  }
  window.addEventListener('resize', handleResize)
}

// 加载数据函数（TODO: 替换为真实 API 调用）
const loadWeightData = async () => {
  try {
    // [TODO] 调用真实 API

    // 模拟数据
    const days = parseInt(weightTimePeriod.value.replace('d', ''))
    const result: { date: string; weight: number }[] = []
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (days - 1 - i))
      result.push({
        date: formatShortDate(date.toISOString()),
        weight: 65 + Math.random() * 5
      })
    }

    weightData.value = result
    await nextTick()
    initWeightChart()
  } catch (error) {
    console.error('加载体重数据失败:', error)
    toast.add({ title: '加载体重数据失败', color: 'error' })
  }
}

const loadCaloriesData = async () => {
  try {
    // [TODO] 调用真实 API

    // 模拟数据
    const days = parseInt(caloriesTimePeriod.value.replace('d', ''))
    const result: { date: string; intake: number; burn: number; net: number }[] = []
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (days - 1 - i))
      const intake = 1800 + Math.random() * 400
      const burn = 300 + Math.random() * 200
      result.push({
        date: formatShortDate(date.toISOString()),
        intake: Math.round(intake),
        burn: Math.round(burn),
        net: Math.round(intake - burn)
      })
    }

    caloriesData.value = result
    await nextTick()
    initCaloriesChart()
  } catch (error) {
    console.error('加载卡路里数据失败:', error)
    toast.add({ title: '加载卡路里数据失败', color: 'error' })
  }
}

const loadHealthGoals = () => {
  // [TODO] 使用 useCookie 替代 localStorage
  const savedGoals = localStorage.getItem('healthGoals')
  if (savedGoals) {
    const parsed = JSON.parse(savedGoals)
    healthGoals.targetWeight = parsed.targetWeight
    healthGoals.dailyCaloriesIntake = parsed.dailyCaloriesIntake || parsed.dailyCalories
    healthGoals.dailyCaloriesBurn = parsed.dailyCaloriesBurn
  }
}

const refreshData = async () => {
  try {
    // [TODO] 调用真实 API 获取今日统计数据
    statistics.averageWeight = 68.5
    statistics.totalCaloriesConsumed = 1850
    statistics.totalCaloriesBurned = 450

    // 刷新图表数据
    loadWeightData()
    loadCaloriesData()
  } catch (error) {
    console.error('加载数据失败:', error)
    toast.add({ title: '加载数据失败', color: 'error' })
  }
}

// 生命周期
onMounted(async () => {
  loadHealthGoals()
  await refreshData()

  // 等待 DOM 完全渲染后初始化图表
  await nextTick()
  setTimeout(() => {
    loadWeightData()
    loadCaloriesData()
  }, 100)
})

// 监听时间段变化
watch(weightTimePeriod, () => {
  loadWeightData()
})

watch(caloriesTimePeriod, () => {
  loadCaloriesData()
})

// 清理
onUnmounted(() => {
  if (weightChart) {
    weightChart.dispose()
  }
  if (caloriesChart) {
    caloriesChart.dispose()
  }
})

// 对话框关闭后刷新数据（组件实现后使用）
// const handleDialogClose = () => {
//   refreshData()
// }
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50/30 via-indigo-50/50 to-pink-50/30 p-6">
    <!-- 页面头部 -->
    <div class="mb-6 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-400 p-8 shadow-xl">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="mb-2 flex items-center gap-3 text-3xl font-bold text-white">
            <UIcon name="i-heroicons-chart-bar" class="text-4xl" />
            数据概览
          </h1>
          <p class="text-blue-50">全面了解您的健康状况，追踪每日进展</p>
        </div>
        <UDropdown :items="quickRecordItems" :popper="{ placement: 'bottom-end' }">
          <UButton color="primary" size="lg" variant="solid">
            <template #leading>
              <UIcon name="i-heroicons-plus" />
            </template>
            快速记录
            <template #trailing>
              <UIcon name="i-heroicons-chevron-down" />
            </template>
          </UButton>
        </UDropdown>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
      <UCard class="transition-shadow hover:shadow-lg">
        <div class="flex items-center gap-4">
          <div
            class="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600"
          >
            <UIcon name="i-heroicons-chart-pie" class="text-3xl text-white" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-3xl font-bold text-gray-900">
              {{ statistics.averageWeight.toFixed(1) }}
            </div>
            <div class="mt-1 text-sm text-gray-600">当前体重（kg）</div>
            <div class="mt-1 text-xs text-gray-400">
              目标: {{ healthGoals.targetWeight || '未设置'
              }}{{ healthGoals.targetWeight ? ' kg' : '' }}
            </div>
          </div>
        </div>
      </UCard>

      <UCard class="transition-shadow hover:shadow-lg">
        <div class="flex items-center gap-4">
          <div
            class="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600"
          >
            <UIcon name="i-heroicons-cake" class="text-3xl text-white" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-3xl font-bold text-gray-900">
              {{ statistics.totalCaloriesConsumed }}
            </div>
            <div class="mt-1 text-sm text-gray-600">今日摄入（kcal）</div>
            <div class="mt-1 text-xs text-gray-400">
              目标: {{ healthGoals.dailyCaloriesIntake || '未设置'
              }}{{ healthGoals.dailyCaloriesIntake ? ' kcal' : '' }}
            </div>
          </div>
        </div>
      </UCard>

      <UCard class="transition-shadow hover:shadow-lg">
        <div class="flex items-center gap-4">
          <div
            class="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600"
          >
            <UIcon name="i-heroicons-bolt" class="text-3xl text-white" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-3xl font-bold text-gray-900">
              {{ statistics.totalCaloriesBurned }}
            </div>
            <div class="mt-1 text-sm text-gray-600">今日消耗（kcal）</div>
            <div class="mt-1 text-xs text-gray-400">
              目标: {{ healthGoals.dailyCaloriesBurn || '未设置'
              }}{{ healthGoals.dailyCaloriesBurn ? ' kcal' : '' }}
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- 数据趋势图表 -->
    <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <!-- 卡路里趋势图 -->
      <UCard>
        <template #header>
          <div class="space-y-4">
            <div class="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <UIcon name="i-heroicons-chart-bar" />
              <h3>卡路里趋势</h3>
            </div>
            <div class="flex flex-wrap gap-4 text-sm">
              <div class="flex items-center gap-2">
                <span class="text-gray-600">平均摄入:</span>
                <span class="font-semibold text-green-600"
                  >{{ averageCaloriesIntake.toFixed(0) }} kcal</span
                >
              </div>
              <div class="flex items-center gap-2">
                <span class="text-gray-600">平均消耗:</span>
                <span class="font-semibold text-red-600"
                  >{{ averageCaloriesBurn.toFixed(0) }} kcal</span
                >
              </div>
              <div class="flex items-center gap-2">
                <span class="text-gray-600">平均净摄入:</span>
                <span class="font-semibold text-yellow-600"
                  >{{ averageNetCalories.toFixed(0) }} kcal</span
                >
              </div>
            </div>
            <UButtonGroup size="sm" orientation="horizontal">
              <UButton
                v-for="btn in timePeriodButtons"
                :key="btn.value"
                :color="caloriesTimePeriod === btn.value ? 'primary' : 'neutral'"
                @click="caloriesTimePeriod = btn.value"
              >
                {{ btn.label }}
              </UButton>
            </UButtonGroup>
          </div>
        </template>
        <div ref="caloriesChartRef" class="h-[350px] w-full" />
      </UCard>

      <!-- 体重趋势图 -->
      <UCard>
        <template #header>
          <div class="space-y-4">
            <div class="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <UIcon name="i-heroicons-scale" />
              <h3>体重趋势</h3>
            </div>
            <UButtonGroup size="sm" orientation="horizontal">
              <UButton
                v-for="btn in timePeriodButtons"
                :key="btn.value"
                :color="weightTimePeriod === btn.value ? 'primary' : 'neutral'"
                @click="weightTimePeriod = btn.value"
              >
                {{ btn.label }}
              </UButton>
            </UButtonGroup>
          </div>
        </template>
        <div ref="weightChartRef" class="h-[350px] w-full" />
      </UCard>
    </div>

    <!-- 快速记录对话框（TODO: 实现组件） -->
    <!-- <QuickBodyDataDialog v-model="showBodyDataDialog" @close="handleDialogClose" /> -->
    <!-- <QuickDietDialog v-model="showDietDialog" @close="handleDialogClose" /> -->
    <!-- <QuickExerciseDialog v-model="showExerciseDialog" @close="handleDialogClose" /> -->
  </div>
</template>
