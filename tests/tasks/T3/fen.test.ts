import { describe, it, expect } from 'vitest'
import { STARTING_FEN, parseFEN, generateFEN } from '../../../src/engine/fen'

describe('FEN — Parse Starting Position', () => {
  it('parses the standard starting FEN', () => {
    const state = parseFEN(STARTING_FEN)

    expect(state.turn).toBe('w')
    expect(state.castling).toEqual({
      whiteKingside: true,
      whiteQueenside: true,
      blackKingside: true,
      blackQueenside: true
    })
    expect(state.enPassant).toBeNull()
    expect(state.halfmoveClock).toBe(0)
    expect(state.fullmoveNumber).toBe(1)

    // Check some board pieces (board is [rank][file], rank 0 = rank 8)
    expect(state.board[7][4]).toEqual({ type: 'k', color: 'w' })  // e1
    expect(state.board[0][4]).toEqual({ type: 'k', color: 'b' })  // e8
    expect(state.board[6][0]).toEqual({ type: 'p', color: 'w' })  // a2
    expect(state.board[1][7]).toEqual({ type: 'p', color: 'b' })  // h7
  })
})

describe('FEN — Parse Arbitrary Positions', () => {
  it('parses mid-game FEN correctly', () => {
    const fen = 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4'
    const state = parseFEN(fen)

    expect(state.turn).toBe('w')
    expect(state.castling).toEqual({
      whiteKingside: true,
      whiteQueenside: true,
      blackKingside: true,
      blackQueenside: true
    })
    expect(state.enPassant).toBeNull()
    expect(state.halfmoveClock).toBe(4)
    expect(state.fullmoveNumber).toBe(4)

    // Verify specific pieces (board is [rank][file], rank 0 = rank 8)
    expect(state.board[0][2]).toEqual({ type: 'b', color: 'b' })  // c8 bishop
    expect(state.board[2][2]).toEqual({ type: 'n', color: 'b' })  // c6 knight
    expect(state.board[4][2]).toEqual({ type: 'b', color: 'w' })  // c4 bishop (rank 4 = index 4)
  })

  it('parses FEN with en passant target', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/4Pp2/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1'
    const state = parseFEN(fen)

    expect(state.turn).toBe('b')
    expect(state.enPassant).toBe('e3')
  })

  it('parses FEN with no castling rights', () => {
    const fen = '8/8/8/8/8/8/8/4K2k w - - 50 100'
    const state = parseFEN(fen)

    expect(state.castling).toEqual({
      whiteKingside: false,
      whiteQueenside: false,
      blackKingside: false,
      blackQueenside: false
    })
    expect(state.halfmoveClock).toBe(50)
    expect(state.fullmoveNumber).toBe(100)
  })

  it('parses FEN with partial castling rights', () => {
    const fen = 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w Kk - 0 1'
    const state = parseFEN(fen)

    expect(state.castling).toEqual({
      whiteKingside: true,
      whiteQueenside: false,
      blackKingside: true,
      blackQueenside: false
    })
  })

  it('parses FEN with only queenside rights', () => {
    const fen = 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w Qq - 0 1'
    const state = parseFEN(fen)

    expect(state.castling).toEqual({
      whiteKingside: false,
      whiteQueenside: true,
      blackKingside: false,
      blackQueenside: true
    })
  })

  it('handles empty rows in FEN', () => {
    const fen = '8/8/8/8/8/8/8/4K2k w - - 0 1'
    const state = parseFEN(fen)

    // Most squares should be empty (board is [rank][file])
    for (let r = 0; r < 7; r++) {
      for (let f = 0; f < 8; f++) {
        expect(state.board[r][f]).toBeNull()
      }
    }
    expect(state.board[7][4]).toEqual({ type: 'k', color: 'w' })  // e1
    expect(state.board[7][7]).toEqual({ type: 'k', color: 'b' })  // h1
  })
})

describe('FEN — Generate FEN', () => {
  it('generates starting FEN correctly', () => {
    const state = parseFEN(STARTING_FEN)
    const generated = generateFEN(state)
    expect(generated).toBe(STARTING_FEN)
  })

  it('generates FEN after a move changes turn', () => {
    const state = parseFEN('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1')
    const generated = generateFEN(state)
    expect(generated).toBe('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1')
  })

  it('generates FEN with updated halfmove clock', () => {
    const state = parseFEN('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 2 2')
    const generated = generateFEN(state)
    expect(generated).toBe('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 2 2')
  })

  it('round-trips arbitrary positions', () => {
    const fens = [
      'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
      '8/8/8/8/8/8/8/4K2k w - - 50 100',
      'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w Kk - 0 1',
      'rnbqkbnr/pppppppp/8/8/4Pp2/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1'
    ]

    for (const fen of fens) {
      const state = parseFEN(fen)
      const generated = generateFEN(state)
      expect(generated).toBe(fen)
    }
  })
})
