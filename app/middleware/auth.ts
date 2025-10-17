export default defineNuxtRouteMiddleware((to) => {
  const config = useRuntimeConfig().public
  if (config.SKIP_AUTH === 'true') return

  const token = useCookie('token')
  const publicRoutes = ['/login', '/register']
  if (!token.value && !publicRoutes.includes(to.path)) {
    return navigateTo('/login')
  }
})
