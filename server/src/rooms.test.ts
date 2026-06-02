import { describe, it, expect, beforeEach } from 'vitest';
import {
  createRoom,
  joinRoom,
  leaveRoom,
  listRooms,
  getRoom,
  deleteRoom,
  clearRooms,
} from './rooms.js';
import type { PlayerInfo } from './types.js';

describe('rooms', () => {
  beforeEach(() => {
    clearRooms();
  });

  describe('createRoom', () => {
    it('generates a unique room ID', () => {
      const room1 = createRoom();
      const room2 = createRoom();
      expect(room1.id).toBeDefined();
      expect(room2.id).toBeDefined();
      expect(room1.id).not.toBe(room2.id);
    });

    it('uses provided name', () => {
      const room = createRoom('My Room');
      expect(room.name).toBe('My Room');
    });

    it('generates a default name when none provided', () => {
      const room = createRoom();
      expect(room.name).toMatch(/^Room /);
    });

    it('initializes with waiting status', () => {
      const room = createRoom();
      expect(room.status).toBe('waiting');
    });

    it('initializes with empty players array', () => {
      const room = createRoom();
      expect(room.players).toEqual([]);
    });
  });

  describe('joinRoom', () => {
    it('adds player to room', () => {
      const room = createRoom();
      const player: PlayerInfo = { id: 'player-1', name: 'Alice' };
      const updated = joinRoom(room.id, player);
      expect(updated.players).toHaveLength(1);
      expect(updated.players[0].id).toBe('player-1');
    });

    it('throws if room does not exist', () => {
      const player: PlayerInfo = { id: 'player-1' };
      expect(() => joinRoom('nonexistent', player)).toThrow('Room not found');
    });

    it('allows multiple players', () => {
      const room = createRoom();
      joinRoom(room.id, { id: 'p1' });
      joinRoom(room.id, { id: 'p2' });
      const updated = getRoom(room.id);
      expect(updated?.players).toHaveLength(2);
    });
  });

  describe('leaveRoom', () => {
    it('removes player from room and keeps room if other players remain', () => {
      const room = createRoom();
      joinRoom(room.id, { id: 'player-1' });
      joinRoom(room.id, { id: 'player-2' });
      const updated = leaveRoom(room.id, 'player-1');
      expect(updated).toBeDefined();
      expect(updated?.players).toHaveLength(1);
      expect(updated?.players[0].id).toBe('player-2');
    });

    it('returns null when last player leaves (room auto-deleted)', () => {
      const room = createRoom();
      joinRoom(room.id, { id: 'player-1' });
      const result = leaveRoom(room.id, 'player-1');
      expect(result).toBeNull();
      expect(getRoom(room.id)).toBeUndefined();
    });

    it('returns null when room becomes empty', () => {
      const room = createRoom();
      joinRoom(room.id, { id: 'player-1' });
      const result = leaveRoom(room.id, 'player-1');
      expect(result).toBeNull();
      expect(getRoom(room.id)).toBeUndefined();
    });

    it('returns undefined if room does not exist', () => {
      const result = leaveRoom('nonexistent', 'player-1');
      expect(result).toBeUndefined();
    });

    it('keeps room if other players remain', () => {
      const room = createRoom();
      joinRoom(room.id, { id: 'p1' });
      joinRoom(room.id, { id: 'p2' });
      const updated = leaveRoom(room.id, 'p1');
      expect(updated).toBeDefined();
      expect(updated?.players).toHaveLength(1);
      expect(updated?.players[0].id).toBe('p2');
    });
  });

  describe('listRooms', () => {
    it('returns empty array when no rooms', () => {
      expect(listRooms()).toEqual([]);
    });

    it('returns all active rooms', () => {
      createRoom('Room 1');
      createRoom('Room 2');
      const rooms = listRooms();
      expect(rooms).toHaveLength(2);
    });

    it('filters closed rooms', () => {
      const room = createRoom();
      // Simulate closing by deleting
      deleteRoom(room.id);
      expect(listRooms()).toHaveLength(0);
    });
  });

  describe('getRoom', () => {
    it('returns room by id', () => {
      const room = createRoom('Test');
      const found = getRoom(room.id);
      expect(found?.id).toBe(room.id);
      expect(found?.name).toBe('Test');
    });

    it('returns undefined for nonexistent room', () => {
      expect(getRoom('nonexistent')).toBeUndefined();
    });
  });

  describe('deleteRoom', () => {
    it('removes room', () => {
      const room = createRoom();
      expect(deleteRoom(room.id)).toBe(true);
      expect(getRoom(room.id)).toBeUndefined();
    });

    it('returns false for nonexistent room', () => {
      expect(deleteRoom('nonexistent')).toBe(false);
    });
  });
});
