import { SocketWithUser } from '@/auth/ws.middleware';
import Matter from 'matter-js';
import type { Socket } from 'socket.io';

export type PlayerPosition = 'left' | 'right' | 'unset';

export interface Player {
  ready: boolean;
  inQueueTimestamp: Date;
  id: string;
  score: number;
  pos: PlayerPosition;
  y: number;
  socket: SocketWithUser;
  winner: boolean;
  angle: number;
}

export interface Match {
  id: string;
  state: 'starting' | 'ongoing' | 'finished';
  leftPlayer: Player;
  rightPlayer: Player;
  spectators: Socket[];
  ball: {
    x: number;
    y: number;
    vx: number;
    vy: number;
  };
  simulation?: PongSimulation;
  loopHandler?: NodeJS.Timeout;
  timeOutHandler?: NodeJS.Timeout;
  targetGoals: number;
  endCause?: 'win' | 'timeout' | 'opLeft';
}

export interface GameCreateBody {
  playerUnoId: string;
  playerDosId: string;
}

export interface PongSimulation {
  engine: Matter.Engine;
  ball: Matter.Body;
  leftPaddle: Matter.Body;
  rightPaddle: Matter.Body;
  leftWall: Matter.Body;
  rightWall: Matter.Body;
  tick: () => void;
  setLastTime: (date: Date) => void;
}

interface GameInvite {
  id: UUID;
  host: SocketWithUser;
  inviteeId: string;
  invitee?: SocketWithUser;
  timeOutHandler?: NodeJS.Timeout;
}
