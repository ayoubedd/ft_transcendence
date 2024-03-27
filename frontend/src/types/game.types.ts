import type { User } from './user.types'

export type GameFilter = 'all' | 'ongoing' | 'victory' | 'defeat' | 'draw' | 'live'
export type GameStatus = 'OVER' | 'ONGOING' | 'PENDING'
export type GameOverStatus = 'VICTORY' | 'DEFEAT' | 'DRAW' | 'TIMEOUT' | 'CANCEL' | 'ERROR'

export interface Game {
  id: string
  status: GameStatus
  user: User
  opponent: User
  winner: { id: string }
  winnerScore: number
  looserScore: number
  createdAt: string
  updatedAt: string
}
