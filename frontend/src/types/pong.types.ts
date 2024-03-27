interface Player {
  id: string
  y: number
  goals: number
  angle: number
  winner?: boolean
}

interface Ball {
  x: number
  y: number
  vx: number
  vy: number
}

export type MatchState = 'starting' | 'ongoing' | 'finished'

export interface PongMatch {
  myPosition?: 'left' | 'right'
  state: MatchState
  rightPlayer: Player
  leftPlayer: Player
  ball: Ball
  matchId: string
  statsPage?: string
  startDate?: string
  endCause?: 'win' | 'timeout' | 'opLeft'
}

export enum QueueingState {
  LOADING,
  FOUND,
  ERROR,
  TIMEOUT
}

export interface QueueMsg {
  status: 'found' | 'timeout' | 'error'
  matchId: string
  message?: string
}
