import api from '@/services/api/users'
import type { User } from '@/types/user.types'

export const useUsersStore = defineStore('users', () => {
  const leaderboard = ref<User[]>([])

  async function getLeaderboard(limit: number, offset: number) {
    const { data, error } = await api.getLeaderboard({ limit, offset })

    if (error) return Promise.reject(error)

    leaderboard.value = data

    return data
  }

  async function getUser(id: string) {
    const { data, error } = await api.getUser(id)

    if (error) return Promise.reject(error)

    return data
  }

  return {
    leaderboard,
    getLeaderboard,
    getUser
  }
})
