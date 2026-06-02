// Chess engine types - uses chess.js shorthand notation internally
// Piece types: p=pawn, n=knight, b=bishop, r=rook, q=queen, k=king
// Colors: w=white, b=black

export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k'
export type PieceColor = 'w' | 'b'

export interface Piece {
  type: PieceType
  color: PieceColor
}

export type BoardSquare = Piece | null

// Board is indexed as [rank][file] where:
// - rank 0 = rank 8, rank 7 = rank 1 (matching chess.js board() output)
// - file 0 = file a, file 7 = file h
export type Board = BoardSquare[][]

// Square as algebraic notation string (e.g., 'e4', 'a1')
export type Square = string

// Square as object with file and rank
export interface SquareObj {
  file: string  // 'a' through 'h'
  rank: number  // 1 through 8
}

export interface Move {
  from: Square
  to: Square
  promotion?: PieceType
  flags?: string  // chess.js flags: 'n'=normal, 'p'=promotion, 'e'=en passant, 'c'=castling
  san?: string    // Standard Algebraic Notation (e.g., 'Nf3', 'O-O')
}

export interface CastlingRights {
  whiteKingside: boolean
  whiteQueenside: boolean
  blackKingside: boolean
  blackQueenside: boolean
}

export interface GameState {
  board: Board
  turn: PieceColor
  castling: CastlingRights
  enPassant: Square | null  // Target square for en passant capture
  halfmoveClock: number     // Moves since last pawn move or capture (for 50-move rule)
  fullmoveNumber: number    // Starts at 1, increments after black's move
}

export interface GameResult {
  status: 'ongoing' | 'checkmate' | 'stalemate' | 'draw' | 'insufficient' | 'threefold' | 'fifty'
  winner: PieceColor | null
  reason?: string
}

export interface Game {
  state: GameState
  moveHistory: Move[]
  result: GameResult
  fenHistory: string[]
}
