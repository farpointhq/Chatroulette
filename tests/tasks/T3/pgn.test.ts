import { describe, it, expect } from 'vitest';
import { createGame, makeMove } from '../../../src/engine/game';
import { parseSquare } from '../../../src/engine/board';
import { parseFEN } from '../../../src/engine/fen';
import { moveToSAN, generatePGN, generateMoveNumber } from '../../../src/engine/pgn';
import type { Move } from '../../../src/engine/types';

describe('PGN — moveToSAN', () => {
  it('generates simple pawn move SAN', () => {
    const state = parseFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    const move: Move = {
      from: parseSquare('e2'),
      to: parseSquare('e4'),
      piece: { type: 'pawn', color: 'white' },
    };
    expect(moveToSAN(move, state)).toBe('e4');
  });

  it('generates pawn capture SAN', () => {
    const state = parseFEN('rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2');
    const move: Move = {
      from: parseSquare('e4'),
      to: parseSquare('d5'),
      piece: { type: 'pawn', color: 'white' },
      capturedPiece: { type: 'pawn', color: 'black' },
    };
    expect(moveToSAN(move, state)).toBe('exd5');
  });

  it('generates knight move SAN', () => {
    const state = parseFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    const move: Move = {
      from: parseSquare('g1'),
      to: parseSquare('f3'),
      piece: { type: 'knight', color: 'white' },
    };
    expect(moveToSAN(move, state)).toBe('Nf3');
  });

  it('generates check SAN', () => {
    const state = parseFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    const move: Move = {
      from: parseSquare('f1'),
      to: parseSquare('c4'),
      piece: { type: 'bishop', color: 'white' },
      isCheck: true,
    };
    expect(moveToSAN(move, state)).toBe('Bc4+');
  });

  it('generates checkmate SAN', () => {
    const state = parseFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    const move: Move = {
      from: parseSquare('d1'),
      to: parseSquare('h5'),
      piece: { type: 'queen', color: 'white' },
      isCheckmate: true,
    };
    expect(moveToSAN(move, state)).toBe('Qh5#');
  });

  it('generates kingside castling SAN', () => {
    const state = parseFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
    const move: Move = {
      from: parseSquare('e1'),
      to: parseSquare('g1'),
      piece: { type: 'king', color: 'white' },
      isCastling: true,
    };
    expect(moveToSAN(move, state)).toBe('O-O');
  });

  it('generates queenside castling SAN', () => {
    const state = parseFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
    const move: Move = {
      from: parseSquare('e1'),
      to: parseSquare('c1'),
      piece: { type: 'king', color: 'white' },
      isCastling: true,
    };
    expect(moveToSAN(move, state)).toBe('O-O-O');
  });

  it('generates promotion SAN', () => {
    const state = parseFEN('8/4P3/8/8/8/8/8/8 w - - 0 1');
    const move: Move = {
      from: parseSquare('e7'),
      to: parseSquare('e8'),
      piece: { type: 'pawn', color: 'white' },
      promotion: 'queen',
    };
    expect(moveToSAN(move, state)).toBe('e8=Q');
  });

  it('generates capture promotion SAN', () => {
    const state = parseFEN('4r3/4P3/8/8/8/8/8/8 w - - 0 1');
    const move: Move = {
      from: parseSquare('e7'),
      to: parseSquare('f8'),
      piece: { type: 'pawn', color: 'white' },
      capturedPiece: { type: 'rook', color: 'black' },
      promotion: 'queen',
    };
    expect(moveToSAN(move, state)).toBe('exf8=Q');
  });
});

describe('PGN — generateMoveNumber', () => {
  it('generates move number for white move', () => {
    expect(generateMoveNumber(1, 'white')).toBe('1.');
    expect(generateMoveNumber(10, 'white')).toBe('10.');
  });

  it('generates move number for black move', () => {
    expect(generateMoveNumber(1, 'black')).toBe('1...');
    expect(generateMoveNumber(10, 'black')).toBe('10...');
  });
});

describe('PGN — generatePGN', () => {
  it('generates PGN for a short game', () => {
    const game = createGame();
    const after1 = makeMove(game, parseSquare('e2'), parseSquare('e4'));
    const after2 = makeMove(after1, parseSquare('e7'), parseSquare('e5'));
    const after3 = makeMove(after2, parseSquare('g1'), parseSquare('f3'));

    const pgn = generatePGN(after3);
    expect(pgn).toContain('[Event "Chess Game"]');
    expect(pgn).toContain('1. e4 e5 2. Nf3');
  });

  it('includes custom headers', () => {
    const game = createGame();
    const after1 = makeMove(game, parseSquare('e2'), parseSquare('e4'));

    const pgn = generatePGN(after1, {
      Event: 'Test Match',
      White: 'Player1',
      Black: 'Player2',
    });

    expect(pgn).toContain('[Event "Test Match"]');
    expect(pgn).toContain('[White "Player1"]');
    expect(pgn).toContain('[Black "Player2"]');
    expect(pgn).toContain('1. e4');
  });

  it('includes result tag for checkmate', () => {
    // Fools mate position
    const game = createGame();
    const after1 = makeMove(game, parseSquare('f2'), parseSquare('f3'));
    const after2 = makeMove(after1, parseSquare('e7'), parseSquare('e5'));
    const after3 = makeMove(after2, parseSquare('g2'), parseSquare('g4'));
    const after4 = makeMove(after3, parseSquare('d8'), parseSquare('h4'));

    const pgn = generatePGN(after4);
    expect(pgn).toContain('[Result "0-1"]');
    expect(pgn).toContain('1. f3 e5 2. g4 Qh4#');
  });
});
