// Board utilities - coordinate conversions, board creation, piece access
// Board is indexed as [rank][file] where rank 0 = rank 8, rank 7 = rank 1

import type { Board, BoardSquare, Piece, PieceType, PieceColor, Square, SquareObj } from './types'

// ============ Coordinate Conversions ============

/** Convert file letter to index (a=0, b=1, ..., h=7) */
export function fileToIndex(file: string): number {
  return file.charCodeAt(0) - 'a'.charCodeAt(0)
}

/** Convert rank number to index (1=0, 2=1, ..., 8=7) */
export function rankToIndex(rank: number): number {
  return rank - 1
}

/** Convert index to file letter (0=a, 1=b, ..., 7=h). Returns empty string for invalid index. */
export function indexToFile(index: number): string {
  if (index < 0 || index > 7) return ''
  return String.fromCharCode('a'.charCodeAt(0) + index)
}

/** Convert index to rank number (0=1, 1=2, ..., 7=8) */
export function indexToRank(index: number): number {
  return index + 1
}

/** Parse algebraic notation to square object (e.g., 'e4' → { file: 'e', rank: 4 }) */
export function parseSquare(square: string): SquareObj {
  if (!/^[a-h][1-8]$/.test(square)) {
    throw new Error(`Invalid square notation: ${square}`)
  }
  return {
    file: square[0] as 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h',
    rank: parseInt(square[1], 10)
  }
}

/** Convert square object to algebraic notation (e.g., { file: 'e', rank: 4 } → 'e4') */
export function squareToString(square: SquareObj): string {
  return `${square.file}${square.rank}`
}

/** Convert square object to board indices [rank][file] */
export function squareToIndices(square: SquareObj): [number, number] {
  const rankIdx = 7 - rankToIndex(square.rank)  // rank 8=0, rank 1=7
  const fileIdx = fileToIndex(square.file)
  return [rankIdx, fileIdx]
}

/** Convert board indices to square object */
export function indicesToSquare(rankIdx: number, fileIdx: number): SquareObj {
  const rank = 8 - rankIdx  // rankIdx 0=rank8, rankIdx 7=rank1
  const file = indexToFile(fileIdx)
  return { file, rank }
}

// ============ Board Creation ============

/** Create an empty 8x8 board */
export function createEmptyBoard(): Board {
  return Array(8).fill(null).map(() => Array(8).fill(null))
}

/** Create the standard starting position board */
export function createStartingBoard(): Board {
  const board = createEmptyBoard()
  
  // Place pawns (rank 2 = index 6, rank 7 = index 1)
  for (let f = 0; f < 8; f++) {
    board[6][f] = { type: 'p', color: 'w' }  // White pawns on rank 2
    board[1][f] = { type: 'p', color: 'b' }  // Black pawns on rank 7
  }
  
  // Place pieces (rank 1 = index 7, rank 8 = index 0)
  const pieceOrder: PieceType[] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r']
  
  // White pieces (rank 1 = index 7)
  for (let f = 0; f < 8; f++) {
    board[7][f] = { type: pieceOrder[f], color: 'w' }
  }
  
  // Black pieces (rank 8 = index 0)
  for (let f = 0; f < 8; f++) {
    board[0][f] = { type: pieceOrder[f], color: 'b' }
  }
  
  return board
}

/** Deep clone a board */
export function cloneBoard(board: Board): Board {
  return board.map(row => row.map(square => square ? { ...square } : null))
}

// ============ Piece Access ============

/** Get piece at a square (accepts algebraic notation string) */
export function getPieceAt(board: Board, square: Square): BoardSquare {
  const { file, rank } = parseSquare(square)
  const [rankIdx, fileIdx] = squareToIndices({ file, rank })
  return board[rankIdx][fileIdx]
}

/** Set piece at a square (accepts algebraic notation string) */
export function setPieceAt(board: Board, square: Square, piece: BoardSquare): void {
  const { file, rank } = parseSquare(square)
  const [rankIdx, fileIdx] = squareToIndices({ file, rank })
  board[rankIdx][fileIdx] = piece
}

/** Get piece at board indices [rank][file] */
export function getPieceAtIndices(board: Board, rankIdx: number, fileIdx: number): BoardSquare {
  return board[rankIdx][fileIdx]
}

/** Set piece at board indices [rank][file] */
export function setPieceAtIndices(board: Board, rankIdx: number, fileIdx: number, piece: BoardSquare): void {
  board[rankIdx][fileIdx] = piece
}

// ============ Board Utilities ============

/** Check if a square is within board bounds */
export function isValidSquare(file: number, rank: number): boolean {
  return file >= 0 && file < 8 && rank >= 0 && rank < 8
}

/** Get all squares on the board as algebraic notation */
export function getAllSquares(): Square[] {
  const squares: Square[] = []
  for (let r = 7; r >= 0; r--) {
    for (let f = 0; f < 8; f++) {
      squares.push(`${indexToFile(f)}${indexToRank(r)}`)
    }
  }
  return squares
}

/** Count pieces of a given color on the board */
export function countPieces(board: Board, color: PieceColor): number {
  let count = 0
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f]
      if (piece && piece.color === color) {
        count++
      }
    }
  }
  return count
}

/** Find all pieces of a given type and color */
export function findPieces(board: Board, type: PieceType, color: PieceColor): Square[] {
  const squares: Square[] = []
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f]
      if (piece && piece.type === type && piece.color === color) {
        squares.push(`${indexToFile(f)}${8 - r}`)
      }
    }
  }
  return squares
}
