import { describe, it, expect } from 'vitest';
import { parseFEN } from '../../../src/engine/fen';
import { parseSquare } from '../../../src/engine/board';
import {
  canCastleKingside, canCastleQueenside,
  getCastlingRookSquare, isEnPassantTarget,
  canPromote, getPromotionRank, updateCastlingRights,
} from '../../../src/engine/special';

describe('Special — Castling Kingside', () => {
  it('allows white kingside castling when rights exist and path is clear', () => {
    const state = parseFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
    expect(canCastleKingside(state, 'white')).toBe(true);
  });

  it('allows black kingside castling when rights exist and path is clear', () => {
    const state = parseFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R b KQkq - 0 1');
    expect(canCastleKingside(state, 'black')).toBe(true);
  });

  it('disallows kingside castling when rights are lost', () => {
    const state = parseFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w Qq - 0 1');
    expect(canCastleKingside(state, 'white')).toBe(false);
    expect(canCastleKingside(state, 'black')).toBe(false);
  });

  it('disallows kingside castling when path is blocked', () => {
    const state = parseFEN('r3k1Nr/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
    expect(canCastleKingside(state, 'black')).toBe(false);
  });

  it('disallows kingside castling when king is in check', () => {
    const state = parseFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
    // Add a rook attacking e8 (black king)
    state.board[4][5] = { type: 'rook', color: 'white' }; // e6
    expect(canCastleKingside(state, 'black')).toBe(false);
  });

  it('disallows kingside castling when king passes through attacked square', () => {
    const state = parseFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
    // Add a rook attacking f8 (king passes through f8)
    state.board[5][5] = { type: 'rook', color: 'white' }; // f6
    expect(canCastleKingside(state, 'black')).toBe(false);
  });
});

describe('Special — Castling Queenside', () => {
  it('allows white queenside castling when rights exist and path is clear', () => {
    const state = parseFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
    expect(canCastleQueenside(state, 'white')).toBe(true);
  });

  it('allows black queenside castling when rights exist and path is clear', () => {
    const state = parseFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R b KQkq - 0 1');
    expect(canCastleQueenside(state, 'black')).toBe(true);
  });

  it('disallows queenside castling when rights are lost', () => {
    const state = parseFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w Kk - 0 1');
    expect(canCastleQueenside(state, 'white')).toBe(false);
    expect(canCastleQueenside(state, 'black')).toBe(false);
  });

  it('disallows queenside castling when path is blocked', () => {
    const state = parseFEN('r1N1k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R b KQkq - 0 1');
    expect(canCastleQueenside(state, 'black')).toBe(false);
  });
});

describe('Special — getCastlingRookSquare', () => {
  it('returns correct squares for white kingside', () => {
    const result = getCastlingRookSquare('white', 'kingside');
    expect(result).toEqual({
      kingFrom: { file: 'e', rank: 1 },
      kingTo: { file: 'g', rank: 1 },
      rookFrom: { file: 'h', rank: 1 },
      rookTo: { file: 'f', rank: 1 },
    });
  });

  it('returns correct squares for black queenside', () => {
    const result = getCastlingRookSquare('black', 'queenside');
    expect(result).toEqual({
      kingFrom: { file: 'e', rank: 8 },
      kingTo: { file: 'c', rank: 8 },
      rookFrom: { file: 'a', rank: 8 },
      rookTo: { file: 'd', rank: 8 },
    });
  });
});

describe('Special — En Passant', () => {
  it('detects en passant target square', () => {
    const state = parseFEN('rnbqkbnr/pppppppp/8/8/4Pp2/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
    expect(isEnPassantTarget(state, parseSquare('e3'))).toBe(true);
    expect(isEnPassantTarget(state, parseSquare('e4'))).toBe(false);
  });

  it('returns false when no en passant target', () => {
    const state = parseFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    expect(isEnPassantTarget(state, parseSquare('e3'))).toBe(false);
  });
});

describe('Special — Pawn Promotion', () => {
  it('white pawn reaching rank 8 can promote', () => {
    const state = parseFEN('8/4P3/8/8/8/8/8/8 w - - 0 1');
    expect(canPromote(parseSquare('e7'), parseSquare('e8'), 'white')).toBe(true);
    expect(canPromote(parseSquare('e7'), parseSquare('e6'), 'white')).toBe(false);
  });

  it('black pawn reaching rank 1 can promote', () => {
    expect(canPromote(parseSquare('e2'), parseSquare('e1'), 'black')).toBe(true);
    expect(canPromote(parseSquare('e2'), parseSquare('e3'), 'black')).toBe(false);
  });

  it('returns correct promotion rank', () => {
    expect(getPromotionRank('white')).toBe(8);
    expect(getPromotionRank('black')).toBe(1);
  });
});

describe('Special — updateCastlingRights', () => {
  it('removes kingside rights when king moves', () => {
    const state = parseFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
    const move = {
      from: parseSquare('e1'),
      to: parseSquare('f1'),
      piece: { type: 'king', color: 'white' },
    };
    const rights = updateCastlingRights(state, move);
    expect(rights).toEqual({
      whiteKingside: false,
      whiteQueenside: false,
      blackKingside: true,
      blackQueenside: true,
    });
  });

  it('removes kingside rights when h-rook moves', () => {
    const state = parseFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
    const move = {
      from: parseSquare('h1'),
      to: parseSquare('h2'),
      piece: { type: 'rook', color: 'white' },
    };
    const rights = updateCastlingRights(state, move);
    expect(rights).toEqual({
      whiteKingside: false,
      whiteQueenside: true,
      blackKingside: true,
      blackQueenside: true,
    });
  });

  it('removes queenside rights when a-rook moves', () => {
    const state = parseFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
    const move = {
      from: parseSquare('a1'),
      to: parseSquare('a2'),
      piece: { type: 'rook', color: 'white' },
    };
    const rights = updateCastlingRights(state, move);
    expect(rights).toEqual({
      whiteKingside: true,
      whiteQueenside: false,
      blackKingside: true,
      blackQueenside: true,
    });
  });
});
