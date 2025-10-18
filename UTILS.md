# 工具函数文档

本文档记录项目中可复用的工具函数和组件，供开发时参考。

## 目录结构

```
app/
├── utils/
│   ├── dateUtils.ts                 # 日期相关工具
│   └── metricUtils.ts               # 健康指标计算工具
├── components/
│   └── CalendarYearMonthSelect.vue  # 日历年月选择器
└── types/
    └── index.ts                     # 类型定义
```

---

## MetricUtils (健康指标工具)

**文件位置**: `app/utils/metricUtils.ts`

### calcBMI

计算 BMI 指数（Body Mass Index）。

**类型签名**:

```typescript
function calcBMI(item: Pick<BodyData, 'weightKG' | 'heightCM'>): number | null
```

**参数**:

- `item`: 包含 `weightKG` 和 `heightCM` 的对象
  - `weightKG`: 体重（千克）
  - `heightCM`: 身高（厘米）

**返回值**:

- `number`: 计算得到的 BMI 值
- `null`: 当数据无效或缺失时

**示例**:

```typescript
import { calcBMI } from '~/utils/metricUtils'

const bmi = calcBMI({ weightKG: 68.5, heightCM: 175 })
console.log(bmi) // 22.4
```

---

### formatBMI

格式化 BMI 为字符串（保留一位小数）。

**类型签名**:

```typescript
function formatBMI(item: Pick<BodyData, 'weightKG' | 'heightCM'>): string
```

**参数**:

- `item`: 包含 `weightKG` 和 `heightCM` 的对象

**返回值**:

- `string`: 格式化后的 BMI 字符串（如 `"22.4"`）
- `"--"`: 当数据无效时

**示例**:

```typescript
import { formatBMI } from '~/utils/metricUtils'

const formatted = formatBMI({ weightKG: 68.5, heightCM: 175 })
console.log(formatted) // "22.4"
```

---

### getBMIStatus

根据 BMI 值返回健康状态分类和颜色。

**类型签名**:

```typescript
interface BMIStatus {
  status: string
  color: string
}

function getBMIStatus(bmi: number | null): BMIStatus
```

**参数**:

- `bmi`: BMI 数值或 `null`

**返回值**:

- `BMIStatus` 对象，包含：
  - `status`: 状态文本（`"偏瘦"` | `"正常"` | `"偏胖"` | `"肥胖"` | `"未知"`）
  - `color`: Tailwind CSS 颜色类名

**BMI 分类标准** (基于 WHO 通用标准):

| BMI 范围    | 状态 | 颜色              |
| ----------- | ---- | ----------------- |
| < 18.5      | 偏瘦 | `text-blue-600`   |
| 18.5 - 23.9 | 正常 | `text-green-600`  |
| 24 - 27.9   | 偏胖 | `text-yellow-600` |
| ≥ 28        | 肥胖 | `text-red-600`    |
| null        | 未知 | `text-gray-500`   |

**示例**:

```typescript
import { calcBMI, getBMIStatus } from '~/utils/metricUtils'

const bmi = calcBMI({ weightKG: 68.5, heightCM: 175 })
const status = getBMIStatus(bmi)
console.log(status) // { status: "正常", color: "text-green-600" }
```

**在模板中使用**:

```vue
<script setup>
import { calcBMI, getBMIStatus } from '~/utils/metricUtils'

const bodyData = ref({ weightKG: 68.5, heightCM: 175 })
const bmi = computed(() => calcBMI(bodyData.value))
const status = computed(() => getBMIStatus(bmi.value))
</script>

<template>
  <div>
    <span>BMI: {{ bmi?.toFixed(1) ?? '--' }}</span>
    <span :class="status.color">{{ status.status }}</span>
  </div>
</template>
```

---

## DateUtils (日期工具)

**文件位置**: `app/utils/dateUtils.ts`

### getTodayDateValue

获取今天的日期值（DateValue 类型）。

**示例**:

```typescript
import { getTodayDateValue } from '~/utils/dateUtils'

const today = getTodayDateValue()
```

### dateValueToString

将 DateValue 转换为 `YYYY-MM-DD` 格式字符串。

**示例**:

```typescript
import { dateValueToString, getTodayDateValue } from '~/utils/dateUtils'

const today = getTodayDateValue()
const dateStr = dateValueToString(today)
console.log(dateStr) // "2025-10-19"
```

---

## 可复用组件

### CalendarYearMonthSelect

**文件位置**: `app/components/CalendarYearMonthSelect.vue`

年月快速选择组件，用于 UCalendar 的 heading 插槽。

**Props**:

- `placeholder`: DateValue - 当前显示的年月
- `minValue`: DateValue - 最小可选日期
- `maxValue`: DateValue - 最大可选日期

**使用示例**:

```vue
<template>
  <UCalendar
    v-model="selectedDate"
    v-model:placeholder="placeholder"
    :min-value="minValue"
    :max-value="maxValue"
  >
    <template #heading="{ value }">
      <CalendarYearMonthSelect
        v-model:placeholder="placeholder"
        :min-value="minValue"
        :max-value="maxValue"
      >
        {{ value }}
      </CalendarYearMonthSelect>
    </template>
  </UCalendar>
</template>
```

---

## 设计原则

在添加新的工具函数或组件时，请遵循以下原则：

### ✅ 应该提取的情况

1. **逻辑在 3+ 处使用** - 真正的复用价值
2. **计算逻辑复杂** - 如 BMI 计算、日期格式化
3. **业务规则固定** - 如 BMI 分类标准
4. **便于测试** - 独立的纯函数

### ❌ 不应该提取的情况

1. **只用 1-2 次** - 过早优化
2. **逻辑差异大** - 需要大量参数配置
3. **绑定特定组件状态** - 如 v-model 绑定
4. **代码已足够清晰** - 提取反而增加复杂度

---

## 类型定义

**文件位置**: `app/types/index.ts`

### BodyData

身体数据类型定义。

```typescript
export interface BodyData {
  bodyMetricID: number
  userID: string
  heightCM: number
  weightKG: number
  recordDate: string // YYYY-MM-DD
  bmi?: number
  createdAt?: string
  updatedAt?: string
}
```
