import type { RoomState, PlayerInfo } from './types.js';

const rooms = new Map<string, RoomState>();
let roomCounter = 0;

export function createRoom(name?: string): RoomState {
  roomCounter++;
  const room: RoomState = {
    id: `room-${Date.now()}-${roomCounter}`,
    name: name ?? `Room ${roomCounter}`,
    players: [],
    status: 'waiting',
    createdAt: new Date(),
  };
  rooms.set(room.id, room);
  return room;
}

export function joinRoom(roomId: string, player: PlayerInfo): RoomState {
  const room = rooms.get(roomId);
  if (!room) {
    throw new Error('Room not found');
  }
  room.players.push(player);
  return room;
}

export function leaveRoom(roomId: string, playerId: string): RoomState | null | undefined {
  const room = rooms.get(roomId);
  if (!room) {
    return undefined;
  }
  room.players = room.players.filter((p) => p.id !== playerId);
  if (room.players.length === 0) {
    rooms.delete(roomId);
    return null;
  }
  return room;
}

export function listRooms(): RoomState[] {
  return Array.from(rooms.values()).filter((room) => room.status !== 'closed');
}

export function getRoom(roomId: string): RoomState | undefined {
  return rooms.get(roomId);
}

export function deleteRoom(roomId: string): boolean {
  return rooms.delete(roomId);
}

export function clearRooms(): void {
  rooms.clear();
  roomCounter = 0;
}

export function findRoomsByPlayer(playerId: string): RoomState[] {
  return Array.from(rooms.values()).filter((room) =>
    room.players.some((p) => p.id === playerId)
  );
}
