import { describe, it, expect } from 'vitest';
import { parseFEN } from '../../../src/engine/fen';
import { parseSquare } from '../../../src/engine/board';
import { generateLegalMoves, generateAllLegalMoves, isMoveLegal, isInCheck, isSquareAttacked, findKing } from '../../../src/engine/moves';

describe('Moves — King Movement', () => {
  it('king can move one square in any direction', () => {
    const state = parseFEN('8/8/8/3K4/8/8/8/8 w - - 0 1');
    const moves = generateLegalMoves(state, parseSquare('d5'));
    const targets = moves.map(sq => `${sq.file}${sq.rank}`).sort();
    expect(targets).toEqual(['c4', 'c5', 'c6', 'd4', 'd6', 'e4', 'e5', 'e6']);
  });

  it('king cannot move into check', () => {
    const state = parseFEN('8/8/8/3K4/8/3r4/8/8 w - - 0 1');
    const moves = generateLegalMoves(state, parseSquare('d5'));
    // d4 and d6 are controlled by the rook on d3, so king can't move there
    const targets = moves.map(sq => `${sq.file}${sq.rank}`).sort();
    expect(targets).not.toContain('d4');
    expect(targets).not.toContain('d6');
  });
});

describe('Moves — Queen Movement', () => {
  it('queen moves like rook plus bishop', () => {
    const state = parseFEN('8/8/8/3Q4/8/8/8/8 w - - 0 1');
    const moves = generateLegalMoves(state, parseSquare('d5'));
    const targets = moves.map(sq => `${sq.file}${sq.rank}`).sort();
    // All squares on same rank, file, and diagonals
    expect(targets).toContain('a5');
    expect(targets).toContain('h5');
    expect(targets).toContain('d1');
    expect(targets).toContain('d8');
    expect(targets).toContain('a2');
    expect(targets).toContain('g8');
    expect(targets).toContain('a8');
    expect(targets).toContain('h1');
    expect(targets).toHaveLength(27);
  });
});

describe('Moves — Rook Movement', () => {
  it('rook moves along rank and file', () => {
    const state = parseFEN('8/8/8/3R4/8/8/8/8 w - - 0 1');
    const moves = generateLegalMoves(state, parseSquare('d5'));
    const targets = moves.map(sq => `${sq.file}${sq.rank}`).sort();
    expect(targets).toHaveLength(14);
    expect(targets).toContain('a5');
    expect(targets).toContain('h5');
    expect(targets).toContain('d1');
    expect(targets).toContain('d8');
  });
});

describe('Moves — Bishop Movement', () => {
  it('bishop moves along diagonals', () => {
    const state = parseFEN('8/8/8/3B4/8/8/8/8 w - - 0 1');
    const moves = generateLegalMoves(state, parseSquare('d5'));
    const targets = moves.map(sq => `${sq.file}${sq.rank}`).sort();
    expect(targets).toHaveLength(13);
    expect(targets).toContain('a2');
    expect(targets).toContain('g8');
    expect(targets).toContain('a8');
    expect(targets).toContain('h1');
  });
});

describe('Moves — Knight Movement', () => {
  it('knight moves in L-shape from center', () => {
    const state = parseFEN('8/8/8/3N4/8/8/8/8 w - - 0 1');
    const moves = generateLegalMoves(state, parseSquare('d5'));
    const targets = moves.map(sq => `${sq.file}${sq.rank}`).sort();
    expect(targets).toEqual([
      'b4', 'b6', 'c3', 'c7', 'e3', 'e7', 'f4', 'f6',
    ]);
  });

  it('knight moves correctly from corner', () => {
    const state = parseFEN('N7/8/8/8/8/8/8/8 w - - 0 1');
    const moves = generateLegalMoves(state, parseSquare('a8'));
    const targets = moves.map(sq => `${sq.file}${sq.rank}`).sort();
    expect(targets).toEqual(['b6', 'c7']);
  });
});

