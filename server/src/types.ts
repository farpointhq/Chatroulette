export interface ServerConfig {
  port: number;
  corsOrigin: string;
  nodeEnv: string;
}

export interface PlayerInfo {
  id: string;
  name?: string;
  avatar?: string;
}

export interface RoomState {
  id: string;
  name: string;
  players: PlayerInfo[];
  status: 'waiting' | 'playing' | 'closed';
  createdAt: Date;
}

export interface SocketEvents {
  'room:list': (rooms: RoomState[]) => void;
  'room:create': (data: { name?: string }, callback?: (response: { success: boolean; room: RoomState }) => void) => void;
  'room:join': (roomId: string, callback?: (response: { success: boolean; room: RoomState }) => void) => void;
  'room:leave': (roomId: string) => void;
  'room:created': (room: RoomState) => void;
  'room:updated': (room: RoomState) => void;
  'room:playerJoined': (data: { playerId: string }) => void;
  'room:playerLeft': (data: { playerId: string }) => void;
}
