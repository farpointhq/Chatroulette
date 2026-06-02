// Special moves: castling, en passant, pawn promotion

import { Chess, Move as ChessMove } from 'chess.js'
import type { GameState, PieceColor, Square, Move } from './types'
import { generateFEN } from './fen'
import { parseSquare } from './board'

// ============ Castling ============

/** Check if kingside castling is legal for a color */
export function canCastleKingside(state: GameState, color: PieceColor): boolean {
  const chess = new Chess(generateFEN(state))
  
  if (chess.turn() !== color) return false
  
  const castlingRights = chess.castling()
  const kingside = color === 'w' ? 'k' : 'K'
  
  if (!castlingRights.includes(kingside)) return false
  
  // Try the castling move
  try {
    const kingPos = color === 'w' ? 'e1' : 'e8'
    const rookPos = color === 'w' ? 'h1' : 'h8'
    const move = chess.move({ from: kingPos, to: rookPos })
    chess.undo()
    return move !== null && move.flags.includes('k')
  } catch {
    return false
  }
}

/** Check if queenside castling is legal for a color */
export function canCastleQueenside(state: GameState, color: PieceColor): boolean {
  const chess = new Chess(generateFEN(state))
  
  if (chess.turn() !== color) return false
  
  const castlingRights = chess.castling()
  const queenside = color === 'w' ? 'q' : 'Q'
  
  if (!castlingRights.includes(queenside)) return false
  
  // Try the castling move
  try {
    const kingPos = color === 'w' ? 'e1' : 'e8'
    const rookPos = color === 'w' ? 'a1' : 'a8'
    const move = chess.move({ from: kingPos, to: rookPos })
    chess.undo()
    return move !== null && move.flags.includes('q')
  } catch {
    return false
  }
}

/** Get castling destination square for kingside */
export function getKingsideCastleDestination(color: PieceColor): Square {
  return color === 'w' ? 'g1' : 'g8'
}

/** Get castling destination square for queenside */
export function getQueensideCastleDestination(color: PieceColor): Square {
  return color === 'w' ? 'c1' : 'c8'
}

/** Check if a move is a castling move */
export function isCastlingMove(state: GameState, from: Square, to: Square): boolean {
  const chess = new Chess(generateFEN(state))
  
  try {
    const move = chess.move({ from, to, verbose: true })
    const isCastle = move.flags.includes('k') || move.flags.includes('q')
    chess.undo()
    return isCastle
  } catch {
    return false
  }
}

// ============ En Passant ============

/** Check if en passant capture is legal */
export function canCaptureEnPassant(state: GameState, from: Square, to: Square): boolean {
  const chess = new Chess(generateFEN(state))
  
  // Check if there's an en passant target square
  const epSquare = chess.epSquare()
  if (!epSquare) return false
  
  // Check if the move is to the en passant square
  if (to !== epSquare) return false
  
  // Try the move
  try {
    const move = chess.move({ from, to })
    const isEP = move.flags.includes('e')
    chess.undo()
    return isEP
  } catch {
    return false
  }
}

/** Get the en passant target square if available */
export function getEnPassantTarget(state: GameState): Square | null {
  const chess = new Chess(generateFEN(state))
  return chess.epSquare() as Square | null
}

/** Check if a move is an en passant capture */
export function isEnPassantMove(state: GameState, from: Square, to: Square): boolean {
  const chess = new Chess(generateFEN(state))
  
  try {
    const move = chess.move({ from, to, verbose: true })
    const isEP = move.flags.includes('e')
    chess.undo()
    return isEP
  } catch {
    return false
  }
}

/** Get the captured pawn square for an en passant move */
export function getEnPassantCaptureSquare(from: Square, to: Square): Square {
  const { file: toFile } = parseSquare(to)
  const { rank: fromRank } = parseSquare(from)
  // The captured pawn is on the same file as the destination, same rank as the source
  return `${toFile}${fromRank}` as Square
}

// ============ Promotion ============

/** Check if a move is a promotion */
export function isPromotionMove(state: GameState, from: Square, to: Square): boolean {
  const chess = new Chess(generateFEN(state))
  
  try {
    const move = chess.move({ from, to, verbose: true })
    const isPromo = move.flags.includes('p')
    chess.undo()
    return isPromo
  } catch {
    return false
  }
}

/** Check if a pawn move requires promotion */
export function needsPromotion(state: GameState, from: Square, to: Square): boolean {
  const chess = new Chess(generateFEN(state))
  const piece = chess.get(from as any)
  
  if (!piece || piece.type !== 'p') return false
  
  const { rank } = parseSquare(to)
  return (piece.color === 'w' && rank === 8) || (piece.color === 'b' && rank === 1)
}

/** Get valid promotion piece options */
export function getPromotionPieces(): Array<'q' | 'r' | 'b' | 'n'> {
  return ['q', 'r', 'b', 'n']
}

/** Create a promotion move */
export function createPromotionMove(from: Square, to: Square, promotion: 'q' | 'r' | 'b' | 'n'): Move {
  return {
    from,
    to,
    promotion,
    flags: 'p'
  }
}

// ============ Special Move Detection ============

/** Get all special moves available in a position */
export interface SpecialMoves {
  castling: { kingside: boolean; queenside: boolean }
  enPassant: Square | null
  promotions: { from: Square; to: Square }[]
}

export function getSpecialMoves(state: GameState): SpecialMoves {
  const chess = new Chess(generateFEN(state))
  const color = chess.turn() as PieceColor
  
  // Get castling rights
  const castlingRights = chess.castling()
  const castling = {
    kingside: (color === 'w' && castlingRights.includes('k')) || (color === 'b' && castlingRights.includes('K')),
    queenside: (color === 'w' && castlingRights.includes('q')) || (color === 'b' && castlingRights.includes('Q'))
  }
  
  // Get en passant square
  const enPassant = chess.epSquare() as Square | null
  
  // Find promotion moves
  const promotions: { from: Square; to: Square }[] = []
  const moves = chess.moves({ verbose: true })
  
  for (const move of moves) {
    if (move.flags.includes('p')) {
      promotions.push({
        from: move.from as Square,
        to: move.to as Square
      })
    }
  }
  
  return { castling, enPassant, promotions }
}
