import { createFetch } from '@vueuse/core'

export const _useFetch = createFetch({
  baseUrl: import.meta.env.VITE_API_URL,
  options: {
    async beforeFetch(ctx) {
      const { options } = ctx
      const token = await useAuthStore().getToken()
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      return { options }
    },
    async onFetchError(ctx) {
      const { response } = ctx
      if (response?.status === 401) useAuthStore().logout()

      return ctx
    }
  }
})

export async function useFetch<T>(path: string, options?: RequestInit) {
  const BASE_URL = path.includes('api') ? '' : import.meta.env.VITE_API_URL
  const { token } = useAuthStore()

  let data: T = {} as T
  let tmpData: any = null
  let error: any = null

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      [options?.body instanceof FormData ? 'useless' : 'Content-Type']: 'application/json',
      ...options?.headers
    }
  })

  if (res.status === 401) useAuthStore().logout()
  if (res.status === 502) return { data, error: { message: 'Server is down' } }

  if (res.ok) tmpData = await res.text()

  try {
    data = JSON.parse(tmpData)
  } catch (e) {
    data = {} as T
  }

  if (!res.ok) error = await res.json()

  if (error && error.message instanceof Array) error.message = error.message.join(', ')

  return { data, error }
}
