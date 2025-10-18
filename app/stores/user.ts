import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = useCookie<string | null>('token', {
    maxAge: 60 * 60 * 24 * 7 // 7 天
  })
  const avatarUrl = ref<string | null>(null)
  const toast = useToast()

  const isLoggedIn = computed(() => !!token.value)

  // 解析 JWT token 获取 payload
  function parseJwt(tokenStr: string) {
    try {
      const base64Url = tokenStr.split('.')[1]
      if (!base64Url) {
        return null
      }
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch (e) {
      console.error('JWT parsing error:', e)
      return null
    }
  }

  // 登录
  async function login(_loginData: LoginRequest) {
    try {
      // [TODO] 替换为实际的 API 调用
      // const response = await $fetch('/api/auth/login', {
      //   method: 'POST',
      //   body: loginData
      // })

      // 临时模拟登录
      const mockToken = 'mock-jwt-token'
      token.value = mockToken

      const payload = parseJwt(mockToken)
      if (payload) {
        const userIDFromToken =
          payload.userId || payload.userID || payload.sub || payload.id || payload.user_id
        if (userIDFromToken) {
          const userIDCookie = useCookie('userID')
          userIDCookie.value = userIDFromToken
        }
      }

      toast.add({
        title: '登录成功',
        color: 'success'
      })

      try {
        await fetchUserProfile()
      } catch (e) {
        console.warn('Failed to fetch user profile after login:', e)
      }

      return true
    } catch (error: unknown) {
      const apiError = error as ApiError
      console.error('Login request failed:', apiError)
      toast.add({
        title: '登录失败',
        description: apiError.response?.data?.message || '请稍后重试',
        color: 'error'
      })
      return false
    }
  }

  // 注册
  async function register(_registerData: RegisterRequest) {
    try {
      // [TODO] 替换为实际的 API 调用
      // const response = await $fetch('/api/auth/register', {
      //   method: 'POST',
      //   body: registerData
      // })

      toast.add({
        title: '注册成功',
        description: '请登录',
        color: 'success'
      })
      return true
    } catch (error: unknown) {
      const apiError = error as ApiError
      toast.add({
        title: '注册失败',
        description: apiError.response?.data?.message || '请稍后重试',
        color: 'error'
      })
      return false
    }
  }

  // 获取用户信息
  async function fetchUserProfile() {
    if (!token.value) {
      return false
    }

    try {
      // [TODO] 替换为实际的 API 调用
      // const response = await $fetch('/api/user/profile', {
      //   headers: {
      //     Authorization: `Bearer ${token.value}`
      //   }
      // })

      // 临时使用模拟数据
      const userIDCookie = useCookie('userID')
      user.value = {
        userID: userIDCookie.value || 'mock-user-id',
        email: 'user@example.com',
        nickname: '用户',
        gender: '未知',
        dateOfBirth: '1990-01-01'
      } as User

      try {
        await fetchAvatar()
      } catch (e) {
        console.warn('Failed to fetch avatar:', e)
      }

      return true
    } catch (error: unknown) {
      const apiError = error as ApiError
      console.error('Failed to fetch user profile:', apiError)

      if (apiError.response?.status === 401) {
        console.warn('Token invalid, clearing login state')
        logout()
        toast.add({
          title: '登录已过期',
          description: '请重新登录',
          color: 'warning'
        })
        return false
      }

      console.warn('Failed to fetch user profile, but keeping login state:', apiError.message)
      return false
    }
  }

  // 获取用户头像
  async function fetchAvatar() {
    if (!token.value) {
      return false
    }

    try {
      // [TODO] 替换为实际的 API 调用
      // const response = await $fetch('/api/user/avatar', {
      //   headers: {
      //     Authorization: `Bearer ${token.value}`
      //   }
      // })

      // 临时返回 false
      if (avatarUrl.value && avatarUrl.value.startsWith('blob:')) {
        URL.revokeObjectURL(avatarUrl.value)
      }
      avatarUrl.value = null
      return false
    } catch (error: unknown) {
      console.warn('Failed to fetch avatar:', error)
      if (avatarUrl.value && avatarUrl.value.startsWith('blob:')) {
        URL.revokeObjectURL(avatarUrl.value)
      }
      avatarUrl.value = null
      return false
    }
  }

  // 更新用户信息
  async function updateProfile(_profileData: Partial<User>) {
    try {
      // [TODO] 替换为实际的 API 调用
      // const response = await $fetch('/api/user/profile', {
      //   method: 'PUT',
      //   headers: {
      //     Authorization: `Bearer ${token.value}`
      //   },
      //   body: profileData
      // })

      toast.add({
        title: '更新成功',
        color: 'success'
      })
      return true
    } catch (error: unknown) {
      const apiError = error as ApiError
      toast.add({
        title: '更新失败',
        description: apiError.response?.data?.message || '请稍后重试',
        color: 'error'
      })
      return false
    }
  }

  // 退出登录
  function logout() {
    user.value = null
    token.value = null

    // 清理头像 blob URL
    if (avatarUrl.value && avatarUrl.value.startsWith('blob:')) {
      URL.revokeObjectURL(avatarUrl.value)
    }
    avatarUrl.value = null

    // 清除 userID cookie
    const userIDCookie = useCookie('userID')
    userIDCookie.value = null

    toast.add({
      title: '已退出登录',
      color: 'neutral'
    })
  }

  // 初始化
  async function init() {
    if (token.value) {
      try {
        await fetchUserProfile()
      } catch (error) {
        console.warn('Failed to fetch user profile during init:', error)
      }
    }
  }

  async function updateAvatar() {
    return await fetchAvatar()
  }

  return {
    user,
    token,
    avatarUrl,
    isLoggedIn,
    login,
    register,
    fetchUserProfile,
    fetchAvatar,
    updateAvatar,
    updateProfile,
    logout,
    init
  }
})
