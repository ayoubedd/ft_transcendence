import { useFetch } from '@/composables/useFetch'
import type { User } from '@/types/user.types'

const BASE_PATH = '/users'

export async function getUsers(options: { username: string; limit: number; offset: number }) {
  const endpoint = `${BASE_PATH}/search?username=${options.username}&limit=${options.limit}&offset=${options.offset}`

  return useFetch<User[]>(endpoint)
}

export async function getLeaderboard(options: { limit: number; offset: number }) {
  const endpoint = `${BASE_PATH}/leaderboard?limit=${options.limit}&offset=${options.offset}`

  return useFetch<User[]>(endpoint)
}

export async function getUser(id: string) {
  const endpoint = `${BASE_PATH}/profile?id=${id}`

  return useFetch<User>(endpoint)
}

export default {
  getUsers,
  getUser,
  getLeaderboard
}
