// Move generation and validation
// Uses chess.js for legal move computation

import { Chess, Move as ChessMove } from 'chess.js'
import type { GameState, Board, PieceColor, Square, SquareObj, Move } from './types'
import { generateFEN, parseFEN } from './fen'
import { parseSquare, squareToString, squareToIndices, indicesToSquare } from './board'

/** Generate all legal moves for the current position */
export function generateLegalMoves(state: GameState, from?: Square): Square[] {
  const chess = new Chess(generateFEN(state))
  const moves = from ? chess.moves({ square: from as any, verbose: true }) : chess.moves({ verbose: true })
  
  return moves.map((move: ChessMove) => move.to as Square)
}

/** Generate all legal moves for a specific color in a position */
export function generateAllLegalMoves(state: GameState, color: PieceColor): Square[] {
  const chess = new Chess(generateFEN(state))
  
  // chess.js only generates moves for the side to move
  // If we need moves for the other side, we'd need to modify the position
  if (chess.turn() !== color) {
    // Return empty array if it's not this color's turn
    // Or we could undo the last move and generate from there
    return []
  }
  
  const moves = chess.moves({ verbose: true })
  return moves.map((move: ChessMove) => move.to as Square)
}

/** Check if a move is legal in the current position */
export function isMoveLegal(state: GameState, from: Square, to: Square, promotion?: SquareObj['file']): boolean {
  const chess = new Chess(generateFEN(state))
  
  try {
    const move = chess.move({ from, to, promotion: promotion as any })
    chess.undo()
    return move !== null
  } catch {
    return false
  }
}

/** Check if the king of a given color is in check */
export function isInCheck(state: GameState, color: PieceColor): boolean {
  const chess = new Chess(generateFEN(state))
  return chess.inCheck() && chess.turn() === color
}

/** Check if a square is attacked by pieces of a given color */
export function isSquareAttacked(state: GameState, square: Square, byColor: PieceColor): boolean {
  const chess = new Chess(generateFEN(state))
  
  // chess.js doesn't have a direct "is square attacked" method
  // We need to check if any piece of byColor can move to this square
  const tempColor = chess.turn()
  
  // This is a simplified check - for full accuracy we'd need to iterate all pieces
  // For now, use chess.js internal attack detection
  try {
    // Try to move a phantom piece to see if it's attacked
    // This is a hack - better to use chess.js's internal attack map
    const attacked = chess.isAttacked(square as any, byColor === 'w' ? 'w' : 'b')
    return attacked
  } catch {
    return false
  }
}

/** Find the king's position for a given color */
export function findKing(state: GameState, color: PieceColor): SquareObj {
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = state.board[r][f]
      if (piece && piece.type === 'k' && piece.color === color) {
        return indicesToSquare(r, f)
      }
    }
  }
  throw new Error(`King not found for color ${color}`)
}

/** Get detailed move information */
export function getMoveDetails(state: GameState, from: Square, to: Square): Move | null {
  const chess = new Chess(generateFEN(state))
  
  try {
    const move = chess.move({ from, to, verbose: true })
    chess.undo()
    
    if (!move) return null
    
    return {
      from: move.from as Square,
      to: move.to as Square,
      promotion: move.promotion as any,
      flags: move.flags,
      san: move.san
    }
  } catch {
    return null
  }
}

/** Check if a move gives check */
export function givesCheck(state: GameState, from: Square, to: Square): boolean {
  const chess = new Chess(generateFEN(state))
  
  try {
    const move = chess.move({ from, to, verbose: true })
    const inCheck = chess.inCheck()
    chess.undo()
    return inCheck
  } catch {
    return false
  }
}

/** Check if a move is a capture */
export function isCapture(state: GameState, from: Square, to: Square): boolean {
  const chess = new Chess(generateFEN(state))
  
  try {
    const move = chess.move({ from, to, verbose: true })
    const isCap = move.captured !== undefined
    chess.undo()
    return isCap
  } catch {
    return false
  }
}

/** Get all possible promotions for a pawn move */
export function getPromotionOptions(): Array<'q' | 'r' | 'b' | 'n'> {
  return ['q', 'r', 'b', 'n']
}

/** Check if a square is a promotion square for a given color */
export function isPromotionSquare(square: Square, color: PieceColor): boolean {
  const { rank } = parseSquare(square)
  return color === 'w' ? rank === 8 : rank === 1
}
