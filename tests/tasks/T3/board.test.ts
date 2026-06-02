import { describe, it, expect } from 'vitest';
import {
  fileToIndex, rankToIndex, indexToFile, indexToRank,
  parseSquare, squareToString,
  getPieceAt, setPieceAt,
  createEmptyBoard, createStartingBoard, cloneBoard,
} from '../../../src/engine/board';

describe('Board — Coordinate Conversions', () => {
  it('fileToIndex converts a through h to 0 through 7', () => {
    expect(fileToIndex('a')).toBe(0);
    expect(fileToIndex('h')).toBe(7);
    expect(fileToIndex('e')).toBe(4);
  });

  it('rankToIndex converts 1 through 8 to 0 through 7', () => {
    expect(rankToIndex(1)).toBe(0);
    expect(rankToIndex(8)).toBe(7);
    expect(rankToIndex(4)).toBe(3);
  });

  it('indexToFile converts 0 through 7 to a through h', () => {
    expect(indexToFile(0)).toBe('a');
    expect(indexToFile(7)).toBe('h');
    expect(indexToFile(4)).toBe('e');
  });

  it('indexToFile throws on invalid index', () => {
    expect(() => indexToFile(-1)).toThrow();
    expect(() => indexToFile(8)).toThrow();
  });

  it('indexToRank converts 0 through 7 to 1 through 8', () => {
    expect(indexToRank(0)).toBe(1);
    expect(indexToRank(7)).toBe(8);
    expect(indexToRank(3)).toBe(4);
  });

  it('indexToRank throws on invalid index', () => {
    expect(() => indexToRank(-1)).toThrow();
    expect(() => indexToRank(8)).toThrow();
  });
});

describe('Board — Square Parsing', () => {
  it('parseSquare converts algebraic notation to Square', () => {
    expect(parseSquare('e4')).toEqual({ file: 'e', rank: 4 });
    expect(parseSquare('a1')).toEqual({ file: 'a', rank: 1 });
    expect(parseSquare('h8')).toEqual({ file: 'h', rank: 8 });
  });

  it('parseSquare throws on invalid notation', () => {
    expect(() => parseSquare('')).toThrow();
    expect(() => parseSquare('i1')).toThrow();
    expect(() => parseSquare('a9')).toThrow();
    expect(() => parseSquare('abc')).toThrow();
  });

  it('squareToString converts Square to algebraic notation', () => {
    expect(squareToString({ file: 'e', rank: 4 })).toBe('e4');
    expect(squareToString({ file: 'a', rank: 1 })).toBe('a1');
    expect(squareToString({ file: 'h', rank: 8 })).toBe('h8');
  });
});

describe('Board — Board Creation', () => {
  it('createEmptyBoard returns an 8x8 array of nulls', () => {
    const board = createEmptyBoard();
    expect(board).toHaveLength(8);
    for (let f = 0; f < 8; f++) {
      expect(board[f]).toHaveLength(8);
      for (let r = 0; r < 8; r++) {
        expect(board[f][r]).toBeNull();
      }
    }
  });

  it('createStartingBoard has correct piece placement', () => {
    const board = createStartingBoard();

    // Check pawns
    for (let f = 0; f < 8; f++) {
      expect(board[f][1]).toEqual({ type: 'pawn', color: 'white' });
      expect(board[f][6]).toEqual({ type: 'pawn', color: 'black' });
    }

    // Check back rank pieces for white
    expect(board[0][0]).toEqual({ type: 'rook', color: 'white' });
    expect(board[1][0]).toEqual({ type: 'knight', color: 'white' });
    expect(board[2][0]).toEqual({ type: 'bishop', color: 'white' });
    expect(board[3][0]).toEqual({ type: 'queen', color: 'white' });
    expect(board[4][0]).toEqual({ type: 'king', color: 'white' });
    expect(board[5][0]).toEqual({ type: 'bishop', color: 'white' });
    expect(board[6][0]).toEqual({ type: 'knight', color: 'white' });
    expect(board[7][0]).toEqual({ type: 'rook', color: 'white' });

    // Check back rank pieces for black
    expect(board[0][7]).toEqual({ type: 'rook', color: 'black' });
    expect(board[1][7]).toEqual({ type: 'knight', color: 'black' });
    expect(board[2][7]).toEqual({ type: 'bishop', color: 'black' });
    expect(board[3][7]).toEqual({ type: 'queen', color: 'black' });
    expect(board[4][7]).toEqual({ type: 'king', color: 'black' });
    expect(board[5][7]).toEqual({ type: 'bishop', color: 'black' });
    expect(board[6][7]).toEqual({ type: 'knight', color: 'black' });
    expect(board[7][7]).toEqual({ type: 'rook', color: 'black' });

    // Check empty center squares
    expect(board[0][3]).toBeNull();
    expect(board[4][4]).toBeNull();
  });

  it('cloneBoard creates an independent copy', () => {
    const original = createStartingBoard();
    const clone = cloneBoard(original);

    // Mutate original
    clone[4][4] = { type: 'queen', color: 'white' };

    // Original should be unchanged
    expect(original[4][4]).toBeNull();
    expect(clone[4][4]).toEqual({ type: 'queen', color: 'white' });
  });
});

describe('Board — Piece Operations', () => {
  it('getPieceAt returns the piece at a square', () => {
    const board = createStartingBoard();
    expect(getPieceAt(board, { file: 'e', rank: 1 })).toEqual({ type: 'king', color: 'white' });
    expect(getPieceAt(board, { file: 'a', rank: 2 })).toEqual({ type: 'pawn', color: 'white' });
    expect(getPieceAt(board, { file: 'e', rank: 4 })).toBeNull();
  });

  it('setPieceAt places and removes pieces', () => {
    const board = createEmptyBoard();
    const sq = { file: 'e', rank: 4 };
    setPieceAt(board, sq, { type: 'queen', color: 'white' });
    expect(getPieceAt(board, sq)).toEqual({ type: 'queen', color: 'white' });

    setPieceAt(board, sq, null);
    expect(getPieceAt(board, sq)).toBeNull();
  });
});
