import type { Game, GameFilter, GameOverStatus } from '@/types/game.types'
import type { User } from '@/types/user.types'

import gamesAPI from '@/services/api/games'

export const boards = [
  { id: 0, bg: null, paddle: '#fff' },
  { id: 1, bg: '/boards/board-bg-1.svg', paddle: '#fff' },
  { id: 2, bg: '/boards/board-bg-2.svg', paddle: '#fff' },
  { id: 3, bg: '/boards/board-bg-3.svg', paddle: '#fff' }
]

export const useGameStore = defineStore('game', () => {
  const games = ref<Game[]>([])
  const gamesOngoing = ref<Game[]>([])
  const selectedBoard = ref<(typeof boards)[0]>(boards[0])
  const recentlyMet = ref<User[]>([])
  const activeFilter = ref<GameFilter>('live')
  const gameStatus = ref<GameOverStatus | null>(null)

  const filteredGames = computed(() => {
    switch (activeFilter.value) {
      case 'live':
        return gamesOngoing.value
      case 'all':
        return games.value
      case 'ongoing':
        return gamesOngoing.value
      case 'victory':
        return games.value.filter(
          (game) => game.status === 'OVER' && game.winner?.id === useAuthStore().user.id
        )
      case 'defeat':
        return games.value.filter(
          (game) =>
            game.status === 'OVER' &&
            game.winner != null &&
            game.winner.id !== useAuthStore().user.id
        )
      case 'draw':
        return games.value.filter((game) => game.status === 'OVER' && game.winner === null)
      default:
        return []
    }
  })

  function $reset() {
    games.value = []
    gamesOngoing.value = []
    recentlyMet.value = []
    gameStatus.value = null
  }

  function setGameStatus(status: GameOverStatus | null) {
    gameStatus.value = status
  }

  function setGameFilter(filter: GameFilter) {
    activeFilter.value = filter
  }

  async function setBoard(id: number) {
    if (id < 0 || id > boards.length) return
    selectedBoard.value = boards[id]
  }

  async function fetchGames(payload: { userId: string; offset: number; limit: number }) {
    const { data, error } = await gamesAPI.getGames(payload)
    if (error) return Promise.reject(error)
    games.value.push(...data)
    await fetchOngoingGames({ offset: 0, limit: 100 })

    return data
  }

  async function fetchOngoingGames(payload: { offset: number; limit: number }) {
    const { data, error } = await gamesAPI.getOngoingGames(payload)
    if (error) return Promise.reject(error)

    const _ongoing: Game[] = data.map((game) => ({
      id: game.id,
      looserScore: game.looserScore ?? 0,
      winnerScore: game.winnerScore ?? 0,
      winner: { id: '' },
      status: 'ONGOING',
      user: game.leftPlayer,
      opponent: game.rightPlayer,
      updatedAt: game.updatedAt,
      createdAt: game.createdAt
    }))

    gamesOngoing.value = _ongoing

    return _ongoing
  }

  async function fetchRecentlyMet(payload: { userId: string; offset: number; limit: number }) {
    const { data, error } = await gamesAPI.getRecentlyMet(payload)
    if (error) return Promise.reject(error)
    recentlyMet.value.push(...data)

    return data
  }

  async function createGame() {
    const { data, error } = await gamesAPI.createGame()
    if (error) return Promise.reject(error)
    games.value.push(data)
    return data
  }

  async function sendGameInvite(payload: { inviteeId: string }) {
    const socketId = useSocketsStore().getSocket('pong')?.socket.id as string

    const newPayload = { ...payload, socketId }
    const { data, error } = await gamesAPI.gameInviteSend(newPayload)
    if (error) return Promise.reject(error)
    return data
  }

  async function acceptGameInvite(payload: { id: string }) {
    const socketId = useSocketsStore().getSocket('pong')?.socket.id as string

    const newPayload = { ...payload, socketId }
    const { data, error } = await gamesAPI.gameInviteAccept(newPayload)
    if (error) return Promise.reject(error)
    return data
  }

  async function rejectGameInvite(payload: { id: string }) {
    const { data, error } = await gamesAPI.gameInviteReject(payload)
    if (error) return Promise.reject(error)
    return data
  }

  return {
    games,
    gamesOngoing,
    activeFilter,
    filteredGames,
    gameStatus,
    recentlyMet,
    selectedBoard,
    $reset,
    setBoard,
    setGameStatus,
    setGameFilter,
    fetchGames,
    fetchOngoingGames,
    fetchRecentlyMet,
    sendGameInvite,
    acceptGameInvite,
    rejectGameInvite,
    createGame
  }
})
