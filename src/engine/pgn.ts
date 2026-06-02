// ============================================
// Chess Engine — PGN Generation
// ============================================

import type { Move, Game, GameState } from './types';

export function moveToSAN(move: Move, state: GameState): string {
  throw new Error('Not implemented');
}

export function generatePGN(game: Game, headers?: Record<string, string>): string {
  throw new Error('Not implemented');
}

export function generateMoveNumber(fullmoveNumber: number, color: 'white' | 'black'): string {
  throw new Error('Not implemented');
}
