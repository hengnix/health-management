<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

// 首页自动跳转到 dashboard
await navigateTo('/dashboard', { replace: true })
</script>

<template>
  <div />
</template>
