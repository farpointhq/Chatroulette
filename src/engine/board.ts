// ============================================
// Chess Engine — Board Representation
// ============================================

import type { Piece, Color, Square, File, Rank } from './types';

export const FILES: File[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
export const RANKS: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8];

export function fileToIndex(file: File): number {
  return FILES.indexOf(file);
}

export function rankToIndex(rank: Rank): number {
  return rank - 1;
}

export function indexToFile(index: number): File {
  if (index < 0 || index > 7) throw new Error(`Invalid file index: ${index}`);
  return FILES[index];
}

export function indexToRank(index: number): Rank {
  if (index < 0 || index > 7) throw new Error(`Invalid rank index: ${index}`);
  return (index + 1) as Rank;
}

export function parseSquare(square: string): Square {
  if (square.length !== 2) throw new Error(`Invalid square: ${square}`);
  const file = square[0] as File;
  const rank = parseInt(square[1], 10) as Rank;
  if (!FILES.includes(file) || rank < 1 || rank > 8) {
    throw new Error(`Invalid square: ${square}`);
  }
  return square;
}

export function squareToString(sq: Square): string {
  return sq;
}

export function getPieceAt(board: (Piece | null)[][], square: Square): Piece | null {
  const file = FILES.indexOf(square[0]);
  const rank = parseInt(square[1], 10) - 1;
  if (file < 0 || file > 7 || rank < 0 || rank > 7) return null;
  return board[rank][file];
}

export function setPieceAt(board: (Piece | null)[][], square: Square, piece: Piece | null): void {
  const file = FILES.indexOf(square[0]);
  const rank = parseInt(square[1], 10) - 1;
  if (file < 0 || file > 7 || rank < 0 || rank > 7) return;
  board[rank][file] = piece;
}

export function createEmptyBoard(): (Piece | null)[][] {
  const board: (Piece | null)[][] = [];
  for (let r = 0; r < 8; r++) {
    board[r] = [null, null, null, null, null, null, null, null];
  }
  return board;
}

export function createStartingBoard(): (Piece | null)[][] {
  const board = createEmptyBoard();

  const backRank: Piece['type'][] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];

  // Black pieces (rank 8, index 0)
  for (let f = 0; f < 8; f++) {
    board[0][f] = { type: backRank[f], color: 'b' };
    board[1][f] = { type: 'p', color: 'b' };
  }

  // White pieces (rank 1, index 7)
  for (let f = 0; f < 8; f++) {
    board[7][f] = { type: backRank[f], color: 'w' };
    board[6][f] = { type: 'p', color: 'w' };
  }

  return board;
}

export function cloneBoard(board: (Piece | null)[][]): (Piece | null)[][] {
  return board.map(row => row.map(cell => (cell ? { ...cell } : null)));
}
