// FEN (Forsyth-Edwards Notation) parsing and generation
// FEN format: position castling en-passant halfmove fullmove

import { Chess } from 'chess.js'
import type { GameState, Board, BoardSquare, PieceColor, Square, CastlingRights } from './types'
import { createEmptyBoard, setPieceAtIndices } from './board'

/** Standard starting position FEN */
export const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

/** Parse FEN string to GameState */
export function parseFEN(fen: string): GameState {
  const chess = new Chess(fen)
  const chessBoard = chess.board()
  
  // chess.js board() returns [rank][file] where rank 0 = rank 8
  // This matches our Board type
  const board: Board = chessBoard.map(row => 
    row.map(piece => piece ? { type: piece.type as 'p' | 'n' | 'b' | 'r' | 'q' | 'k', color: piece.color as 'w' | 'b' } : null)
  )
  
  // Parse FEN parts: position castling en-passant halfmove fullmove
  const fenParts = fen.split(' ')
  
  // Parse castling rights from FEN string (part 3, index 2)
  const castlingStr = fenParts[2] || '-'
  const castling: CastlingRights = {
    whiteKingside: castlingStr.includes('k'),
    whiteQueenside: castlingStr.includes('q'),
    blackKingside: castlingStr.includes('K'),
    blackQueenside: castlingStr.includes('Q')
  }
  
  // Parse en passant square and counters from FEN
  const enPassant = (fenParts[3] && fenParts[3] !== '-') ? fenParts[3] as Square : null
  const halfmoveClock = parseInt(fenParts[4] || '0', 10)
  const fullmoveNumber = parseInt(fenParts[5] || '1', 10)
  
  return {
    board,
    turn: chess.turn() as PieceColor,
    castling,
    enPassant,
    halfmoveClock,
    fullmoveNumber
  }
}

/** Generate FEN string from GameState */
export function generateFEN(state: GameState): string {
  const chess = new Chess()
  
  // Build board representation
  let position = ''
  for (let r = 0; r < 8; r++) {
    let empty = 0
    for (let f = 0; f < 8; f++) {
      const piece = state.board[r][f]
      if (!piece) {
        empty++
      } else {
        if (empty > 0) {
          position += empty
          empty = 0
        }
        const symbol = piece.color === 'w' 
          ? piece.type.toUpperCase() 
          : piece.type
        position += symbol
      }
    }
    if (empty > 0) {
      position += empty
    }
    if (r < 7) {
      position += '/'
    }
  }
  
  // Build castling string in standard order: KQkq
  let castling = ''
  if (state.castling.blackKingside) castling += 'K'
  if (state.castling.blackQueenside) castling += 'Q'
  if (state.castling.whiteKingside) castling += 'k'
  if (state.castling.whiteQueenside) castling += 'q'
  if (castling === '') castling = '-'
  
  // En passant square
  const enPassant = state.enPassant || '-'
  
  return `${position} ${state.turn} ${castling} ${enPassant} ${state.halfmoveClock} ${state.fullmoveNumber}`
}

/** Check if FEN string is valid */
export function isValidFEN(fen: string): boolean {
  try {
    const chess = new Chess(fen)
    return chess.isGameOver() || chess.inCheck() || chess.moves().length > 0 || fen === STARTING_FEN
  } catch {
    return false
  }
}

/** Get FEN for starting position */
export function getStartingFEN(): string {
  return STARTING_FEN
}

/** Parse FEN and return just the position part (before first space) */
export function parseFENPosition(fen: string): string {
  return fen.split(' ')[0]
}

/** Extract castling rights from FEN */
export function parseFENCastling(fen: string): CastlingRights {
  const parts = fen.split(' ')
  const castling = parts[1] || '-'
  
  return {
    whiteKingside: castling.includes('k'),
    whiteQueenside: castling.includes('q'),
    blackKingside: castling.includes('K'),
    blackQueenside: castling.includes('Q')
  }
}

/** Extract en passant square from FEN */
export function parseFENEnPassant(fen: string): Square | null {
  const parts = fen.split(' ')
  const ep = parts[2] || '-'
  return ep === '-' ? null : ep as Square
}
