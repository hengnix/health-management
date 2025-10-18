// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui'],

  components: [
    {
      path: '~/components',
      pathPrefix: false // 不使用文件夹名作为组件名前缀
    }
  ],

  imports: {
    // 自动导入目录配置
    dirs: [
      // 默认已包含: composables/**, utils/**
      'stores',
      'types'
    ]
  },

  devtools: {
    enabled: true
  },

  app: {
    head: {
      title: '健康生活管理系统',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '健康生活管理系统 - 您的健康小助手' }
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
    }
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      apiBase: '/api'
    }
  },

  routeRules: {
    '/login': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  // 后端 API 代理配置
  nitro: {
    devProxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
