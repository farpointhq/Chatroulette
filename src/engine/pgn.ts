// PGN (Portable Game Notation) generation and parsing

import { Chess } from 'chess.js'
import type { Game, Move, GameState, PieceColor } from './types'
import { generateFEN, parseFEN } from './fen'
import { getTurn } from './game'

/** Convert a move to Standard Algebraic Notation (SAN) */
export function moveToSAN(state: GameState, from: string, to: string, promotion?: 'q' | 'r' | 'b' | 'n'): string {
  const chess = new Chess(generateFEN(state))
  
  try {
    const move = chess.move({ from, to, promotion, verbose: true })
    const san = move.san
    chess.undo()
    return san
  } catch {
    // If move is invalid, return basic notation
    const piece = chess.get(from as any)
    const pieceSymbol = piece?.type?.toUpperCase() || ''
    return `${pieceSymbol}${to}`
  }
}

/** Generate PGN string from a game */
export function generatePGN(game: Game, options?: {
  white?: string
  black?: string
  event?: string
  site?: string
  date?: string
  round?: string
  result?: string
}): string {
  const headers: Record<string, string> = {
    Event: options?.event || 'Chess Game',
    Site: options?.site || '?',
    Date: options?.date || new Date().toISOString().split('T')[0],
    Round: options?.round || '?',
    White: options?.white || '?',
    Black: options?.black || '?',
    Result: options?.result || getPGNResult(game)
  }
  
  // Build header section
  let pgn = ''
  for (const [key, value] of Object.entries(headers)) {
    pgn += `[${key} "${value}"]\n`
  }
  pgn += '\n'
  
  // Build moves section
  const moves = game.moveHistory
  let moveText = ''
  let moveNumber = 1
  
  for (let i = 0; i < moves.length; i++) {
    const move = moves[i]
    const isWhiteMove = i % 2 === 0
    
    if (isWhiteMove) {
      moveText += `${moveNumber}. ${move.san || getBasicMoveNotation(move)}`
    } else {
      moveText += ` ${move.san || getBasicMoveNotation(move)}`
      moveNumber++
    }
  }
  
  // Wrap moves at ~80 characters
  const wrappedMoves = wrapMoveText(moveText)
  pgn += wrappedMoves
  
  return pgn
}

/** Get PGN result string from game */
export function getPGNResult(game: Game): string {
  if (game.result.status === 'checkmate') {
    return game.result.winner === 'w' ? '1-0' : '0-1'
  }
  if (game.result.status === 'draw' || 
      game.result.status === 'stalemate' || 
      game.result.status === 'insufficient' ||
      game.result.status === 'threefold' ||
      game.result.status === 'fifty') {
    return '1/2-1/2'
  }
  return '*' // Game in progress
}

/** Generate move number string */
export function generateMoveNumber(moveNumber: number, isWhite: boolean): string {
  if (isWhite) {
    return `${moveNumber}.`
  } else {
    return `${moveNumber}...`
  }
}

/** Get basic move notation if SAN is not available */
function getBasicMoveNotation(move: Move): string {
  const pieceSymbols: Record<string, string> = {
    p: '',
    n: 'N',
    b: 'B',
    r: 'R',
    q: 'Q',
    k: 'K'
  }
  
  const pieceSymbol = move.from[0] === 'p' ? '' : pieceSymbols[move.from[0]] || ''
  const capture = 'x'
  const promotion = move.promotion ? `=${move.promotion.toUpperCase()}` : ''
  
  // Simplified notation - doesn't handle disambiguation
  return `${pieceSymbol}${capture}${move.to}${promotion}`
}

/** Wrap move text to ~80 characters per line */
function wrapMoveText(moveText: string): string {
  const maxWidth = 80
  const words = moveText.split(' ')
  const lines: string[] = []
  let currentLine = ''
  
  for (const word of words) {
    if (currentLine.length + word.length + 1 <= maxWidth) {
      currentLine += (currentLine ? ' ' : '') + word
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }
  }
  
  if (currentLine) lines.push(currentLine)
  
  return lines.join('\n')
}

/** Parse PGN string and extract moves */
export function parsePGN(pgn: string): string[] {
  // Remove headers
  const lines = pgn.split('\n')
  const moveLines = lines.filter(line => !line.startsWith('[') && line.trim())
  const moveText = moveLines.join(' ')
  
  // Extract moves (simplified parsing)
  const moves: string[] = []
  const moveRegex = /([1-9][0-9]*\.+)?\s*([KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?(?:[+#])?|O-O(?:-O)?)/g
  
  let match
  while ((match = moveRegex.exec(moveText)) !== null) {
    if (match[2]) {
      moves.push(match[2])
    }
  }
  
  return moves
}

/** Create a game from PGN string */
export function createGameFromPGN(pgn: string): { moves: Move[]; finalFEN?: string } | null {
  const chess = new Chess()
  const moves = parsePGN(pgn)
  const moveRecords: Move[] = []
  
  try {
    for (const moveSan of moves) {
      const move = chess.move(moveSan)
      if (move) {
        moveRecords.push({
          from: move.from as any,
          to: move.to as any,
          san: move.san,
          flags: move.flags,
          promotion: move.promotion as any
        })
      }
    }
    
    return {
      moves: moveRecords,
      finalFEN: chess.fen()
    }
  } catch {
    return null
  }
}

/** Get PGN headers from a PGN string */
export function parsePGNHeaders(pgn: string): Record<string, string> {
  const headers: Record<string, string> = {}
  const headerRegex = /\[(\w+)\s+"([^"]+)"\]/g
  
  let match
  while ((match = headerRegex.exec(pgn)) !== null) {
    headers[match[1]] = match[2]
  }
  
  return headers
}
