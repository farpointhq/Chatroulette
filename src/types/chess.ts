export type PieceColor = 'w' | 'b'
export type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k'

export interface ChessPiece {
  color: PieceColor
  type: PieceType
}

export type BoardSquare = ChessPiece | null

export type Board = BoardSquare[][]

export interface Square {
  row: number
  col: number
}

export interface Move {
  from: Square
  to: Square
  promotion?: PieceType
}

export interface GameState {
  board: Board
  activeColor: PieceColor
  castlingRights: {
    w: { kingSide: boolean; queenSide: boolean }
    b: { kingSide: boolean; queenSide: boolean }
  }
  enPassantTarget: Square | null
  halfmoveClock: number
  fullmoveNumber: number
  lastMove: Move | null
  isCheck: boolean
  isCheckmate: boolean
  isStalemate: boolean
}
