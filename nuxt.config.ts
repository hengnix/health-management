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
    dirs: [
      // 默认已包含: composables/**, utils/**
      'types'
    ]
  },

  devtools: {
    enabled: true
  },

  app: {
    head: {
      title: '健康生活管理系统',
      htmlAttrs: {
        lang: 'zh-CN'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '健康生活管理系统 - 您的健康小助手' }
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.svg' }]
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' }
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      apiBase: '/api'
    }
  },

  routeRules: {
    // 公开页面 - 预渲染（SEO + 性能）
    '/': { prerender: true },
    '/login': { prerender: true },

    // 管理后台页面 - 客户端渲染（交互优先）
    '/dashboard': { ssr: false },
    '/chat': { ssr: false },
    '/body-data': { ssr: false },
    '/diet': { ssr: false },
    '/exercise': { ssr: false },
    '/profile': { ssr: false },

    // API 路由 - CORS 支持
    '/api/**': { cors: true }
  },

  compatibilityDate: '2025-01-15',

  vite: {
    server: {
      proxy:
        import.meta.env.ENABLE_API_PROXY === 'true'
          ? {
              '/api': {
                target: import.meta.env.API_TARGET || 'http://localhost:8080',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),

                bypass: (req) => {
                  const path = req.url || ''
                  if (path.includes('/_nuxt_icon/')) {
                    return path.replace('/api', '')
                  }
                  return null
                },

                configure: (proxy) => {
                  // 禁用压缩，避免 Vite 代理处理 gzip 出现问题
                  const proxyWithEvents = proxy as unknown as {
                    on: (event: string, handler: (proxyReq: unknown) => void) => void
                  }
                  proxyWithEvents.on('proxyReq', (proxyReq: unknown) => {
                    const req = proxyReq as { setHeader: (name: string, value: string) => void }
                    req.setHeader('Accept-Encoding', 'identity')
                  })
                }
              }
            }
          : undefined
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
