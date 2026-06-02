import { describe, it, expect } from 'vitest'
import {
  fileToIndex, rankToIndex, indexToFile, indexToRank,
  parseSquare, squareToString,
  getPieceAt, setPieceAt,
  createEmptyBoard, createStartingBoard, cloneBoard,
} from '../../../src/engine/board'

describe('Board — Coordinate Conversions', () => {
  it('fileToIndex converts a through h to 0 through 7', () => {
    expect(fileToIndex('a')).toBe(0)
    expect(fileToIndex('h')).toBe(7)
    expect(fileToIndex('e')).toBe(4)
  })

  it('rankToIndex converts 1 through 8 to 0 through 7', () => {
    expect(rankToIndex(1)).toBe(0)
    expect(rankToIndex(8)).toBe(7)
    expect(rankToIndex(4)).toBe(3)
  })

  it('indexToFile converts 0 through 7 to a through h', () => {
    expect(indexToFile(0)).toBe('a')
    expect(indexToFile(7)).toBe('h')
    expect(indexToFile(4)).toBe('e')
  })

  it('indexToFile returns empty string on invalid index', () => {
    expect(indexToFile(-1)).toBe('')
    expect(indexToFile(8)).toBe('')
  })

  it('indexToRank converts 0 through 7 to 1 through 8', () => {
    expect(indexToRank(0)).toBe(1)
    expect(indexToRank(7)).toBe(8)
    expect(indexToRank(3)).toBe(4)
  })

  it('indexToRank returns invalid rank on out-of-bounds index', () => {
    expect(indexToRank(-1)).toBe(0)
    expect(indexToRank(8)).toBe(9)
  })
})

describe('Board — Square Parsing', () => {
  it('parseSquare converts algebraic notation to Square object', () => {
    expect(parseSquare('e4')).toEqual({ file: 'e', rank: 4 })
    expect(parseSquare('a1')).toEqual({ file: 'a', rank: 1 })
    expect(parseSquare('h8')).toEqual({ file: 'h', rank: 8 })
  })

  it('parseSquare throws on invalid notation', () => {
    expect(() => parseSquare('')).toThrow()
    expect(() => parseSquare('i1')).toThrow()
    expect(() => parseSquare('a9')).toThrow()
    expect(() => parseSquare('abc')).toThrow()
  })

  it('squareToString converts Square object to algebraic notation', () => {
    expect(squareToString({ file: 'e', rank: 4 })).toBe('e4')
    expect(squareToString({ file: 'a', rank: 1 })).toBe('a1')
    expect(squareToString({ file: 'h', rank: 8 })).toBe('h8')
  })
})

describe('Board — Board Creation', () => {
  it('createEmptyBoard returns an 8x8 array of nulls', () => {
    const board = createEmptyBoard()
    expect(board).toHaveLength(8)
    // Board is indexed as [rank][file]
    for (let r = 0; r < 8; r++) {
      expect(board[r]).toHaveLength(8)
      for (let f = 0; f < 8; f++) {
        expect(board[r][f]).toBeNull()
      }
    }
  })

  it('createStartingBoard has correct piece placement', () => {
    const board = createStartingBoard()

    // Board is indexed as [rank][file] where rank 0 = rank 8, rank 7 = rank 1
    // Check pawns (white on rank 2 = index 6, black on rank 7 = index 1)
    for (let f = 0; f < 8; f++) {
      expect(board[6][f]).toEqual({ type: 'p', color: 'w' })  // White pawns
      expect(board[1][f]).toEqual({ type: 'p', color: 'b' })  // Black pawns
    }

    // Check back rank pieces for white (rank 1 = index 7)
    expect(board[7][0]).toEqual({ type: 'r', color: 'w' })  // a1 - rook
    expect(board[7][1]).toEqual({ type: 'n', color: 'w' })  // b1 - knight
    expect(board[7][2]).toEqual({ type: 'b', color: 'w' })  // c1 - bishop
    expect(board[7][3]).toEqual({ type: 'q', color: 'w' })  // d1 - queen
    expect(board[7][4]).toEqual({ type: 'k', color: 'w' })  // e1 - king
    expect(board[7][5]).toEqual({ type: 'b', color: 'w' })  // f1 - bishop
    expect(board[7][6]).toEqual({ type: 'n', color: 'w' })  // g1 - knight
    expect(board[7][7]).toEqual({ type: 'r', color: 'w' })  // h1 - rook

    // Check back rank pieces for black (rank 8 = index 0)
    expect(board[0][0]).toEqual({ type: 'r', color: 'b' })  // a8 - rook
    expect(board[0][1]).toEqual({ type: 'n', color: 'b' })  // b8 - knight
    expect(board[0][2]).toEqual({ type: 'b', color: 'b' })  // c8 - bishop
    expect(board[0][3]).toEqual({ type: 'q', color: 'b' })  // d8 - queen
    expect(board[0][4]).toEqual({ type: 'k', color: 'b' })  // e8 - king
    expect(board[0][5]).toEqual({ type: 'b', color: 'b' })  // f8 - bishop
    expect(board[0][6]).toEqual({ type: 'n', color: 'b' })  // g8 - knight
    expect(board[0][7]).toEqual({ type: 'r', color: 'b' })  // h8 - rook

    // Check empty center squares
    expect(board[4][4]).toBeNull()  // e4
    expect(board[3][3]).toBeNull()  // d5
  })

  it('cloneBoard creates an independent copy', () => {
    const original = createStartingBoard()
    const clone = cloneBoard(original)

    // Mutate clone (rank 4 = index 4, file e = index 4, so e4)
    clone[4][4] = { type: 'q', color: 'w' }

    // Original should be unchanged
    expect(original[4][4]).toBeNull()
    expect(clone[4][4]).toEqual({ type: 'q', color: 'w' })
  })
})

describe('Board — Piece Operations', () => {
  it('getPieceAt returns the piece at a square (string notation)', () => {
    const board = createStartingBoard()
    expect(getPieceAt(board, 'e1')).toEqual({ type: 'k', color: 'w' })
    expect(getPieceAt(board, 'a2')).toEqual({ type: 'p', color: 'w' })
    expect(getPieceAt(board, 'e4')).toBeNull()
  })

  it('setPieceAt places and removes pieces (string notation)', () => {
    const board = createEmptyBoard()
    const square = 'e4'
    setPieceAt(board, square, { type: 'q', color: 'w' })
    expect(getPieceAt(board, square)).toEqual({ type: 'q', color: 'w' })

    setPieceAt(board, square, null)
    expect(getPieceAt(board, square)).toBeNull()
  })
})
