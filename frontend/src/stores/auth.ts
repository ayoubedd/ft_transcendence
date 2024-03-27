import { useStorage } from '@vueuse/core'
import api from '@/services/api/auth'
import type { User } from '@/types/user.types'
import { jwtDecode } from 'jwt-decode'

export const useAuthStore = defineStore('auth', () => {
  const token = useStorage('__tk__', '', localStorage) as Ref<string>
  const strategy = useStorage('strategy', '', localStorage) as Ref<string>
  const isTwoFaInProgress = ref(false)
  const user = ref<User>({} as User)
  const isLoggedIn = computed(() => !!token.value)
  const router = useRouter()

  async function updateUser(data: Partial<User>) {
    user.value = { ...user.value, ...data }
  }

  function updateStrategy(newStrategy: string) {
    strategy.value = newStrategy
  }

  async function getToken() {
    if (!token.value) return router.push({ name: 'login' })
    return token.value
  }

  async function login(code: string) {
    const { data, error } = await api.login(code, strategy.value)

    if (error) return Promise.reject(error)

    const tokenData = jwtDecode(data.access_token) as {
      sub: string
      isTwoFaAuthenticated: boolean
      isTwoFaEnabled: boolean
      username: string
    }

    if (!tokenData) return await router.push({ name: 'login' })

    token.value = data.access_token || ''

    if (tokenData.isTwoFaEnabled) {
      isTwoFaInProgress.value = true
      await router.push({ name: '2fa' })

      return
    }

    router.push({ name: 'home' })
  }

  async function TwoFactorAuth(code: string) {
    const { data, error } = await api.twoAuthAuthenticator(code)

    if (error) return Promise.reject(error)

    token.value = data.access_token || ''
    isTwoFaInProgress.value = false
  }

  async function getMe() {
    if (!token.value) return
    const { data, error } = await api.getMe()

    if (error) return { error }

    user.value = data
    socketBind()
    return data
  }

  async function logout() {
    const tmpToken = token.value
    token.value = ''
    const res = await router.push({ name: 'login' })
    if (res) {
      token.value = tmpToken
      return
    }
    useSocketsStore().disconnectAll()
  }

  function socketBind() {
    useSocketsStore().connectAll()
    // update user status if the socket is connected
    const usersSocket = useSocketsStore().getSocket('users')
    usersSocket?.socket?.on('connect', async () => {
      if (!isLoggedIn.value) return
      const { data, error } = await api.getMe()
      if (error) return
      user.value.status = data.status
    })
  }

  return {
    token,
    user,
    isTwoFaInProgress,
    strategy,
    isLoggedIn,
    getToken,
    login,
    getMe,
    logout,
    updateUser,
    updateStrategy,
    TwoFactorAuth
  }
})
