// ============================================
// Chess Engine — FEN Parsing & Generation
// ============================================

import type { GameState, Square, CastlingRights } from './types';

export const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export function parseFEN(fen: string): GameState {
  throw new Error('Not implemented');
}

export function generateFEN(state: GameState): string {
  throw new Error('Not implemented');
}

export function parseCastlingRights(castlingPart: string): CastlingRights {
  throw new Error('Not implemented');
}

export function formatCastlingRights(rights: CastlingRights): string {
  throw new Error('Not implemented');
}
