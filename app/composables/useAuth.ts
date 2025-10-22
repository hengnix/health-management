/**
 * 用户认证状态管理
 */

export const useAuth = () => {
  const user = useState<User | null>('user', () => null)
  const avatarUrl = useState<string | null>('avatarUrl', () => null)

  // 使用 cookie 存储 token（自动在服务端和客户端同步）
  const token = useCookie<string | null>('token', {
    maxAge: 60 * 60 * 24 * 7, // 7 天
    sameSite: 'lax',
    secure: import.meta.env.PROD
  })

  // 使用 cookie 存储 userID
  const userID = useCookie<string | null>('userID', {
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
    secure: import.meta.env.PROD
  })

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)

  // 获取 toast 实例的辅助函数（仅客户端）
  const getToast = () => {
    if (import.meta.client) {
      return useToast()
    }
    return { add: () => {} }
  }

  // 解析 JWT token 获取 payload（仅客户端）
  const parseJwt = (tokenStr: string) => {
    if (!import.meta.client) return null

    try {
      const base64Url = tokenStr.split('.')[1]
      if (!base64Url) return null

      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch {
      return null
    }
  }

  // 登录
  const login = async (loginData: LoginRequest) => {
    try {
      const response = await $fetch<{ code: number; data?: string; msg?: string }>(
        '/api/auth/login',
        {
          method: 'POST',
          body: loginData
        }
      )

      // 适配后端返回格式：code: 1 表示成功，code: 0 表示失败
      if (response.code === 1 && response.data) {
        token.value = response.data

        const payload = parseJwt(response.data)
        if (payload) {
          const userIDFromToken =
            payload.userId || payload.userID || payload.sub || payload.id || payload.user_id
          if (userIDFromToken) {
            userID.value = userIDFromToken
          }
        }

        getToast().add({
          title: '登录成功',
          color: 'success'
        })

        await fetchUserProfile()
        return true
      } else {
        // 后端返回失败信息
        throw new Error(response.msg || '登录失败')
      }
    } catch (error: unknown) {
      const apiError = error as ApiError
      getToast().add({
        title: '登录失败',
        description: apiError.message || apiError.response?.data?.message || '请稍后重试',
        color: 'error'
      })
      return false
    }
  }

  // 注册
  const register = async (registerData: RegisterRequest) => {
    try {
      const response = await $fetch<{ code: number; msg?: string }>('/api/auth/register', {
        method: 'POST',
        body: registerData
      })

      // 适配后端返回格式：code: 1 表示成功，code: 0 表示失败
      if (response.code === 1) {
        getToast().add({
          title: '注册成功',
          description: '请登录',
          color: 'success'
        })
        return true
      } else {
        throw new Error(response.msg || '注册失败')
      }
    } catch (error: unknown) {
      const apiError = error as ApiError

      getToast().add({
        title: '注册失败',
        description: apiError.message || apiError.response?.data?.message || '请稍后重试',
        color: 'error'
      })
      return false
    }
  }

  // 获取用户信息
  const fetchUserProfile = async () => {
    if (!token.value) {
      return false
    }

    try {
      const response = await $fetch<{ code: number; data: User; msg?: string }>(
        '/api/user/profile',
        {
          headers: {
            Authorization: `Bearer ${token.value}`
          }
        }
      )

      if (response.code === 1 && response.data) {
        user.value = response.data
        await fetchAvatar()
        return true
      } else {
        throw new Error(response.msg || '获取用户信息失败')
      }
    } catch (error: unknown) {
      const apiError = error as ApiError

      if (apiError.response?.status === 401) {
        logout()
        getToast().add({
          title: '登录已过期',
          description: '请重新登录',
          color: 'warning'
        })
        return false
      }

      return false
    }
  }

  // 获取用户头像
  const fetchAvatar = async () => {
    if (!token.value) {
      return false
    }

    try {
      const response = await $fetch<Blob>('/api/user/avatar', {
        headers: {
          Authorization: `Bearer ${token.value}`
        },
        responseType: 'blob'
      })

      if (import.meta.client && avatarUrl.value && avatarUrl.value.startsWith('blob:')) {
        URL.revokeObjectURL(avatarUrl.value)
      }

      if (import.meta.client && response) {
        avatarUrl.value = URL.createObjectURL(response)
        return true
      }

      return false
    } catch {
      if (import.meta.client && avatarUrl.value && avatarUrl.value.startsWith('blob:')) {
        URL.revokeObjectURL(avatarUrl.value)
      }
      avatarUrl.value = null
      return false
    }
  }

  // 更新头像
  const updateAvatar = async () => {
    return await fetchAvatar()
  }

  // 更新用户信息
  const updateProfile = async (profileData: Partial<User>) => {
    try {
      const response = await $fetch<{ code: number; msg?: string }>('/api/user/profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token.value}`
        },
        body: profileData
      })

      if (response.code === 1) {
        getToast().add({
          title: '更新成功',
          color: 'success'
        })
        return true
      } else {
        throw new Error(response.msg || '更新失败')
      }
    } catch (error: unknown) {
      const apiError = error as ApiError
      getToast().add({
        title: '更新失败',
        description: apiError.message || apiError.response?.data?.message || '请稍后重试',
        color: 'error'
      })
      return false
    }
  }

  // 退出登录
  const logout = () => {
    user.value = null
    token.value = null
    userID.value = null

    // 清理头像 blob URL
    if (import.meta.client && avatarUrl.value && avatarUrl.value.startsWith('blob:')) {
      URL.revokeObjectURL(avatarUrl.value)
    }
    avatarUrl.value = null

    getToast().add({
      title: '已退出登录',
      color: 'neutral'
    })
  }

  // 初始化
  const init = async () => {
    if (token.value) {
      await fetchUserProfile()
    }
  }

  return {
    // 状态
    user: readonly(user),
    token: readonly(token),
    avatarUrl: readonly(avatarUrl),
    isLoggedIn,

    // 方法
    login,
    register,
    fetchUserProfile,
    fetchAvatar,
    updateAvatar,
    updateProfile,
    logout,
    init
  }
}
