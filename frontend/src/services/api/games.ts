import type { Game } from '@/types/game.types'
import type { User } from '@/types/user.types'

const BASE_PATH = '/games'

export async function getGames(payload: { userId: string; offset: number; limit: number }) {
  const endpoint = `${BASE_PATH}?userId=${payload.userId}&offset=${payload.offset}&limit=${payload.limit}`
  return useFetch<Game[]>(endpoint)
}

export async function getGame(payload: { userId: string }) {
  const endpoint = `${BASE_PATH}/ongoing?userId=${payload.userId}`
  return useFetch<{ matchId: string }>(endpoint)
}

export async function getRecentlyMet(payload: { offset: number; limit: number }) {
  const endpoint = `${BASE_PATH}/users?offset=${payload.offset}&limit=${payload.limit}`

  return useFetch<User[]>(endpoint)
}

export async function createGame() {
  return useFetch<Game>(BASE_PATH, { method: 'POST' })
}

export async function gameInviteSend(payload: { inviteeId: string; socketId: string }) {
  const endpoint = `${BASE_PATH}/invite`

  return useFetch(endpoint, { method: 'POST', body: JSON.stringify(payload) })
}

export async function gameInviteAccept(payload: { id: string; socketId: string }) {
  const endpoint = `${BASE_PATH}/invite/accept`

  return useFetch(endpoint, { method: 'POST', body: JSON.stringify(payload) })
}

export async function gameInviteReject(payload: { id: string }) {
  const endpoint = `${BASE_PATH}/invite/reject`

  return useFetch(endpoint, { method: 'POST', body: JSON.stringify(payload) })
}

export async function getOngoingGames(payload: { offset: number; limit: number }) {
  const endpoint = `${BASE_PATH}/ongoing/matches?offset=${payload.offset}&limit=${payload.limit}`

  return useFetch<any[]>(endpoint)
}

export default {
  getGames,
  getGame,
  createGame,
  getRecentlyMet,
  gameInviteSend,
  gameInviteAccept,
  gameInviteReject,
  getOngoingGames
}
