import type { User } from '@/types/user.types'

const BASE_PATH = '/users'

export async function getProfile(userId: string) {
  const endpoint = `${BASE_PATH}/profile?id=${userId}`

  return useFetch<User>(endpoint)
}

export async function getProfileByUsername(username: string) {
  const endpoint = `${BASE_PATH}/profile/${username}`

  return useFetch<User>(endpoint)
}

export async function updateProfile(data: Partial<User>) {
  const endpoint = `${BASE_PATH}/settings`

  const _payload = { username: useAuthStore().user.username, ...data }

  return useFetch<User>(endpoint, { method: 'POST', body: JSON.stringify(_payload) })
}

export async function uploadAvatar(file: File) {
  const endpoint = `${BASE_PATH}/avatar`

  const formData = new FormData()
  formData.append('avatar', file)

  return useFetch<User>(endpoint, { method: 'POST', body: formData })
}

export default {
  getProfile,
  updateProfile,
  uploadAvatar,
  getProfileByUsername
}
