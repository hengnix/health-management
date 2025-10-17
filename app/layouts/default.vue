<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- 顶部导航栏 -->
    <header class="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div class="flex h-16 items-center justify-between px-6">
        <div class="flex items-center gap-3">
          <UIcon
            name="i-heroicons-chart-bar"
            class="text-3xl text-primary"
          />
          <h1 class="text-xl font-bold">
            健康生活管理系统
          </h1>
        </div>
      </div>
    </header>

    <!-- 主体容器 -->
    <div class="flex">
      <!-- 左侧菜单栏 -->
      <aside class="fixed left-0 top-16 bottom-0 w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-y-auto">
        <div class="p-4 space-y-6">
          <!-- 导航标题 -->
          <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-medium">
            <UIcon name="i-heroicons-bars-3" />
            <span>导航菜单</span>
          </div>

          <!-- 导航菜单 -->
          <nav class="space-y-1">
            <NuxtLink
              v-for="link in menuLinks"
              :key="link.to"
              :to="link.to"
              class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              active-class="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
            >
              <UIcon
                :name="link.icon"
                class="text-lg"
              />
              <span>{{ link.label }}</span>
            </NuxtLink>
          </nav>

          <!-- 用户信息区域 -->
          <div class="pt-4 border-t border-gray-200 dark:border-gray-800">
            <UButton
              variant="ghost"
              color="neutral"
              block
              class="justify-start"
              @click="goToProfile"
            >
              <template #leading>
                <UAvatar
                  v-if="userStore.avatarUrl"
                  :src="userStore.avatarUrl"
                  size="xs"
                />
                <UIcon
                  v-else
                  name="i-heroicons-user"
                  class="text-lg"
                />
              </template>
              {{ userStore.user?.nickname || '用户' }}
            </UButton>
          </div>
        </div>
      </aside>

      <!-- 主内容区 -->
      <main class="flex-1 ml-64 p-6">
        <div class="max-w-7xl mx-auto">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()

// 临时 store，后续迁移真正的 user store
const userStore = ref({
  user: { nickname: '用户' },
  avatarUrl: ''
})

const menuLinks = computed(() => [
  {
    label: '数据概览',
    icon: 'i-heroicons-chart-bar',
    to: '/dashboard'
  },
  {
    label: '身体数据',
    icon: 'i-heroicons-chart-pie',
    to: '/body-data'
  },
  {
    label: '饮食管理',
    icon: 'i-heroicons-cake',
    to: '/diet'
  },
  {
    label: '运动管理',
    icon: 'i-heroicons-fire',
    to: '/exercise'
  },
  {
    label: '健康咨询',
    icon: 'i-heroicons-chat-bubble-left-right',
    to: '/chat'
  }
])

function goToProfile() {
  router.push('/profile')
}
</script>