describe('Moves — Pawn Movement', () => {
  it('white pawn advances one square', () => {
    const state = parseFEN('8/8/8/8/8/8/4P3/8 w - - 0 1');
    const moves = generateLegalMoves(state, parseSquare('e2'));
    const targets = moves.map(sq => `${sq.file}${sq.rank}`).sort();
    expect(targets).toEqual(['e3', 'e4']);
  });

  it('black pawn advances one square', () => {
    const state = parseFEN('8/3p4/8/8/8/8/8/8 b - - 0 1');
    const moves = generateLegalMoves(state, parseSquare('d7'));
    const targets = moves.map(sq => `${sq.file}${sq.rank}`).sort();
    expect(targets).toEqual(['d5', 'd6']);
  });

  it('pawn blocked by own piece cannot move', () => {
    const state = parseFEN('8/8/8/8/8/4P3/4P3/8 w - - 0 1');
    const moves = generateLegalMoves(state, parseSquare('e2'));
    expect(moves).toHaveLength(0);
  });

  it('pawn can capture diagonally', () => {
    const state = parseFEN('8/8/8/8/3p1p2/4P3/8/8 w - - 0 1');
    const moves = generateLegalMoves(state, parseSquare('e3'));
    const targets = moves.map(sq => `${sq.file}${sq.rank}`).sort();
    expect(targets).toEqual(['d4', 'e4', 'f4']);
  });

  it('pawn cannot move two squares after initial position', () => {
    const state = parseFEN('8/8/8/8/4P3/8/8/8 w - - 0 1');
    const moves = generateLegalMoves(state, parseSquare('e4'));
    const targets = moves.map(sq => `${sq.file}${sq.rank}`).sort();
    expect(targets).toEqual(['e5']);
  });
});

describe('Moves — isMoveLegal', () => {
  it('accepts legal moves', () => {
    const state = parseFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    expect(isMoveLegal(state, parseSquare('e2'), parseSquare('e4'))).toBe(true);
    expect(isMoveLegal(state, parseSquare('g1'), parseSquare('f3'))).toBe(true);
  });

  it('rejects illegal moves', () => {
    const state = parseFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    expect(isMoveLegal(state, parseSquare('e2'), parseSquare('e5'))).toBe(false);
    expect(isMoveLegal(state, parseSquare('b1'), parseSquare('c4'))).toBe(false);
  });

  it('rejects moves that leave king in check', () => {
    const state = parseFEN('rnb1kbnr/pppp1ppp/8/4p3/5Pq1/8/PPPPP1PP/RNBQKBNR w KQkq - 1 3');
    // White king is in check from queen on g4, only move is Kf2 or Bf4
    expect(isMoveLegal(state, parseSquare('d2'), parseSquare('d3'))).toBe(false);
  });
});

describe('Moves — Check Detection', () => {
  it('detects check from queen', () => {
    const state = parseFEN('8/8/8/8/8/8/5k2/4Q3 b - - 0 1');
    expect(isInCheck(state, 'black')).toBe(true);
  });

  it('detects check from knight', () => {
    const state = parseFEN('8/8/8/8/8/3n4/5k2/8 b - - 0 1');
    expect(isInCheck(state, 'white')).toBe(true);
  });

  it('does not detect check when king is safe', () => {
    const state = parseFEN('8/8/8/8/8/8/5k2/8 b - - 0 1');
    expect(isInCheck(state, 'black')).toBe(false);
  });
});

describe('Moves — Square Attack Detection', () => {
  it('detects attacked squares by rooks', () => {
    const state = parseFEN('8/8/8/3r4/8/8/8/8 b - - 0 1');
    expect(isSquareAttacked(state, parseSquare('d1'), 'black')).toBe(true);
    expect(isSquareAttacked(state, parseSquare('h5'), 'black')).toBe(true);
    expect(isSquareAttacked(state, parseSquare('c4'), 'black')).toBe(false);
  });

  it('detects attacked squares by pawns', () => {
    const state = parseFEN('8/8/8/8/8/4p3/8/8 b - - 0 1');
    expect(isSquareAttacked(state, parseSquare('d2'), 'black')).toBe(true);
    expect(isSquareAttacked(state, parseSquare('f2'), 'black')).toBe(true);
    expect(isSquareAttacked(state, parseSquare('e2'), 'black')).toBe(false);
  });
});

describe('Moves — findKing', () => {
  it('finds white king', () => {
    const state = parseFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    expect(findKing(state, 'white')).toEqual({ file: 'e', rank: 1 });
  });

  it('finds black king', () => {
    const state = parseFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    expect(findKing(state, 'black')).toEqual({ file: 'e', rank: 8 });
  });
});

describe('Moves — generateAllLegalMoves', () => {
  it('generates 20 moves from starting position for white', () => {
    const state = parseFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    const moves = generateAllLegalMoves(state, 'white');
    expect(moves).toHaveLength(20);
  });

  it('generates 20 moves from starting position for black', () => {
    const state = parseFEN('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
    const moves = generateAllLegalMoves(state, 'black');
    expect(moves).toHaveLength(20);
  });
});
