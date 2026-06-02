import type { Server as SocketIOServer, Socket } from 'socket.io';
import {
  createRoom,
  joinRoom,
  leaveRoom,
  listRooms,
  findRoomsByPlayer,
} from '../rooms.js';

export function registerSocketHandlers(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    // Auto-join lobby and send room list
    socket.join('lobby');
    socket.emit('room:list', listRooms());

    // Room creation
    socket.on('room:create', (data: { name?: string }, callback?: (response: { success: boolean; room: any }) => void) => {
      const room = createRoom(data?.name);
      // Add creator as first player
      room.players.push({ id: socket.id });
      socket.join(room.id);
      socket.to('lobby').emit('room:created', room);
      callback?.({ success: true, room });
    });

    // Room join
    socket.on('room:join', (roomId: string, callback?: (response: { success: boolean; room: any }) => void) => {
      try {
        const room = joinRoom(roomId, { id: socket.id });
        socket.join(roomId);
        socket.to(roomId).emit('room:playerJoined', { playerId: socket.id });
        socket.to('lobby').emit('room:updated', room);
        callback?.({ success: true, room });
      } catch (error) {
        callback?.({ success: false, room: null });
      }
    });

    // Room leave
    socket.on('room:leave', (roomId: string) => {
      const result = leaveRoom(roomId, socket.id);
      socket.leave(roomId);
      socket.to(roomId).emit('room:playerLeft', { playerId: socket.id });
      if (result) {
        socket.to('lobby').emit('room:updated', result);
      } else {
        socket.to('lobby').emit('room:list', listRooms());
      }
    });

    // Disconnect cleanup
    socket.on('disconnect', () => {
      const playerRooms = findRoomsByPlayer(socket.id);
      for (const room of playerRooms) {
        const result = leaveRoom(room.id, socket.id);
        socket.to(room.id).emit('room:playerLeft', { playerId: socket.id });
        if (result) {
          socket.to('lobby').emit('room:updated', result);
        } else {
          socket.to('lobby').emit('room:list', listRooms());
        }
      }
    });
  });
}
