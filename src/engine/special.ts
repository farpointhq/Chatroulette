// ============================================
// Chess Engine — Special Moves (Castling, En Passant, Promotion)
// ============================================

import type { Color, Square, Move, GameState, CastlingRights } from './types';

export function canCastleKingside(state: GameState, color: Color): boolean {
  throw new Error('Not implemented');
}

export function canCastleQueenside(state: GameState, color: Color): boolean {
  throw new Error('Not implemented');
}

export function getCastlingRookSquare(color: Color, side: 'kingside' | 'queenside'): { kingFrom: Square; kingTo: Square; rookFrom: Square; rookTo: Square } {
  throw new Error('Not implemented');
}

export function isEnPassantTarget(state: GameState, square: Square): boolean {
  throw new Error('Not implemented');
}

export function canPromote(from: Square, to: Square, color: Color): boolean {
  throw new Error('Not implemented');
}

export function getPromotionRank(color: Color): number {
  throw new Error('Not implemented');
}

export function updateCastlingRights(state: GameState, move: Move): CastlingRights {
  throw new Error('Not implemented');
}
