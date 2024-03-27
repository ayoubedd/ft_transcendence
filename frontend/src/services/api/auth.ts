import { useFetch } from '@/composables/useFetch'
import type { User } from '@/types/user.types'

export async function login(code: string, strategy: string) {
  const endpoint = `${import.meta.env.VITE_API_URL}/auth/callback?code=${code}&strategy=${strategy}`

  return useFetch<{ access_token: string }>(endpoint)
}

export async function getMe() {
  const endpoint = `/users/me`

  return useFetch<User>(endpoint)
}

export async function twoFactorQr() {
  const endpoint = `/auth/twofa/generate`

  return useFetch<{ url: string }>(endpoint)
}

export async function twoFactorEnable(code: string) {
  const endpoint = `/auth/twofa/on`

  return useFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify({ code })
  })
}

export async function twoAuthAuthenticator(code: string) {
  const endpoint = `/auth/twofa/authenticate?code=${code}`

  return useFetch<{ access_token: string }>(endpoint)
}

export default {
  login,
  getMe,
  twoFactorQr,
  twoFactorEnable,
  twoAuthAuthenticator
}
